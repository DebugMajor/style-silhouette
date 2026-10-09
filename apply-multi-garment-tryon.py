#!/usr/bin/env python3
"""Add independent upper/lower/dress slots and a combined local preview to VirtualTryOn.jsx."""
from pathlib import Path
from datetime import datetime
import re
import sys

REL = Path('frontend/src/pages/VirtualTryOn.jsx')
path = Path.cwd() / REL
if not path.is_file():
    print(f'ERROR: Run this script from the style-silhouette repository root; missing {REL}')
    sys.exit(1)

text = path.read_text(encoding='utf-8')
original = text
if 'generateClientSideMultiTryOn' in text and 'garmentsByCategory' in text:
    print('Multi-garment try-on appears to be installed already. No files changed.')
    sys.exit(0)

# 1) Add per-category garment storage while retaining the existing selected-slot variables.
state_anchor = "    const [clothingImage, setClothingImage] = useState(null)\n"
state_insert = state_anchor + "    // Keep a separate garment for each slot so Upper and Lower can be combined.\n    const [garmentsByCategory, setGarmentsByCategory] = useState({ upper_body: null, lower_body: null, dresses: null })\n"
if state_anchor not in text:
    print('ERROR: Could not find clothingImage state declaration. No files changed.')
    sys.exit(1)
text = text.replace(state_anchor, state_insert, 1)

# 2) Persist each upload in the selected category slot.
old_upload = """            if (type === 'model') {
                setModelImage(dataUrl)
            } else {
                setClothingImage(dataUrl)
                setGarmentName(file.name.replace(/\\.[^/.]+$/, ''))
            }
"""
new_upload = """            if (type === 'model') {
                setModelImage(dataUrl)
            } else {
                const uploadedName = file.name.replace(/\\.[^/.]+$/, '')
                setClothingImage(dataUrl)
                setGarmentName(uploadedName)
                setGarmentsByCategory(prev => ({
                    ...prev,
                    [category]: { image: dataUrl, name: uploadedName, category }
                }))
            }
"""
if old_upload not in text:
    print('ERROR: Could not safely find the image upload handler. No files changed.')
    sys.exit(1)
text = text.replace(old_upload, new_upload, 1)

# 3) Replace the one-active-category handler with independent category slots.
old_buttons = """                                    {[
                                        ['upper_body', 'Upper'],
                                        ['lower_body', 'Lower'],
                                        ['dresses', 'Dress']
                                    ].map(([id, label]) => (
                                        <button
                                            key={id}
                                            className={`btn btn-sm ${category === id ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setCategory(id)}
                                        >
                                            {label}
                                        </button>
                                    ))}
"""
new_buttons = """                                    {[
                                        ['upper_body', 'Upper'],
                                        ['lower_body', 'Lower'],
                                        ['dresses', 'Dress']
                                    ].map(([id, label]) => {
                                        const hasGarment = id === category
                                            ? Boolean(clothingImage || garmentsByCategory[id]?.image)
                                            : Boolean(garmentsByCategory[id]?.image)
                                        return (
                                            <button
                                                key={id}
                                                className={`btn btn-sm ${category === id ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => {
                                                    if (id === category) return
                                                    // Save the current slot first (including a garment loaded from Wardrobe).
                                                    if (clothingImage) {
                                                        setGarmentsByCategory(prev => ({
                                                            ...prev,
                                                            [category]: {
                                                                image: clothingImage,
                                                                name: garmentName || prev[category]?.name || 'Uploaded garment',
                                                                category
                                                            }
                                                        }))
                                                    }
                                                    const nextGarment = garmentsByCategory[id]
                                                    setCategory(id)
                                                    setClothingImage(nextGarment?.image || null)
                                                    setGarmentName(nextGarment?.name || '')
                                                    setResultImage(null)
                                                }}
                                            >
                                                {label}{hasGarment ? ' ✓' : ''}
                                            </button>
                                        )
                                    })}
"""
if old_buttons not in text:
    print('ERROR: Could not safely find the garment category buttons. No files changed.')
    sys.exit(1)
text = text.replace(old_buttons, new_buttons, 1)

# Give the user an instruction immediately below the category selector.
category_close = """                                </div>
                            </div>

                            <div style={{
                                minHeight: 360,
"""
category_hint = """                                </div>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '7px 0 0', lineHeight: 1.45 }}>
                                    Upload an item for Upper, then switch to Lower and upload another. Both slots stay selected for a combined preview.
                                </p>
                            </div>

                            <div style={{
                                minHeight: 360,
"""
if category_close in text:
    text = text.replace(category_close, category_hint, 1)
else:
    # Safe to continue if the current page styles differ; core controls are still patched.
    print('NOTE: Could not insert category hint; the main functionality will still be applied.')

# 4) Insert multi-garment local compositor immediately before generateTryOn.
marker = '    const generateTryOn = async () => {\n'
if marker not in text:
    print('ERROR: Could not find generateTryOn handler. No files changed.')
    sys.exit(1)
compositor = r'''    // Local multi-item preview. This is an approximate 2D overlay, not a photorealistic VTON model.
    const generateClientSideMultiTryOn = async (modelImgUrl, garments) => {
        const loadImage = (src) => new Promise((resolve, reject) => {
            const image = new Image()
            image.crossOrigin = 'anonymous'
            image.onload = () => resolve(image)
            image.onerror = () => reject(new Error('Could not load one of the try-on images.'))
            image.src = src
        })

        const modelImg = await loadImage(modelImgUrl)
        const canvas = document.createElement('canvas')
        canvas.width = modelImg.naturalWidth || modelImg.width || 720
        canvas.height = modelImg.naturalHeight || modelImg.height || 960
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas is unavailable in this browser.')
        ctx.drawImage(modelImg, 0, 0, canvas.width, canvas.height)

        // Draw bottoms first so an upper garment can overlap the waistband naturally.
        const order = { lower_body: 0, upper_body: 1, dresses: 2 }
        const orderedGarments = [...garments].sort((a, b) => (order[a.category] ?? 1) - (order[b.category] ?? 1))

        for (const garment of orderedGarments) {
            const sourceImg = await loadImage(garment.image)
            const maxDim = 720
            const factor = Math.min(1, maxDim / Math.max(sourceImg.naturalWidth || sourceImg.width, sourceImg.naturalHeight || sourceImg.height))
            const gw = Math.max(1, Math.round((sourceImg.naturalWidth || sourceImg.width) * factor))
            const gh = Math.max(1, Math.round((sourceImg.naturalHeight || sourceImg.height) * factor))
            const cutout = document.createElement('canvas')
            cutout.width = gw
            cutout.height = gh
            const gctx = cutout.getContext('2d', { willReadFrequently: true })
            if (!gctx) continue
            gctx.drawImage(sourceImg, 0, 0, gw, gh)

            // Remove a uniform, light background only when it is connected to the image edge.
            // This helps keep a white/cream shirt's interior intact.
            try {
                const imageData = gctx.getImageData(0, 0, gw, gh)
                const pixels = imageData.data
                const samplePoints = [[0, 0], [gw - 1, 0], [0, gh - 1], [gw - 1, gh - 1]]
                let br = 0, bg = 0, bb = 0
                for (const [sx, sy] of samplePoints) {
                    const i = (sy * gw + sx) * 4
                    br += pixels[i]; bg += pixels[i + 1]; bb += pixels[i + 2]
                }
                br = Math.round(br / 4); bg = Math.round(bg / 4); bb = Math.round(bb / 4)
                const backgroundIsLight = (br + bg + bb) / 3 > 155 && Math.max(br, bg, bb) - Math.min(br, bg, bb) < 80
                if (backgroundIsLight) {
                    const total = gw * gh
                    const visited = new Uint8Array(total)
                    const queue = new Int32Array(total)
                    let head = 0, tail = 0
                    const isBackground = (p) => {
                        const i = p * 4
                        if (pixels[i + 3] === 0) return true
                        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
                        const brightness = (r + g + b) / 3
                        const delta = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb)
                        return brightness > 145 && delta < 108
                    }
                    const add = (p) => {
                        if (p >= 0 && p < total && !visited[p] && isBackground(p)) {
                            visited[p] = 1
                            queue[tail++] = p
                        }
                    }
                    for (let x = 0; x < gw; x++) { add(x); add((gh - 1) * gw + x) }
                    for (let y = 0; y < gh; y++) { add(y * gw); add(y * gw + gw - 1) }
                    while (head < tail) {
                        const p = queue[head++]
                        pixels[p * 4 + 3] = 0
                        const x = p % gw, y = (p / gw) | 0
                        if (x > 0) add(p - 1)
                        if (x < gw - 1) add(p + 1)
                        if (y > 0) add(p - gw)
                        if (y < gh - 1) add(p + gw)
                    }
                    gctx.putImageData(imageData, 0, 0)
                }
            } catch (error) {
                // Cross-origin photos may block pixel access; draw the image as-is in that case.
                console.warn('[TryOn] Background cleanup skipped:', error?.message || error)
            }

            const W = canvas.width, H = canvas.height
            let box
            if (garment.category === 'lower_body') {
                box = { x: W * 0.245, y: H * 0.455, w: W * 0.51, h: H * 0.49 }
            } else if (garment.category === 'dresses') {
                box = { x: W * 0.205, y: H * 0.205, w: W * 0.59, h: H * 0.735 }
            } else {
                box = { x: W * 0.19, y: H * 0.215, w: W * 0.62, h: H * 0.30 }
            }
            const aspect = gw / gh
            let drawW = box.w
            let drawH = drawW / aspect
            if (drawH > box.h) { drawH = box.h; drawW = drawH * aspect }
            const x = box.x + (box.w - drawW) / 2
            const y = box.y + (box.h - drawH) / 2
            ctx.drawImage(cutout, x, y, drawW, drawH)
        }
        return canvas.toDataURL('image/jpeg', 0.92)
    }

'''
text = text.replace(marker, compositor + marker, 1)

# 5) Replace try-on generation handler with multi-slot-aware logic.
start = text.find('    const generateTryOn = async () => {\n')
end = text.find('    const downloadResult = () => {\n', start)
if start < 0 or end < 0:
    print('ERROR: Could not safely replace generateTryOn handler. No files changed.')
    sys.exit(1)
new_handler = r'''    const generateTryOn = async () => {
        if (!modelImage) {
            message('Upload or capture a model photo first.', 'error')
            return
        }

        const selectedByCategory = { ...garmentsByCategory }
        // Include a garment loaded from Wardrobe or present in the currently visible slot.
        if (clothingImage) {
            selectedByCategory[category] = {
                ...(selectedByCategory[category] || {}),
                image: clothingImage,
                name: garmentName || selectedByCategory[category]?.name || 'Uploaded garment',
                category
            }
        }
        let selectedGarments = Object.entries(selectedByCategory)
            .filter(([, item]) => Boolean(item?.image))
            .map(([itemCategory, item]) => ({ ...item, category: itemCategory }))

        if (!selectedGarments.length) {
            message('Upload at least one garment. You can add both an Upper and a Lower item before generating.', 'error')
            return
        }

        // A dress is a full-body garment; if selected, use it on its own.
        if (selectedGarments.some(item => item.category === 'dresses')) {
            selectedGarments = [selectedGarments.find(item => item.category === 'dresses')]
        }

        setProcessing(true)
        setResultImage(null)
        message(selectedGarments.length > 1
            ? 'Combining your upper and lower garments in the preview…'
            : 'Generating your virtual try-on…', 'info')

        try {
            // The connected API accepts one garment per request, so multiple categories use the
            // local category-aware compositor rather than silently ignoring one selected item.
            if (selectedGarments.length > 1) {
                const combined = await generateClientSideMultiTryOn(modelImage, selectedGarments)
                setResultImage(combined)
                message('Upper and Lower garments are both shown. This is a local 2D preview, not AI-generated fabric fitting.', 'success')
                return
            }

            const garment = selectedGarments[0]
            try {
                const response = await axios.post(
                    API_TRYON,
                    {
                        model_image: modelImage,
                        clothing_image: garment.image,
                        category: garment.category,
                        garment_description: garment.name || 'fashion clothing'
                    },
                    { timeout: 8000 }
                )

                const result = response.data?.result_image || response.data?.resultImage
                if (!result) throw new Error(response.data?.message || 'Agent did not return a result image.')
                setResultImage(result)
                message('Virtual Try-On completed successfully.', 'success')
                loadHistory()
            } catch (apiError) {
                console.warn('[TryOn] Live single-garment try-on unavailable; showing local preview:', apiError?.message || apiError)
                const localResult = await generateClientSideMultiTryOn(modelImage, [garment])
                setResultImage(localResult)
                message('Preview created with category-aware garment placement. Live AI fitting was unavailable; this is an approximate 2D overlay.', 'info')
            }
        } catch (error) {
            console.error('[TryOn] Preview generation failed:', error)
            message(error?.message || 'Virtual Try-On preview could not be generated.', 'error')
        } finally {
            setProcessing(false)
        }
    }

'''
text = text[:start] + new_handler + text[end:]

# 6) Clear the additional slots when starting a fresh try-on.
clear_anchor = """        setModelImage(null)
        setClothingImage(null)
        setGarmentName('')
        setResultImage(null)
"""
clear_replacement = """        setModelImage(null)
        setClothingImage(null)
        setGarmentsByCategory({ upper_body: null, lower_body: null, dresses: null })
        setCategory('upper_body')
        setGarmentName('')
        setResultImage(null)
"""
if clear_anchor in text:
    text = text.replace(clear_anchor, clear_replacement, 1)
else:
    print('NOTE: clearSession block differs; new-slot reset was not added there.')

if text == original:
    print('ERROR: No changes produced. No files changed.')
    sys.exit(1)

backup = path.with_name(path.name + '.before-multi-garment-' + datetime.now().strftime('%Y%m%d-%H%M%S') + '.bak')
backup.write_text(original, encoding='utf-8')
path.write_text(text, encoding='utf-8', newline='')
print('Multi-garment try-on patch installed.')
print(f'Backup: {backup}')
print('Upper and Lower can now be uploaded separately and composited in the same local preview.')
print('Note: combined Upper + Lower uses a local 2D overlay because the connected VTON API accepts one garment per request.')
