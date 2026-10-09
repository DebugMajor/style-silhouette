import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard,
    Sparkles,
    TrendingUp,
    MessageCircle,
    Shirt,
    Box,
    Grid,
    Camera,
    Upload,
    Settings,
    LogOut
} from 'lucide-react'

export default function Sidebar() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const navSections = [
        {
            title: 'OVERVIEW',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard', end: true },
            ]
        },
        {
            title: 'AI STUDIO',
            items: [
                { icon: Sparkles, label: 'AI Style', to: '/dashboard/suggestions' },
                { icon: TrendingUp, label: 'AI Trends', to: '/dashboard/suggestions?tab=ai-trend' },
                { icon: MessageCircle, label: 'AI Stylist', to: '/dashboard/voice' },
            ]
        },
        {
            title: 'TRY-ON',
            items: [
                { icon: Shirt, label: 'Virtual Try-On', to: '/dashboard/virtual-try-on' },
                { icon: Box, label: '3D Studio', to: '/dashboard/virtual-try-on?mode=3d' },
            ]
        },
        {
            title: 'WARDROBE',
            items: [
                { icon: Grid, label: 'My Wardrobe', to: '/dashboard/wardrobe' },
            ]
        },
        {
            title: 'TOOLS',
            items: [
                { icon: Camera, label: 'Camera', to: '/dashboard/camera' },
                { icon: Upload, label: 'Upload', to: '/dashboard/upload' },
            ]
        },
        {
            title: 'ACCOUNT',
            items: [
                { icon: Settings, label: 'Settings', action: () => navigate('/dashboard/settings') },
                { icon: LogOut, label: 'Logout', action: logout, isDanger: true },
            ]
        }
    ]

    return (
        <aside style={{
            width: '240px',
            minWidth: '240px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            zIndex: 95
        }}>
            {/* Logo Header */}
            <div style={{ padding: '0 8px', marginBottom: '8px' }}>
                <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase'
                }}>
                    STYLE-A-SILHOUETTE
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.12em', marginTop: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                    AI FASHION PLATFORM
                </div>
            </div>

            {/* Navigation Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                {navSections.map((sec) => (
                    <div key={sec.title}>
                        <div style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: 'var(--text-muted)',
                            marginBottom: '8px',
                            paddingLeft: '8px'
                        }}>
                            {sec.title}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {sec.items.map((item) => {
                                const Icon = item.icon
                                if (item.action) {
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={item.action}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '9px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                color: item.isDanger ? '#EF4444' : 'var(--text-secondary)',
                                                background: 'transparent',
                                                width: '100%',
                                                textAlign: 'left',
                                                transition: 'var(--transition)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                        </button>
                                    )
                                }

                                const isActive = item.end
                                    ? location.pathname === item.to
                                    : location.pathname + location.search === item.to || (location.pathname === item.to && !location.search)

                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        style={() => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '9px 12px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            background: isActive ? 'var(--bg-card)' : 'transparent',
                                            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                                            transition: 'var(--transition)'
                                        })}
                                    >
                                        <Icon size={16} color={isActive ? 'var(--accent)' : 'var(--text-secondary)'} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    )
}
