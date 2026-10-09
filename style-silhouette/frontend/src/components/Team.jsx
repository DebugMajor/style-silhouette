const TEAM = [
    {
        name: 'Shashwat Dhondyal',
        role: 'Frontend + AI Integration',
        initials: 'SD',
        focus: 'React UI, Gemini/OpenAI API integration, design system, camera pipeline',
        github: 'https://github.com/DebugMajor',
        linkedin: 'https://www.linkedin.com/in/okshash/',
        email: 'shashwatdhondyal812@gmail.com',
    },
    {
        name: 'Tejaswini Rath',
        role: 'Backend Developer',
        initials: 'TR',
        focus: 'Express routes, auth controllers, middleware, MongoDB schemas',
        github: 'https://github.com/TejaswiniRath',
        linkedin: 'https://www.linkedin.com/in/tejaswini-rath-931018287/',
        email: 'tejasmita108@gmail.com',
    },
    {
        name: 'Sanjay Sutar',
        role: 'Database & API',
        initials: 'SS',
        focus: 'MongoDB Atlas, Mongoose ODM, REST API design, data modelling',
        github: 'https://github.com/SanjaySutar25',
        linkedin: 'https://www.linkedin.com/in/sanjay-sutar-43a1b1226/',
        email: null,
    },
    {
        name: 'Narayan Hari Singh',
        role: 'System Design',
        initials: 'NH',
        focus: 'Architecture planning, system design, documentation, deployment strategy',
        github: null,
        linkedin: null,
        email: null,
    },
]

/* Simple inline SVG icons */
const GithubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
)
const LinkedinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
    </svg>
)
const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
)

export default function Team() {
    return (
        <section id="team" style={{
            padding: '100px 48px',
            position: 'relative',
            zIndex: 10,
            background: 'rgba(220,20,60,.015)',
            borderTop: '1px solid rgba(220,20,60,.08)',
        }}>

            <div className="au" style={{ marginBottom: '60px' }}>
                <div className="ol-r" style={{ marginBottom: '12px' }}>The people behind it</div>
                <h2 style={{ fontFamily: 'var(--fp)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, lineHeight: 1, color: 'var(--t1)', marginBottom: '20px' }}>
                    Built by <em style={{ fontStyle: 'italic', color: 'var(--r)' }}>students.</em>
                </h2>
                <p style={{ fontFamily: 'var(--fg)', fontSize: '15px', fontWeight: 300, color: 'var(--t2)', lineHeight: 1.8, maxWidth: '480px' }}>
                    Meet the developers building Style-A-Silhouette — four people, one shared vision.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                {TEAM.map(({ name, role, initials, focus, github, linkedin, email }, i) => (
                    <div key={name}
                        className={`au d${i + 1}`}
                        style={{
                            padding: '28px 22px',
                            background: 'rgba(8,3,3,.8)',
                            border: '1px solid var(--b)',
                            borderRadius: '2px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all .3s',
                            cursor: 'none',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(220,20,60,.1)'
                            e.currentTarget.querySelector('.tm-bar').style.transform = 'scaleY(1)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--b)'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.querySelector('.tm-bar').style.transform = 'scaleY(0)'
                        }}
                    >
                        {/* Left bar */}
                        <div className="tm-bar" style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--r)', transform: 'scaleY(0)', transformOrigin: 'bottom', transition: 'transform .3s var(--ease)' }} />

                        {/* Avatar */}
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '2px', marginBottom: '18px',
                            background: 'linear-gradient(135deg,var(--rd),var(--r))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--fp)', fontSize: '18px', fontStyle: 'italic', color: '#fff', fontWeight: 700,
                        }}>
                            {initials}
                        </div>

                        <div style={{ fontFamily: 'var(--fg)', fontSize: '14px', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>{name}</div>
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--r)', marginBottom: '14px' }}>{role}</div>
                        <div style={{ fontFamily: 'var(--fg)', fontSize: '12px', color: 'var(--t3)', lineHeight: 1.65, marginBottom: '20px' }}>{focus}</div>

                        {/* Social links */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {github && (
                                <a href={github} target="_blank" rel="noreferrer"
                                    style={{ width: '32px', height: '32px', borderRadius: '2px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', cursor: 'none', transition: 'all .2s', textDecoration: 'none' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'; e.currentTarget.style.color = 'var(--rh)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'var(--t2)' }}>
                                    <GithubIcon />
                                </a>
                            )}
                            {linkedin && (
                                <a href={linkedin} target="_blank" rel="noreferrer"
                                    style={{ width: '32px', height: '32px', borderRadius: '2px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', cursor: 'none', transition: 'all .2s', textDecoration: 'none' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'; e.currentTarget.style.color = 'var(--rh)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'var(--t2)' }}>
                                    <LinkedinIcon />
                                </a>
                            )}
                            {email && (
                                <a href={`mailto:${email}`}
                                    style={{ width: '32px', height: '32px', borderRadius: '2px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', cursor: 'none', transition: 'all .2s', textDecoration: 'none' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,20,60,.3)'; e.currentTarget.style.color = 'var(--rh)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'var(--t2)' }}>
                                    <MailIcon />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
