import { Camera, Sparkles, Check, Database } from 'lucide-react'

const HOW = [
    { num: '01', title: 'Capture Silhouette', desc: 'Capture outfit composition using high-definition camera feed or direct media upload.' },
    { num: '02', title: 'Gemini AI Vision', desc: 'Multimodal vision neural net evaluates fabric drape, silhouette proportions, and color palette harmony.' },
    { num: '03', title: 'Actionable Styling', desc: 'Receive precise garment styling adjustments, occasion suitability scores, and layering tips.' },
    { num: '04', title: 'Digital Closet', desc: 'Organize your physical garments into a digital wardrobe repository for automatic outfit remixing.' },
]

export default function About() {
    return (
        <section id="about" style={{ padding: '110px 24px', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Top Narrative Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '64px',
                alignItems: 'center',
                marginBottom: '80px'
            }}>
                <div>
                    <div className="overline-badge" style={{ marginBottom: '16px' }}>03 / BRAND PHILOSOPHY</div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '24px', lineHeight: 1.15 }}>
                        Bridging Haute Couture Aesthetics & Neural Vision
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 300, marginBottom: '32px' }}>
                        Style-A-Silhouette explores the intersection of artificial intelligence, computer vision, and luxury fashion curation. Designed to empower individuals with instantaneous, objective, and elevated styling recommendations.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '4px' }}>ARCHITECTURE</div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>IDM-VTON & Gemini 1.5</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '4px' }}>SHADERS</div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Tripo PBR Rendering</div>
                        </div>
                    </div>
                </div>

                <div className="valtero-img-frame" style={{ height: '480px', borderRadius: '4px' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop" 
                        alt="Fashion Editorial Studio" 
                    />
                </div>
            </div>

            {/* How it works steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                {HOW.map(({ num, title, desc }) => (
                    <div key={title} className="card" style={{ padding: '28px', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '16px' }}>{num}</div>
                        <div>
                            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

