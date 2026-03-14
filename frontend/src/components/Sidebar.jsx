import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
    { icon: '◎', label: 'Camera Styling', to: '/dashboard/camera', live: true },
    { icon: '◫', label: 'Digital Wardrobe', to: '/dashboard/wardrobe' },
    { icon: '✦', label: 'AI Suggestions', to: '/dashboard/suggestions' },
    { icon: '↑', label: 'Upload Outfit', to: '/dashboard/upload' },
    { icon: '◉', label: 'Voice Styling', to: '/dashboard/voice' },
]

const ACCOUNT_ITEMS = [
    { icon: '○', label: 'Settings', to: '/dashboard/settings' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'S'

    return (
        <aside style={{
            width: '200px', minWidth: '200px',
            background: 'rgba(5,2,2,.75)',
            borderRight: '1px solid rgba(220,20,60,.1)',
            backdropFilter: 'blur(24px)',
            padding: '32px 0',
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Vertical STUDIO watermark */}
            <span style={{
                position: 'absolute', right: '-28px', top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.4em',
                textTransform: 'uppercase', color: 'rgba(220,20,60,.15)',
                pointerEvents: 'none',
            }}>STUDIO</span>

            {/* User block */}
            <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,.05)', marginBottom: '16px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '2px',
                    background: 'linear-gradient(135deg,var(--rd),var(--r))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--fp)', fontSize: '16px', fontStyle: 'italic',
                    color: '#fff', marginBottom: '10px',
                }}>{initials}</div>
                <div style={{ fontFamily: 'var(--fg)', fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>
                    {user?.name || 'Stylist'}
                </div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--r)', marginTop: '2px' }}>
                    Style Studio
                </div>
            </div>

            {/* Studio nav */}
            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--t3)', padding: '0 20px', marginBottom: '8px' }}>
                Studio
            </div>

            {NAV_ITEMS.map(({ icon, label, to, live }) => (
                <NavLink
                    key={to}
                    to={to}
                    style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '11px 20px',
                        fontFamily: 'var(--fg)', fontSize: '12px', fontWeight: 500,
                        color: isActive ? 'var(--t1)' : 'var(--t2)',
                        background: isActive ? 'rgba(220,20,60,.07)' : 'transparent',
                        borderLeft: isActive ? '2px solid var(--r)' : '2px solid transparent',
                        textDecoration: 'none', cursor: 'none',
                        transition: 'all .2s',
                    })}
                    onMouseEnter={e => {
                        if (!e.currentTarget.classList.contains('active')) {
                            e.currentTarget.style.color = 'var(--t1)'
                            e.currentTarget.style.background = 'rgba(220,20,60,.04)'
                            e.currentTarget.style.borderLeft = '2px solid rgba(220,20,60,.3)'
                        }
                    }}
                    onMouseLeave={e => {
                        if (!e.currentTarget.classList.contains('active')) {
                            e.currentTarget.style.color = 'var(--t2)'
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderLeft = '2px solid transparent'
                        }
                    }}
                >
                    <span>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {live && (
                        <span style={{
                            width: '4px', height: '4px', borderRadius: '50%',
                            background: 'var(--r)', flexShrink: 0,
                            animation: 'pulse 2s ease-in-out infinite',
                        }} />
                    )}
                </NavLink>
            ))}

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,.04)', margin: '16px 0' }} />

            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--t3)', padding: '0 20px', marginBottom: '8px' }}>
                Account
            </div>

            <button
                onClick={() => navigate('/dashboard/settings')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 20px', background: 'transparent',
                    border: 'none', borderLeft: '2px solid transparent',
                    fontFamily: 'var(--fg)', fontSize: '12px', fontWeight: 500,
                    color: 'var(--t2)', cursor: 'none', transition: 'all .2s',
                    textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.background = 'rgba(220,20,60,.04)'; e.currentTarget.style.borderLeft = '2px solid rgba(220,20,60,.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '2px solid transparent' }}
            >
                ○ &nbsp; Settings
            </button>

            <button
                onClick={logout}
                style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 20px', background: 'transparent',
                    border: 'none', borderLeft: '2px solid transparent',
                    fontFamily: 'var(--fg)', fontSize: '12px', fontWeight: 500,
                    color: 'var(--t2)', cursor: 'none', transition: 'all .2s',
                    textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.background = 'rgba(220,20,60,.04)'; e.currentTarget.style.borderLeft = '2px solid rgba(220,20,60,.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '2px solid transparent' }}
            >
                ↗ &nbsp; Logout
            </button>
        </aside>
    )
}
