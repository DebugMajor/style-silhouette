from pathlib import Path
import re
import shutil
import sys

ROOT = Path.cwd()
TARGET = ROOT / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'
if not TARGET.exists():
    print('ERROR: Run this script from the style-silhouette repository root.')
    print(f'Expected file: {TARGET}')
    sys.exit(1)

source = TARGET.read_text(encoding='utf-8')
start_marker = 'function generateClientSideTryOn(modelImgUrl, clothingImgUrl) {'
end_marker = '\n\n    const generateTryOn = async () => {'
start = source.find(start_marker)
end = source.find(end_marker, start + len(start_marker)) if start >= 0 else -1
if start < 0 or end < 0:
    print('ERROR: Could not find the expected generateClientSideTryOn function. No files changed.')
    print('Your VirtualTryOn.jsx may have been changed by another patch; please share its current version.')
    sys.exit(2)

replacement = r'''function generateClientSideTryOn(modelImgUrl, clothingImgUrl, category = 'upper_body') {
    // This is a local composition fallback, not generative AI. It removes a
    // uniform edge-connected product-photo background and places the cropped
    // garment in the body region matching the selected category.
    return new Promise((resolve, reject) => {
        const loadImage = (src) => new Promise((resolveImage, rejectImage) => {
            const image = new Image()
            image.onload = () => resolveImage(image)
            image.onerror = () => rejectImage(new Error('Unable to load one of the try-on images.'))
            image.src = src
        })

        Promise.all([loadImage(modelImgUrl), loadImage(clothingImgUrl)])
            .then(([modelImg, clothingImg]) => {
                const output = document.createElement('canvas')
                output.width = modelImg.naturalWidth || modelImg.width || 720
                output.height = modelImg.naturalHeight || modelImg.height || 960
                const outCtx = output.getContext('2d')
                if (!outCtx) throw new Error('Canvas is unavailable in this browser.')
                outCtx.drawImage(modelImg, 0, 0, output.width, output.height)

                // Remove only background pixels connected to the image edges.
                // Sampling all four corners supports common white or black product backgrounds
                // without simply making every white/black garment pixel transparent.
                const source = document.createElement('canvas')
                source.width = clothingImg.naturalWidth || clothingImg.width
                source.height = clothingImg.naturalHeight || clothingImg.height
                const srcCtx = source.getContext('2d', { willReadFrequently: true })
                if (!srcCtx) throw new Error('Canvas is unavailable in this browser.')
                srcCtx.drawImage(clothingImg, 0, 0, source.width, source.height)

                let croppedGarment = source
                try {
                    const imageData = srcCtx.getImageData(0, 0, source.width, source.height)
                    const pixels = imageData.data
                    const w = source.width
                    const h = source.height
                    const total = w * h
                    const cornerPoints = [
                        [1, 1], [Math.max(0, w - 2), 1],
                        [1, Math.max(0, h - 2)], [Math.max(0, w - 2), Math.max(0, h - 2)]
                    ]
                    const cornerColors = cornerPoints.map(([x, y]) => {
                        const i = (y * w + x) * 4
                        return [pixels[i], pixels[i + 1], pixels[i + 2]]
                    })
                    const toleranceSquared = 82 * 82
                    const matchesBorderColor = (pixelIndex) => {
                        const i = pixelIndex * 4
                        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
                        return cornerColors.some(([cr, cg, cb]) => {
                            const dr = r - cr, dg = g - cg, db = b - cb
                            return dr * dr + dg * dg + db * db <= toleranceSquared
                        })
                    }

                    // Typed queue keeps edge flood-fill efficient for normal photo sizes.
                    const queue = new Int32Array(total)
                    let head = 0, tail = 0
                    const visit = (x, y) => {
                        const p = y * w + x
                        const alphaIndex = p * 4 + 3
                        if (pixels[alphaIndex] === 0 || !matchesBorderColor(p)) return
                        pixels[alphaIndex] = 0
                        queue[tail++] = p
                    }
                    for (let x = 0; x < w; x++) {
                        visit(x, 0)
                        if (h > 1) visit(x, h - 1)
                    }
                    for (let y = 1; y < h - 1; y++) {
                        visit(0, y)
                        if (w > 1) visit(w - 1, y)
                    }
                    while (head < tail) {
                        const p = queue[head++]
                        const x = p % w
                        const y = Math.floor(p / w)
                        if (x > 0) visit(x - 1, y)
                        if (x + 1 < w) visit(x + 1, y)
                        if (y > 0) visit(x, y - 1)
                        if (y + 1 < h) visit(x, y + 1)
                    }
                    srcCtx.putImageData(imageData, 0, 0)

                    let minX = w, minY = h, maxX = -1, maxY = -1
                    for (let y = 0; y < h; y++) {
                        for (let x = 0; x < w; x++) {
                            if (pixels[(y * w + x) * 4 + 3] > 12) {
                                if (x < minX) minX = x
                                if (x > maxX) maxX = x
                                if (y < minY) minY = y
                                if (y > maxY) maxY = y
                            }
                        }
                    }
                    if (maxX >= minX && maxY >= minY) {
                        const pad = Math.max(2, Math.round(Math.min(maxX - minX + 1, maxY - minY + 1) * 0.015))
                        minX = Math.max(0, minX - pad)
                        minY = Math.max(0, minY - pad)
                        maxX = Math.min(w - 1, maxX + pad)
                        maxY = Math.min(h - 1, maxY + pad)
                        const boundsW = maxX - minX + 1
                        const boundsH = maxY - minY + 1
                        croppedGarment = document.createElement('canvas')
                        croppedGarment.width = boundsW
                        croppedGarment.height = boundsH
                        croppedGarment.getContext('2d').drawImage(source, minX, minY, boundsW, boundsH, 0, 0, boundsW, boundsH)
                    }
                } catch (backgroundError) {
                    // If the browser blocks pixel reads, preserve the source image and still
                    // place it in the category-specific region instead of failing the preview.
                    console.warn('[Try-On] Background removal skipped:', backgroundError.message)
                }

                const W = output.width
                const H = output.height
                let region
                if (category === 'lower_body') {
                    region = { x: W * 0.30, y: H * 0.47, w: W * 0.40, h: H * 0.47 }
                } else if (category === 'dresses') {
                    region = { x: W * 0.24, y: H * 0.22, w: W * 0.52, h: H * 0.70 }
                } else {
                    region = { x: W * 0.25, y: H * 0.24, w: W * 0.50, h: H * 0.31 }
                }

                // Contain the entire garment within the selected body region; preserve aspect ratio.
                const fit = Math.min(region.w / croppedGarment.width, region.h / croppedGarment.height)
                const drawW = croppedGarment.width * fit
                const drawH = croppedGarment.height * fit
                const drawX = region.x + (region.w - drawW) / 2
                const drawY = region.y + (region.h - drawH) / 2
                outCtx.drawImage(croppedGarment, drawX, drawY, drawW, drawH)
                resolve(output.toDataURL('image/png'))
            })
            .catch(reject)
    })
}'''

updated = source[:start] + replacement + source[end:]
old_call = 'generateClientSideTryOn(modelImage, clothingImage)'
if old_call not in updated:
    print('ERROR: Could not find the expected fallback call. No files changed.')
    sys.exit(3)
updated = updated.replace(old_call, 'generateClientSideTryOn(modelImage, clothingImage, category)', 1)
old_status = "message('Virtual Try-On generated successfully!', 'success')"
if old_status in updated:
    updated = updated.replace(old_status, "message('Local preview composed for the selected garment type. This is an approximate overlay because the AI try-on service is unavailable.', 'info')", 1)

backup = TARGET.with_name(TARGET.name + '.before-category-aware-tryon.bak')
if not backup.exists():
    shutil.copy2(TARGET, backup)
TARGET.write_text(updated, encoding='utf-8', newline='')
print('Category-aware try-on fallback installed.')
print(f'Backup: {backup}')
print('Lower-body garments now render over the lower-body region; upper garments and dresses use separate regions.')
print('Note: this is a local 2D overlay fallback, not AI-generated garment fitting.')
