from pathlib import Path
import re
import sys

root = Path.cwd()
target = root / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'
if not target.exists():
    print('ERROR: Run this script from the style-silhouette repository root.')
    print('Expected file:', target)
    sys.exit(1)

source = target.read_text(encoding='utf-8')
pattern = r"function generateClientSideTryOn\(.*?\n\}\n\n\s*const generateTryOn"
match = re.search(pattern, source, flags=re.S)
if not match:
    print('ERROR: Could not find generateClientSideTryOn() in VirtualTryOn.jsx.')
    print('No files were changed. The file may already have a different implementation.')
    sys.exit(2)

replacement = r'''function generateClientSideTryOn(modelImgUrl, clothingImgUrl, garmentCategory = 'upper_body') {
    return new Promise((resolve, reject) => {
        const modelImg = new Image()
        const clothingImg = new Image()
        let loaded = 0
        let loadFailed = false

        const onError = () => {
            if (!loadFailed) {
                loadFailed = true
                reject(new Error('Could not load the model or garment image.'))
            }
        }

        const removeEdgeBackground = (image) => {
            const cutout = document.createElement('canvas')
            cutout.width = image.naturalWidth || image.width
            cutout.height = image.naturalHeight || image.height
            const cutoutCtx = cutout.getContext('2d', { willReadFrequently: true })
            cutoutCtx.drawImage(image, 0, 0, cutout.width, cutout.height)

            const width = cutout.width
            const height = cutout.height
            const imageData = cutoutCtx.getImageData(0, 0, width, height)
            const pixels = imageData.data
            const queue = new Int32Array(width * height)
            const tolerance = 38

            // Remove only background-coloured pixels connected to the image edges.
            // This works for common plain white and black garment-photo backgrounds.
            const flood = (startX, startY) => {
                const start = (startY * width + startX) * 4
                if (pixels[start + 3] === 0) return
                const refR = pixels[start]
                const refG = pixels[start + 1]
                const refB = pixels[start + 2]
                let head = 0
                let tail = 0
                const startPixel = startY * width + startX
                queue[tail++] = startPixel
                pixels[start + 3] = 0

                while (head < tail) {
                    const pixel = queue[head++]
                    const x = pixel % width
                    const y = (pixel / width) | 0
                    const add = (nx, ny) => {
                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return
                        const ni = (ny * width + nx) * 4
                        if (pixels[ni + 3] === 0) return
                        if (Math.abs(pixels[ni] - refR) > tolerance ||
                            Math.abs(pixels[ni + 1] - refG) > tolerance ||
                            Math.abs(pixels[ni + 2] - refB) > tolerance) return
                        pixels[ni + 3] = 0
                        queue[tail++] = ny * width + nx
                    }
                    add(x - 1, y)
                    add(x + 1, y)
                    add(x, y - 1)
                    add(x, y + 1)
                }
            }

            for (let x = 0; x < width; x++) {
                flood(x, 0)
                flood(x, height - 1)
            }
            for (let y = 1; y < height - 1; y++) {
                flood(0, y)
                flood(width - 1, y)
            }
            cutoutCtx.putImageData(imageData, 0, 0)

            // Crop to the remaining visible garment so the source photo's empty
            // white/black margins do not become a large rectangle on the person.
            let minX = width, minY = height, maxX = -1, maxY = -1
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (pixels[(y * width + x) * 4 + 3] > 12) {
                        if (x < minX) minX = x
                        if (y < minY) minY = y
                        if (x > maxX) maxX = x
                        if (y > maxY) maxY = y
                    }
                }
            }
            if (maxX < minX || maxY < minY) {
                return { canvas: cutout, crop: { x: 0, y: 0, w: width, h: height } }
            }
            const pad = 2
            minX = Math.max(0, minX - pad)
            minY = Math.max(0, minY - pad)
            maxX = Math.min(width - 1, maxX + pad)
            maxY = Math.min(height - 1, maxY + pad)
            return {
                canvas: cutout,
                crop: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
            }
        }

        const onLoaded = () => {
            loaded++
            if (loaded !== 2 || loadFailed) return

            try {
                const width = modelImg.naturalWidth || modelImg.width || 720
                const height = modelImg.naturalHeight || modelImg.height || 960
                const output = document.createElement('canvas')
                output.width = width
                output.height = height
                const ctx = output.getContext('2d')
                ctx.drawImage(modelImg, 0, 0, width, height)

                const { canvas: garmentCanvas, crop } = removeEdgeBackground(clothingImg)
                const aspect = crop.w / crop.h

                // Fit the garment into the selected body zone, preserving aspect ratio.
                // These zones match the full-body preview: torso, legs, or full outfit.
                let maxW, maxH, centerY
                if (garmentCategory === 'lower_body') {
                    maxW = width * 0.46
                    maxH = height * 0.40
                    centerY = height * 0.70 // waistband starts at the hips; jeans extend toward the ankles
                } else if (garmentCategory === 'dresses') {
                    maxW = width * 0.48
                    maxH = height * 0.62
                    centerY = height * 0.50
                } else {
                    maxW = width * 0.42
                    maxH = height * 0.285
                    centerY = height * 0.355 // shoulders through waist, not over the legs
                }

                let drawW = maxW
                let drawH = drawW / aspect
                if (drawH > maxH) {
                    drawH = maxH
                    drawW = drawH * aspect
                }
                const drawX = (width - drawW) / 2
                const drawY = centerY - drawH / 2

                ctx.drawImage(
                    garmentCanvas,
                    crop.x, crop.y, crop.w, crop.h,
                    drawX, drawY, drawW, drawH
                )
                resolve(output.toDataURL('image/jpeg', 0.92))
            } catch (error) {
                reject(error)
            }
        }

        modelImg.onload = onLoaded
        clothingImg.onload = onLoaded
        modelImg.onerror = onError
        clothingImg.onerror = onError
        modelImg.src = modelImgUrl
        clothingImg.src = clothingImgUrl
    })
}

    const generateTryOn'''

updated = source[:match.start()] + replacement + source[match.end():]
updated = updated.replace(
    'generateClientSideTryOn(modelImage, clothingImage)',
    'generateClientSideTryOn(modelImage, clothingImage, category)'
)
updated = updated.replace(
    "message('Virtual Try-On generated successfully!', 'success')",
    "message('Local 2D preview created. This positions the garment by category; realistic AI garment fitting requires the live try-on service.', 'success')"
)

backup = target.with_name('VirtualTryOn.jsx.before-category-placement-fix.bak')
if backup.exists():
    n = 1
    while target.with_name(f'VirtualTryOn.jsx.before-category-placement-fix.{n}.bak').exists():
        n += 1
    backup = target.with_name(f'VirtualTryOn.jsx.before-category-placement-fix.{n}.bak')
backup.write_text(source, encoding='utf-8')
target.write_text(updated, encoding='utf-8', newline='')
print('Category-aware local try-on placement installed.')
print(f'Backup created: {backup.name}')
print('Lower: jeans/trousers are placed at the waist and legs; Upper: shirts are placed on the torso; Dress: full-body zone.')
print('The local fallback is an approximate 2D overlay, not photorealistic AI fitting.')
