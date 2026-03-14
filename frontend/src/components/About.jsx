const pnl = {
    padding: '28px',
    background: 'rgba(8,3,3,.8)',
    border: '1px solid var(--b)',
    borderRadius: '2px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color .25s',
}

const HOW = [
    { icon: '◎', title: 'Capture', desc: 'Use your device camera to capture your outfit instantly, or upload an existing photo.' },
    { icon: '⬡', title: 'Analyse', desc: 'Gemini 2.5 Flash processes the image and evaluates every styling element in detail.' },
    { icon: '✦', title: 'Suggest', desc: 'Receive specific, actionable recommendations to improve your outfit combinations.' },
    { icon: '◫', title: 'Store', desc: 'Maintain a complete digital wardrobe. AI organises and remixes your pieces automatically.' },
]

export default function About() {
    return (
        <section id="about" style={{ padding: '100px 48px', position: 'relative', zIndex: 10, borderTop: '1px solid rgba(220,20,60,.08)' }}>

            {/* ── Header ── */}
            <div className="au" style={{ marginBottom: '60px' }}>
                <div className="ol-r" style={{ marginBottom: '12px' }}>What we built</div>
                <h2 style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, lineHeight: 1, color: 'var(--t1)', marginBottom: '20px' }}>
                    About <em style={{ fontStyle: 'italic', color: 'var(--r)' }}>Style-A-Silhouette</em>
                </h2>
                <p style={{ fontFamily: 'var(--fg)', fontSize: '16px', fontWeight: 300, color: 'var(--t2)', lineHeight: 1.85, maxWidth: '640px' }}>
                    A camera-based smart styling assistant designed to help users evaluate their outfits instantly. By combining modern web technologies with intelligent analysis, the platform acts as a personal digital stylist — helping you make better fashion decisions.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* What it does */}
                <div className="au d1" style={pnl}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,20,60,.25)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--b)'}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--r),transparent)', opacity: .4 }} />
                    <div className="ol-r" style={{ marginBottom: '10px' }}>What it does</div>
                    <div style={{ fontFamily: 'var(--fp)', fontSize: '24px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '16px' }}>The System</div>
                    <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.8 }}>
                        Users capture an image of their outfit using their device camera or upload an existing photo. The system analyses the outfit and provides feedback on styling choices, colour combinations, and overall appearance using Google Gemini 2.5 Flash.
                    </p>
                    <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.8, marginTop: '12px' }}>
                        Future versions will incorporate advanced AI models capable of identifying clothing items and suggesting improvements to create more balanced and stylish outfits.
                    </p>
                </div>

                {/* Why */}
                <div className="au d2" style={pnl}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,20,60,.25)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--b)'}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--r),transparent)', opacity: .4 }} />
                    <div className="ol-r" style={{ marginBottom: '10px' }}>Why we built it</div>
                    <div style={{ fontFamily: 'var(--fp)', fontSize: '24px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '16px' }}>The Problem</div>
                    <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.8 }}>
                        Choosing the right outfit can be difficult and subjective. Many people struggle to decide whether their clothing combinations work well together.
                    </p>
                    <p style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.8, marginTop: '12px' }}>
                        Style-A-Silhouette explores how artificial intelligence and computer vision can assist users in making confident styling decisions — a personal fashion assistant available anytime.
                    </p>
                </div>
            </div>

            {/* How it works */}
            <div className="au d3" style={{ marginBottom: '20px' }}>
                <div className="ol-r" style={{ marginBottom: '20px' }}>How it works</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                    {HOW.map(({ icon, title, desc }) => (
                        <div key={title}
                            style={{ ...pnl, padding: '24px 20px', cursor: 'none', transition: 'all .3s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(220,20,60,.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                            <div style={{ fontSize: '28px', color: 'var(--r)', lineHeight: 1, marginBottom: '14px' }}>{icon}</div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '12px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--t1)', marginBottom: '8px' }}>{title}</div>
                            <div style={{ fontFamily: 'var(--fg)', fontSize: '12px', color: 'var(--t2)', lineHeight: 1.7 }}>{desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Future vision */}
            <div className="au d4" style={{
                ...pnl,
                padding: '36px 40px',
                background: 'linear-gradient(135deg,rgba(220,20,60,.06),rgba(139,0,32,.1))',
                borderColor: 'rgba(220,20,60,.2)',
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--r),transparent)' }} />
                <div className="ol-r" style={{ marginBottom: '10px' }}>Long-term vision</div>
                <div style={{ fontFamily: 'var(--fp)', fontSize: '24px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '18px' }}>Future Roadmap</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                    {[
                        'Detect clothing types automatically using YOLO v8',
                        'Recommend matching outfits from your wardrobe',
                        'Organise a complete digital wardrobe with tagging',
                        'Suggest combinations based on weather and occasion',
                        'Real-time processing via Python FastAPI microservice',
                        'Personal style learning from user feedback history',
                    ].map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--r)', flexShrink: 0 }} />
                            <span style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)' }}>{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
