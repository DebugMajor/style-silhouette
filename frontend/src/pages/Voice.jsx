import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AIStyleCharacter from '../components/AIStyleCharacter'

const OCCASIONS = ['Casual', 'Formal', 'Party', 'College', 'Travel', 'Traditional', 'Streetwear']

function getAuthHeaders() {
    try {
        const stored = localStorage.getItem('sas_user')
        if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.token) return { Authorization: `Bearer ${parsed.token}` }
        }
    } catch {}
    return {}
}

export default function Voice() {
    const navigate = useNavigate()
    const characterRef = useRef(null)

    // Camera state
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [cameraOn, setCameraOn] = useState(false)
    const [cameraError, setCameraError] = useState(null)
    const [capturedImage, setCapturedImage] = useState(null)

    // Character & Analysis state
    const [characterState, setCharacterState] = useState('IDLE')
    const [characterText, setCharacterText] = useState("Hi! I'm your personal fashion stylist. Show me your outfit on camera!")
    const [selectedOccasion, setSelectedOccasion] = useState('Casual')
    const [analysisResult, setAnalysisResult] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Conversation state
    const [messages, setMessages] = useState([
        { sender: 'AI', text: "Hi! I'm your personal fashion stylist. Enable your camera and click 'Analyze My Style' or ask me any styling question!" }
    ])
    const [inputText, setInputText] = useState('')
    const [isListeningMic, setIsListeningMic] = useState(false)
    const recognitionRef = useRef(null)

    // Start Live Camera
    const startCamera = async () => {
        setCameraError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setCameraOn(true)
        } catch (err) {
            console.error('[Camera] Access denied or error:', err)
            setCameraError('Camera access is required for live style analysis.')
            setCameraOn(false)
        }
    }

    // Stop Live Camera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
            videoRef.current.srcObject = null
        }
        setCameraOn(false)
    }

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    // Handle File Upload Fallback
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setCapturedImage(URL.createObjectURL(file))
        runAnalysisOnBlob(file)
    }

    // Capture Frame & Analyze Style
    const captureAndAnalyze = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
            if (!blob) return
            setCapturedImage(canvas.toDataURL('image/jpeg'))
            runAnalysisOnBlob(blob)
        }, 'image/jpeg', 0.9)
    }

    const runAnalysisOnBlob = async (imageBlob) => {
        setIsAnalyzing(true)
        setCharacterState('THINKING')
        setCharacterText('Analyzing your visible outfit and style proportions...')

        const formData = new FormData()
        formData.append('image', imageBlob, 'capture.jpg')
        formData.append('occasion', selectedOccasion)

        try {
            const res = await axios.post('/api/style-speaker/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthHeaders()
                }
            })

            const analysis = res.data?.analysis
            if (analysis) {
                setAnalysisResult(analysis)
                const speechAdvice = analysis.spokenResponse || analysis.outfitSummary
                setCharacterText(speechAdvice)
                setMessages(prev => [...prev, { sender: 'AI', text: speechAdvice }])

                // Trigger ElevenLabs Speech Audio
                fetchElevenLabsSpeech(speechAdvice)
            }
        } catch (err) {
            console.error('[Voice] Analysis failed:', err)
            const fallbackText = "I've inspected your outfit! The color combination looks balanced. Try pairing with neutral footwear."
            setCharacterText(fallbackText)
            fetchElevenLabsSpeech(fallbackText)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Fetch Speech Audio from Backend ElevenLabs Endpoint (POST /api/style-speaker/speak)
    const fetchElevenLabsSpeech = async (textToSpeak) => {
        if (!textToSpeak) return
        try {
            const res = await axios.post('/api/style-speaker/speak', { text: textToSpeak }, {
                headers: getAuthHeaders(),
                responseType: 'blob'
            })

            if (res.data && res.data.type?.includes('audio')) {
                if (characterRef.current) {
                    characterRef.current.playAudioStream(res.data, textToSpeak)
                }
            } else {
                if (characterRef.current) {
                    characterRef.current.fallbackWebSpeech(textToSpeak)
                }
            }
        } catch (err) {
            console.warn('[Voice] ElevenLabs speech fetch fallback:', err.message)
            if (characterRef.current) {
                characterRef.current.fallbackWebSpeech(textToSpeak)
            }
        }
    }

    // Conversational Follow-Up Chat
    const handleSendMessage = async (customMsg) => {
        const text = customMsg || inputText
        if (!text || !text.trim()) return

        const userMsg = text.trim()
        setInputText('')

        setMessages(prev => [...prev, { sender: 'USER', text: userMsg }])
        setCharacterState('THINKING')
        setCharacterText('Thinking...')

        try {
            const res = await axios.post('/api/style-speaker/chat', {
                message: userMsg,
                occasion: selectedOccasion,
                currentOutfit: analysisResult
            }, {
                headers: getAuthHeaders()
            })

            const replyText = res.data?.spokenResponse || "That's a stylish idea! Keep your outfit proportions balanced."
            setCharacterText(replyText)
            setMessages(prev => [...prev, { sender: 'AI', text: replyText }])

            // Trigger Speech Audio
            fetchElevenLabsSpeech(replyText)
        } catch (err) {
            const fallbackReply = "For that occasion, I'd suggest pairing a dark blazer with neutral footwear."
            setCharacterText(fallbackReply)
            setMessages(prev => [...prev, { sender: 'AI', text: fallbackReply }])
            fetchElevenLabsSpeech(fallbackReply)
        }
    }

    // Mic Button (Speech Recognition)
    const toggleMic = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Voice recognition is not supported in this browser. Try Chrome.')
            return
        }

        if (isListeningMic) {
            recognitionRef.current?.stop()
            setIsListeningMic(false)
            setCharacterState('IDLE')
            return
        }

        const rec = new SpeechRecognition()
        rec.lang = 'en-US'
        rec.interimResults = false

        rec.onstart = () => {
            setIsListeningMic(true)
            setCharacterState('LISTENING')
            setCharacterText('Listening to your question...')
        }

        rec.onresult = (e) => {
            const transcriptText = e.results[0][0].transcript
            setIsListeningMic(false)
            handleSendMessage(transcriptText)
        }

        rec.onerror = () => {
            setIsListeningMic(false)
            setCharacterState('IDLE')
        }

        rec.onend = () => {
            setIsListeningMic(false)
        }

        recognitionRef.current = rec
        rec.start()
    }

    const handleTryOn = () => {
        const itemParam = encodeURIComponent(JSON.stringify({
            id: 'top-1',
            name: analysisResult?.styleCategory ? `${analysisResult.styleCategory} Look` : 'Recommended Outfit',
            category: 'Tops'
        }))
        navigate(`/dashboard/virtual-try-on?item=${itemParam}`)
    }

    return (
        <div style={{ padding: '36px 40px', maxWidth: '1300px', margin: '0 auto', color: 'var(--t1)' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <div className="ol-r">REAL-TIME AI STYLIST</div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '36px', fontWeight: 700, fontStyle: 'italic', marginTop: '4px' }}>
                    AI Style <span style={{ color: 'var(--r)' }}>Speaker</span>
                </div>
                <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', marginTop: '4px' }}>
                    Your personal AI fashion consultant powered by live vision analysis & ElevenLabs voice.
                </p>
            </div>

            {/* Main Interactive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

                {/* LEFT: Live Camera Panel */}
                <div style={{
                    background: 'rgba(8,3,3,.85)',
                    border: '1px solid rgba(220,20,60,.18)',
                    borderRadius: '4px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '520px'
                }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--r)' }}>
                                LIVE CAMERA
                            </span>
                            <span style={{ fontFamily: 'var(--fg)', fontSize: '11px', color: cameraOn ? '#10b981' : 'var(--t3)' }}>
                                Status: {cameraOn ? 'ON 🟢' : 'OFF 🔴'}
                            </span>
                        </div>

                        {/* Video / Captured Image Preview */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '340px',
                            background: '#040101',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {!cameraOn && !capturedImage ? (
                                <div style={{ textAlign: 'center', padding: '24px' }}>
                                    <div style={{ fontSize: '42px', marginBottom: '12px' }}>📹</div>
                                    <div style={{ fontFamily: 'var(--fg)', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                                        Camera Preview Inactive
                                    </div>
                                    <div style={{ fontFamily: 'var(--fg)', fontSize: '11px', color: 'var(--t3)', marginBottom: '16px' }}>
                                        Enable live camera to evaluate your outfit in real-time.
                                    </div>
                                    <button className="btn bp" onClick={startCamera} style={{ padding: '10px 20px', fontSize: '12px' }}>
                                        Start Camera
                                    </button>
                                </div>
                            ) : capturedImage ? (
                                <img src={capturedImage} alt="Captured frame" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}

                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>

                        {cameraError && (
                            <div style={{ padding: '10px', marginTop: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', color: '#f87171', fontSize: '11px' }}>
                                ⚠️ {cameraError}
                            </div>
                        )}
                    </div>

                    {/* Camera Control Buttons */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {cameraOn && (
                            <>
                                <button className="btn bp" style={{ flex: 1, padding: '12px', fontSize: '12px' }} onClick={captureAndAnalyze} disabled={isAnalyzing}>
                                    {isAnalyzing ? 'Analyzing Outfit...' : '⚡ Analyze My Style'}
                                </button>
                                <button className="btn" style={{ padding: '12px 16px', fontSize: '12px' }} onClick={stopCamera}>
                                    Stop
                                </button>
                            </>
                        )}

                        {capturedImage && (
                            <button className="btn" style={{ padding: '12px 16px', fontSize: '12px' }} onClick={() => { setCapturedImage(null); startCamera(); }}>
                                ↺ Retake
                            </button>
                        )}

                        <label className="btn" style={{ padding: '12px 16px', fontSize: '12px', cursor: 'pointer' }}>
                            Upload Photo
                            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                {/* RIGHT: AI Style Character Avatar Component */}
                <div style={{ height: '100%', minHeight: '520px' }}>
                    <AIStyleCharacter
                        ref={characterRef}
                        state={characterState}
                        activeText={characterText}
                    />
                </div>
            </div>

            {/* Occasion Selector Pills */}
            <div style={{ marginBottom: '24px', background: 'rgba(8,3,3,.85)', border: '1px solid rgba(220,20,60,.18)', borderRadius: '4px', padding: '18px 24px' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--r)', marginBottom: '10px' }}>
                    SELECT OCCASION STYLING CONTEXT
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {OCCASIONS.map((occ) => (
                        <button
                            key={occ}
                            onClick={() => setSelectedOccasion(occ)}
                            style={{
                                padding: '8px 18px',
                                borderRadius: '20px',
                                background: selectedOccasion === occ ? 'linear-gradient(135deg, var(--rd), var(--r))' : 'rgba(255,255,255,0.04)',
                                border: selectedOccasion === occ ? '1px solid var(--r)' : '1px solid rgba(255,255,255,0.1)',
                                color: selectedOccasion === occ ? '#ffffff' : 'var(--t2)',
                                fontFamily: 'var(--fg)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {occ}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style Analysis Breakdown */}
            {analysisResult && (
                <div style={{ marginBottom: '24px', background: 'rgba(8,3,3,.85)', border: '1px solid rgba(220,20,60,.18)', borderRadius: '4px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontFamily: 'var(--fp)', fontSize: '20px', fontStyle: 'italic', margin: 0 }}>
                            Style Analysis Breakdown
                        </h3>

                        <button className="btn bp" onClick={handleTryOn} style={{ padding: '8px 18px', fontSize: '11px' }}>
                            ✂ Try This Style in Virtual Try-On →
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '4px' }}>
                            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--r)', letterSpacing: '.15em' }}>STYLE CATEGORY</div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '14px', fontWeight: 600, color: 'var(--t1)', marginTop: '4px' }}>
                                {analysisResult.styleCategory}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '4px' }}>
                            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--r)', letterSpacing: '.15em' }}>VISIBLE ITEMS</div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', marginTop: '4px' }}>
                                {(analysisResult.visibleItems || []).join(', ')}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '4px' }}>
                            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--r)', letterSpacing: '.15em' }}>PALETTE COLORS</div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', marginTop: '4px' }}>
                                {(analysisResult.colors || []).join(', ')}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--r)', letterSpacing: '.15em', marginBottom: '8px' }}>
                            RECOMMENDATIONS
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--t2)', fontFamily: 'var(--fg)', fontSize: '13px', lineHeight: 1.6 }}>
                            {(analysisResult.recommendations || []).map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Conversation Transcript & Chat Input */}
            <div style={{ background: 'rgba(8,3,3,.85)', border: '1px solid rgba(220,20,60,.18)', borderRadius: '4px', padding: '24px' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--r)', marginBottom: '16px' }}>
                    AI STYLIST DIALOGUE
                </div>

                {/* Messages Feed */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            background: msg.sender === 'USER' ? 'rgba(220,20,60,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${msg.sender === 'USER' ? 'rgba(220,20,60,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            padding: '10px 16px',
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: msg.sender === 'USER' ? 'var(--r)' : '#38bdf8', letterSpacing: '.1em', marginBottom: '2px' }}>
                                {msg.sender === 'USER' ? 'YOU' : 'AI FASHION STYLIST'}
                            </div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t1)', lineHeight: 1.4 }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Bar */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Ask your AI stylist (e.g. 'What shoes should I wear to a party?')..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(220,20,60,0.2)',
                            borderRadius: '4px',
                            padding: '12px 16px',
                            color: '#ffffff',
                            fontFamily: 'var(--fg)',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />

                    <button
                        onClick={toggleMic}
                        style={{
                            padding: '0 16px',
                            background: isListeningMic ? 'var(--r)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${isListeningMic ? 'var(--r)' : 'rgba(255,255,255,0.15)'}`,
                            borderRadius: '4px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                        title="Voice Input"
                    >
                        🎤
                    </button>

                    <button
                        onClick={() => handleSendMessage()}
                        className="btn bp"
                        style={{ padding: '0 24px', fontSize: '12px' }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
