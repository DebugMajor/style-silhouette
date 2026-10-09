import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shirt, ArrowRight, Plus } from 'lucide-react'

const WARDROBE_ITEMS = [
    {
        id: 'w-1',
        name: 'Haute Couture Wool Trench Coat',
        category: 'Outerwear',
        tags: ['Statement', 'Winter', 'Tailored'],
        imageSrc: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'w-2',
        name: 'Structured Silk Evening Blazer',
        category: 'Outerwear',
        tags: ['Minimalist', 'Formal', 'Silk'],
        imageSrc: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'w-3',
        name: 'Draped Linen Editorial Top',
        category: 'Tops',
        tags: ['Contemporary', 'Couture'],
        imageSrc: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'w-4',
        name: 'High-Waist Tailored Trousers',
        category: 'Tops',
        tags: ['Workwear', 'Monochrome'],
        imageSrc: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'w-5',
        name: 'Architectural Runway Dress',
        category: 'Outerwear',
        tags: ['Runway', 'Luxury'],
        imageSrc: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'w-6',
        name: 'Minimalist Studio Vest',
        category: 'Tops',
        tags: ['Studio', 'Edgy'],
        imageSrc: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    },
]

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories']

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
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        MY WARDROBE
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', margin: 0, fontSize: '0.9rem' }}>
                        Manage your digital closet and catalog pieces for virtual try-on fitting.
                    </p>
                </div>

                <button
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
                    onClick={() => navigate('/dashboard/upload')}
                >
                    <Plus size={16} />
                    <span>Add Clothing</span>
                </button>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCat(cat)}
                        className={`btn btn-sm ${selectedCat === cat ? 'btn-primary' : 'btn-secondary'}`}
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
                        className="card card-hover"
                        style={{ display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
                            <img src={item.imageSrc} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>

                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {item.name}
                        </div>

                        <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                            {item.category}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {item.tags.map((tag) => (
                                <span key={tag} className="badge">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: 'auto', width: '100%' }}
                            onClick={() => handleTryOn(item)}
                        >
                            <span>Try On Look</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
