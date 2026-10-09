import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Move, Maximize2, RotateCw, RefreshCw, Check, X, Scissors,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react'

const DEFAULT_TRANSFORM = Object.freeze({
    posX: 0, posY: 0, scale: 1, scaleW: 1, scaleH: 1, rotation: 0, opacity: 1,
})
const ORDER = { lower_body: 0, upper_body: 1, dresses: 2 }
const LABELS = { upper_body: 'Upper', lower_body: 'Lower', dresses: 'Dress' }

function normalizedGarments(garments, clothingPhoto, category) {
    if (Array.isArray(garments) && garments.length) {
        const byCategory = new Map()
        garments.filter(g => g?.image).forEach(g => byCategory.set(g.category || category, g))
        return [...byCategory.values()].sort((a, b) => (ORDER[a.category] ?? 1) - (ORDER[b.category] ?? 1))
    }
    return clothingPhoto ? [{ image: clothingPhoto, category: category || 'upper_body', name: 'Garment' }] : []
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('An image could not be loaded. Try re-uploading it.'))
        image.src = src
    })
}

// Remove only edge-connected pixels close to the image's corner background colour.
// This avoids keying out enclosed white garment fabric.
function createGarmentSource(image, removeBackground) {
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(image, 0, 0, width, height)
    if (!removeBackground) return canvas

    try {
        const pixelsImage = ctx.getImageData(0, 0, width, height)
        const pixels = pixelsImage.data
        let alreadyTransparent = false
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 250) { alreadyTransparent = true; break }
        }
        if (alreadyTransparent) return canvas

        const patch = Math.max(2, Math.min(12, Math.floor(Math.min(width, height) * 0.025)))
        const corners = [[0, 0], [width - patch, 0], [0, height - patch], [width - patch, height - patch]]
        let r = 0, g = 0, b = 0, n = 0
        for (const [sx, sy] of corners) {
            for (let yy = sy; yy < sy + patch; yy++) {
                for (let xx = sx; xx < sx + patch; xx++) {
                    const i = (yy * width + xx) * 4
                    r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; n++
                }
            }
        }
        r /= n; g /= n; b /= n
        const cornerBrightness = (r + g + b) / 3
        const colourSpread = Math.max(r, g, b) - Math.min(r, g, b)
        if (colourSpread > 92) return canvas

        const tolerance = cornerBrightness > 185 ? 48 : cornerBrightness < 70 ? 43 : 34
        const toleranceSq = tolerance * tolerance * 3
        const total = width * height
        const visited = new Uint8Array(total)
        const queue = new Int32Array(total)
        let head = 0, tail = 0
        const add = (x, y) => {
            if (x < 0 || y < 0 || x >= width || y >= height) return
            const p = y * width + x
            if (visited[p]) return
            const i = p * 4
            const dr = pixels[i] - r, dg = pixels[i + 1] - g, db = pixels[i + 2] - b
            if (dr * dr + dg * dg + db * db > toleranceSq) return
            visited[p] = 1
            queue[tail++] = p
        }
        for (let x = 0; x < width; x++) { add(x, 0); add(x, height - 1) }
        for (let y = 1; y < height - 1; y++) { add(0, y); add(width - 1, y) }
        while (head < tail) {
            const p = queue[head++]
            pixels[p * 4 + 3] = 0
            const x = p % width, y = (p / width) | 0
            if (x > 0) add(x - 1, y)
            if (x + 1 < width) add(x + 1, y)
            if (y > 0) add(x, y - 1)
            if (y + 1 < height) add(x, y + 1)
        }
        ctx.putImageData(pixelsImage, 0, 0)
    } catch (error) {
        // If the image is remote and canvas access is blocked by CORS, use the original image.
        console.warn('[TryOnAdjuster] Background removal skipped:', error?.message || error)
    }
    return canvas
}

function categoryBox(category, width, height) {
    if (category === 'lower_body') return { x: width * 0.245, y: height * 0.455, w: width * 0.51, h: height * 0.49 }
    if (category === 'dresses') return { x: width * 0.205, y: height * 0.205, w: width * 0.59, h: height * 0.735 }
    return { x: width * 0.19, y: height * 0.215, w: width * 0.62, h: height * 0.30 }
}

export default function TryOnAdjuster({
    modelPhoto,
    clothingPhoto,
    category = 'upper_body',
    garments = [],
    initialTransforms = {},
    onApply,
    onClose,
}) {
    const canvasRef = useRef(null)
    const modelImageRef = useRef(null)
    const rawGarmentImagesRef = useRef({})
    const garmentSourcesRef = useRef({})
    const draggingRef = useRef(false)
    const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 })
    const [activeCategory, setActiveCategory] = useState(category || 'upper_body')
    const [transforms, setTransforms] = useState({})
    const [removeBackground, setRemoveBackground] = useState(true)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [loadError, setLoadError] = useState('')
    const [dragging, setDragging] = useState(false)
    const [cutoutVersion, setCutoutVersion] = useState(0)

    const garmentList = normalizedGarments(garments, clothingPhoto, category)
    const garmentKey = garmentList.map(g => `${g.category}:${g.name || ''}:${String(g.image).length}:${String(g.image).slice(-28)}`).join('|')
    const activeGarment = garmentList.find(g => g.category === activeCategory) || garmentList[0]
    const activeKey = activeGarment?.category || activeCategory
    const current = { ...DEFAULT_TRANSFORM, ...(transforms[activeKey] || {}) }

    useEffect(() => {
        setActiveCategory(category || garmentList[0]?.category || 'upper_body')
    }, [category, garmentKey])

    useEffect(() => {
        setTransforms(prev => ({ ...prev, ...(initialTransforms || {}) }))
    }, [initialTransforms])

    useEffect(() => {
        let cancelled = false
        setImagesLoaded(false)
        setLoadError('')
        const modelPromise = loadImage(modelPhoto)
        const garmentPromises = garmentList.map(async garment => ({
            category: garment.category,
            image: await loadImage(garment.image),
        }))
        Promise.all([modelPromise, ...garmentPromises]).then(([model, ...loadedGarments]) => {
            if (cancelled) return
            modelImageRef.current = model
            rawGarmentImagesRef.current = Object.fromEntries(loadedGarments.map(g => [g.category, g.image]))
            setImagesLoaded(true)
        }).catch(error => {
            if (!cancelled) setLoadError(error.message || 'Unable to load images for adjustment.')
        })
        return () => { cancelled = true }
    // `garmentKey` tracks image/name/category changes without reloading on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelPhoto, garmentKey])

    useEffect(() => {
        if (!imagesLoaded) return
        const next = {}
        for (const garment of garmentList) {
            const image = rawGarmentImagesRef.current[garment.category]
            if (image) next[garment.category] = createGarmentSource(image, removeBackground)
        }
        garmentSourcesRef.current = next
        setCutoutVersion(v => v + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imagesLoaded, removeBackground, garmentKey])

    const updateActive = useCallback((patch) => {
        setTransforms(prev => ({
            ...prev,
            [activeKey]: { ...DEFAULT_TRANSFORM, ...(prev[activeKey] || {}), ...patch },
        }))
    }, [activeKey])

    const drawCanvas = useCallback((showSelection = true) => {
        const canvas = canvasRef.current
        const model = modelImageRef.current
        if (!canvas || !model || !imagesLoaded) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const W = canvas.width, H = canvas.height
        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = '#111113'
        ctx.fillRect(0, 0, W, H)

        const mW = model.naturalWidth || model.width
        const mH = model.naturalHeight || model.height
        const fit = Math.min(W / mW, H / mH)
        const displayW = mW * fit, displayH = mH * fit
        ctx.drawImage(model, (W - displayW) / 2, (H - displayH) / 2, displayW, displayH)

        const hasDress = garmentList.some(g => g.category === 'dresses')
        const drawable = hasDress ? garmentList.filter(g => g.category === 'dresses') : [...garmentList].sort((a, b) => (ORDER[a.category] ?? 1) - (ORDER[b.category] ?? 1))
        for (const garment of drawable) {
            const source = garmentSourcesRef.current[garment.category]
            if (!source) continue
            const box = categoryBox(garment.category, W, H)
            const sourceW = source.width || 1, sourceH = source.height || 1
            const ratio = Math.min(box.w / sourceW, box.h / sourceH)
            const baseW = sourceW * ratio
            const baseH = sourceH * ratio
            const t = { ...DEFAULT_TRANSFORM, ...(transforms[garment.category] || {}) }
            const finalW = baseW * t.scale * t.scaleW
            const finalH = baseH * t.scale * t.scaleH
            const centerX = box.x + box.w / 2 + t.posX
            const centerY = box.y + box.h / 2 + t.posY

            ctx.save()
            ctx.globalAlpha = Math.max(0, Math.min(1, t.opacity))
            ctx.translate(centerX, centerY)
            ctx.rotate((t.rotation * Math.PI) / 180)
            ctx.shadowColor = 'rgba(0,0,0,.25)'
            ctx.shadowBlur = 7
            ctx.drawImage(source, -finalW / 2, -finalH / 2, finalW, finalH)
            ctx.shadowBlur = 0
            if (showSelection && garment.category === activeKey) {
                ctx.strokeStyle = dragging ? '#4ADE80' : '#BA7180'
                ctx.lineWidth = 3
                ctx.setLineDash([8, 5])
                ctx.strokeRect(-finalW / 2, -finalH / 2, finalW, finalH)
            }
            ctx.restore()
        }
    }, [imagesLoaded, garmentKey, transforms, activeKey, dragging, cutoutVersion])

    useEffect(() => { drawCanvas(true) }, [drawCanvas])

    const handlePointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return
        e.preventDefault()
        e.currentTarget.setPointerCapture?.(e.pointerId)
        draggingRef.current = true
        setDragging(true)
        dragStartRef.current = { x: e.clientX, y: e.clientY, posX: current.posX, posY: current.posY }
    }

    const handlePointerMove = (e) => {
        if (!draggingRef.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        updateActive({
            posX: Math.round(dragStartRef.current.posX + (e.clientX - dragStartRef.current.x) * canvas.width / rect.width),
            posY: Math.round(dragStartRef.current.posY + (e.clientY - dragStartRef.current.y) * canvas.height / rect.height),
        })
    }

    const handlePointerUp = (e) => {
        draggingRef.current = false
        setDragging(false)
        if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    }

    const resetActive = () => updateActive({ ...DEFAULT_TRANSFORM })
    const preset = () => {
        if (activeKey === 'lower_body') updateActive({ posX: 0, posY: 30, scale: 1, scaleW: 1, scaleH: 1, rotation: 0, opacity: 1 })
        else if (activeKey === 'dresses') updateActive({ posX: 0, posY: 0, scale: 1, scaleW: 1, scaleH: 1, rotation: 0, opacity: 1 })
        else updateActive({ posX: 0, posY: -12, scale: 1, scaleW: 1, scaleH: 1, rotation: 0, opacity: 1 })
    }

    const handleApply = () => {
        const canvas = canvasRef.current
        if (!canvas || !imagesLoaded) return
        drawCanvas(false)
        const dataUrl = canvas.toDataURL('image/png')
        onApply?.(dataUrl, transforms)
    }

    return (
        <section style={{ background: 'var(--bg-card, #18181b)', border: '1px solid var(--accent-border, #9b5866)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 17 }}>Adjust Garment Fit</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>Select Upper or Lower, then drag or fine-tune that garment. Other selected garments remain in the preview.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={resetActive}><RefreshCw size={13} /> Reset {LABELS[activeKey] || 'Garment'}</button>
                    {onClose && <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close fit editor"><X size={14} /></button>}
                </div>
            </div>

            {garmentList.length > 1 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {garmentList.map(g => (
                        <button key={g.category} className={`btn btn-sm ${activeKey === g.category ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveCategory(g.category); setDragging(false) }}>
                            {LABELS[g.category] || g.name || g.category}{activeKey === g.category ? ' · Editing' : ' ✓'}
                        </button>
                    ))}
                </div>
            )}

            {loadError && <div className="alert alert-error">{loadError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 380px) minmax(260px, 1fr)', gap: 18, alignItems: 'start' }}>
                <div>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 12, background: '#101012', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
                        <canvas ref={canvasRef} width={768} height={1024} style={{ width: '100%', height: '100%', display: 'block' }} />
                        {!imagesLoaded && !loadError && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,.6)' }}>Loading preview…</div>}
                        <div style={{ position: 'absolute', left: 10, top: 10, borderRadius: 18, padding: '5px 9px', background: 'rgba(0,0,0,.72)', color: '#fff', fontSize: 11, pointerEvents: 'none' }}><Move size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />Drag {LABELS[activeKey] || 'garment'} to move</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 9 }} onClick={preset}>Auto-align {LABELS[activeKey] || 'Garment'}</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 15, background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}><span><Maximize2 size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Scale</span><strong>{Math.round(current.scale * 100)}%</strong></label>
                        <input type="range" min="0.45" max="1.65" step="0.01" value={current.scale} onChange={e => updateActive({ scale: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}><span><Move size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Horizontal position</span><strong>{current.posX}px</strong></label>
                        <input type="range" min="-280" max="280" step="1" value={current.posX} onChange={e => updateActive({ posX: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}><span>Vertical position</span><strong>{current.posY}px</strong></label>
                        <input type="range" min="-300" max="300" step="1" value={current.posY} onChange={e => updateActive({ posY: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                        <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => updateActive({ posY: current.posY - 5 })}><ArrowUp size={12} /> Up</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => updateActive({ posY: current.posY + 5 })}><ArrowDown size={12} /> Down</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => updateActive({ posX: current.posX - 5 })}><ArrowLeft size={12} /> Left</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => updateActive({ posX: current.posX + 5 })}><ArrowRight size={12} /> Right</button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}><span><RotateCw size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />Rotation</span><strong>{current.rotation}°</strong></label>
                        <input type="range" min="-30" max="30" step="1" value={current.rotation} onChange={e => updateActive({ rotation: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}><span>Opacity</span><strong>{Math.round(current.opacity * 100)}%</strong></label>
                        <input type="range" min="0.55" max="1" step="0.01" value={current.opacity} onChange={e => updateActive({ opacity: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}><input type="checkbox" checked={removeBackground} onChange={e => setRemoveBackground(e.target.checked)} /> <Scissors size={14} /> Remove garment photo background</label>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                {onClose && <button className="btn btn-secondary" onClick={onClose}>Cancel</button>}
                <button className="btn btn-primary" onClick={handleApply} disabled={!imagesLoaded || Boolean(loadError)}><Check size={15} /> Apply All Garments</button>
            </div>
        </section>
    )
}
