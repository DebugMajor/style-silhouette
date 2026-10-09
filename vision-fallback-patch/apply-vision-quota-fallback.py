from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path.cwd()
TARGET = ROOT / 'backend' / 'services' / 'styleVisionService.js'

if not TARGET.is_file():
    print('ERROR: Run this script from the style-silhouette repository root. Could not find backend/services/styleVisionService.js.')
    sys.exit(1)

source = TARGET.read_text(encoding='utf-8')
start_marker = 'async function analyzeOutfitImage('
end_marker = '/**\n * Handle conversational follow-up dialogue with AI Stylist'
start = source.find(start_marker)
end = source.find(end_marker, start + len(start_marker)) if start >= 0 else -1
if start < 0 or end < 0:
    print('ERROR: The current styleVisionService.js layout did not match safely. No files were changed.')
    print('Please share the analyzeOutfitImage function (remove API keys) so the patch can be adapted.')
    sys.exit(1)

existing = source[start:end].rstrip() + '\n\n'
# Keep the current provider-backed implementation; wrap it with a non-fabricating fallback.
renamed = existing.replace(start_marker, 'async function analyzeOutfitImageWithProviders(', 1)
if renamed == existing:
    print('ERROR: Could not rename provider function safely. No files were changed.')
    sys.exit(1)

wrapper = r'''/**
 * Public image-analysis entry point. Provider quota/auth failures should not crash the UI.
 * The fallback is explicitly labelled and does not claim to have visually identified garments.
 */
async function analyzeOutfitImage(filePath, mimeType = 'image/jpeg') {
    try {
        const result = await analyzeOutfitImageWithProviders(filePath, mimeType)
        return result
    } catch (err) {
        const detail = String(err?.message || err || '').toLowerCase()
        const quotaRelated = /429|quota|credit|resource_exhausted|rate.?limit|insufficient_quota|credit_balance_exhausted/.test(detail)
        console.warn(
            '[styleVisionService] Returning transparent local fallback:',
            quotaRelated ? 'vision provider quota/credits exhausted' : 'vision provider unavailable'
        )

        return {
            outfitSummary: quotaRelated
                ? 'Your photo was received, but live visual analysis is temporarily unavailable because the configured vision providers have exhausted their quota or credits.'
                : 'Your photo was received, but the configured vision providers are temporarily unavailable.',
            visibleItems: [],
            colors: [],
            styleCategory: 'Not analyzed',
            recommendations: [
                'For a balanced casual look, combine a neutral base with one accent colour.',
                'Keep the outfit to two or three complementary colours.',
                'Match footwear formality to the occasion and the rest of the outfit.'
            ],
            spokenResponse: quotaRelated
                ? "I received your photo, but I couldn't inspect its garments because the image-analysis services are out of quota. As general styling advice, use two or three complementary colours, balance relaxed pieces with one structured item, and match your shoes to the occasion."
                : "I received your photo, but the image-analysis service isn't responding right now. As general styling advice, use two or three complementary colours and choose footwear that matches the occasion.",
            analysisMode: 'local_fallback',
            providerUnavailable: true,
            providerError: quotaRelated ? 'Vision provider quota or credits exhausted' : 'Vision provider unavailable'
        }
    }
}

'''
updated = source[:start] + renamed + wrapper + source[end:]

backup = TARGET.with_name(f'{TARGET.name}.before-vision-fallback-{datetime.now().strftime("%Y%m%d-%H%M%S")}.bak')
shutil.copy2(TARGET, backup)
TARGET.write_text(updated, encoding='utf-8', newline='')
print('Vision quota fallback installed.')
print(f'Backup: {backup.relative_to(ROOT)}')
print('The existing provider implementation is preserved. If providers fail, the API returns clearly labelled general advice instead of throwing.')
