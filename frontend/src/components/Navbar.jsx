import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, ArrowRight, User, LogOut } from 'lucide-react'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isHome = pathname === '/'

    const scrollToSection = (sectionId) => {
        setMobileOpen(false)
        if (!isHome) {
            navigate('/')
            setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(250, 250, 250, 0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 36px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1300px', margin: '0 auto' }}>
                
                {/* Brand Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.25rem',
                        fontWeight: 400,
                        letterSpacing: '0.08em',
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase'
                    }}>
                        STYLE<span style={{ color: 'var(--accent)', fontStyle: 'italic', margin: '0 4px' }}>A</span>SILHOUETTE
                    </span>
                </Link>

                {/* Desktop Navigation Links */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
                    {isHome ? (
                        <>
                            <button onClick={() => scrollToSection('features')} style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Features</button>
                            <button onClick={() => scrollToSection('about')} style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>About</button>
                            <button onClick={() => scrollToSection('roadmap')} style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Platform</button>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" style={{ color: pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                                Dashboard
                            </Link>
                            <Link to="/dashboard/virtual-try-on" style={{ color: pathname.includes('virtual-try-on') ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                                Virtual Try-On
                            </Link>
                            <Link to="/dashboard/wardrobe" style={{ color: pathname.includes('wardrobe') ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                                Wardrobe
                            </Link>
                        </>
                    )}
                </nav>

                {/* Auth CTA Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/dashboard" className="btn btn-secondary btn-sm">
                                <User size={14} />
                                <span>Dashboard</span>
                            </Link>
                            <button onClick={logout} className="btn btn-ghost btn-sm" title="Sign Out">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/login" className="btn btn-ghost btn-sm">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                <span>Get Started</span>
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ display: 'none', color: 'var(--text-primary)', padding: '6px' }}
                        className="mobile-toggle"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileOpen && (
                <div style={{
                    padding: '20px 0', borderTop: '1px solid var(--border)', marginTop: '14px',
                    display: 'flex', flexDirection: 'column', gap: '14px'
                }}>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Dashboard</Link>
                    <Link to="/dashboard/virtual-try-on" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Virtual Try-On</Link>
                    <Link to="/dashboard/wardrobe" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Wardrobe</Link>
                    <Link to="/dashboard/suggestions" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', fontSize: '14px' }}>AI Studio</Link>
                </div>
            )}
        </header>
    )
}
