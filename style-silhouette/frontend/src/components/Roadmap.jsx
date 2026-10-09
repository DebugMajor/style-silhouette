const PHASES = [
    {
        num: '01', label: 'Phase 1', status: 'live', title: 'Camera Capture & Foundation',
        items: [
            'Camera access via getUserMedia',
            'Image capture + canvas extraction',
            'MERN stack architecture',
            'JWT authentication system',
            'Landing page UI development',
        ],
    },
    {
        num: '02', label: 'Phase 2', status: 'building', title: 'Outfit Analysis System',
        items: [
            'Gemini 2.5 Flash integration',
            'Structured outfit JSON parsing',
            'Upload image analysis',
            'Colour combination detection',
            'Analysis history + MongoDB storage',
        ],
    },
    {
        num: '03', label: 'Phase 3', status: 'building', title: 'AI Styling Recommendations',
        items: [
            'GPT-4o-mini voice styling',
            'Personalised outfit suggestions',
            'Wardrobe AI remix engine',
            'Style preference learning',
            'Occasion-based recommendations',
        ],
    },
    {
        num: '04', label: 'Phase 4', status: 'planned', title: 'Digital Wardrobe System',
        items: [
            'Store outfits in database',
            'Organise clothing by category',
            'Smart wardrobe combination AI',
            'Weather + occasion matching',
            'Python FastAPI microservice',
        ],
    },
]

export default function Roadmap() {
    return (
        <section id="roadmap" style={{ padding: '100px 48px', position: 'relative', zIndex: 10 }}>

            <div className="au" style={{ marginBottom: '60px' }}>
                <div className="ol-r" style={{ marginBottom: '12px' }}>Development phases</div>
                <h2 style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, lineHeight: 1, color: 'var(--t1)', marginBottom: '20px' }}>
                    Built in <em style={{ fontStyle: 'italic', color: 'var(--r)' }}>stages.</em>
                </h2>
                <p style={{ fontFamily: 'var(--fg)', fontSize: '15px', fontWeight: 300, color: 'var(--t2)', lineHeight: 1.8, maxWidth: '520px' }}>
                    A clear four-phase roadmap from camera foundation to a full AI-powered digital wardrobe system.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                {PHASES.map(({ num, label, status, title, items }, i) => {
                    const isLive = status === 'live'
                    const isBuilding = status === 'building'
                    return (
                        <div key={num}
                            className={`au d${i + 1}`}
                            style={{
                                padding: '32px 24px',
                                background: 'rgba(8,3,3,.8)',
                                border: `1px solid ${isLive ? 'rgba(220,20,60,.35)' : 'var(--b)'}`,
                                borderRadius: '2px',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all .25s',
                                cursor: 'none',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = isLive ? 'rgba(220,20,60,.6)' : 'rgba(220,20,60,.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = isLive ? 'rgba(220,20,60,.35)' : 'var(--b)'; e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            {/* Live top bar */}
                            {isLive && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--rd),var(--r))' }} />
                            )}

                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ fontFamily: 'var(--fp)', fontSize: '48px', fontWeight: 700, fontStyle: 'italic', color: 'rgba(220,20,60,.12)', lineHeight: 1 }}>{num}</div>
                                <span style={{
                                    fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase',
                                    padding: '4px 10px', borderRadius: '2px',
                                    background: isLive ? 'rgba(220,20,60,.15)' : isBuilding ? 'rgba(220,20,60,.06)' : 'rgba(255,255,255,.04)',
                                    border: `1px solid ${isLive ? 'rgba(220,20,60,.4)' : isBuilding ? 'rgba(220,20,60,.2)' : 'rgba(255,255,255,.08)'}`,
                                    color: isLive ? 'var(--rh)' : isBuilding ? 'rgba(220,20,60,.7)' : 'var(--t3)',
                                }}>
                                    {isLive ? '● Live' : isBuilding ? '◌ Building' : '○ Planned'}
                                </span>
                            </div>

                            <div className="ol-r" style={{ marginBottom: '6px' }}>{label}</div>
                            <div style={{ fontFamily: 'var(--fp)', fontSize: '18px', fontStyle: 'italic', color: 'var(--t1)', marginBottom: '20px', lineHeight: 1.3 }}>{title}</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                                {items.map(item => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isLive ? 'var(--r)' : 'rgba(255,255,255,.2)', flexShrink: 0, marginTop: '5px' }} />
                                        <span style={{ fontFamily: 'var(--fg)', fontSize: '12px', color: isLive ? 'var(--t2)' : 'var(--t3)', lineHeight: 1.5 }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
