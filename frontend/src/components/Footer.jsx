import { Link } from 'react-router-dom'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer style={{
            borderTop: '1px solid var(--border)',
            padding: '60px 36px 40px',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '13px'
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', marginBottom: '48px' }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        color: 'var(--text-primary)',
                        marginBottom: '12px'
                    }}>
                        STYLE<span style={{ color: 'var(--accent)', fontStyle: 'italic', margin: '0 4px' }}>A</span>SILHOUETTE
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, fontWeight: 300 }}>
                        High-precision virtual try-on, 3D avatar rendering, and multimodal fashion intelligence platform.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '48px' }}>
                    <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '16px' }}>
                            PLATFORM
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                            <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
                            <Link to="/dashboard/virtual-try-on" style={{ color: 'var(--text-secondary)' }}>Virtual Try-On</Link>
                            <Link to="/dashboard/wardrobe" style={{ color: 'var(--text-secondary)' }}>Digital Wardrobe</Link>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '16px' }}>
                            AI STUDIOS
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                            <Link to="/dashboard/ai-trend" style={{ color: 'var(--text-secondary)' }}>3D Avatar Generator</Link>
                            <Link to="/dashboard/voice" style={{ color: 'var(--text-secondary)' }}>Voice Stylist</Link>
                            <Link to="/dashboard/camera" style={{ color: 'var(--text-secondary)' }}>Gemini Vision</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>© {year} STYLE-A-SILHOUETTE PLATFORM. ALL RIGHTS RESERVED.</span>
                <span>DESIGN REFERENCE: VALTERO EDITORIAL</span>
            </div>
        </footer>
    )
}

