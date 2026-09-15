import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AIStyleCharacter from '../components/AIStyleCharacter'
import { Camera, Mic, MicOff, Sparkles, RefreshCw, Shirt, Upload, AlertCircle, Send, Volume2 } from 'lucide-react'

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

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
            videoRef.current.srcObject = null
        }
        setCameraOn(false)
    }

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setCapturedImage(URL.createObjectURL(file))
        runAnalysisOnBlob(file)
    }

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

            fetchElevenLabsSpeech(replyText)
        } catch (err) {
            const fallbackReply = "For that occasion, I'd suggest pairing a dark blazer with neutral footwear."
            setCharacterText(fallbackReply)
            setMessages(prev => [...prev, { sender: 'AI', text: fallbackReply }])
            fetchElevenLabsSpeech(fallbackReply)
        }
    }

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
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    AI Style Speaker
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', margin: 0, fontSize: '0.9rem' }}>
                    Personal AI fashion consultant with live vision analysis and spoken recommendations.
                </p>
            </div>

            {/* Main Interactive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

                {/* Camera Panel */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '500px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Camera Feed
                            </span>
                            <span className={`badge ${cameraOn ? 'badge-success' : ''}`}>
                                {cameraOn ? 'Active' : 'Offline'}
                            </span>
                        </div>

                        <div style={{
                            position: 'relative', width: '100%', height: '340px',
                            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                            overflow: 'hidden', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {!cameraOn && !capturedImage ? (
                                <div style={{ textAlign: 'center', padding: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <Camera size={24} />
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        Camera Inactive
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        Start your camera to analyze your outfit in real-time
                                    </div>
                                    <button className="btn btn-primary" onClick={startCamera}>
                                        <Camera size={14} />
                                        <span>Start Camera</span>
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
                            <div className="alert alert-error" style={{ marginTop: '12px' }}>
                                <AlertCircle size={16} />
                                <span>{cameraError}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {cameraOn && (
                            <>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={captureAndAnalyze} disabled={isAnalyzing}>
                                    <Sparkles size={15} />
                                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze My Style'}</span>
                                </button>
                                <button className="btn btn-secondary" onClick={stopCamera}>
                                    Stop
                                </button>
                            </>
                        )}

                        {capturedImage && (
                            <button className="btn btn-secondary" onClick={() => { setCapturedImage(null); startCamera(); }}>
                                <RefreshCw size={14} />
                                <span>Retake</span>
                            </button>
                        )}

                        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                            <Upload size={14} />
                            <span>Upload</span>
                            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                {/* AI Character Component */}
                <div style={{ height: '100%', minHeight: '500px' }}>
                    <AIStyleCharacter
                        ref={characterRef}
                        state={characterState}
                        activeText={characterText}
                    />
                </div>
            </div>

            {/* Occasion Selector */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                    Styling Context / Occasion
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {OCCASIONS.map((occ) => (
                        <button
                            key={occ}
                            onClick={() => setSelectedOccasion(occ)}
                            className={`btn btn-sm ${selectedOccasion === occ ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {occ}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style Breakdown Result */}
            {analysisResult && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            Style Analysis Breakdown
                        </h3>

                        <button className="btn btn-secondary btn-sm" onClick={handleTryOn}>
                            <Shirt size={14} />
                            <span>Try in Virtual Try-On</span>
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CATEGORY</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                                {analysisResult.styleCategory}
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VISIBLE ITEMS</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {(analysisResult.visibleItems || []).join(', ')}
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>COLOR PALETTE</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {(analysisResult.colors || []).join(', ')}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            RECOMMENDATIONS
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                            {(analysisResult.recommendations || []).map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Conversation Feed & Chat */}
            <div className="card">
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 size={14} color="var(--accent)" />
                    <span>Stylist Dialogue</span>
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            background: msg.sender === 'USER' ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                            border: `1px solid ${msg.sender === 'USER' ? 'var(--accent-border)' : 'var(--border)'}`,
                            padding: '10px 14px', borderRadius: 'var(--radius-md)'
                        }}>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: msg.sender === 'USER' ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: '2px' }}>
                                {msg.sender === 'USER' ? 'YOU' : 'AI STYLIST'}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Ask your AI stylist (e.g., 'What shoes should I wear to a dinner?')..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />

                    <button
                        onClick={toggleMic}
                        className={`btn ${isListeningMic ? 'btn-primary' : 'btn-secondary'}`}
                        title="Voice Input"
                    >
                        {isListeningMic ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <button onClick={() => handleSendMessage()} className="btn btn-primary">
                        <Send size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}
