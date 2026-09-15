import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { Camera as CameraIcon, Sparkles, RefreshCw, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

function GarmentRow({ label, value }) {
    if (!value || value === 'Not visible' || value === '') return null
    return (
        <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', minWidth: '90px' }}>{label}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{value}</span>
        </div>
    )
}

export default function Camera() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    const [mode, setMode] = useState('idle') // idle | live | captured | analysing | result
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [imgSrc, setImgSrc] = useState(null)

    const startCamera = useCallback(async () => {
        setError('')
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false })
            streamRef.current = stream
            if (videoRef.current) videoRef.current.srcObject = stream
            setMode('live')
        } catch {
            setError('Camera access denied. Please allow camera permissions in your browser.')
        }
    }, [])

    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop())
    }, [])

    const capture = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        stopStream()
        setImgSrc(canvas.toDataURL('image/jpeg', 0.92))
        setMode('captured')
    }, [stopStream])

    const analyse = useCallback(async () => {
        setMode('analysing')
        setError('')
        try {
            const canvas = canvasRef.current
            const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9))
            const form = new FormData()
            form.append('image', blob, 'outfit.jpg')

            const { data } = await axios.post('/api/camera/upload', form)
            setResult(data)
            setMode('result')

            if (data.suggestions?.length > 0) {
                const speech = new SpeechSynthesisUtterance(data.suggestions[0])
                speech.lang = 'en-US'
                window.speechSynthesis.speak(speech)
            }
        } catch (err) {
            setMode('captured')
            setError(err?.response?.data?.message || 'Analysis failed. Please try again.')
        }
    }, [])

    const reset = () => {
        stopStream()
        setMode('idle'); setResult(null); setError(''); setImgSrc(null)
    }

    const score = result?.styleScore ?? 0

    return (
        <div style={{ padding: '32px 36px', maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Camera Styling</h1>
                <p className="page-subtitle" style={{ marginTop: '4px', margin: 0 }}>
                    Real-time AI outfit analysis powered by Gemini fashion vision engine.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Viewfinder Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{
                        width: '100%', aspectRatio: '4/3', background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                        position: 'relative', overflow: 'hidden', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <video
                            ref={videoRef} autoPlay playsInline muted
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: (mode === 'live') ? 'block' : 'none' }}
                        />

                        {imgSrc && mode !== 'live' && (
                            <img src={imgSrc} alt="Captured outfit" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}

                        {mode === 'idle' && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                <CameraIcon size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Camera Ready</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click start camera to begin stream</div>
                            </div>
                        )}

                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginTop: '14px' }}>
                            <AlertCircle size={15} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                        {mode === 'idle' && (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={startCamera}>
                                <CameraIcon size={15} />
                                <span>Start Camera</span>
                            </button>
                        )}
                        {mode === 'live' && (
                            <>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={capture}>
                                    Capture Frame
                                </button>
                                <button className="btn btn-secondary" onClick={reset}>
                                    Stop
                                </button>
                            </>
                        )}
                        {mode === 'captured' && (
                            <>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={analyse}>
                                    <span>Analyse Outfit</span>
                                    <ArrowRight size={14} />
                                </button>
                                <button className="btn btn-secondary" onClick={() => setMode('live')}>
                                    Retake
                                </button>
                            </>
                        )}
                        {mode === 'analysing' && (
                            <button className="btn btn-primary" style={{ flex: 1 }} disabled>
                                <span>Analysing...</span>
                            </button>
                        )}
                        {mode === 'result' && (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={reset}>
                                <RefreshCw size={14} />
                                <span>New Analysis</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                            Style Score
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {mode === 'result' ? `${score}/100` : '—'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {mode === 'result' && score >= 85 ? 'Excellent Harmony' : mode === 'result' ? 'Balanced Ensemble' : 'Awaiting camera capture'}
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Detected Garments</h3>
                        {mode !== 'result' ? (
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Capture and analyse an outfit to view detected garment breakdown.
                            </div>
                        ) : (
                            <>
                                <GarmentRow label="Top" value={result.top} />
                                <GarmentRow label="Bottom" value={result.bottom} />
                                <GarmentRow label="Shoes" value={result.shoes} />
                                <GarmentRow label="Accessories" value={result.accessories} />
                            </>
                        )}
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Styling Recommendations</h3>
                        {mode !== 'result' ? (
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Actionable styling tips will appear here following analysis.
                            </div>
                        ) : result?.suggestions?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {result.suggestions.map((tip, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <CheckCircle size={14} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No suggestions returned.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
