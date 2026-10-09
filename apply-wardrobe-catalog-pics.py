from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

ROOT = Path.cwd()
WARDROBE = ROOT / 'frontend' / 'src' / 'pages' / 'Wardrobe.jsx'
TRYON = ROOT / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'
ADJUSTER = ROOT / 'frontend' / 'src' / 'components' / 'TryOnAdjuster.jsx'
ASSETS_DIR = ROOT / 'frontend' / 'public' / 'wardrobe' / 'catalog'
REQUIRED_ASSETS = [
    'ivory-tee.png', 'indigo-jeans.png', 'sand-chinos.png',
    'oxford-shirt.png', 'olive-bomber.png', 'navy-polo.png'
]

for path in (WARDROBE, TRYON, ADJUSTER):
    if not path.is_file():
        print('ERROR: Run this script from the style-silhouette repository root.')
        print(f'Missing expected file: {path}')
        sys.exit(1)
missing_assets = [name for name in REQUIRED_ASSETS if not (ASSETS_DIR / name).is_file()]
if missing_assets:
    print('ERROR: Catalog image assets are missing. Extract the full ZIP into the repository root first:')
    for name in missing_assets:
        print(f'  frontend/public/wardrobe/catalog/{name}')
    sys.exit(2)

wardrobe_src = WARDROBE.read_text(encoding='utf-8')
tryon_src = TRYON.read_text(encoding='utf-8')
adjuster_src = ADJUSTER.read_text(encoding='utf-8')
new_wardrobe = wardrobe_src
new_tryon = tryon_src
new_adjuster = adjuster_src

# Replace the static demo catalog with generated, transparent product cutouts that work
# with the displayed model's casual menswear palette and category-aware try-on.
items_block = '''const WARDROBE_ITEMS = [
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
]'''
start = new_wardrobe.find('const WARDROBE_ITEMS = [')
end = new_wardrobe.find('\n]', start) if start >= 0 else -1
if start < 0 or end < 0:
    print('ERROR: Could not safely locate WARDROBE_ITEMS in Wardrobe.jsx. No code files changed.')
    sys.exit(3)
end += 2
new_wardrobe = new_wardrobe[:start] + items_block + new_wardrobe[end:]

cat_match = re.search(r"const CATEGORIES\s*=\s*\[[^\]]*\]", new_wardrobe)
if not cat_match:
    print('ERROR: Could not locate the wardrobe category filters. No code files changed.')
    sys.exit(4)
new_wardrobe = new_wardrobe[:cat_match.start()] + "const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear']" + new_wardrobe[cat_match.end():]

# Preserve the link integration added earlier; pass route state and item query for deep links.
handler_pattern = r"const handleTryOn = \(item\) => \{.*?\n    \}"
handler_match = re.search(handler_pattern, new_wardrobe, flags=re.S)
if not handler_match:
    print('ERROR: Could not locate handleTryOn() in Wardrobe.jsx. No code files changed.')
    sys.exit(5)
handler = '''const handleTryOn = (item) => {
        const itemParam = encodeURIComponent(JSON.stringify(item))
        navigate(`/dashboard/virtual-try-on?item=${itemParam}`, {
            state: { wardrobeItem: item }
        })
    }'''
new_wardrobe = new_wardrobe[:handler_match.start()] + handler + new_wardrobe[handler_match.end():]

# Make the fallback place the selected cutout in the appropriate region of the full-body photo.
function_pattern = r"function generateClientSideTryOn\(.*?\n\}\n\s*\n\s*const generateTryOn = async \(\) => \{"
function_match = re.search(function_pattern, new_tryon, flags=re.S)
if not function_match:
    print('ERROR: Could not locate generateClientSideTryOn() in VirtualTryOn.jsx. No code files changed.')
    sys.exit(6)
function_replacement = r'''function generateClientSideTryOn(modelImgUrl, clothingImgUrl, garmentCategory = 'upper_body') {
    // Approximate local 2D composition fallback. Transparent wardrobe cutouts are
    // preserved; uniform white photo backgrounds are removed only when connected to edges.
    return new Promise((resolve, reject) => {
        const loadImage = (src) => new Promise((resolveImage, rejectImage) => {
            const image = new Image()
            image.onload = () => resolveImage(image)
            image.onerror = () => rejectImage(new Error('Unable to load the model or garment image.'))
            if (/^https?:\/\//i.test(src)) image.crossOrigin = 'anonymous'
            image.src = src
        })

        Promise.all([loadImage(modelImgUrl), loadImage(clothingImgUrl)])
            .then(([modelImg, clothingImg]) => {
                const width = modelImg.naturalWidth || modelImg.width || 720
                const height = modelImg.naturalHeight || modelImg.height || 960
                const output = document.createElement('canvas')
                output.width = width
                output.height = height
                const outCtx = output.getContext('2d')
                if (!outCtx) throw new Error('Canvas is unavailable in this browser.')
                outCtx.drawImage(modelImg, 0, 0, width, height)

                const garmentCanvas = document.createElement('canvas')
                garmentCanvas.width = clothingImg.naturalWidth || clothingImg.width
                garmentCanvas.height = clothingImg.naturalHeight || clothingImg.height
                const garmentCtx = garmentCanvas.getContext('2d', { willReadFrequently: true })
                if (!garmentCtx) throw new Error('Canvas is unavailable in this browser.')
                garmentCtx.drawImage(clothingImg, 0, 0, garmentCanvas.width, garmentCanvas.height)

                try {
                    const w = garmentCanvas.width
                    const h = garmentCanvas.height
                    const imageData = garmentCtx.getImageData(0, 0, w, h)
                    const pixels = imageData.data
                    const corners = [[0,0], [w-1,0], [0,h-1], [w-1,h-1]]
                    const hasExistingTransparency = corners.some(([x,y]) => pixels[(y*w+x)*4+3] < 250)
                    if (!hasExistingTransparency) {
                        // Only remove an edge-connected near-white background; do not erase
                        // similarly coloured pixels inside a white/cream garment.
                        const samples = corners.map(([x,y]) => {
                            const i = (y*w+x)*4
                            return [pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]]
                        }).filter(c => c[3] > 250 && Math.min(c[0],c[1],c[2]) >= 220 && Math.max(c[0],c[1],c[2])-Math.min(c[0],c[1],c[2]) < 28)
                        if (samples.length) {
                            const ref = samples[0]
                            const nearBackground = (p) => {
                                const i = p*4
                                return pixels[i+3] > 0 &&
                                    pixels[i] >= 218 && pixels[i+1] >= 218 && pixels[i+2] >= 218 &&
                                    Math.abs(pixels[i]-ref[0]) <= 44 &&
                                    Math.abs(pixels[i+1]-ref[1]) <= 44 &&
                                    Math.abs(pixels[i+2]-ref[2]) <= 44
                            }
                            const queue = new Int32Array(w*h)
                            let head = 0, tail = 0
                            const visit = (x,y) => {
                                if (x<0 || y<0 || x>=w || y>=h) return
                                const p = y*w+x, ai = p*4+3
                                if (pixels[ai] === 0 || !nearBackground(p)) return
                                pixels[ai] = 0
                                queue[tail++] = p
                            }
                            for (let x=0; x<w; x++) { visit(x,0); visit(x,h-1) }
                            for (let y=1; y<h-1; y++) { visit(0,y); visit(w-1,y) }
                            while (head<tail) {
                                const p = queue[head++], x=p%w, y=Math.floor(p/w)
                                visit(x-1,y); visit(x+1,y); visit(x,y-1); visit(x,y+1)
                            }
                            garmentCtx.putImageData(imageData,0,0)
                        }
                    }
                } catch (backgroundError) {
                    console.warn('[Try-On] Preserving source background because cutout processing failed:', backgroundError.message)
                }

                const pixels = garmentCtx.getImageData(0, 0, garmentCanvas.width, garmentCanvas.height).data
                let minX=garmentCanvas.width, minY=garmentCanvas.height, maxX=-1, maxY=-1
                for (let y=0; y<garmentCanvas.height; y++) {
                    for (let x=0; x<garmentCanvas.width; x++) {
                        if (pixels[(y*garmentCanvas.width+x)*4+3] > 12) {
                            if (x<minX) minX=x
                            if (x>maxX) maxX=x
                            if (y<minY) minY=y
                            if (y>maxY) maxY=y
                        }
                    }
                }
                if (maxX < minX || maxY < minY) throw new Error('The garment image appears empty after background removal.')
                const pad = Math.max(1, Math.round(Math.min(maxX-minX+1, maxY-minY+1)*0.01))
                minX=Math.max(0,minX-pad); minY=Math.max(0,minY-pad)
                maxX=Math.min(garmentCanvas.width-1,maxX+pad); maxY=Math.min(garmentCanvas.height-1,maxY+pad)
                const cropW=maxX-minX+1, cropH=maxY-minY+1

                let region
                if (garmentCategory === 'lower_body') {
                    region = { x: width*0.29, y: height*0.465, w: width*0.42, h: height*0.50 }
                } else if (garmentCategory === 'dresses') {
                    region = { x: width*0.23, y: height*0.20, w: width*0.54, h: height*0.73 }
                } else {
                    region = { x: width*0.23, y: height*0.195, w: width*0.54, h: height*0.34 }
                }
                const fit = Math.min(region.w/cropW, region.h/cropH)
                const drawW=cropW*fit, drawH=cropH*fit
                const drawX=region.x+(region.w-drawW)/2
                const drawY=region.y+(region.h-drawH)/2
                outCtx.drawImage(garmentCanvas,minX,minY,cropW,cropH,drawX,drawY,drawW,drawH)
                resolve(output.toDataURL('image/png'))
            })
            .catch(reject)
    })
}

    const generateTryOn = async () => {'''
new_tryon = new_tryon[:function_match.start()] + function_replacement + new_tryon[function_match.end():]
# Convert public-local garment assets to absolute URLs before sending them to FastAPI.
# The Python ImageSource schema accepts HTTP(S) URLs, not browser-relative paths.
new_tryon = new_tryon.replace(
    'model_image: modelImage,\n                    clothing_image: clothingImage,',
    'model_image: typeof modelImage === \'string\' && modelImage.startsWith(\'/\') ? `${window.location.origin}${modelImage}` : modelImage,\n                    clothing_image: typeof clothingImage === \'string\' && clothingImage.startsWith(\'/\') ? `${window.location.origin}${clothingImage}` : clothingImage,',
    1
)

# Always pass the selected category into the local preview fallback.
new_tryon, call_count = re.subn(
    r"generateClientSideTryOn\(\s*modelImage\s*,\s*clothingImage(?:\s*,\s*category)?\s*\)",
    'generateClientSideTryOn(modelImage, clothingImage, category)',
    new_tryon,
    count=1
)
if call_count != 1:
    print('ERROR: Could not safely wire the try-on category into its local fallback. No code files changed.')
    sys.exit(7)

# Honor the explicit metadata first, so selecting a bottom in Wardrobe always selects Lower.
# Otherwise fall back to category/name inference for backwards compatibility.
effect_pattern = r"    // Prefill the selected wardrobe garment.*?\n    \}, \[location\.key, location\.search, location\.state\]\)"
effect_match = re.search(effect_pattern, new_tryon, flags=re.S)
if effect_match:
    new_effect = r'''    // Prefill the selected wardrobe garment after clicking "Try On Look".
    useEffect(() => {
        let item = location.state?.wardrobeItem
        if (!item) {
            const encodedItem = new URLSearchParams(location.search).get('item')
            if (encodedItem) {
                try { item = JSON.parse(encodedItem) }
                catch (error) { console.warn('[Wardrobe Try-On] Could not parse selected item:', error) }
            }
        }
        if (!item || typeof item !== 'object' || !item.imageSrc) return

        const description = `${item.name || ''} ${item.category || ''}`.toLowerCase()
        let selectedCategory = item.tryOnCategory || 'upper_body'
        if (!item.tryOnCategory) {
            if (/\b(dress|gown|jumpsuit|romper)\b/.test(description)) selectedCategory = 'dresses'
            else if (/\b(jeans?|trousers?|pants?|shorts?|skirt|leggings?|bottoms?|chinos)\b/.test(description)) selectedCategory = 'lower_body'
        }

        setClothingImage(item.imageSrc)
        setGarmentName(item.name || 'Wardrobe garment')
        setCategory(selectedCategory)
        setResultImage(null)
        setIsAdjusting(false)
        setStatus({
            text: `Loaded "${item.name || 'wardrobe item'}" from your wardrobe. Upload or capture a model photo to continue.`,
            type: 'info'
        })
    }, [location.key, location.search, location.state])'''
    new_tryon = new_tryon[:effect_match.start()] + new_effect + new_tryon[effect_match.end():]
else:
    # Existing installation might use another comment; require the existing location hook and add a new effect.
    marker = "    const message = (text, type = 'info') => setStatus({ text, type })"
    if 'const location = useLocation()' not in new_tryon or marker not in new_tryon:
        print('ERROR: Could not find the wardrobe prefill effect or safe insertion point in VirtualTryOn.jsx. No code files changed.')
        sys.exit(8)
    add_effect = r'''

    useEffect(() => {
        let item = location.state?.wardrobeItem
        if (!item) {
            const encodedItem = new URLSearchParams(location.search).get('item')
            if (encodedItem) { try { item = JSON.parse(encodedItem) } catch {} }
        }
        if (!item || !item.imageSrc) return
        const description = `${item.name || ''} ${item.category || ''}`.toLowerCase()
        let selectedCategory = item.tryOnCategory || (/\b(jeans?|trousers?|pants?|chinos|bottoms?)\b/.test(description) ? 'lower_body' : /\b(dress|gown)\b/.test(description) ? 'dresses' : 'upper_body')
        setClothingImage(item.imageSrc)
        setGarmentName(item.name || 'Wardrobe garment')
        setCategory(selectedCategory)
        setResultImage(null)
        setStatus({ text: `Loaded "${item.name || 'wardrobe item'}" from your wardrobe. Upload or capture a model photo to continue.`, type: 'info' })
    }, [location.key, location.search, location.state])'''
    new_tryon = new_tryon.replace(marker, marker + add_effect, 1)

# The adjuster should keep transparent PNG cutouts intact; for opaque white-background files,
# remove only edge-connected near-white pixels rather than deleting the garment's highlights.
adjust_start = new_adjuster.find('    const getProcessedGarmentCanvas = useCallback(')
adjust_end = new_adjuster.find('\n    }, [])', adjust_start) if adjust_start >= 0 else -1
if adjust_start < 0 or adjust_end < 0:
    print('ERROR: Could not locate the background-processing function in TryOnAdjuster.jsx. No code files changed.')
    sys.exit(9)
adjust_end += len('\n    }, [])')
adjust_func = r'''    const getProcessedGarmentCanvas = useCallback((garmentImg, shouldRemoveBg, threshold) => {
        const canvas = document.createElement('canvas')
        canvas.width = garmentImg.naturalWidth || garmentImg.width || 500
        canvas.height = garmentImg.naturalHeight || garmentImg.height || 500
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(garmentImg, 0, 0, canvas.width, canvas.height)
        if (!shouldRemoveBg) return canvas

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const width = canvas.width, height = canvas.height

        // If it already contains transparent pixels, preserve its carefully prepared cutout.
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 250) return canvas
        }

        // Flood-fill only near-white background connected to an image edge.
        // White details inside an ivory T-shirt remain visible.
        const cornerPixels = [[0,0], [width-1,0], [0,height-1], [width-1,height-1]].map(([x,y]) => {
            const i = (y*width+x)*4
            return [data[i],data[i+1],data[i+2]]
        }).filter(([r,g,b]) => Math.min(r,g,b) >= Math.max(205, threshold-20) && Math.max(r,g,b)-Math.min(r,g,b) < 30)
        if (!cornerPixels.length) return canvas
        const [br,bg,bb] = cornerPixels[0]
        const total = width*height
        const queue = new Int32Array(total)
        let head = 0, tail = 0
        const visit = (x,y) => {
            if (x<0 || y<0 || x>=width || y>=height) return
            const p=y*width+x, i=p*4
            if (data[i+3]===0 || data[i]<threshold-20 || data[i+1]<threshold-20 || data[i+2]<threshold-20) return
            if (Math.abs(data[i]-br)>38 || Math.abs(data[i+1]-bg)>38 || Math.abs(data[i+2]-bb)>38) return
            data[i+3]=0
            queue[tail++]=p
        }
        for (let x=0; x<width; x++) { visit(x,0); visit(x,height-1) }
        for (let y=1; y<height-1; y++) { visit(0,y); visit(width-1,y) }
        while (head<tail) {
            const p=queue[head++], x=p%width, y=Math.floor(p/width)
            visit(x-1,y); visit(x+1,y); visit(x,y-1); visit(x,y+1)
        }
        ctx.putImageData(imageData,0,0)
        return canvas
    }, [])'''
new_adjuster = new_adjuster[:adjust_start] + adjust_func + new_adjuster[adjust_end:]

# Validate all core changes before writing.
if not all(path in new_wardrobe for path in ["/wardrobe/catalog/ivory-tee.png", "/wardrobe/catalog/indigo-jeans.png", "tryOnCategory: 'lower_body'"]):
    print('ERROR: Catalog validation failed. No code files changed.')
    sys.exit(10)
if 'generateClientSideTryOn(modelImage, clothingImage, category)' not in new_tryon:
    print('ERROR: Category-aware fallback validation failed. No code files changed.')
    sys.exit(11)

changes = [(WARDROBE, wardrobe_src, new_wardrobe), (TRYON, tryon_src, new_tryon), (ADJUSTER, adjuster_src, new_adjuster)]
stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
for path, original, updated in changes:
    if original == updated:
        continue
    backup = path.with_name(f'{path.name}.before-wardrobe-catalog-pics-{stamp}.bak')
    shutil.copy2(path, backup)
    path.write_text(updated, encoding='utf-8', newline='')
    print(f'Updated: {path.relative_to(ROOT)}')
    print(f'Backup:  {backup.relative_to(ROOT)}')

print('\nLocal menswear catalog installed (6 transparent PNG product images).')
print('Wardrobe items now include explicit Upper/Lower try-on metadata.')
print('Local preview fallback now positions pants on the lower body and tops on the torso.')
print('Adjust Fit preserves transparent product cutouts and protects white garment areas.')
print('Note: the local preview remains a 2D composition; realistic fabric fitting requires a working AI try-on service.')
