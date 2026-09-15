import { Link } from 'react-router-dom'
import { ArrowRight, Shirt, Sparkles, Wand2 } from 'lucide-react'

export default function Hero() {
    return (
        <section id="hero" style={{
            padding: '72px 24px 96px',
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '56px',
            alignItems: 'center'
        }}>
            {/* Left Copy */}
            <div>
                <div className="overline-badge" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '20px', height: '1px', backgroundColor: 'var(--accent)' }} />
                    <span>01 / AUTUMN WINTER 2026 LOOKBOOK</span>
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(42px, 5.2vw, 68px)',
                    fontWeight: 400,
                    lineHeight: 1.08,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    marginBottom: '24px'
                }}>
                    Elegance Refined by <br />
                    <span style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 400 }}>Intelligence.</span>
                </h1>

                <p style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                    maxWidth: '500px',
                    marginBottom: '40px',
                    fontWeight: 300
                }}>
                    Experience precision haute couture recommendations, photorealistic IDM-VTON virtual try-on, and real-time AI outfit harmonizing.
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '60px' }}>
                    <Link to="/register" className="btn btn-editorial">
                        <span>EXPLORE AI STUDIO</span>
                    </Link>
                    <Link to="/dashboard/virtual-try-on" className="btn btn-secondary btn-lg" style={{ borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        <Shirt size={14} />
                        <span>VIRTUAL TRY-ON</span>
                    </Link>
                </div>

                {/* Metrics Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    paddingTop: '32px',
                    borderTop: '1px solid var(--border)'
                }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)' }}>2.4K+</div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginTop: '4px' }}>Outfits Analysed</div>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)' }}>94%</div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginTop: '4px' }}>Style Precision</div>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)' }}>&lt;500ms</div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginTop: '4px' }}>Latency</div>
                    </div>
                </div>
            </div>

            {/* Right Editorial Photo Frame */}
            <div style={{ position: 'relative' }}>
                <div className="valtero-img-frame" style={{ height: '560px', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" 
                        alt="High Fashion Editorial Model" 
                    />
                    
                    {/* Floating Editorial Badge */}
                    <div style={{
                        position: 'absolute',
                        bottom: '24px',
                        left: '24px',
                        right: '24px',
                        backgroundColor: 'rgba(13, 13, 14, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--border)',
                        padding: '16px 20px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between'
                    }}>
                        <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', fontWeight: 600 }}>
                                IDM-VTON ARCHITECTURE
                            </div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                                Couture Garment Synthesis
                            </div>
                        </div>
                        <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            2026 EDITION
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}

