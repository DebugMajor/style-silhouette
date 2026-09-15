import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Bell, User, LogOut, Settings, Sparkles } from 'lucide-react'

export default function Topbar({ pageTitle }) {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    // Compute title from route if not provided
    const getTitle = () => {
        if (pageTitle) return pageTitle
        const path = location.pathname
        if (path === '/dashboard') return 'Dashboard'
        if (path.includes('virtual-try-on')) return 'Virtual Try-On'
        if (path.includes('wardrobe')) return 'My Wardrobe'
        if (path.includes('suggestions')) return 'AI Studio'
        if (path.includes('voice')) return 'AI Style Speaker'
        if (path.includes('camera')) return 'Camera Analysis'
        if (path.includes('upload')) return 'Upload Media'
        return 'Dashboard'
    }

    const title = getTitle()

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'S'

    return (
        <header style={{
            height: '70px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
        }}>
            {/* Left: Page Title */}
            <div>
                <h1 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                    margin: 0
                }}>
                    {title}
                </h1>
            </div>

            {/* Right: Search, Notifications & Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                
                {/* Search Input Box */}
                <div style={{
                    position: 'relative',
                    width: '240px'
                }}>
                    <Search
                        size={15}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search styles, garments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Notifications Bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                        title="Notifications"
                    >
                        <Bell size={18} />
                        <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent)'
                        }} />
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '48px',
                            width: '280px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)',
                            padding: '16px',
                            zIndex: 100
                        }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Notifications</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>2 New</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Try-On Ready</div>
                                    <div>IDM-VTON completed high-res try-on scan.</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>New Wardrobe Item</div>
                                    <div>Silk Blazer added to Digital Wardrobe.</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Avatar & Menu */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '4px 10px 4px 4px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--accent-dim)',
                            border: '1px solid var(--accent-border)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 600
                        }}>
                            {initials}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {user?.name ? user.name.split(' ')[0] : 'Stylist'}
                        </span>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '48px',
                            width: '200px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)',
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            zIndex: 100
                        }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'Stylist User'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email || 'user@silhouette.ai'}</div>
                            </div>
                            <button
                                onClick={() => { setShowProfileMenu(false); navigate('/dashboard/settings'); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', width: '100%', textAlign: 'left' }}
                            >
                                <Settings size={14} />
                                <span>Account Settings</span>
                            </button>
                            <button
                                onClick={logout}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#EF4444', width: '100%', textAlign: 'left' }}
                            >
                                <LogOut size={14} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </header>
    )
}
