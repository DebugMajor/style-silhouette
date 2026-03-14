import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

const pnl = {
    padding: '20px',
    background: 'rgba(8,3,3,.85)',
    border: '1px solid var(--b)',
    borderRadius: '2px',
    position: 'relative',
    overflow: 'hidden',
}

const topLine = {
    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
    background: 'linear-gradient(90deg,transparent,var(--r),transparent)', opacity: .4,
}

/* ── Garment row ─────────────────────────────────────────── */
function GarmentRow({ label, value }) {
    if (!value || value === 'Not visible' || value === '') return null
    return (
        <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--r)', minWidth: '90px', paddingTop: '1px' }}>{label}</span>
            <span style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t1)', lineHeight: 1.5 }}>{value}</span>
        </div>
    )
}

export default function Camera() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    const [mode, setMode] = useState('idle')   // idle | live | captured | analysing | result
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [imgSrc, setImgSrc] = useState(null)

    /* ── Start camera ── */
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

    /* ── Stop stream ── */
    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop())
    }, [])

    /* ── Capture frame ── */
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

    /* ── Analyse via Gemini (camera/upload endpoint) ── */
    const analyse = useCallback(async () => {
        setMode('analysing')
        setError('')
        try {
            const canvas = canvasRef.current
            // Convert canvas → blob → FormData → POST to /api/camera/upload
            const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9))
            const form = new FormData()
            form.append('image', blob, 'outfit.jpg')

            const { data } = await axios.post('/api/camera/upload', form)
            setResult(data)
            setMode('result')

            // TTS — speak the first suggestion
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

    /* ── Reset ── */
    const reset = () => {
        stopStream()
        setMode('idle'); setResult(null); setError(''); setImgSrc(null)
    }

    const score = result?.styleScore ?? 0
    const dashOffset = 251.2 - (251.2 * score / 100)

    return (
        <div style={{ padding: '36px 40px', position: 'relative', zIndex: 1 }}>
            {/* Orb */}
            <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(160,8,32,.18)', top: '-80px', right: '-60px', position: 'absolute', zIndex: 0 }} />

            {/* Header */}
            <div className="au" style={{ marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <div className="ol-r">AI Camera Analysis</div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '36px', fontWeight: 700, fontStyle: 'italic', marginTop: '6px' }}>
                    Camera <span style={{ color: 'var(--r)' }}>Styling</span>
                </div>
                <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t3)', marginTop: '6px' }}>
                    Powered by Gemini 2.5 Flash · Structured outfit analysis
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', position: 'relative', zIndex: 2 }}>

                {/* ── LEFT: Camera HUD ── */}
                <div>
                    {/* Viewfinder */}
                    <div style={{
                        width: '100%', aspectRatio: '4/3',
                        background: 'rgba(4,1,1,.9)',
                        border: '1px solid rgba(220,20,60,.15)',
                        borderRadius: '2px',
                        position: 'relative', overflow: 'hidden',
                        marginBottom: '16px',
                    }}>
                        {/* HUD corners */}
                        {[
                            { top: '12px', left: '12px', borderTop: '2px solid var(--r)', borderLeft: '2px solid var(--r)' },
                            { top: '12px', right: '12px', borderTop: '2px solid var(--r)', borderRight: '2px solid var(--r)' },
                            { bottom: '12px', left: '12px', borderBottom: '2px solid var(--r)', borderLeft: '2px solid var(--r)' },
                            { bottom: '12px', right: '12px', borderBottom: '2px solid var(--r)', borderRight: '2px solid var(--r)' },
                        ].map((s, i) => (
                            <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', zIndex: 5, ...s }} />
                        ))}

                        {/* Top status */}
                        <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--r)', zIndex: 5 }}>
                            {mode === 'idle' && 'SAS · STANDBY'}
                            {mode === 'live' && 'REC ●'}
                            {mode === 'captured' && 'CAPTURED'}
                            {mode === 'analysing' && 'PROCESSING'}
                            {mode === 'result' && 'COMPLETE ✓'}
                        </div>

                        {/* Bottom readouts */}
                        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', zIndex: 5, fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(220,20,60,.5)' }}>
                            <span>GEMINI 2.5</span>
                            <span>STYLE AI</span>
                            <span>HD</span>
                        </div>

                        {/* Video element */}
                        <video
                            ref={videoRef} autoPlay playsInline muted
                            style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                                display: (mode === 'live') ? 'block' : 'none',
                            }}
                        />

                        {/* Captured image preview */}
                        {imgSrc && mode !== 'live' && (
                            <img src={imgSrc} alt="Captured outfit"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: mode === 'analysing' ? .5 : 1, transition: 'opacity .3s' }}
                            />
                        )}

                        {/* Idle placeholder */}
                        {mode === 'idle' && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                                <div style={{ fontSize: '48px', color: 'rgba(220,20,60,.15)', lineHeight: 1, marginBottom: '12px' }}>◎</div>
                                <div style={{ fontFamily: 'var(--fp)', fontSize: '16px', fontStyle: 'italic', color: 'var(--t3)' }}>Camera ready</div>
                            </div>
                        )}

                        {/* Scan line during analysis */}
                        {mode === 'analysing' && (
                            <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,rgba(220,20,60,.9),transparent)', animation: 'scanLine 1.4s ease-in-out infinite', boxShadow: '0 0 12px rgba(220,20,60,.5)', zIndex: 6 }} />
                        )}

                        {/* Crosshair live */}
                        {mode === 'live' && (
                            <>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '40px', height: '40px', zIndex: 4, border: '1px solid rgba(220,20,60,.3)', borderRadius: '50%' }} />
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(220,20,60,.15)', zIndex: 4 }} />
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'rgba(220,20,60,.15)', zIndex: 4 }} />
                            </>
                        )}

                        {/* Hidden canvas */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--rh)', marginBottom: '12px', padding: '10px 14px', background: 'rgba(220,20,60,.07)', border: '1px solid rgba(220,20,60,.2)', borderRadius: '2px' }}>
                            {error}
                        </div>
                    )}

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {mode === 'idle' && (
                            <button className="btn bp" style={{ flex: 1, padding: '13px', fontSize: '11px' }} onClick={startCamera}>
                                ◎ Start Camera
                            </button>
                        )}
                        {mode === 'live' && (
                            <>
                                <button className="btn bp" style={{ flex: 1, padding: '13px', fontSize: '11px' }} onClick={capture}>
                                    Capture Outfit
                                </button>
                                <button className="btn" style={{ padding: '13px 16px' }} onClick={reset}>
                                    Stop
                                </button>
                            </>
                        )}
                        {mode === 'captured' && (
                            <>
                                <button className="btn bp" style={{ flex: 1, padding: '13px', fontSize: '11px' }} onClick={analyse}>
                                    Analyse with Gemini →
                                </button>
                                <button className="btn" style={{ padding: '13px 16px' }} onClick={() => setMode('live')}>
                                    Retake
                                </button>
                            </>
                        )}
                        {mode === 'analysing' && (
                            <button className="btn" style={{ flex: 1, padding: '13px', fontSize: '11px' }} disabled>
                                Analysing…
                            </button>
                        )}
                        {mode === 'result' && (
                            <button className="btn bp" style={{ flex: 1, padding: '13px', fontSize: '11px' }} onClick={reset}>
                                ◎ New Analysis
                            </button>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Results panel ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Score ring */}
                    <div style={{ ...pnl, display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ topLine }} />
                        <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                <defs>
                                    <linearGradient id="rg-cam" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b0020" />
                                        <stop offset="100%" stopColor="#ff2d5b" />
                                    </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="5" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#rg-cam)" strokeWidth="5"
                                    strokeLinecap="round" strokeDasharray="251.2"
                                    strokeDashoffset={mode !== 'result' ? 251.2 : dashOffset}
                                    transform="rotate(-90 50 50)"
                                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1)' }} />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontFamily: 'var(--fp)', fontSize: '26px', fontWeight: 700, fontStyle: 'italic', color: 'var(--t1)', lineHeight: 1 }}>
                                    {mode === 'result' ? score : '—'}
                                </span>
                                <span style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--r)' }}>score</span>
                            </div>
                        </div>
                        <div>
                            <div className="ol" style={{ marginBottom: '8px' }}>Style Score</div>
                            <div style={{ fontFamily: 'var(--fp)', fontSize: '22px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '4px' }}>
                                {mode === 'result' && score >= 85 ? 'Excellent Look'
                                    : mode === 'result' && score >= 70 ? 'Solid Style'
                                        : mode === 'result' && score >= 55 ? 'Good Foundation'
                                            : mode === 'result' ? 'Needs Work'
                                                : 'Awaiting capture'}
                            </div>
                            {mode === 'result' && (
                                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--r)' }}>
                                    Gemini 2.5 Flash
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detected garments */}
                    <div style={pnl}>
                        <div style={topLine} />
                        <div className="ol" style={{ marginBottom: '14px' }}>Detected Garments</div>
                        {mode !== 'result'
                            ? <span style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontStyle: 'italic', color: 'var(--t3)' }}>
                                Capture and analyse an outfit to see garment detection.
                            </span>
                            : <>
                                <GarmentRow label="Top" value={result.top} />
                                <GarmentRow label="Bottom" value={result.bottom} />
                                <GarmentRow label="Shoes" value={result.shoes} />
                                <GarmentRow label="Accessories" value={result.accessories} />
                            </>
                        }
                    </div>

                    {/* Suggestions */}
                    <div style={pnl}>
                        <div style={topLine} />
                        <div className="ol" style={{ marginBottom: '14px' }}>AI Suggestions</div>
                        {mode !== 'result'
                            ? <span style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontStyle: 'italic', color: 'var(--t3)' }}>
                                Personalised styling tips will appear after analysis.
                            </span>
                            : result?.suggestions?.length > 0
                                ? result.suggestions.map((tip, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: i < result.suggestions.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--r)', flexShrink: 0, marginTop: '5px' }} />
                                        <span style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6 }}>{tip}</span>
                                    </div>
                                ))
                                : <span style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontStyle: 'italic', color: 'var(--t3)' }}>No suggestions returned.</span>
                        }
                    </div>

                    {/* Save button */}
                    {mode === 'result' && (
                        <button className="btn bp" style={{ padding: '13px', fontSize: '11px' }}>
                            Save to Wardrobe
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
