import { useState, useRef, useCallback } from 'react'

const EXAMPLES = [
    '"I have a board meeting tomorrow morning, smart casual dress code."',
    '"Date night at a nice restaurant, nothing too formal."',
    '"Weekend brunch, relaxed but put-together."',
    '"Job interview at a tech startup, modern professional."',
]

const pnl = { background: 'rgba(8,3,3,.8)', border: '1px solid var(--b)', borderRadius: '2px' }

/* Mock response — replace with actual /api/ai/voice call */
const MOCK_RESULT = {
    occasion: 'Board Meeting — Smart Casual',
    outfit: ['Navy Blazer', 'White Oxford', 'Dark Chinos', 'Tan Chelsea Boots', 'Leather Watch'],
    score: 91,
    reasoning: 'Navy blazer over a white oxford keeps authority while the chinos soften the formality. Chelsea boots bridge smart and casual perfectly for a modern workplace.',
}

export default function Voice() {
    const [mode, setMode] = useState('idle')   // idle | recording | processing | result
    const [transcript, setTranscript] = useState('')
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [ripple, setRipple] = useState(false)
    const recognitionRef = useRef(null)

    const startRecording = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setError('Voice recognition not supported in this browser. Try Chrome.')
            return
        }
        setError(''); setTranscript(''); setMode('recording'); setRipple(true)
        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        rec.onresult = (e) => {
            const t = Array.from(e.results).map(r => r[0].transcript).join('')
            setTranscript(t)
        }
        rec.onerror = () => { setMode('idle'); setRipple(false); setError('Microphone error. Please allow mic access.') }
        rec.onend = () => setRipple(false)
        recognitionRef.current = rec
        rec.start()
    }, [])

    const stopAndAnalyse = useCallback(async () => {
        recognitionRef.current?.stop()
        setMode('processing'); setRipple(false)
        // Simulate API call — replace with: await axios.post('/api/ai/voice', { transcript })
        await new Promise(r => setTimeout(r, 1600))
        setResult(MOCK_RESULT)
        setMode('result')
    }, [])

    const reset = () => { setMode('idle'); setTranscript(''); setResult(null); setError('') }

    const score = result?.score ?? 0
    const dashOffset = 251.2 - (251.2 * score / 100)

    return (
        <div style={{ padding: '36px 40px', position: 'relative', zIndex: 1 }}>
            <div className="orb" style={{ width: '380px', height: '380px', background: 'rgba(160,8,32,.14)', top: '-80px', right: '-60px', position: 'absolute', zIndex: 0 }} />

            {/* Header */}
            <div className="au" style={{ marginBottom: '28px', position: 'relative', zIndex: 2 }}>
                <div className="ol-r">Natural Language Styling</div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '36px', fontWeight: 700, fontStyle: 'italic', marginTop: '6px' }}>
                    Voice <span style={{ color: 'var(--r)' }}>Styling</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start', position: 'relative', zIndex: 2 }}>

                {/* LEFT — mic UI */}
                <div>
                    {/* Mic button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', background: 'rgba(4,1,1,.8)', border: '1px solid rgba(220,20,60,.15)', borderRadius: '2px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>

                        {/* HUD top */}
                        <div style={{ position: 'absolute', top: '16px', fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--r)' }}>
                            {mode === 'recording' ? 'LISTENING…' : mode === 'processing' ? 'PROCESSING' : 'SAS · VOICE MODE'}
                        </div>

                        {/* Ripple rings */}
                        {ripple && (
                            <>
                                <div style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(220,20,60,.15)', animation: 'breathe 1.5s ease-in-out infinite', animationDelay: '0s' }} />
                                <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(220,20,60,.08)', animation: 'breathe 1.5s ease-in-out infinite', animationDelay: '.3s' }} />
                                <div style={{ position: 'absolute', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(220,20,60,.04)', animation: 'breathe 1.5s ease-in-out infinite', animationDelay: '.6s' }} />
                            </>
                        )}

                        {/* Main mic circle */}
                        <div
                            onClick={mode === 'idle' ? startRecording : mode === 'recording' ? stopAndAnalyse : undefined}
                            style={{
                                width: '96px', height: '96px', borderRadius: '50%',
                                background: mode === 'recording' ? 'var(--r)' : 'rgba(220,20,60,.1)',
                                border: `2px solid ${mode === 'recording' ? 'var(--rh)' : 'rgba(220,20,60,.3)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: (mode === 'idle' || mode === 'recording') ? 'none' : 'default',
                                transition: 'all .3s var(--ease)',
                                boxShadow: mode === 'recording' ? '0 0 40px rgba(220,20,60,.4)' : 'none',
                                zIndex: 2, flexShrink: 0,
                                transform: mode === 'recording' ? 'scale(1.05)' : 'scale(1)',
                            }}>
                            <span style={{ fontSize: '32px', lineHeight: 1 }}>
                                {mode === 'processing' ? '◌' : '◉'}
                            </span>
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'center', zIndex: 2 }}>
                            <div style={{ fontFamily: 'var(--fp)', fontSize: '18px', fontStyle: 'italic', color: 'var(--t2)', marginBottom: '6px' }}>
                                {mode === 'idle' && 'Tap to start'}
                                {mode === 'recording' && 'Tap to analyse'}
                                {mode === 'processing' && 'Building outfit…'}
                                {mode === 'result' && 'Outfit ready'}
                            </div>
                            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                                {mode === 'idle' && 'Describe your occasion'}
                                {mode === 'recording' && 'Speak naturally'}
                                {mode === 'processing' && 'AI engine running'}
                                {mode === 'result' && 'See results →'}
                            </div>
                        </div>

                        {/* Bottom readouts */}
                        <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(220,20,60,.5)' }}>
                            <span>{mode === 'recording' ? 'REC ●' : 'STANDBY'}</span>
                            <span>VOICE AI</span>
                            <span>EN-US</span>
                        </div>
                    </div>

                    {/* Transcript display */}
                    <div style={{ ...pnl, padding: '18px', minHeight: '80px', marginBottom: '16px' }}>
                        <div className="ol" style={{ marginBottom: '10px' }}>Transcript</div>
                        <div style={{ fontFamily: 'var(--fp)', fontSize: '15px', fontStyle: 'italic', color: transcript ? 'var(--t1)' : 'var(--t3)', lineHeight: 1.75 }}>
                            {transcript || '"Start speaking to see your words here…"'}
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {mode === 'idle' && (
                            <button className="btn bp" style={{ flex: 1, padding: '12px' }} onClick={startRecording}>Start Recording</button>
                        )}
                        {mode === 'recording' && (
                            <button className="btn bp" style={{ flex: 1, padding: '12px' }} onClick={stopAndAnalyse}>Stop &amp; Analyse</button>
                        )}
                        {mode === 'result' && (
                            <button className="btn" style={{ flex: 1, padding: '12px' }} onClick={reset}>New Query</button>
                        )}
                        {error && <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--rh)', alignSelf: 'center' }}>{error}</div>}
                    </div>

                    {/* Example prompts */}
                    <div style={{ marginTop: '20px' }}>
                        <div className="ol" style={{ marginBottom: '12px' }}>Example Prompts</div>
                        {EXAMPLES.map((ex, i) => (
                            <div key={i}
                                onClick={() => { if (mode === 'idle') { setTranscript(ex.replace(/^"|"$/g, '')) } }}
                                style={{
                                    fontFamily: 'var(--fp)', fontSize: '13px', fontStyle: 'italic', color: 'var(--t3)',
                                    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
                                    cursor: mode === 'idle' ? 'none' : 'default', transition: 'color .2s', lineHeight: 1.5,
                                }}
                                onMouseEnter={e => mode === 'idle' && (e.currentTarget.style.color = 'var(--t2)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
                            >{ex}</div>
                        ))}
                    </div>
                </div>

                {/* RIGHT — outfit result */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Score */}
                    <div style={{ ...pnl, padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                <defs>
                                    <linearGradient id="rg-v" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b0020" /><stop offset="100%" stopColor="#ff2d5b" />
                                    </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="5" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#rg-v)" strokeWidth="5"
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
                            <div style={{ fontFamily: 'var(--fp)', fontSize: '20px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '4px' }}>
                                {mode === 'result' ? result.occasion : 'Awaiting prompt'}
                            </div>
                            {mode === 'result' && <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--r)' }}>AI Generated Look</div>}
                        </div>
                    </div>

                    {/* Suggested outfit */}
                    <div style={{ ...pnl, padding: '20px' }}>
                        <div className="ol" style={{ marginBottom: '14px' }}>Suggested Outfit</div>
                        {mode === 'result'
                            ? result.outfit.map((item, i) => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < result.outfit.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--r)', flexShrink: 0 }} />
                                    <span style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t1)' }}>{item}</span>
                                </div>
                            ))
                            : <span style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontStyle: 'italic', color: 'var(--t3)' }}>Items will appear here after your voice prompt.</span>
                        }
                    </div>

                    {/* AI reasoning */}
                    <div style={{ ...pnl, padding: '20px' }}>
                        <div className="ol" style={{ marginBottom: '4px' }}>AI Reasoning</div>
                        <blockquote style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontStyle: 'italic', color: mode === 'result' ? 'var(--t2)' : 'var(--t3)', lineHeight: 1.75, borderLeft: '2px solid var(--r)', paddingLeft: '14px', marginTop: '10px' }}>
                            {mode === 'result'
                                ? `"${result.reasoning}"`
                                : '"Describe your occasion and the AI will explain why it chose each item for you."'}
                        </blockquote>
                    </div>

                    {/* Save to wardrobe */}
                    {mode === 'result' && (
                        <button className="btn bp" style={{ padding: '13px', fontSize: '11px' }}>
                            Save Outfit to Wardrobe
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
