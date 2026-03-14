import { Link } from 'react-router-dom'

const LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Features', to: '/#features' },
    { label: 'Roadmap', to: '/#roadmap' },
    { label: 'Team', to: '/#team' },
]

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer style={{
            borderTop: '1px solid rgba(220,20,60,.1)',
            padding: '32px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            position: 'relative',
            zIndex: 10,
            background: 'rgba(3,3,3,.8)',
            backdropFilter: 'blur(24px)',
        }}>
            {/* Logo */}
            <div style={{ fontFamily: 'var(--fp)', fontSize: '14px', fontWeight: 700, fontStyle: 'italic', color: 'var(--t1)' }}>
                Style-<span style={{ color: 'var(--r)' }}>A</span>-Silhouette
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: '2px' }}>
                {LINKS.map(({ label, to }) => (
                    <Link key={label} to={to} style={{
                        fontFamily: 'var(--fg)', fontSize: '11px', fontWeight: 500,
                        letterSpacing: '.08em', textTransform: 'uppercase',
                        color: 'var(--t2)', padding: '6px 14px', cursor: 'none',
                        textDecoration: 'none', transition: 'color .2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}
                    >{label}</Link>
                ))}
            </div>

            {/* Copyright */}
            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                © {year} &nbsp;·&nbsp; AI Fashion Intelligence &nbsp;·&nbsp;
                <span style={{ color: 'var(--r)' }}>Phase 1</span>
            </div>
        </footer>
    )
}
