import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shirt, ArrowRight, Plus } from 'lucide-react'

const WARDROBE_ITEMS = [
    {
        id: 'catalog-tee-ivory',
        name: 'Essential Ivory Crew-Neck T-Shirt',
        category: 'Tops',
        tryOnCategory: 'upper_body',
        tags: ['Casual', 'Neutral', 'Everyday'],
        imageSrc: '/wardrobe/catalog/ivory-tee.png',
    },
    {
        id: 'catalog-jeans-indigo',
        name: 'Indigo Straight-Leg Jeans',
        category: 'Bottoms',
        tryOnCategory: 'lower_body',
        tags: ['Denim', 'Casual', 'Everyday'],
        imageSrc: '/wardrobe/catalog/indigo-jeans.png',
    },
    {
        id: 'catalog-chinos-sand',
        name: 'Sand Slim-Fit Chinos',
        category: 'Bottoms',
        tryOnCategory: 'lower_body',
        tags: ['Smart Casual', 'Neutral', 'Tailored'],
        imageSrc: '/wardrobe/catalog/sand-chinos.png',
    },
    {
        id: 'catalog-oxford-blue',
        name: 'Light Blue Oxford Shirt',
        category: 'Tops',
        tryOnCategory: 'upper_body',
        tags: ['Smart Casual', 'Office', 'Classic'],
        imageSrc: '/wardrobe/catalog/oxford-shirt.png',
    },
    {
        id: 'catalog-bomber-olive',
        name: 'Olive Casual Bomber Jacket',
        category: 'Outerwear',
        tryOnCategory: 'upper_body',
        tags: ['Layering', 'Casual', 'Earth Tones'],
        imageSrc: '/wardrobe/catalog/olive-bomber.png',
    },
    {
        id: 'catalog-polo-navy',
        name: 'Navy Pique Polo Shirt',
        category: 'Tops',
        tryOnCategory: 'upper_body',
        tags: ['Smart Casual', 'Navy', 'Everyday'],
        imageSrc: '/wardrobe/catalog/navy-polo.png',
    },
]

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear']

function wardrobeTryOnSlot(item) {
    const description = `${item?.name || ''} ${item?.category || ''}`.toLowerCase()
    if (/\b(dress|gown|jumpsuit|romper)\b/.test(description)) return 'dresses'
    if (/\b(jeans?|trousers?|pants?|shorts?|skirt|leggings?|bottoms?|chinos?)\b/.test(description) || /\bbottoms\b/i.test(item?.category || '')) return 'lower_body'
    if (/\b(shoes?|sneakers?|boots?|sandals?)\b/.test(description)) return 'lower_body'
    return 'upper_body'
}


export default function Wardrobe() {
    const [selectedCat, setSelectedCat] = useState('All')
    const [selectedItems, setSelectedItems] = useState([])
    const navigate = useNavigate()

    const filtered = selectedCat === 'All'
        ? WARDROBE_ITEMS
        : WARDROBE_ITEMS.filter((i) => i.category === selectedCat)

    const handleTryOn = (item) => {
        setSelectedItems(prev => {
            const alreadySelected = prev.some(selected => selected.id === item.id)
            if (alreadySelected) return prev.filter(selected => selected.id !== item.id)

            const slot = wardrobeTryOnSlot(item)
            // A dress covers both regions, so it is selected on its own.
            if (slot === 'dresses') return [item]
            // Selecting an upper/lower item replaces only the prior item in that same slot.
            return [...prev.filter(selected => {
                const selectedSlot = wardrobeTryOnSlot(selected)
                return selectedSlot !== 'dresses' && selectedSlot !== slot
            }), item]
        })
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

                {selectedItems.length > 0 && (
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/dashboard/virtual-try-on', { state: { wardrobeItems: selectedItems } })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                        <ArrowRight size={15} /> Try On Selected ({selectedItems.length})
                    </button>
                )}

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
                {filtered.map((item) => {
                    const isSelected = selectedItems.some(selected => selected.id === item.id)
                    return (
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
                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ marginTop: 'auto', width: '100%' }}
                            onClick={() => handleTryOn(item)}
                        >
                            <span>{isSelected ? 'Selected ✓' : 'Select for Try-On'}</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>
                    )
                })}
            </div>
        </div>
    )
}
