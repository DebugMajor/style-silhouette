import { Camera, Sparkles, CheckCircle, Mic, Grid, Upload, Shirt, Box } from 'lucide-react'

const FEATURES = [
    {
        num: '01', icon: Shirt,
        title: 'IDM-VTON Virtual Try-On',
        desc: 'Photorealistic garment synthesis mapping luxury clothing onto model photos via diffusion AI.',
        tag: 'TRY-ON STUDIO',
        img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'
    },
    {
        num: '02', icon: Grid,
        title: 'Digital Wardrobe Closet',
        desc: 'Catalog your haute couture garments, catalog items by silhouette, and curate custom lookbooks.',
        tag: 'DIGITAL CLOSET',
        img: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop'
    },
    {
        num: '03', icon: Box,
        title: '3D Avatar Generation',
        desc: 'Generate interactive 3D avatars with Tripo PBR shaders for 360-degree garment inspection.',
        tag: 'TRIPO 3D',
        img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'
    },
    {
        num: '04', icon: Mic,
        title: 'ElevenLabs Voice Stylist',
        desc: 'Spoken dialogue fashion assistant offering real-time advice and garment pairing harmony.',
        tag: 'VOICE STYLIST',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'
    },
    {
        num: '05', icon: Sparkles,
        title: 'Gemini Vision Analysis',
        desc: 'Multimodal AI vision analyzing fabric textures, color harmony, and occasion appropriateness.',
        tag: 'GEMINI VISION',
        img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop'
    },
    {
        num: '06', icon: Camera,
        title: 'Live Camera Capture',
        desc: 'Instant camera feed integration for real-time outfit inspection and style scoring.',
        tag: 'LIVE CAMERA',
        img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop'
    },
]

export default function Features() {
    return (
        <section id="features" style={{
            padding: '110px 24px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div className="container">
                <div style={{ marginBottom: '64px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <div className="overline-badge" style={{ marginBottom: '12px' }}>02 / CURATED CAPABILITIES</div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                            Haute Couture Meets Artificial Intelligence
                        </h2>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
                        From high-resolution virtual try-on to 3D avatar generation — an editorial technology platform built for modern fashion creation.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
                    {FEATURES.map(({ num, icon: Icon, title, desc, tag, img }) => (
                        <div key={num} className="valtero-img-frame" style={{ height: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
                            <img src={img} alt={title} style={{ filter: 'brightness(0.35)' }} />

                            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--accent)' }}>{num}</span>
                                <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                                    {tag}
                                </span>
                            </div>

                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    {title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, fontWeight: 300 }}>
                                    {desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

