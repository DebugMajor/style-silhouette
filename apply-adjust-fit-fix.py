from pathlib import Path
import re
import shutil
import sys

ROOT = Path.cwd()
ADJUST_PATH = ROOT / 'frontend' / 'src' / 'components' / 'TryOnAdjuster.jsx'
VTON_PATH = ROOT / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'


def replace_once(text: str, pattern: str, replacement: str, label: str, flags=0) -> str:
    updated, n = re.subn(pattern, replacement, text, count=1, flags=flags)
    if n != 1:
        raise RuntimeError(f'Could not safely update {label}; expected one match, found {n}. No files have been written yet.')
    return updated

if not ADJUST_PATH.exists() or not VTON_PATH.exists():
    print('Run this script from the style-silhouette repository root (the folder containing frontend/).', file=sys.stderr)
    sys.exit(1)

adjust = ADJUST_PATH.read_text(encoding='utf-8')
vton = VTON_PATH.read_text(encoding='utf-8')

# Make the garment background remover remove only background-connected pixels, including black backgrounds,
# while respecting already-transparent PNGs so the white garment itself is not erased.
new_bg_fn = r'''    const getProcessedGarmentCanvas = useCallback((garmentImg, shouldRemoveBg, threshold) => {
        const offCanvas = document.createElement('canvas')
        offCanvas.width = garmentImg.naturalWidth || garmentImg.width || 500
        offCanvas.height = garmentImg.naturalHeight || garmentImg.height || 500
        const ctx = offCanvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(garmentImg, 0, 0, offCanvas.width, offCanvas.height)

        if (!shouldRemoveBg) return offCanvas

        const imageData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height)
        const pixels = imageData.data
        const width = offCanvas.width
        const height = offCanvas.height
        const total = width * height

        // If the source already has transparency, keep it instead of flattening/keying the garment.
        let hasTransparency = false
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 250) { hasTransparency = true; break }
        }
        if (hasTransparency) return offCanvas

        // Estimate the background from small patches in the four corners.
        const patch = Math.max(2, Math.min(18, Math.floor(Math.min(width, height) * 0.04)))
        const corners = [[0, 0], [width - patch, 0], [0, height - patch], [width - patch, height - patch]]
        let sumR = 0, sumG = 0, sumB = 0, samples = 0
        for (const [sx, sy] of corners) {
            for (let y = sy; y < sy + patch; y++) {
                for (let x = sx; x < sx + patch; x++) {
                    const p = (y * width + x) * 4
                    sumR += pixels[p]; sumG += pixels[p + 1]; sumB += pixels[p + 2]; samples++
                }
            }
        }
        const bgR = sumR / samples, bgG = sumG / samples, bgB = sumB / samples
        // Sensitivity remains adjustable with the existing slider. Default 235 gives a moderate edge tolerance.
        const tolerance = Math.max(18, Math.min(76, 18 + (threshold - 180) * 0.8))
        const toleranceSq = tolerance * tolerance * 3
        const nearBackground = (idx) => {
            const dr = pixels[idx] - bgR
            const dg = pixels[idx + 1] - bgG
            const db = pixels[idx + 2] - bgB
            return dr * dr + dg * dg + db * db <= toleranceSq
        }

        // Flood fill from image edges only. This protects garment pixels that happen to be similar in color
        // to the background but are enclosed by the garment (especially white fabric on a dark background).
        const queue = new Int32Array(total)
        let head = 0, tail = 0
        const enqueue = (x, y) => {
            const pIndex = y * width + x
            const i = pIndex * 4
            if (pixels[i + 3] === 0 || !nearBackground(i)) return
            pixels[i + 3] = 0 // mark visited and remove this background pixel
            queue[tail++] = pIndex
        }
        for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1) }
        for (let y = 1; y < height - 1; y++) { enqueue(0, y); enqueue(width - 1, y) }

        while (head < tail) {
            const p = queue[head++]
            const x = p % width
            const y = (p / width) | 0
            if (x > 0) enqueue(x - 1, y)
            if (x + 1 < width) enqueue(x + 1, y)
            if (y > 0) enqueue(x, y - 1)
            if (y + 1 < height) enqueue(x, y + 1)
        }

        ctx.putImageData(imageData, 0, 0)
        return offCanvas
    }, [])'''
adjust = replace_once(
    adjust,
    r'    const getProcessedGarmentCanvas = useCallback\(\(garmentImg, shouldRemoveBg, threshold\) => \{.*?    \}, \[\]\)',
    lambda m: new_bg_fn,
    'garment background processing',
    flags=re.S,
)

# Drag using Pointer Events and pointer capture so dragging remains active even if the pointer moves quickly/outside the canvas.
if 'const isDraggingRef = useRef(false)' not in adjust:
    adjust = replace_once(
        adjust,
        r'(    const \[isDragging, setIsDragging\] = useState\(false\)\n)',
        r'\1    const isDraggingRef = useRef(false)\n',
        'dragging ref',
    )

new_drag = r'''    const handlePointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return
        e.preventDefault()
        e.currentTarget.setPointerCapture?.(e.pointerId)
        isDraggingRef.current = true
        setIsDragging(true)
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialPosX: posX,
            initialPosY: posY
        }
    }

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        const scaleFactorX = canvas.width / rect.width
        const scaleFactorY = canvas.height / rect.height
        const deltaX = (e.clientX - dragStartRef.current.x) * scaleFactorX
        const deltaY = (e.clientY - dragStartRef.current.y) * scaleFactorY
        setPosX(Math.round(dragStartRef.current.initialPosX + deltaX))
        setPosY(Math.round(dragStartRef.current.initialPosY + deltaY))
    }

    const handlePointerUp = (e) => {
        isDraggingRef.current = false
        setIsDragging(false)
        if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
        }
    }'''
adjust = replace_once(
    adjust,
    r'    // ── Mouse / Touch Drag Handlers ──\n.*?    // ── Reset Controls ──',
    lambda m: new_drag + '\n\n    // ── Reset Controls ──',
    'drag handlers',
    flags=re.S,
)

# Replace the old mouse/touch event props with pointer events.
adjust = replace_once(
    adjust,
    r'                        onMouseDown=\{handlePointerDown\}\n                        onMouseMove=\{handlePointerMove\}\n                        onMouseUp=\{handlePointerUp\}\n                        onMouseLeave=\{handlePointerUp\}\n                        onTouchStart=\{handlePointerDown\}\n                        onTouchMove=\{handlePointerMove\}\n                        onTouchEnd=\{handlePointerUp\}',
    '                        onPointerDown={handlePointerDown}\n                        onPointerMove={handlePointerMove}\n                        onPointerUp={handlePointerUp}\n                        onPointerCancel={handlePointerUp}',
    'drag event props',
)
adjust = adjust.replace('Remove White Garment BG', 'Remove Garment Background')
adjust = adjust.replace('Cutout Sensitivity Threshold', 'Background Removal Sensitivity')

# Preserve alpha for clothing images (PNG transparency) instead of converting every source to JPEG/black background.
new_file_to_data_url = r'''function fileToDataUrl(file, preserveTransparency = false) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                const maxDim = 1200
                let width = img.naturalWidth || img.width
                let height = img.naturalHeight || img.height
                if (width > maxDim || height > maxDim) {
                    const ratio = maxDim / Math.max(width, height)
                    width = Math.round(width * ratio)
                    height = Math.round(height * ratio)
                }
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, width, height)
                ctx.drawImage(img, 0, 0, width, height)
                // Keep transparent garment backgrounds as PNG. Model photos are compressed as JPEG to save memory.
                resolve(preserveTransparency
                    ? canvas.toDataURL('image/png')
                    : canvas.toDataURL('image/jpeg', 0.85))
            }
            img.onerror = () => resolve(reader.result)
            img.src = reader.result
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}'''
vton = replace_once(
    vton,
    r'function fileToDataUrl\(file\) \{.*?\n\}',
    lambda m: new_file_to_data_url,
    'image upload conversion',
    flags=re.S,
)
vton = replace_once(
    vton,
    r'const dataUrl = await fileToDataUrl\(file\)',
    'const dataUrl = await fileToDataUrl(file, type === \'clothing\')',
    'preserve clothing transparency',
)

# Light validation before writing.
if 'onPointerDown={handlePointerDown}' not in adjust or 'const isDraggingRef = useRef(false)' not in adjust:
    raise RuntimeError('Pointer drag validation failed; files were not written.')
if 'fileToDataUrl(file, type === \'clothing\')' not in vton:
    raise RuntimeError('Upload alpha-preservation validation failed; files were not written.')

for path, content in [(ADJUST_PATH, adjust), (VTON_PATH, vton)]:
    backup = path.with_name(path.name + '.before-adjust-fit-fix.bak')
    if not backup.exists():
        shutil.copy2(path, backup)
    path.write_text(content, encoding='utf-8', newline='\n')

print('Adjust Fit improvements applied successfully.')
print('Backups:')
print(f'  {ADJUST_PATH.relative_to(ROOT)}.before-adjust-fit-fix.bak')
print(f'  {VTON_PATH.relative_to(ROOT)}.before-adjust-fit-fix.bak')
print('Changes: pointer-based drag with capture; edge-connected background removal; transparent clothing PNG support.')
