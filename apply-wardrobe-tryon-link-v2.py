from pathlib import Path
from datetime import datetime
import re
import sys

ROOT = Path.cwd()
WARDROBE = ROOT / 'frontend' / 'src' / 'pages' / 'Wardrobe.jsx'
TRYON = ROOT / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'

for path in (WARDROBE, TRYON):
    if not path.is_file():
        print('ERROR: Run this script from the style-silhouette repository root.')
        print(f'Missing expected file: {path}')
        sys.exit(1)

wardrobe_src = WARDROBE.read_text(encoding='utf-8')
tryon_src = TRYON.read_text(encoding='utf-8')
new_wardrobe = wardrobe_src
new_tryon = tryon_src

# Correct catalogue metadata, if these original entries still exist.
new_wardrobe = new_wardrobe.replace(
    "name: 'High-Waist Tailored Trousers',\n        category: 'Tops',",
    "name: 'High-Waist Tailored Trousers',\n        category: 'Bottoms',"
)
new_wardrobe = new_wardrobe.replace(
    "name: 'Architectural Runway Dress',\n        category: 'Outerwear',",
    "name: 'Architectural Runway Dress',\n        category: 'Dresses',"
)
if "const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories']" in new_wardrobe:
    new_wardrobe = new_wardrobe.replace(
        "const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories']",
        "const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']"
    )

# Wardrobe already writes item=... to the URL. Also pass route state when the usual handler exists.
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

# Add useLocation to an existing react-router-dom import, or add a standalone import.
if not re.search(r'\buseLocation\b', new_tryon):
    import_match = re.search(r"import\s*\{([^}]*)\}\s*from\s*(['\"])react-router-dom\2\s*;?", new_tryon)
    if import_match:
        names = [name.strip() for name in import_match.group(1).split(',') if name.strip()]
        if 'useLocation' not in names:
            names.append('useLocation')
        replacement = "import { " + ', '.join(names) + " } from 'react-router-dom'"
        new_tryon = new_tryon[:import_match.start()] + replacement + new_tryon[import_match.end():]
    else:
        # Imports may remain valid as separate top-level declarations even if navigation hooks were removed with 3D mode.
        new_tryon = "import { useLocation } from 'react-router-dom'\n" + new_tryon

# The local 3D-removal patch may have removed useNavigate entirely, so do not depend on it.
if 'const location = useLocation()' not in new_tryon:
    component_match = re.search(r'export\s+default\s+function\s+VirtualTryOn\s*\([^)]*\)\s*\{', new_tryon)
    if not component_match:
        print('ERROR: Could not locate the VirtualTryOn component declaration. No files changed.')
        sys.exit(2)
    insert_at = component_match.end()
    new_tryon = new_tryon[:insert_at] + '\n    const location = useLocation()' + new_tryon[insert_at:]

# Prefill the garment selected from Wardrobe. Supports query-string links and React Router state.
marker = "    const message = (text, type = 'info') => setStatus({ text, type })"
effect_text = r'''

    // Prefill the selected wardrobe garment after clicking "Try On Look".
    // Model photo stays empty so the user can upload or capture their own image.
    useEffect(() => {
        let item = location.state?.wardrobeItem

        if (!item) {
            const encodedItem = new URLSearchParams(location.search).get('item')
            if (encodedItem) {
                try {
                    item = JSON.parse(encodedItem)
                } catch (error) {
                    console.warn('[Wardrobe Try-On] Could not parse selected item:', error)
                }
            }
        }

        if (!item || typeof item !== 'object' || !item.imageSrc) return

        const description = `${item.name || ''} ${item.category || ''}`.toLowerCase()
        let selectedCategory = 'upper_body'
        if (/\b(dress|gown|jumpsuit|romper)\b/.test(description)) {
            selectedCategory = 'dresses'
        } else if (/\b(jeans?|trousers?|pants?|shorts?|skirt|leggings?|bottoms?)\b/.test(description)) {
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
if 'Prefill the selected wardrobe garment after clicking "Try On Look".' not in new_tryon:
    if marker not in new_tryon:
        print('ERROR: Could not find the message() insertion point in VirtualTryOn.jsx. No files changed.')
        sys.exit(3)
    new_tryon = new_tryon.replace(marker, marker + effect_text, 1)

# Validate integration is actually present before writing anything.
if 'const location = useLocation()' not in new_tryon or 'Loaded "${item.name || \'wardrobe item\'}" from your wardrobe.' not in new_tryon:
    print('ERROR: Integration validation failed. No files changed.')
    sys.exit(4)

changes = []
if new_wardrobe != wardrobe_src:
    changes.append((WARDROBE, wardrobe_src, new_wardrobe))
if new_tryon != tryon_src:
    changes.append((TRYON, tryon_src, new_tryon))
if not changes:
    print('No changes needed: wardrobe-to-try-on integration already appears installed.')
    sys.exit(0)

stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
for path, original, updated in changes:
    backup = path.with_name(f'{path.name}.before-wardrobe-link-v2-{stamp}.bak')
    backup.write_text(original, encoding='utf-8')
    path.write_text(updated, encoding='utf-8', newline='')
    print(f'Updated: {path.relative_to(ROOT)}')
    print(f'Backup:  {backup.relative_to(ROOT)}')

print('\nWardrobe-to-Virtual-Try-On link installed.')
print('Clicking Try On Look preloads the garment in Step 2 and selects Upper/Lower/Dress from the item name/category.')
print('Step 1 remains available for uploading or capturing the user photo.')
