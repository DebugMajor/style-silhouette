import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AI3DViewer from '../components/AI3DViewer'

const GUIDELINES = [
    'Use a full-body photo',
    'Face and body should be clearly visible',
    'Good lighting',
    'Simple background',
    'Front-facing photo recommended'
]

/**
 * Safely retrieve user JWT Authorization headers
 */
function getAuthHeaders() {
    try {
        const stored = localStorage.getItem('sas_user')
        if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.token) {
                return { Authorization: `Bearer ${parsed.token}` }
            }
        }
    } catch {}
    return {}
}

export default function AITrend({ hideHeader = false }) {
    const navigate = useNavigate()
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)

    // Developer Test Auth State
    const [testAuthResult, setTestAuthResult] = useState(null)
    const [testingAuth, setTestingAuth] = useState(false)

    // Generation lifecycle state
    const [isGenerating, setIsGenerating] = useState(false)
    const [stageText, setStageText] = useState('')
    const [progress, setProgress] = useState(0)

    // Result state
    const [generatedModel, setGeneratedModel] = useState(null)
    const pollTimerRef = useRef(null)
    const timeoutTimerRef = useRef(null)

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)
            if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)
        }
    }, [previewUrl])

    const handleTestAuth = async () => {
        setTestingAuth(true)
        setTestAuthResult(null)
        try {
            const res = await axios.get('/api/ai-trend/test-auth', {
                headers: getAuthHeaders()
            })
            if (res.data?.authenticated) {
                setTestAuthResult({
                    success: true,
                    message: 'Tripo Connected ✓'
                })
            } else {
                setTestAuthResult({
                    success: false,
                    message: `Tripo Authentication Failed ✗ (${res.data?.message || 'Unauthorized'})`
                })
            }
        } catch (err) {
            console.error('[AITrend] Test auth failed:', err)
            const serverMsg = err.response?.data?.message || err.message
            setTestAuthResult({
                success: false,
                message: `Tripo Authentication Failed ✗ (${serverMsg})`
            })
        } finally {
            setTestingAuth(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setErrorMsg(null)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        const ext = file.name.split('.').pop().toLowerCase()
        if (!allowedTypes.includes(file.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            setErrorMsg('Please upload a valid image file (JPG, PNG, or WebP).')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg('Image size exceeds 10MB limit.')
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setGeneratedModel(null)
    }

    const handleGenerate = async () => {
        if (!selectedFile) {
            setErrorMsg('Please upload a full-body image.')
            return
        }

        setErrorMsg(null)
        setIsGenerating(true)
        setStageText('Uploading photo...')
        setProgress(5)

        const formData = new FormData()
        formData.append('image', selectedFile)

        try {
            // Step 1: Upload photo & Create 3D Task (attach JWT auth headers explicitly)
            const uploadRes = await axios.post('/api/ai-trend/generate-3d', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthHeaders()
                }
            })

            if (!uploadRes.data?.success || !uploadRes.data?.taskId) {
                throw new Error(uploadRes.data?.message || 'Unable to upload your image.')
            }

            const taskId = uploadRes.data.taskId
            setStageText('Creating AI 3D task...')
            setProgress(15)

            // Step 2: Poll status every 3.5 seconds
            startPolling(taskId)
        } catch (err) {
            console.error('[AITrend] Generation trigger failed:', err)
            setIsGenerating(false)
            setErrorMsg(err.response?.data?.message || err.message || 'AI generation failed. Please try another image.')
        }
    }

    const startPolling = (taskId) => {
        const TIMEOUT_MS = 5 * 60 * 1000 // 5-minute timeout protection

        timeoutTimerRef.current = setTimeout(() => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)
            setIsGenerating(false)
            setErrorMsg('3D model is taking longer than expected. Please try again.')
        }, TIMEOUT_MS)

        pollTimerRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/api/ai-trend/status/${taskId}`, {
                    headers: getAuthHeaders()
                })
                const data = res.data

                if (!data) return

                const currentProgress = data.progress || 20
                setProgress(Math.max(15, currentProgress))

                if (data.status === 'queued') {
                    setStageText('Task queued in AI queue...')
                } else if (data.status === 'running') {
                    if (currentProgress < 50) {
                        setStageText('Generating 3D avatar...')
                    } else if (currentProgress < 85) {
                        setStageText('Preparing 3D model...')
                    } else {
                        setStageText('Loading 3D avatar...')
                    }
                } else if (data.status === 'success' && data.model?.url) {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
                    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)

                    setStageText('Preparing 3D model...')
                    setProgress(100)

                    setTimeout(() => {
                        setIsGenerating(false)
                        setGeneratedModel(data.model)
                    }, 600)
                } else if (data.status === 'failed' || data.status === 'banned') {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
                    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)

                    setIsGenerating(false)
                    setErrorMsg(data.message || 'AI generation failed. Please try another image.')
                }
            } catch (pollErr) {
                console.warn('[AITrend] Polling error:', pollErr.message)
            }
        }, 3500)
    }

    const handleUseInTryOn = () => {
        if (!generatedModel?.url) return
        localStorage.setItem('ai_avatar_model_url', generatedModel.url)
        localStorage.setItem('ai_avatar_timestamp', Date.now().toString())
        navigate('/dashboard/virtual-try-on')
    }

    const handleReset = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setGeneratedModel(null)
        setErrorMsg(null)
        setIsGenerating(false)
    }

    return (
        <div style={{ padding: hideHeader ? '0' : '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--t1)' }}>
            {/* Header */}
            {!hideHeader && (
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '.25em',
                            textTransform: 'uppercase', color: 'var(--r)', marginBottom: '8px'
                        }}>
                            AI TREND STUDIO
                        </div>
                        <h1 style={{ fontFamily: 'var(--fp)', fontSize: '32px', fontWeight: 700, fontStyle: 'italic', margin: 0 }}>
                            Photo → AI 3D Avatar
                        </h1>
                        <p style={{ fontFamily: 'var(--fg)', fontSize: '14px', color: 'var(--t2)', marginTop: '6px' }}>
                            Turn your full-body photo into a personalized AI 3D avatar.
                        </p>
                    </div>

                    {/* Developer Diagnostic Test Button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <button
                            onClick={handleTestAuth}
                            disabled={testingAuth}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '4px',
                                color: 'var(--t2)',
                                fontFamily: 'var(--fg)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {testingAuth ? 'Testing Connection...' : '🔌 Test Tripo Connection'}
                        </button>

                        {testAuthResult && (
                            <div style={{
                                fontSize: '11px',
                                fontFamily: 'var(--fm)',
                                fontWeight: 600,
                                color: testAuthResult.success ? '#10b981' : '#f87171',
                                padding: '4px 8px',
                                background: testAuthResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '4px',
                                border: `1px solid ${testAuthResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                                {testAuthResult.message}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Card */}
            <div style={{
                background: 'rgba(8,3,3,.85)',
                border: '1px solid rgba(220,20,60,.18)',
                borderRadius: '4px',
                padding: '32px',
                backdropFilter: 'blur(20px)',
                position: 'relative'
            }}>
                {errorMsg && (
                    <div style={{
                        padding: '12px 18px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        color: '#f87171',
                        fontFamily: 'var(--fg)',
                        fontSize: '13px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>⚠️ &nbsp; {errorMsg}</span>
                        <button
                            onClick={() => setErrorMsg(null)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* View 1: Generated 3D Avatar Display */}
                {generatedModel ? (
                    <div>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,.06)', paddingBottom: '16px'
                        }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--fp)', fontSize: '20px', fontStyle: 'italic', margin: 0 }}>
                                    AI Generated 3D Avatar
                                </h2>
                                <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: '#10b981', letterSpacing: '.1em' }}>
                                    ✓ GENERATION COMPLETE
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleReset}
                                    className="btn"
                                    style={{ padding: '10px 20px', fontSize: '12px' }}
                                >
                                    ↺ Generate Again
                                </button>

                                <button
                                    onClick={handleUseInTryOn}
                                    className="btn bp"
                                    style={{ padding: '10px 22px', fontSize: '12px' }}
                                >
                                    ✂ Use in Virtual Try-On →
                                </button>
                            </div>
                        </div>

                        {/* 3D Model Viewer Component */}
                        <div style={{ height: '580px', width: '100%', borderRadius: '6px', overflow: 'hidden' }}>
                            <AI3DViewer modelUrl={generatedModel.url} />
                        </div>
                    </div>
                ) : isGenerating ? (
                    /* View 2: Generation Progress */
                    <div style={{
                        padding: '60px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                            🪄
                        </div>

                        <h3 style={{ fontFamily: 'var(--fp)', fontSize: '22px', fontStyle: 'italic', marginBottom: '8px' }}>
                            {stageText}
                        </h3>

                        <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', maxWidth: '400px', marginBottom: '24px' }}>
                            Tripo AI is constructing high-fidelity geometry and textures from your photo.
                        </p>

                        {/* Progress Bar */}
                        <div style={{
                            width: '100%',
                            maxWidth: '420px',
                            height: '6px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--rd), var(--r))',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>

                        <span style={{ fontFamily: 'var(--fm)', fontSize: '11px', color: 'var(--r)', marginTop: '10px' }}>
                            {progress}% completed
                        </span>
                    </div>
                ) : (
                    /* View 3: Upload & Instructions Form */
                    <div style={{ display: 'grid', gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr 340px', gap: '32px' }}>
                        {/* Left Column: Upload Area */}
                        <div>
                            <div style={{
                                fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em',
                                textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '12px'
                            }}>
                                CREATE YOUR 3D AVATAR
                            </div>

                            {!previewUrl ? (
                                <label style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '340px',
                                    border: '2px dashed rgba(220,20,60,.3)',
                                    borderRadius: '6px',
                                    background: 'rgba(220,20,60,.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--r)'; e.currentTarget.style.background = 'rgba(220,20,60,.05)' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'; e.currentTarget.style.background = 'rgba(220,20,60,.02)' }}
                                >
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
                                    <span style={{ fontFamily: 'var(--fg)', fontSize: '14px', fontWeight: 600, color: 'var(--t1)' }}>
                                        Upload Photo
                                    </span>
                                    <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--t3)', marginTop: '6px' }}>
                                        Supports JPG, PNG, WebP (Max 10MB)
                                    </span>
                                </label>
                            ) : (
                                <div style={{ position: 'relative', height: '340px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(220,20,60,.2)' }}>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#050202' }}
                                    />
                                    <button
                                        onClick={handleReset}
                                        style={{
                                            position: 'absolute', top: '12px', right: '12px',
                                            background: 'rgba(5,2,2,0.8)', border: '1px solid rgba(255,255,255,0.2)',
                                            color: '#fff', padding: '6px 12px', borderRadius: '4px',
                                            fontSize: '11px', cursor: 'pointer'
                                        }}
                                    >
                                        Change Photo
                                    </button>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!selectedFile}
                                className="btn bp"
                                style={{
                                    width: '100%',
                                    marginTop: '20px',
                                    padding: '14px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    letterSpacing: '.05em',
                                    opacity: selectedFile ? 1 : 0.4,
                                    cursor: selectedFile ? 'pointer' : 'not-allowed'
                                }}
                            >
                                ⚡ Generate 3D Avatar
                            </button>
                        </div>

                        {/* Right Column: Instructions */}
                        <div style={{
                            background: 'rgba(255,255,255,.02)',
                            border: '1px solid rgba(255,255,255,.05)',
                            borderRadius: '6px',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ fontFamily: 'var(--fg)', fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--t1)' }}>
                                    Photo Guidelines
                                </h3>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {GUIDELINES.map((item, idx) => (
                                        <li key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                            fontFamily: 'var(--fg)',
                                            fontSize: '12px',
                                            color: 'var(--t2)',
                                            marginBottom: '14px'
                                        }}>
                                            <span style={{ color: 'var(--r)', fontWeight: 700 }}>✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{
                                padding: '14px',
                                background: 'rgba(220,20,60,.05)',
                                border: '1px solid rgba(220,20,60,.15)',
                                borderRadius: '4px',
                                marginTop: '20px'
                            }}>
                                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--r)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
                                    PRO TIP
                                </div>
                                <div style={{ fontFamily: 'var(--fg)', fontSize: '11px', color: 'var(--t2)', marginTop: '4px', lineHeight: 1.4 }}>
                                    Clear full-body portraits with good contrast against simple backgrounds produce the highest accuracy 3D avatars.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
