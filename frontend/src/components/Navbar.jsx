import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
    { label: 'Home', section: 'hero' },
    { label: 'About', section: 'about' },
    { label: 'Features', section: 'features' },
    { label: 'Roadmap', section: 'roadmap' },
    { label: 'Team', section: 'team' },
]

/* Smooth-scroll to a section ID on the Home page */
function scrollTo(section, pathname, navigate) {
    if (pathname !== '/') {
        // Navigate home first, then scroll after render
        navigate('/')
        setTimeout(() => {
            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    } else {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
    }
}

export default function Navbar() {
    const { user, logout } = useAuth()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 48px',
            position: 'relative',
            zIndex: 20,
            borderBottom: '1px solid rgba(255,255,255,.04)',
        }}>
            {/* Logo */}
            <button
                onClick={() => navigate('/')}
                style={{
                    fontFamily: 'var(--fp)', fontSize: '14px', fontWeight: 700,
                    fontStyle: 'italic', letterSpacing: '.05em', color: 'var(--t1)',
                    background: 'none', border: 'none', cursor: 'none',
                    position: 'relative',
                }}
                className="nav-logo"
            >
                Style-A-Silhouette
                <style>{`.nav-logo::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:var(--r);transform:scaleX(0);transform-origin:left;transition:transform .3s}.nav-logo:hover::after{transform:scaleX(1)}`}</style>
            </button>

            {/* Nav links — only shown on home page, hidden inside dashboard */}
            {pathname === '/' && (
                <div style={{ display: 'flex', gap: 0 }}>
                    {NAV_LINKS.map(({ label, section }) => (
                        <button
                            key={label}
                            onClick={() => scrollTo(section, pathname, navigate)}
                            style={{
                                fontFamily: 'var(--fg)', fontSize: '11px', fontWeight: 500,
                                letterSpacing: '.08em', textTransform: 'uppercase',
                                color: 'var(--t2)', padding: '8px 18px', cursor: 'none',
                                background: 'none', border: 'none',
                                transition: 'color .2s', position: 'relative',
                            }}
                            className="nl"
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}
                        >
                            {label}
                            <style>{`.nl::after{content:'';position:absolute;bottom:4px;left:18px;right:18px;height:1px;background:var(--r);transform:scaleX(0);transform-origin:left;transition:transform .25s}.nl:hover::after{transform:scaleX(1)}`}</style>
                        </button>
                    ))}
                </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
                {user ? (
                    <>
                        <Link to="/dashboard" className="btn" style={{ padding: '9px 20px', fontSize: '11px' }}>
                            Dashboard
                        </Link>
                        <button onClick={logout} className="btn bp" style={{ padding: '9px 20px', fontSize: '11px' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn" style={{ padding: '9px 20px', fontSize: '11px' }}>Sign In</Link>
                        <Link to="/register" className="btn bp" style={{ padding: '9px 20px', fontSize: '11px' }}>Try App</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
