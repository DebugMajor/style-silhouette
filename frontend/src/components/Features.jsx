const FEATURES = [
    {
        num: '01', icon: '◎',
        title: 'Camera Capture',
        desc: 'Live camera feed via getUserMedia. Capture your outfit in one tap — no uploads required. Instant frame extraction from stream.',
        tag: 'Live',
    },
    {
        num: '02', icon: '⬡',
        title: 'Gemini AI Analysis',
        desc: 'Google Gemini 2.5 Flash analyses your outfit and returns structured data — top, bottom, shoes, accessories — with a style score.',
        tag: 'Gemini',
    },
    {
        num: '03', icon: '✦',
        title: 'Outfit Evaluation',
        desc: 'Receive detailed feedback on colour combinations, occasion fit, and overall styling. Score from 0–100 with specific improvement tips.',
        tag: 'AI',
    },
    {
        num: '04', icon: '◉',
        title: 'Voice Styling',
        desc: 'Describe your occasion in natural language. GPT-4o-mini generates a complete outfit suggestion based on your wardrobe and context.',
        tag: 'GPT-4o',
    },
    {
        num: '05', icon: '◫',
        title: 'Digital Wardrobe',
        desc: 'Catalogue and categorise every clothing item you own. AI tracks wear frequency, scores, and helps you remix pieces into new looks.',
        tag: 'Phase 2',
    },
    {
        num: '06', icon: '◬',
        title: 'Upload Analysis',
        desc: 'Drag and drop any outfit photo for analysis. Same Gemini engine as camera — full structured breakdown saved to your history.',
        tag: 'Live',
    },
]

export default function Features() {
    return (
        <section id="features" style={{
            padding: '100px 48px',
            position: 'relative',
            zIndex: 10,
            background: 'rgba(220,20,60,.015)',
            borderTop: '1px solid rgba(220,20,60,.08)',
            borderBottom: '1px solid rgba(220,20,60,.08)',
        }}>
            {/* Header */}
            <div className="au" style={{ marginBottom: '60px' }}>
                <div className="ol-r" style={{ marginBottom: '12px' }}>What we're building</div>
                <h2 style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, lineHeight: 1, color: 'var(--t1)', marginBottom: '20px' }}>
                    Every feature, <em style={{ fontStyle: 'italic', color: 'var(--r)' }}>engineered.</em>
                </h2>
                <p style={{ fontFamily: 'var(--fg)', fontSize: '15px', fontWeight: 300, color: 'var(--t2)', lineHeight: 1.8, maxWidth: '520px' }}>
                    From live camera capture to AI-powered voice styling — here's the complete feature set across all development phases.
                </p>
            </div>

            {/* Feature grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                {FEATURES.map(({ num, icon, title, desc, tag }, i) => (
                    <div key={num}
                        className={`au d${Math.min(i + 1, 6)}`}
                        style={{
                            padding: '28px 24px',
                            background: 'rgba(8,3,3,.8)',
                            border: '1px solid var(--b)',
                            borderRadius: '2px',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'none',
                            transition: 'all .3s var(--ease)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 16px 40px rgba(220,20,60,.08)'
                            e.currentTarget.querySelector('.fl').style.opacity = '1'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--b)'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.querySelector('.fl').style.opacity = '0'
                        }}
                    >
                        {/* top line reveal */}
                        <div className="fl" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--r),transparent)', opacity: 0, transition: 'opacity .3s' }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ fontFamily: 'var(--fp)', fontSize: '48px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(220,20,60,.12)', lineHeight: 1 }}>{num}</div>
                            <span className="badge" style={{ fontSize: '8px' }}>{tag}</span>
                        </div>

                        <div style={{ fontSize: '26px', color: 'var(--r)', lineHeight: 1, marginBottom: '12px' }}>{icon}</div>
                        <div style={{ fontFamily: 'var(--fg)', fontSize: '12px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--t1)', marginBottom: '10px' }}>{title}</div>
                        <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.75 }}>{desc}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}
