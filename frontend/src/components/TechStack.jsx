const STACK = [
    // Frontend
    { label: 'React 18', group: 'Frontend', color: 'rgba(97,218,251,.15)', border: 'rgba(97,218,251,.2)' },
    { label: 'Vite', group: 'Tooling', color: 'rgba(189,52,254,.12)', border: 'rgba(189,52,254,.2)' },
    { label: 'React Router 6', group: 'Routing', color: 'rgba(220,20,60,.1)', border: 'rgba(220,20,60,.25)' },
    { label: 'Axios', group: 'HTTP', color: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)' },
    // Backend
    { label: 'Node.js', group: 'Runtime', color: 'rgba(104,159,56,.12)', border: 'rgba(104,159,56,.2)' },
    { label: 'Express', group: 'Backend', color: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)' },
    { label: 'MongoDB', group: 'Database', color: 'rgba(77,179,61,.12)', border: 'rgba(77,179,61,.2)' },
    { label: 'Mongoose', group: 'ODM', color: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)' },
    // Auth
    { label: 'JWT', group: 'Auth', color: 'rgba(220,20,60,.1)', border: 'rgba(220,20,60,.25)' },
    { label: 'bcryptjs', group: 'Security', color: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)' },
    // AI
    { label: 'Gemini 2.5 Flash', group: 'AI Vision', color: 'rgba(66,133,244,.12)', border: 'rgba(66,133,244,.2)' },
    { label: 'GPT-4o-mini', group: 'AI Text', color: 'rgba(16,163,127,.12)', border: 'rgba(16,163,127,.2)' },
    // Upload
    { label: 'Multer', group: 'Upload', color: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)' },
    { label: 'Web Speech API', group: 'Voice', color: 'rgba(255,180,0,.1)', border: 'rgba(255,180,0,.2)' },
]

export default function TechStack() {
    return (
        <section id="tech" style={{
            padding: '80px 48px',
            position: 'relative',
            zIndex: 10,
            borderTop: '1px solid rgba(220,20,60,.08)',
        }}>
            <div className="au" style={{ marginBottom: '40px' }}>
                <div className="ol-r" style={{ marginBottom: '10px' }}>Built with</div>
                <h2 style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, lineHeight: 1, color: 'var(--t1)' }}>
                    The <em style={{ fontStyle: 'italic', color: 'var(--r)' }}>stack.</em>
                </h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {STACK.map(({ label, group, color, border }) => (
                    <div key={label}
                        style={{
                            padding: '14px 20px',
                            background: color,
                            border: `1px solid ${border}`,
                            borderRadius: '2px',
                            cursor: 'none',
                            transition: 'all .25s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                        <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--t3)' }}>{group}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}
