import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import {
    Sparkles,
    Shirt,
    TrendingUp,
    MessageCircle,
    Camera,
    Upload,
    ArrowRight,
    Grid,
    CheckCircle2,
    Clock,
    Plus
} from 'lucide-react'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [analyses, setAnalyses] = useState([])
    const [aiStats, setAiStats] = useState({ totalAnalyses: 8, avgScore: 88, wardrobeCount: 24, totalLooks: 12, savedStyles: 6 })

    useEffect(() => {
        const load = async () => {
            try {
                const [histRes, statsRes] = await Promise.all([
                    axios.get('/api/analyze?limit=5'),
                    axios.get('/api/ai/stats'),
                ])
                if (histRes.data && histRes.data.data) {
                    setAnalyses(histRes.data.data)
                }
                if (statsRes.data) {
                    setAiStats(prev => ({ ...prev, ...statsRes.data }))
                }
            } catch {
                // Safe default values per spec
            }
        }
        load()
    }, [])

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    const greeting = getGreeting()

    const summaryCards = [
        { label: 'TOTAL LOOKS', value: aiStats.totalLooks || 12, desc: 'Curated outfits' },
        { label: 'STYLE ANALYSES', value: aiStats.totalAnalyses || 8, desc: 'Completed scans' },
        { label: 'WARDROBE ITEMS', value: aiStats.wardrobeCount || 24, desc: 'Cataloged pieces' },
        { label: 'SAVED STYLES', value: aiStats.savedStyles || 6, desc: 'Personal collection' },
    ]

    const recentActivities = [
        { title: 'Style analysis', date: 'Today', type: 'Camera Scan' },
        { title: 'Virtual try-on', date: 'Yesterday', type: 'IDM-VTON' },
        { title: 'Added clothing', date: '2 days ago', type: 'Digital Wardrobe' },
        { title: 'AI trend explored', date: '3 days ago', type: 'Trend Studio' },
    ]

    const wardrobePreviewImages = [
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop',
    ]

    return (
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    {greeting}, {user?.name ? user.name.split(' ')[0] : 'Stylist'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px', margin: 0 }}>
                    Your personal fashion workspace.
                </p>
            </div>

            {/* 4 Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {summaryCards.map((card) => (
                    <div
                        key={card.label}
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '20px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {card.label}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                            {card.value}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {card.desc}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Hero Section: YOUR STYLE TODAY */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '32px',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        DAILY HIGHLIGHT
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '12px', letterSpacing: '-0.01em' }}>
                        YOUR STYLE TODAY
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px', maxWidth: '480px' }}>
                        Discover a look that fits your style. Evaluate ensemble proportions, garment color harmony, and occasion appropriateness in seconds.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/dashboard/camera')}
                            style={{
                                backgroundColor: 'var(--text-primary)',
                                color: 'var(--bg-primary)',
                                border: '1px solid var(--text-primary)',
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Camera size={16} />
                            <span>Analyze My Outfit</span>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard/virtual-try-on')}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Shirt size={16} />
                            <span>Try Virtual Try-On</span>
                        </button>
                    </div>
                </div>

                <div style={{
                    height: '240px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    position: 'relative'
                }}>
                    <img
                        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
                        alt="Style Showcase"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* AI Features Section: AI STYLE STUDIO */}
            <div>
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        INTELLIGENT SUITE
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        AI STYLE STUDIO
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    
                    {/* Card 1: AI STYLE */}
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        minHeight: '200px'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <Sparkles size={20} color="var(--accent)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI STYLE</h3>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                Analyze your outfit and receive personalized fashion recommendations.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/suggestions')}
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '20px'
                            }}
                        >
                            <span>Open Style AI</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Card 2: AI TREND */}
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        minHeight: '200px'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <TrendingUp size={20} color="var(--accent)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI TREND</h3>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                Discover current fashion trends and style inspiration.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/suggestions?tab=ai-trend')}
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '20px'
                            }}
                        >
                            <span>Explore Trends</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Card 3: AI STYLIST */}
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        minHeight: '200px'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <MessageCircle size={20} color="var(--accent)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI STYLIST</h3>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                Talk with your AI fashion stylist and get real-time fashion advice.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/voice')}
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '20px'
                            }}
                        >
                            <span>Talk to Stylist</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                </div>
            </div>

            {/* Virtual Try-On Section */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        CLOTHING FITTING
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '6px' }}>
                        VIRTUAL TRY-ON
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: '520px' }}>
                        Upload your photo and a garment to see how the outfit looks on you.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/dashboard/virtual-try-on')}
                        style={{
                            backgroundColor: 'var(--accent)',
                            color: '#FFFFFF',
                            border: '1px solid var(--accent)',
                            padding: '10px 18px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Shirt size={15} />
                        <span>AI Photo Try-On</span>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/virtual-try-on?mode=3d')}
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            padding: '10px 18px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Sparkles size={15} />
                        <span>3D Try-On</span>
                    </button>
                </div>
            </div>

            {/* Bottom Row: Recent Activity & Wardrobe Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* RECENT ACTIVITY */}
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px'
                }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        RECENT ACTIVITY
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentActivities.map((act) => (
                            <div
                                key={act.title}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justify: 'space-between',
                                    padding: '12px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Clock size={14} color="var(--accent)" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{act.title}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MY WARDROBE PREVIEW */}
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>MY WARDROBE</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>24 items cataloged</div>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard/wardrobe')}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'var(--accent)',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span>Open Wardrobe</span>
                            <ArrowRight size={12} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {wardrobePreviewImages.map((imgSrc, i) => (
                            <div
                                key={i}
                                style={{
                                    height: '80px',
                                    borderRadius: 'var(--radius-sm)',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <img src={imgSrc} alt={`Wardrobe Preview ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    )
}
