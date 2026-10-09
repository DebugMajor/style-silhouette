import { useState, useRef, useEffect, useCallback } from 'react'
import {
    Move,
    Maximize2,
    RotateCw,
    RefreshCw,
    Check,
    X,
    Sliders,
    ZoomIn,
    ZoomOut,
    Eye,
    Scissors,
    Lock,
    Unlock,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Sparkles
} from 'lucide-react'

export default function TryOnAdjuster({
    modelPhoto,
    clothingPhoto,
    category = 'upper_body',
    onApply,
    onClose
}) {
    const canvasRef = useRef(null)

    // ── Adjustment States ──
    const [posX, setPosX] = useState(0)
    const [posY, setPosY] = useState(0)
    const [scale, setScale] = useState(1.0)
    const [scaleW, setScaleW] = useState(1.0)
    const [scaleH, setScaleH] = useState(1.0)
    const [lockAspect, setLockAspect] = useState(true)
    const [rotation, setRotation] = useState(0)
    const [opacity, setOpacity] = useState(1.0)
    const [removeWhiteBg, setRemoveWhiteBg] = useState(true)
    const [bgThreshold, setBgThreshold] = useState(235)

    // Interaction state
    const [isDragging, setIsDragging] = useState(false)
    const dragStartRef = useRef({ x: 0, y: 0, initialPosX: 0, initialPosY: 0 })

    // Loaded image elements ref
    const modelImgRef = useRef(null)
    const clothingImgRef = useRef(null)
    const processedGarmentCanvasRef = useRef(null)
    const [imagesLoaded, setImagesLoaded] = useState(false)

    // ── Helper: Process Garment Background Keying ──
    const getProcessedGarmentCanvas = useCallback((garmentImg, shouldRemoveBg, threshold) => {
        const offCanvas = document.createElement('canvas')
        offCanvas.width = garmentImg.width || 500
        offCanvas.height = garmentImg.height || 500
        const ctx = offCanvas.getContext('2d')
        ctx.drawImage(garmentImg, 0, 0)

        if (!shouldRemoveBg) {
            return offCanvas
        }

        const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height)
        const data = imgData.data

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            
            // Check if pixel is near white/light gray
            if (r >= threshold && g >= threshold && b >= threshold) {
                data[i + 3] = 0 // transparent
            } else if (r >= threshold - 20 && g >= threshold - 20 && b >= threshold - 20) {
                // Smooth feather edge
                const avg = (r + g + b) / 3
                const alphaFactor = Math.max(0, (255 - avg) / (255 - (threshold - 20)))
                data[i + 3] = Math.floor(data[i + 3] * alphaFactor)
            }
        }

        ctx.putImageData(imgData, 0, 0)
        return offCanvas
    }, [])

    // ── Load Images into Refs ──
    useEffect(() => {
        let isMounted = true
        setImagesLoaded(false)

        const mImg = new Image()
        mImg.crossOrigin = 'anonymous'

        const cImg = new Image()
        cImg.crossOrigin = 'anonymous'

        let loadedCount = 0
        const checkDone = () => {
            loadedCount++
            if (loadedCount === 2 && isMounted) {
                modelImgRef.current = mImg
                clothingImgRef.current = cImg
                setImagesLoaded(true)
            }
        }

        mImg.onload = checkDone
        mImg.onerror = checkDone
        cImg.onload = checkDone
        cImg.onerror = checkDone

        mImg.src = modelPhoto
        cImg.src = clothingPhoto

        return () => {
            isMounted = false
        }
    }, [modelPhoto, clothingPhoto])

    // Update background keying cache canvas when garment image or threshold changes
    useEffect(() => {
        if (imagesLoaded && clothingImgRef.current) {
            processedGarmentCanvasRef.current = getProcessedGarmentCanvas(
                clothingImgRef.current,
                removeWhiteBg,
                bgThreshold
            )
        }
    }, [imagesLoaded, clothingPhoto, removeWhiteBg, bgThreshold, getProcessedGarmentCanvas])

    // ── Category Base Positioning Defaults ──
    const getBaseGarmentRect = useCallback((canvasWidth, canvasHeight) => {
        let targetX = canvasWidth * 0.2
        let targetY = canvasHeight * 0.24
        let targetW = canvasWidth * 0.6
        let targetH = canvasHeight * 0.45

        if (category === 'lower_body') {
            targetY = canvasHeight * 0.52
            targetH = canvasHeight * 0.42
            targetW = canvasWidth * 0.5
            targetX = canvasWidth * 0.25
        } else if (category === 'dresses') {
            targetY = canvasHeight * 0.22
            targetH = canvasHeight * 0.7
            targetW = canvasWidth * 0.65
            targetX = canvasWidth * 0.175
        }

        return { targetX, targetY, targetW, targetH }
    }, [category])

    // ── Render Main Canvas ──
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || !imagesLoaded || !modelImgRef.current) return

        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height

        // Clear canvas
        ctx.fillStyle = '#121214'
        ctx.fillRect(0, 0, width, height)

        // Draw model background image
        const humanImg = modelImgRef.current
        if (humanImg && humanImg.naturalWidth) {
            const hRatio = width / humanImg.naturalWidth
            const vRatio = height / humanImg.naturalHeight
            const ratio = Math.min(hRatio, vRatio)
            const shiftX = (width - humanImg.naturalWidth * ratio) / 2
            const shiftY = (height - humanImg.naturalHeight * ratio) / 2

            ctx.drawImage(
                humanImg,
                0, 0, humanImg.naturalWidth, humanImg.naturalHeight,
                shiftX, shiftY, humanImg.naturalWidth * ratio, humanImg.naturalHeight * ratio
            )
        }

        // Draw garment image with transforms
        const garmentSource = processedGarmentCanvasRef.current || clothingImgRef.current
        if (garmentSource) {
            const baseRect = getBaseGarmentRect(width, height)
            
            // Calculate center point of garment base box
            const baseCenterX = baseRect.targetX + baseRect.targetW / 2
            const baseCenterY = baseRect.targetY + baseRect.targetH / 2

            // Apply transforms
            const finalWidth = baseRect.targetW * scale * scaleW
            const finalHeight = baseRect.targetH * scale * scaleH
            const finalCenterX = baseCenterX + posX
            const finalCenterY = baseCenterY + posY

            ctx.save()
            ctx.globalAlpha = opacity

            // Position at center of transformed box for clean rotation
            ctx.translate(finalCenterX, finalCenterY)
            ctx.rotate((rotation * Math.PI) / 180)

            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
            ctx.shadowBlur = 16
            ctx.shadowOffsetY = 6

            ctx.drawImage(
                garmentSource,
                -finalWidth / 2,
                -finalHeight / 2,
                finalWidth,
                finalHeight
            )

            // If dragging, draw bounding box indicator
            if (isDragging) {
                ctx.strokeStyle = '#4ADE80'
                ctx.lineWidth = 2
                ctx.setLineDash([6, 4])
                ctx.strokeRect(
                    -finalWidth / 2,
                    -finalHeight / 2,
                    finalWidth,
                    finalHeight
                )
            }

            ctx.restore()
        }
    }, [imagesLoaded, getBaseGarmentRect, posX, posY, scale, scaleW, scaleH, rotation, opacity, isDragging])

    useEffect(() => {
        renderCanvas()
    }, [renderCanvas])

    // ── Mouse / Touch Drag Handlers ──
    const handlePointerDown = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        setIsDragging(true)
        dragStartRef.current = {
            x: clientX,
            y: clientY,
            initialPosX: posX,
            initialPosY: posY
        }
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const scaleFactorX = canvas.width / rect.width
        const scaleFactorY = canvas.height / rect.height

        const deltaX = (clientX - dragStartRef.current.x) * scaleFactorX
        const deltaY = (clientY - dragStartRef.current.y) * scaleFactorY

        setPosX(Math.round(dragStartRef.current.initialPosX + deltaX))
        setPosY(Math.round(dragStartRef.current.initialPosY + deltaY))
    }

    const handlePointerUp = () => {
        setIsDragging(false)
    }

    // ── Reset Controls ──
    const handleReset = () => {
        setPosX(0)
        setPosY(0)
        setScale(1.0)
        setScaleW(1.0)
        setScaleH(1.0)
        setRotation(0)
        setOpacity(1.0)
        setRemoveWhiteBg(true)
        setBgThreshold(235)
    }

    // ── Preset Alignments ──
    const applyPreset = (presetType) => {
        if (presetType === 'upper') {
            setPosY(-40)
            setScale(1.05)
        } else if (presetType === 'lower') {
            setPosY(60)
            setScale(1.0)
        } else if (presetType === 'dress') {
            setPosY(0)
            setScale(1.1)
        } else if (presetType === 'center') {
            setPosX(0)
            setPosY(0)
            setScale(1.0)
        }
    }

    // ── Apply & Export Canvas Result ──
    const handleApplyResult = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        // Final render clean without drag lines
        renderCanvas()
        const dataUrl = canvas.toDataURL('image/png')
        if (onApply) {
            onApply(dataUrl)
        }
    }

    return (
        <div style={{
            background: 'var(--bg-card, #18181b)',
            border: '1px solid var(--accent, #6366f1)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent, #6366f1)',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Move size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            Custom Garment Positioning & Resizing
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                            Drag on canvas or use sliders to scale, position, and fit garment perfectly on model.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleReset} className="btn btn-secondary btn-sm" title="Reset to default fit">
                        <RefreshCw size={13} />
                        <span>Reset Fit</span>
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Editor Body: Canvas Viewport (Left) + Sliders & Controls (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
                
                {/* CANVAS VIEWPORT */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '380px',
                            aspectRatio: '3/4',
                            borderRadius: 'var(--radius-md, 8px)',
                            overflow: 'hidden',
                            border: isDragging ? '2px solid #4ADE80' : '1px solid var(--border)',
                            background: '#09090b',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                        onMouseDown={handlePointerDown}
                        onMouseMove={handlePointerMove}
                        onMouseUp={handlePointerUp}
                        onMouseLeave={handlePointerUp}
                        onTouchStart={handlePointerDown}
                        onTouchMove={handlePointerMove}
                        onTouchEnd={handlePointerUp}
                    >
                        <canvas
                            ref={canvasRef}
                            width={768}
                            height={1024}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        />

                        {/* Interactive Drag Hint Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(4px)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            pointerEvents: 'none'
                        }}>
                            <Move size={12} color="#4ADE80" />
                            <span>Drag Garment to Move</span>
                        </div>

                        {!imagesLoaded && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(18, 18, 20, 0.9)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: 'var(--text-muted)'
                            }}>
                                <div className="spinner" style={{ width: '28px', height: '28px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
                                <span style={{ fontSize: '12px' }}>Loading Canvas Assets...</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Preset Buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '380px' }}>
                        <button onClick={() => applyPreset('upper')} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>
                            Upper Body Preset
                        </button>
                        <button onClick={() => applyPreset('lower')} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>
                            Lower Body Preset
                        </button>
                        <button onClick={() => applyPreset('dress')} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>
                            Dress Preset
                        </button>
                        <button onClick={() => applyPreset('center')} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>
                            Center Alignment
                        </button>
                    </div>
                </div>

                {/* SLIDERS & FINE CONTROLS PANEL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-secondary, #27272a)', padding: '16px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border)' }}>
                    
                    {/* SECTION 1: RESIZE & SCALE */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Maximize2 size={14} color="var(--accent)" />
                                <span>Overall Scale ({Math.round(scale * 100)}%)</span>
                            </label>
                            <button
                                onClick={() => setLockAspect(!lockAspect)}
                                className={`btn btn-sm ${lockAspect ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                title={lockAspect ? 'Unlock Width & Height' : 'Lock Aspect Ratio'}
                            >
                                {lockAspect ? <Lock size={11} /> : <Unlock size={11} />}
                                <span>{lockAspect ? 'Locked' : 'Unlocked'}</span>
                            </button>
                        </div>

                        <input
                            type="range"
                            min="0.3"
                            max="2.2"
                            step="0.02"
                            value={scale}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value)
                                setScale(val)
                                if (lockAspect) {
                                    setScaleW(1.0)
                                    setScaleH(1.0)
                                }
                            }}
                            style={{ width: '100%', accentColor: 'var(--accent)' }}
                        />

                        {!lockAspect && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Width ({Math.round(scaleW * 100)}%)
                                    </div>
                                    <input
                                        type="range"
                                        min="0.4"
                                        max="2.0"
                                        step="0.05"
                                        value={scaleW}
                                        onChange={(e) => setScaleW(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                                    />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Height ({Math.round(scaleH * 100)}%)
                                    </div>
                                    <input
                                        type="range"
                                        min="0.4"
                                        max="2.0"
                                        step="0.05"
                                        value={scaleH}
                                        onChange={(e) => setScaleH(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: POSITION (X & Y) */}
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Move size={14} color="var(--accent)" />
                            <span>Position (X: {posX}px, Y: {posY}px)</span>
                        </div>

                        {/* Fine Step Nudge Controls */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                            <button onClick={() => setPosY(prev => prev - 5)} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px' }}>
                                <ArrowUp size={12} /> Up
                            </button>
                            <button onClick={() => setPosY(prev => prev + 5)} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px' }}>
                                <ArrowDown size={12} /> Down
                            </button>
                            <button onClick={() => setPosX(prev => prev - 5)} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px' }}>
                                <ArrowLeft size={12} /> Left
                            </button>
                            <button onClick={() => setPosX(prev => prev + 5)} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px' }}>
                                <ArrowRight size={12} /> Right
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Horizontal Position (X)</span>
                                    <span>{posX}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="-250"
                                    max="250"
                                    step="1"
                                    value={posX}
                                    onChange={(e) => setPosX(parseInt(e.target.value, 10))}
                                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Vertical Position (Y)</span>
                                    <span>{posY}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="-250"
                                    max="250"
                                    step="1"
                                    value={posY}
                                    onChange={(e) => setPosY(parseInt(e.target.value, 10))}
                                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: ROTATION */}
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <RotateCw size={14} color="var(--accent)" />
                                Rotation ({rotation}°)
                            </span>
                            {rotation !== 0 && (
                                <button onClick={() => setRotation(0)} className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                    Reset Angle
                                </button>
                            )}
                        </div>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            step="1"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: 'var(--accent)' }}
                        />
                    </div>

                    {/* SECTION 4: BACKGROUND KEYING & TRANSPARENCY */}
                    <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Scissors size={14} color="var(--accent)" />
                                <span>Remove White Garment BG</span>
                            </label>
                            <input
                                type="checkbox"
                                checked={removeWhiteBg}
                                onChange={(e) => setRemoveWhiteBg(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                            />
                        </div>

                        {removeWhiteBg && (
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span>Cutout Sensitivity Threshold</span>
                                    <span>{bgThreshold}</span>
                                </div>
                                <input
                                    type="range"
                                    min="180"
                                    max="255"
                                    step="1"
                                    value={bgThreshold}
                                    onChange={(e) => setBgThreshold(parseInt(e.target.value, 10))}
                                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                                />
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {onClose && (
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                )}
                <button onClick={handleApplyResult} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                    <Check size={16} />
                    <span>Apply Custom Fit & Save Image</span>
                </button>
            </div>
        </div>
    )
}
