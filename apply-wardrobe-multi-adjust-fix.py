#!/usr/bin/env python3
"""Fix multi-item wardrobe handoff and preserve all garments while adjusting one."""
from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

ROOT = Path.cwd()
WARDROBE = ROOT / 'frontend' / 'src' / 'pages' / 'Wardrobe.jsx'
VTON = ROOT / 'frontend' / 'src' / 'pages' / 'VirtualTryOn.jsx'
ADJUSTER = ROOT / 'frontend' / 'src' / 'components' / 'TryOnAdjuster.jsx'
REPLACEMENT = Path(__file__).resolve().parent / 'patch_files' / 'frontend' / 'src' / 'components' / 'TryOnAdjuster.jsx'

for path in (WARDROBE, VTON, ADJUSTER, REPLACEMENT):
    if not path.is_file():
        print(f'ERROR: Required file not found: {path}')
        print('Run this script from the style-silhouette repository root, and extract the complete ZIP first.')
        sys.exit(1)

wardrobe_src = WARDROBE.read_text(encoding='utf-8')
vton_src = VTON.read_text(encoding='utf-8')
adjuster_replacement = REPLACEMENT.read_text(encoding='utf-8')
new_wardrobe = wardrobe_src
new_vton = vton_src

# ---- Wardrobe: enable selecting one upper + one lower (or a dress alone) ----
if 'const [selectedItems, setSelectedItems] = useState([])' not in new_wardrobe:
    anchor = "    const [selectedCat, setSelectedCat] = useState('All')\n"
    if anchor not in new_wardrobe:
        print('ERROR: Cannot find Wardrobe selected-category state. No files changed.')
        sys.exit(2)
    new_wardrobe = new_wardrobe.replace(anchor, anchor + "    const [selectedItems, setSelectedItems] = useState([])\n", 1)

slot_helper = r'''
function wardrobeTryOnSlot(item) {
    const description = `${item?.name || ''} ${item?.category || ''}`.toLowerCase()
    if (/\b(dress|gown|jumpsuit|romper)\b/.test(description)) return 'dresses'
    if (/\b(jeans?|trousers?|pants?|shorts?|skirt|leggings?|bottoms?|chinos?)\b/.test(description) || /\bbottoms\b/i.test(item?.category || '')) return 'lower_body'
    if (/\b(shoes?|sneakers?|boots?|sandals?)\b/.test(description)) return 'lower_body'
    return 'upper_body'
}
'''
if 'function wardrobeTryOnSlot(item)' not in new_wardrobe:
    cat_match = re.search(r"const CATEGORIES = \[\s*[^\n]*\]", new_wardrobe)
    if not cat_match:
        print('ERROR: Cannot find Wardrobe category list. No files changed.')
        sys.exit(2)
    cat_end = cat_match.end()
    new_wardrobe = new_wardrobe[:cat_end] + '\n' + slot_helper + new_wardrobe[cat_end:]

# Replace the old immediate-navigation handler with selection/replacement by garment slot.
handler_pattern = r'    const handleTryOn = \(item\) => \{.*?\n    \}'
handler = r'''    const handleTryOn = (item) => {
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
    }'''
new_wardrobe, count = re.subn(handler_pattern, handler, new_wardrobe, count=1, flags=re.S)
if count != 1:
    print('ERROR: Could not safely replace Wardrobe Try On handler. No files changed.')
    sys.exit(2)

# Add an action that forwards all selected garments together.
if 'Try On Selected (' not in new_wardrobe:
    upload_button_anchor = '''                <button
                    style={{
                        backgroundColor: 'var(--accent)',
                        color: '#FFFFFF','''
    selection_button = '''                {selectedItems.length > 0 && (
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/dashboard/virtual-try-on', { state: { wardrobeItems: selectedItems } })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                        <ArrowRight size={15} /> Try On Selected ({selectedItems.length})
                    </button>
                )}

'''
    if upload_button_anchor not in new_wardrobe:
        print('ERROR: Could not find the Add Clothing button to place the selected-items action. No files changed.')
        sys.exit(2)
    new_wardrobe = new_wardrobe.replace(upload_button_anchor, selection_button + upload_button_anchor, 1)

# Convert the card loop to block form so each button can show the selected state.
loop_anchor = '                {filtered.map((item) => (\n'
if loop_anchor in new_wardrobe:
    new_wardrobe = new_wardrobe.replace(
        loop_anchor,
        "                {filtered.map((item) => {\n                    const isSelected = selectedItems.some(selected => selected.id === item.id)\n                    return (\n",
        1,
    )
    end_anchor = '                ))}\n            </div>\n        </div>\n    )\n}'
    # find the final outer-loop close (the exact ending should appear once after the loop start)
    loop_start = new_wardrobe.find('                {filtered.map((item) => {')
    end_pos = new_wardrobe.find(end_anchor, loop_start)
    if end_pos < 0:
        print('ERROR: Could not safely close the updated Wardrobe card loop. No files changed.')
        sys.exit(2)
    new_wardrobe = new_wardrobe[:end_pos] + '                    )\n                })}\n            </div>\n        </div>\n    )\n}' + new_wardrobe[end_pos + len(end_anchor):]

# Change the button label and style within the card.
new_wardrobe = new_wardrobe.replace(
    '''                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: 'auto', width: '100%' }}
                            onClick={() => handleTryOn(item)}
                        >
                            <span>Try On Look</span>''',
    '''                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ marginTop: 'auto', width: '100%' }}
                            onClick={() => handleTryOn(item)}
                        >
                            <span>{isSelected ? 'Selected ✓' : 'Select for Try-On'}</span>''',
    1,
)
if 'Select for Try-On' not in new_wardrobe or 'Try On Selected (' not in new_wardrobe:
    print('ERROR: Wardrobe multi-select controls failed validation. No files changed.')
    sys.exit(2)

# ---- VirtualTryOn: handle an array of wardrobe items and persist per-slot transforms ----
# Ensure useLocation is imported and instantiated.
if 'useLocation' not in new_vton:
    import_match = re.search(r"import\s*\{([^}]*)\}\s*from\s*(['\"])react-router-dom\2\s*;?", new_vton)
    if import_match:
        names = [name.strip() for name in import_match.group(1).split(',') if name.strip()]
        names.append('useLocation')
        new_vton = new_vton[:import_match.start()] + "import { " + ', '.join(dict.fromkeys(names)) + " } from 'react-router-dom'" + new_vton[import_match.end():]
    else:
        new_vton = "import { useLocation } from 'react-router-dom'\n" + new_vton
if 'const location = useLocation()' not in new_vton:
    comp_match = re.search(r'export\s+default\s+function\s+VirtualTryOn\s*\([^)]*\)\s*\{', new_vton)
    if not comp_match:
        print('ERROR: Cannot find VirtualTryOn component declaration. No files changed.')
        sys.exit(3)
    new_vton = new_vton[:comp_match.end()] + '\n    const location = useLocation()' + new_vton[comp_match.end():]

if 'const [garmentsByCategory, setGarmentsByCategory]' not in new_vton:
    print('ERROR: Multi-garment state is missing. Apply the existing multi-garment try-on patch first. No files changed.')
    sys.exit(3)
if 'const [garmentTransforms, setGarmentTransforms]' not in new_vton:
    state_anchor = "    const [garmentsByCategory, setGarmentsByCategory] = useState({ upper_body: null, lower_body: null, dresses: null })\n"
    if state_anchor not in new_vton:
        print('ERROR: Could not find garmentsByCategory state. No files changed.')
        sys.exit(3)
    new_vton = new_vton.replace(state_anchor, state_anchor + "    const [garmentTransforms, setGarmentTransforms] = useState({})\n", 1)

# Add useMemo for a stable editor item array, avoiding reload loops inside the editor.
react_import = re.search(r"import\s*\{([^}]*)\}\s*from\s*(['\"])react\2\s*;?", new_vton)
if react_import and 'useMemo' not in react_import.group(1):
    names = [name.strip() for name in react_import.group(1).split(',') if name.strip()]
    names.append('useMemo')
    new_vton = new_vton[:react_import.start()] + "import { " + ', '.join(dict.fromkeys(names)) + " } from 'react'" + new_vton[react_import.end():]

# Replace the older single-item prefill effect with a multi-item aware effect.
new_effect = r'''
    // Prefill one or two selected items from My Wardrobe. Upper + Lower are kept together.
    useEffect(() => {
        let items = Array.isArray(location.state?.wardrobeItems) ? location.state.wardrobeItems : []
        if (!items.length && location.state?.wardrobeItem) items = [location.state.wardrobeItem]
        if (!items.length) {
            const encodedItem = new URLSearchParams(location.search).get('item')
            if (encodedItem) {
                try { items = [JSON.parse(encodedItem)] }
                catch (error) { console.warn('[Wardrobe Try-On] Could not parse selected item:', error) }
            }
        }
        items = items.filter(item => item && typeof item === 'object' && item.imageSrc)
        if (!items.length) return

        const slotFor = (item) => {
            const description = `${item.name || ''} ${item.category || ''}`.toLowerCase()
            if (/\b(dress|gown|jumpsuit|romper)\b/.test(description)) return 'dresses'
            if (/\b(jeans?|trousers?|pants?|shorts?|skirt|leggings?|bottoms?|chinos?|shoes?|sneakers?|boots?|sandals?)\b/.test(description) || /\bbottoms\b/.test(String(item.category || '').toLowerCase())) return 'lower_body'
            return 'upper_body'
        }
        const slots = { upper_body: null, lower_body: null, dresses: null }
        for (const item of items) {
            const slot = slotFor(item)
            slots[slot] = { image: item.imageSrc, name: item.name || 'Wardrobe garment', category: slot }
        }
        // If a dress is selected, treat it as the complete outfit and don't layer tops/bottoms over it.
        if (slots.dresses) {
            slots.upper_body = null
            slots.lower_body = null
        }
        const active = slots.upper_body || slots.lower_body || slots.dresses
        setGarmentsByCategory(slots)
        setCategory(active.category)
        setClothingImage(active.image)
        setGarmentName(active.name)
        setGarmentTransforms({})
        setResultImage(null)
        setIsAdjusting(false)
        message({}.text || `Loaded ${Object.values(slots).filter(Boolean).length} wardrobe item(s). Upload or capture your model photo to continue.`, 'info')
    }, [location.key, location.search, location.state])
'''
# message() takes text,type; keep the intentionally authored status call simple.
new_effect = new_effect.replace("message({}.text || `Loaded ${Object.values(slots).filter(Boolean).length} wardrobe item(s). Upload or capture your model photo to continue.`, 'info')", "message(`Loaded ${Object.values(slots).filter(Boolean).length} wardrobe item(s) from My Wardrobe. Upload or capture your model photo to continue.`, 'info')")
old_effect_match = re.search(r'    // Prefill the selected wardrobe garment.*?\n    \}, \[location\.key, location\.search, location\.state\]\)', new_vton, flags=re.S)
if old_effect_match:
    new_vton = new_vton[:old_effect_match.start()] + new_effect.strip('\n') + new_vton[old_effect_match.end():]
elif 'Prefill one or two selected items from My Wardrobe.' not in new_vton:
    marker = "    const message = (text, type = 'info') => setStatus({ text, type })"
    if marker not in new_vton:
        print('ERROR: Cannot find status-message insertion point. No files changed.')
        sys.exit(3)
    new_vton = new_vton.replace(marker, marker + '\n' + new_effect, 1)

# Make client-side compositing apply persistent transforms to each slot.
new_vton = new_vton.replace(
    'const generateClientSideMultiTryOn = async (modelImgUrl, garments) => {',
    'const generateClientSideMultiTryOn = async (modelImgUrl, garments, transforms = {}) => {',
    1,
)
old_draw = '''            const x = box.x + (box.w - drawW) / 2
            const y = box.y + (box.h - drawH) / 2
            ctx.drawImage(cutout, x, y, drawW, drawH)'''
new_draw = '''            const x = box.x + (box.w - drawW) / 2
            const y = box.y + (box.h - drawH) / 2
            const t = { posX: 0, posY: 0, scale: 1, scaleW: 1, scaleH: 1, rotation: 0, opacity: 1, ...(transforms[garment.category] || {}) }
            const finalW = drawW * t.scale * t.scaleW
            const finalH = drawH * t.scale * t.scaleH
            ctx.save()
            ctx.globalAlpha = Math.max(0, Math.min(1, t.opacity))
            ctx.translate(x + drawW / 2 + t.posX, y + drawH / 2 + t.posY)
            ctx.rotate((t.rotation * Math.PI) / 180)
            ctx.drawImage(cutout, -finalW / 2, -finalH / 2, finalW, finalH)
            ctx.restore()'''
if old_draw in new_vton:
    new_vton = new_vton.replace(old_draw, new_draw, 1)
elif 'transforms[garment.category]' not in new_vton:
    print('ERROR: Could not patch the composite draw position. No files changed.')
    sys.exit(3)

# Add a stable getter for both current and stored slot garments before generateTryOn.
getter = r'''    const getSelectedGarments = () => {
        const byCategory = { ...(garmentsByCategory || {}) }
        if (clothingImage) {
            byCategory[category] = {
                ...(byCategory[category] || {}),
                image: clothingImage,
                name: garmentName || byCategory[category]?.name || 'Uploaded garment',
                category,
            }
        }
        let selected = Object.entries(byCategory)
            .filter(([, item]) => Boolean(item?.image))
            .map(([itemCategory, item]) => ({ ...item, category: itemCategory }))
        if (selected.some(item => item.category === 'dresses')) selected = [selected.find(item => item.category === 'dresses')]
        return selected
    }

'''
if 'const getSelectedGarments = () =>' not in new_vton:
    gen_marker = '    const generateTryOn = async () => {\n'
    if gen_marker not in new_vton:
        print('ERROR: Could not find generateTryOn handler. No files changed.')
        sys.exit(3)
    new_vton = new_vton.replace(gen_marker, getter + gen_marker, 1)

# Replace the adjuster callbacks/props so the editor receives all selected garments and returns transforms.
old_adjuster = '''                            <TryOnAdjuster
                                modelPhoto={modelImage}
                                clothingPhoto={clothingImage}
                                category={category}
                                onApply={(newImage) => {
                                    setResultImage(newImage)
                                    setIsAdjusting(false)
                                    message('Custom position & scale applied to Try-On result!', 'success')
                                }}
                                onClose={() => setIsAdjusting(false)}
                            />'''
new_adjuster = '''                            <TryOnAdjuster
                                modelPhoto={modelImage}
                                clothingPhoto={clothingImage}
                                category={category}
                                garments={editorGarments}
                                initialTransforms={garmentTransforms}
                                onApply={(newImage, updatedTransforms) => {
                                    setResultImage(newImage)
                                    setGarmentTransforms(updatedTransforms || {})
                                    setIsAdjusting(false)
                                    message('Fit adjustments applied. All selected garments are preserved.', 'success')
                                }}
                                onClose={() => setIsAdjusting(false)}
                            />'''
if old_adjuster in new_vton:
    new_vton = new_vton.replace(old_adjuster, new_adjuster, 1)
elif '<TryOnAdjuster' in new_vton and 'garments={editorGarments}' not in new_vton:
    print('ERROR: Found TryOnAdjuster but its props did not match the expected multi-garment structure. No files changed.')
    sys.exit(3)

# Insert a memoized list before the main JSX return.
if 'const editorGarments = useMemo(' not in new_vton:
    main_return = '    return (\n        <main style={{ maxWidth: 1320'
    if main_return not in new_vton:
        print('ERROR: Cannot find main VirtualTryOn render return. No files changed.')
        sys.exit(3)
    new_vton = new_vton.replace(main_return, '    const editorGarments = useMemo(() => getSelectedGarments(), [garmentsByCategory, clothingImage, garmentName, category])\n\n' + main_return, 1)

# Update calls to local compositing to use stored transforms and selected garments.
new_vton = new_vton.replace('generateClientSideMultiTryOn(modelImage, selectedGarments)', 'generateClientSideMultiTryOn(modelImage, selectedGarments, garmentTransforms)')
new_vton = new_vton.replace('generateClientSideMultiTryOn(modelImage, [garment])', 'generateClientSideMultiTryOn(modelImage, [garment], garmentTransforms)')
# The current multi-garment handler should use selected stored slots. Replace only its slot read block.
old_selection_block = '''        const selectedByCategory = { ...garmentsByCategory }
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

        if (!selectedGarments.length) {'''
new_selection_block = '''        let selectedGarments = getSelectedGarments()

        if (!selectedGarments.length) {'''
if old_selection_block in new_vton:
    new_vton = new_vton.replace(old_selection_block, new_selection_block, 1)

# Make adjust buttons work if the active slot differs, so long as at least one garment is selected.
new_vton = new_vton.replace('disabled={!modelImage || !clothingImage}', 'disabled={!modelImage || getSelectedGarments().length === 0}')

# Clear multi-garment state and transforms when creating a new session.
if 'setGarmentsByCategory({ upper_body: null, lower_body: null, dresses: null })' not in new_vton:
    clear_anchor = "        setClothingImage(null)\n        setGarmentName('')\n        setResultImage(null)"
    if clear_anchor in new_vton:
        new_vton = new_vton.replace(clear_anchor, "        setClothingImage(null)\n        setGarmentsByCategory({ upper_body: null, lower_body: null, dresses: null })\n        setGarmentTransforms({})\n        setGarmentName('')\n        setResultImage(null)", 1)

# Ensure uploaded/current item slot is available in the result and editor arrays.
checks = [
    ('wardrobe selection state', 'const [selectedItems, setSelectedItems] = useState([])' in new_wardrobe),
    ('wardrobe multi-item route state', 'state: { wardrobeItems: selectedItems }' in new_wardrobe),
    ('wardrobe slot toggles', 'Selected ✓' in new_wardrobe),
    ('multi-item route receiver', 'location.state?.wardrobeItems' in new_vton),
    ('garment transforms state', 'const [garmentTransforms, setGarmentTransforms]' in new_vton),
    ('multi-garment editor prop', 'garments={editorGarments}' in new_vton),
    ('editor transform callback', 'setGarmentTransforms(updatedTransforms || {})' in new_vton),
    ('compositor transforms', 'transforms[garment.category]' in new_vton),
]
failed = [name for name, ok in checks if not ok]
if failed:
    print('ERROR: Validation failed: ' + ', '.join(failed) + '. No files changed.')
    sys.exit(4)

# No files are changed until all replacements validate.
stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
for path, original, updated in ((WARDROBE, wardrobe_src, new_wardrobe), (VTON, vton_src, new_vton)):
    if original != updated:
        backup = path.with_name(f'{path.name}.before-wardrobe-multi-adjust-{stamp}.bak')
        shutil.copy2(path, backup)
        path.write_text(updated, encoding='utf-8', newline='\n')
        print(f'Updated: {path.relative_to(ROOT)}')
        print(f'Backup:  {backup.relative_to(ROOT)}')

backup = ADJUSTER.with_name(f'{ADJUSTER.name}.before-wardrobe-multi-adjust-{stamp}.bak')
shutil.copy2(ADJUSTER, backup)
shutil.copy2(REPLACEMENT, ADJUSTER)
shutil.rmtree(REPLACEMENT.parents[3], ignore_errors=True)
print(f'Updated: {ADJUSTER.relative_to(ROOT)}')
print(f'Backup:  {backup.relative_to(ROOT)}')
print('\nInstalled: select upper + lower garments from Wardrobe together; adjust either garment independently; applying fit preserves both garments.')
print('Note: combined multi-garment visualization is still a local 2D composite, not photorealistic AI fitting.')
