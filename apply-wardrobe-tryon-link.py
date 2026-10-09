from pathlib import Path
from datetime import datetime
import re
import sys

ROOT = Path.cwd()
WARDROBE = ROOT / 'frontend' / 'src' / 'pages' / 'Wardrobe.jsx'
TRYON = ROOT / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'

for p in (WARDROBE, TRYON):
    if not p.is_file():
        print('ERROR: Run this script from the style-silhouette repository root.')
        print(f'Missing expected file: {p}')
        sys.exit(1)

wardrobe_src = WARDROBE.read_text(encoding='utf-8')
tryon_src = TRYON.read_text(encoding='utf-8')
new_wardrobe = wardrobe_src
new_tryon = tryon_src

# Correct the wardrobe catalog metadata so its filters and try-on category agree.
new_wardrobe = new_wardrobe.replace(
    "name: 'High-Waist Tailored Trousers',\n        category: 'Tops',",
    "name: 'High-Waist Tailored Trousers',\n        category: 'Bottoms',"
)
new_wardrobe = new_wardrobe.replace(
    "name: 'Architectural Runway Dress',\n        category: 'Outerwear',",
    "name: 'Architectural Runway Dress',\n        category: 'Dresses',"
)
new_wardrobe = new_wardrobe.replace(
    "const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories']",
    "const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']"
)

# Keep the item in the URL for refresh/deep-link compatibility, and also pass route state.
old_handler = '''    const handleTryOn = (item) => {
        const itemParam = encodeURIComponent(JSON.stringify(item))
        navigate(`/dashboard/virtual-try-on?item=${itemParam}`)
    }'''
new_handler = '''    const handleTryOn = (item) => {
        const itemParam = encodeURIComponent(JSON.stringify(item))
        navigate(`/dashboard/virtual-try-on?item=${itemParam}`, {
            state: { wardrobeItem: item }
        })
    }'''
if old_handler in new_wardrobe:
    new_wardrobe = new_wardrobe.replace(old_handler, new_handler, 1)
elif 'state: { wardrobeItem: item }' not in new_wardrobe:
    print('ERROR: Could not find handleTryOn() in Wardrobe.jsx. No files changed.')
    sys.exit(2)

# Add useLocation without disturbing other router imports.
if "import { useLocation, useNavigate } from 'react-router-dom'" not in new_tryon:
    if "import { useNavigate } from 'react-router-dom'" in new_tryon:
        new_tryon = new_tryon.replace(
            "import { useNavigate } from 'react-router-dom'",
            "import { useLocation, useNavigate } from 'react-router-dom'",
            1
        )
    elif "from 'react-router-dom'" not in new_tryon or 'useLocation' not in new_tryon:
        print('ERROR: Could not safely update the router import in VirtualTryOn.jsx. No files changed.')
        sys.exit(3)

if 'const location = useLocation()' not in new_tryon:
    target = '    const navigate = useNavigate()'
    if target not in new_tryon:
        print('ERROR: Could not find useNavigate() in VirtualTryOn.jsx. No files changed.')
        sys.exit(4)
    new_tryon = new_tryon.replace(target, target + '\n    const location = useLocation()', 1)

# When arriving from Wardrobe, preselect the garment, infer its body region, and leave model input ready.
effect_marker = '    const message = (text, type = \'info\') => setStatus({ text, type })'
wardrobe_effect = r'''

    // Prefill the selected wardrobe garment when the user chooses "Try On Look".
    // The user can then upload or capture their own model photo in Step 1.
    useEffect(() => {
        let item = location.state?.wardrobeItem

        // Support direct links/bookmarks created by earlier builds as well as route state.
        if (!item) {
            const encodedItem = new URLSearchParams(location.search).get('item')
            if (encodedItem) {
                try {
                    item = JSON.parse(encodedItem)
                } catch (error) {
                    console.warn('[Wardrobe Try-On] Could not read selected item:', error)
                }
            }
        }

        if (!item || typeof item !== 'object' || !item.imageSrc) return

        const itemDescription = `${item.name || ''} ${item.category || ''}`.toLowerCase()
        let selectedCategory = 'upper_body'
        if (/\b(dress|gown|jumpsuit|romper)\b/.test(itemDescription)) {
            selectedCategory = 'dresses'
        } else if (/\b(jeans?|trousers?|pants?|shorts?|skirt|leggings?|bottoms?)\b/.test(itemDescription)) {
            selectedCategory = 'lower_body'
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
    }, [location.key, location.search, location.state])
'''
if 'Prefill the selected wardrobe garment when the user chooses "Try On Look"' not in new_tryon:
    if effect_marker not in new_tryon:
        print('ERROR: Could not find status-message insertion point in VirtualTryOn.jsx. No files changed.')
        sys.exit(5)
    new_tryon = new_tryon.replace(effect_marker, effect_marker + wardrobe_effect, 1)

# Remote wardrobe images are served by Unsplash. Request CORS access so the optional local
# canvas-preview fallback can draw them and export the result without a tainted canvas.
if 'function generateClientSideTryOn' in new_tryon:
    # Implementation variant 1: direct Image refs / onload handlers.
    direct_src = '''        modelImg.src = modelImgUrl
        clothingImg.src = clothingImgUrl'''
    direct_replacement = '''        // Set CORS mode before src for wardrobe URLs; data URLs continue to work normally.
        if (/^https?:\\/\\//i.test(modelImgUrl)) modelImg.crossOrigin = 'anonymous'
        if (/^https?:\\/\\//i.test(clothingImgUrl)) clothingImg.crossOrigin = 'anonymous'
        modelImg.src = modelImgUrl
        clothingImg.src = clothingImgUrl'''
    if direct_src in new_tryon and 'clothingImg.crossOrigin' not in new_tryon:
        new_tryon = new_tryon.replace(direct_src, direct_replacement, 1)
    # Implementation variant 2: a reusable loadImage helper.
    old_load = '''            const image = new Image()
            image.onload = () => resolveImage(image)
            image.onerror = () => rejectImage(new Error('Unable to load one of the try-on images.'))
            image.src = src'''
    new_load = '''            const image = new Image()
            image.onload = () => resolveImage(image)
            image.onerror = () => rejectImage(new Error('Unable to load one of the try-on images.'))
            if (/^https?:\\/\\//i.test(src)) image.crossOrigin = 'anonymous'
            image.src = src'''
    if old_load in new_tryon and 'if (/^https?:\\/\\//i.test(src)) image.crossOrigin' not in new_tryon:
        new_tryon = new_tryon.replace(old_load, new_load, 1)

# Refuse to write if no functional integration was made.
if new_wardrobe == wardrobe_src:
    print('ERROR: Wardrobe file did not change; it may already be patched or have different code.')
    sys.exit(6)
if new_tryon == tryon_src:
    print('ERROR: VirtualTryOn.jsx did not change; it may already be patched or have different code.')
    sys.exit(7)

stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
backups = []
for path, original in ((WARDROBE, wardrobe_src), (TRYON, tryon_src)):
    backup = path.with_name(f'{path.name}.before-wardrobe-tryon-link-{stamp}.bak')
    backup.write_text(original, encoding='utf-8')
    backups.append(backup)

WARDROBE.write_text(new_wardrobe, encoding='utf-8', newline='')
TRYON.write_text(new_tryon, encoding='utf-8', newline='')

print('Wardrobe-to-Virtual-Try-On integration installed.')
print(f'Backup created: {backups[0].relative_to(ROOT)}')
print(f'Backup created: {backups[1].relative_to(ROOT)}')
print('Try On Look now preloads the selected garment into Step 2 and chooses Upper/Lower/Dress from the item name.')
print('The model photo stays empty so the user can upload or capture their own photo in Step 1.')
