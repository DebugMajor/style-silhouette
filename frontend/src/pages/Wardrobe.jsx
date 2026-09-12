import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const WARDROBE_ITEMS = [
    {
        id: 'w-1',
        name: 'Crimson Leather Jacket',
        category: 'Outerwear',
        tags: ['Statement', 'Winter', 'Biker'],
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320"><path d="M75,40 Q150,15 225,40 L275,110 L240,290 L185,290 L150,150 L115,290 L60,290 L25,110 Z" fill="%23dc143c" stroke="%238b0020" stroke-width="6"/><path d="M125,40 L150,130 L175,40" fill="none" stroke="%23ffffff" stroke-width="4"/><path d="M60,110 L95,280 M240,110 L205,280" fill="none" stroke="%23440010" stroke-width="5"/><circle cx="150" cy="180" r="8" fill="%23ffd700"/><path d="M75,40 L105,90 M225,40 L195,90" fill="none" stroke="%23ffffff" stroke-width="3"/></svg>`,
    },
    {
        id: 'w-2',
        name: 'Classic White Tee',
        category: 'Tops',
        tags: ['Basic', 'Casual', 'Cotton'],
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M80,30 Q150,55 220,30 L280,90 L240,130 L220,105 L220,280 L80,280 L80,105 L60,130 L20,90 Z" fill="%23f8f9fa" stroke="%23ced4da" stroke-width="4"/><path d="M110,30 Q150,70 190,30" fill="none" stroke="%23adb5bd" stroke-width="3"/><path d="M80,270 L220,270" fill="none" stroke="%23e9ecef" stroke-width="6"/></svg>`,
    },
    {
        id: 'w-3',
        name: 'Tailored Black Blazer',
        category: 'Outerwear',
        tags: ['Formal', 'Office', 'Elegant'],
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340"><path d="M70,30 Q150,10 230,30 L285,115 L245,310 L55,310 L15,115 Z" fill="%23121212" stroke="%232d2d2d" stroke-width="5"/><path d="M70,30 L135,170 L150,150 L165,170 L230,30" fill="%231a1a1a" stroke="%23dc143c" stroke-width="3"/><path d="M150,150 L150,310" stroke="%23333333" stroke-width="2"/><circle cx="150" cy="220" r="5" fill="%23ffffff"/><circle cx="150" cy="260" r="5" fill="%23ffffff"/></svg>`,
    },
    {
        id: 'w-4',
        name: 'Denim Vest Cutout',
        category: 'Tops',
        tags: ['Streetwear', 'Summer'],
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M85,35 Q150,60 215,35 L245,100 L225,275 L75,275 L55,100 Z" fill="%232b5c8f" stroke="%231a3959" stroke-width="5"/><path d="M100,100 L135,100 L135,140 L100,140 Z M165,100 L200,100 L200,140 L165,140 Z" fill="%231e4267" stroke="%23ffffff" stroke-dasharray="3,3"/><path d="M150,60 L150,275" stroke="%23ffc107" stroke-dasharray="4,3" stroke-width="2"/></svg>`,
    },
    {
        id: 'w-5',
        name: 'Designer Sunglasses',
        category: 'Accessories',
        tags: ['Luxury', 'Eyewear'],
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120"><path d="M20,35 Q75,15 130,35 L135,65 Q85,105 20,80 Z" fill="%230a0a0a" stroke="%23dc143c" stroke-width="5"/><path d="M170,35 Q225,15 280,35 L280,80 Q215,105 165,65 Z" fill="%230a0a0a" stroke="%23dc143c" stroke-width="5"/><rect x="130" y="40" width="35" height="8" rx="4" fill="%23dc143c"/><path d="M30,45 Q75,30 115,50" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4"/></svg>`,
    },
    {
        id: 'w-6',
        name: 'Gold Chain Necklace',
        category: 'Accessories',
        tags: ['Jewelry', 'Gold'],
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><path d="M60,20 Q150,180 240,20" fill="none" stroke="%23ffd700" stroke-width="8" stroke-dasharray="12 6"/><polygon points="150,145 165,175 135,175" fill="%23ffb700" stroke="%23ffffff" stroke-width="2"/></svg>`,
    },
]

const CATEGORIES = ['All', 'Tops', 'Outerwear', 'Accessories']

export default function Wardrobe() {
    const [selectedCat, setSelectedCat] = useState('All')
    const navigate = useNavigate()

    const filtered = selectedCat === 'All'
        ? WARDROBE_ITEMS
        : WARDROBE_ITEMS.filter((i) => i.category === selectedCat)

    const handleTryOn = (item) => {
        const itemParam = encodeURIComponent(JSON.stringify(item))
        navigate(`/dashboard/virtual-try-on?item=${itemParam}`)
    }

    return (
        <div style={{ padding: '36px 40px', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div className="ol-r">Digital Closet</div>
                    <div style={{ fontFamily: 'var(--fp)', fontSize: '36px', fontWeight: 700, fontStyle: 'italic', marginTop: '4px' }}>
                        <span style={{ color: 'var(--r)' }}>Digital</span> Wardrobe
                    </div>
                </div>

                <button
                    className="btn bp"
                    onClick={() => navigate('/dashboard/virtual-try-on')}
                >
                    ✂ Open Virtual Try-On Studio
                </button>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCat(cat)}
                        className={`badge ${selectedCat === cat ? '' : 'badge-w'}`}
                        style={{
                            padding: '8px 18px',
                            cursor: 'none',
                            fontSize: '10px',
                            background: selectedCat === cat ? 'var(--r)' : 'rgba(255,255,255,0.03)',
                            color: selectedCat === cat ? '#fff' : 'var(--t2)',
                            borderColor: selectedCat === cat ? 'var(--r)' : 'var(--b)',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {filtered.map((item) => (
                    <div
                        key={item.id}
                        className="gl lift"
                        style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}
                    >
                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', padding: '10px' }}>
                            <img src={item.imageSrc} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>

                        <div style={{ fontFamily: 'var(--fg)', fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>
                            {item.name}
                        </div>

                        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', textTransform: 'uppercase', color: 'var(--r)', marginBottom: '12px' }}>
                            {item.category}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {item.tags.map((tag) => (
                                <span key={tag} className="badge-w" style={{ fontSize: '8px' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <button
                            className="btn bp"
                            style={{ marginTop: 'auto', width: '100%', fontSize: '10px' }}
                            onClick={() => handleTryOn(item)}
                        >
                            ✂ Try On Look →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
