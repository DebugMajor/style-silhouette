import { Link } from 'react-router-dom'

export default function Hero() {
    return (
        <section id="hero" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            minHeight: 'calc(100vh - 80px)',
            alignItems: 'center',
            padding: '0 48px',
            gap: '48px',
            position: 'relative',
            zIndex: 10,
        }}>
            {/* ── Left copy ── */}
            <div>
                <div className="au d1" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <div style={{ width: '40px', height: '1px', background: 'var(--r)' }} />
                    <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--r)' }}>
                        AI Fashion Intelligence
                    </span>
                </div>

                {/* Glitch headline */}
                <style>{`
          .gw::before,.gw::after{content:attr(data-text);position:absolute;left:0;top:0;width:100%;height:100%}
          .gw::before{color:var(--r);opacity:.7;animation:glitch 4s infinite linear;clip-path:inset(30% 0 50% 0)}
          .gw::after{color:#0ff;opacity:.3;animation:glitch 4s infinite linear reverse;clip-path:inset(60% 0 20% 0)}
        `}</style>
                <div className="au d2" style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(64px,9vw,116px)', fontWeight: 900, lineHeight: .9, letterSpacing: '-.02em', position: 'relative' }}>
                    <span className="gw" data-text="STYLE" style={{ position: 'relative', display: 'inline-block' }}>STYLE</span>
                </div>
                <div className="au d2" style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(64px,9vw,116px)', fontWeight: 400, lineHeight: .9, color: 'var(--t2)', letterSpacing: '-.02em' }}>YOUR</div>
                <div className="au d2" style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(64px,9vw,116px)', fontWeight: 400, fontStyle: 'italic', lineHeight: .9, color: 'var(--r)', letterSpacing: '-.02em', marginBottom: '40px' }}>
                    Silhouette.
                </div>

                <p className="au d3" style={{ fontFamily: 'var(--fg)', fontSize: '15px', fontWeight: 300, color: 'var(--t2)', lineHeight: 1.8, maxWidth: '420px', marginBottom: '40px' }}>
                    Capture, analyse, and elevate your look with real-time AI outfit intelligence. Your personal fashion engine — powered by Gemini and GPT-4o.
                </p>

                <div className="au d4" style={{ display: 'flex', gap: '12px', marginBottom: '56px', flexWrap: 'wrap' }}>
                    <Link to="/register" className="btn bp" style={{ padding: '14px 36px', fontSize: '12px' }}>Get Started Free</Link>
                    <a href="#features" className="btn" style={{ padding: '14px 28px', fontSize: '12px' }}>See Features →</a>
                </div>

                {/* Stats row */}
                <div className="au d5" style={{ display: 'flex', gap: 0 }}>
                    {[
                        { val: '2', accent: '.4K', label: 'Outfits Analysed' },
                        { val: '94', accent: '%', label: 'Accuracy Rate' },
                        { val: '<', accent: '500', label: 'ms Response' },
                    ].map(({ val, accent, label }, i) => (
                        <div key={i} style={{ padding: '20px 32px 20px 0', borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none', marginRight: i < 2 ? '32px' : 0 }}>
                            <div style={{ fontFamily: 'var(--fp)', fontSize: '42px', fontWeight: 700, fontStyle: 'italic', color: 'var(--t1)', lineHeight: 1 }}>
                                {val}<em style={{ color: 'var(--r)', fontStyle: 'normal' }}>{accent}</em>
                            </div>
                            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--t3)', marginTop: '4px' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right — feature preview cards ── */}
            <div className="au d3" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 0' }}>
                {[
                    { icon: '◎', title: 'Real-time CV', desc: 'Gemini 2.5 Flash detects garments in under 500ms.' },
                    { icon: '✦', title: 'Style Scoring', desc: 'Colour harmony, occasion fit, trend alignment — scored 0–100.' },
                    { icon: '◫', title: 'Digital Wardrobe', desc: 'Catalogue every piece. AI remixes them into complete looks.' },
                    { icon: '◉', title: 'Voice Styling', desc: 'Describe your occasion. GPT-4o builds the outfit.' },
                ].map(({ icon, title, desc }) => (
                    <div key={title}
                        style={{ padding: '20px 24px', background: 'rgba(8,4,4,.85)', border: '1px solid var(--b)', borderRadius: '2px', position: 'relative', overflow: 'hidden', transition: 'all .3s var(--ease)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b)'; e.currentTarget.style.transform = 'translateX(0)' }}
                    >
                        <span style={{ fontSize: '22px', color: 'var(--r)', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>{icon}</span>
                        <div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t1)', marginBottom: '4px' }}>{title}</div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '12px', color: 'var(--t2)', lineHeight: 1.6 }}>{desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
