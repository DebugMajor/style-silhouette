import { Link } from 'react-router-dom'

export default function TryApp() {
    return (
        <section id="try" style={{
            padding: '100px 48px',
            position: 'relative',
            zIndex: 10,
            borderTop: '1px solid rgba(220,20,60,.08)',
        }}>
            <div className="au" style={{ marginBottom: '60px' }}>
                <div className="ol-r" style={{ marginBottom: '12px' }}>Try it now</div>
                <h2 style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, lineHeight: 1, color: 'var(--t1)' }}>
                    Analyse your <em style={{ fontStyle: 'italic', color: 'var(--r)' }}>first outfit.</em>
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '40px' }}>
                {[
                    {
                        icon: '◎',
                        title: 'Camera Analysis',
                        desc: 'Use your device camera for real-time outfit capture. Gemini analyses the frame and returns structured styling feedback instantly.',
                        to: '/dashboard/camera',
                        label: 'Open Camera',
                        live: true,
                    },
                    {
                        icon: '↑',
                        title: 'Upload Image',
                        desc: 'Drag and drop any outfit photo. Same Gemini 2.5 Flash engine — full breakdown of every garment with a style score.',
                        to: '/dashboard/upload',
                        label: 'Upload Outfit',
                        live: true,
                    },
                    {
                        icon: '◉',
                        title: 'Voice Styling',
                        desc: 'Describe your occasion in natural language. GPT-4o-mini generates a complete outfit suggestion based on your context.',
                        to: '/dashboard/voice',
                        label: 'Start Voice',
                        live: true,
                    },
                ].map(({ icon, title, desc, to, label, live }) => (
                    <div key={title}
                        style={{
                            padding: '32px 28px',
                            background: 'rgba(8,3,3,.8)',
                            border: '1px solid var(--b)',
                            borderRadius: '2px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all .3s',
                            cursor: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(220,20,60,.08)'; e.currentTarget.querySelector('.tl').style.opacity = '1' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.querySelector('.tl').style.opacity = '0' }}
                    >
                        <div className="tl" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--r),transparent)', opacity: 0, transition: 'opacity .3s' }} />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <span style={{ fontSize: '32px', color: 'var(--r)', lineHeight: 1 }}>{icon}</span>
                            {live && <span className="badge" style={{ fontSize: '8px' }}>● Live</span>}
                        </div>

                        <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t1)', marginBottom: '10px' }}>{title}</div>
                        <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.75, marginBottom: '28px', flex: 1 }}>{desc}</p>

                        <Link to={to} className="btn bp" style={{ fontSize: '11px', padding: '12px', width: '100%', justifyContent: 'center' }}>
                            {label} →
                        </Link>
                    </div>
                ))}
            </div>

            {/* Bottom CTA banner */}
            <div className="au d3" style={{
                padding: '48px',
                background: 'linear-gradient(135deg,rgba(220,20,60,.08),rgba(139,0,32,.12))',
                border: '1px solid rgba(220,20,60,.2)',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--r),transparent)' }} />
                <div>
                    <div className="ol-r" style={{ marginBottom: '10px' }}>Free to use</div>
                    <div style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(22px,3vw,38px)', fontWeight: 700, fontStyle: 'italic', color: 'var(--t1)', lineHeight: 1 }}>
                        Create your account.<br />Start styling today.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link to="/register" className="btn bp" style={{ padding: '14px 36px', fontSize: '12px' }}>Sign Up Free</Link>
                    <Link to="/login" className="btn" style={{ padding: '14px 24px', fontSize: '12px' }}>Sign In</Link>
                </div>
            </div>
        </section>
    )
}
