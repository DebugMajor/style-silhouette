from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path.cwd()
FRONTEND = ROOT / "frontend" / "src" / "pages" / "Voice.jsx"
SERVICE = ROOT / "backend" / "services" / "styleVisionService.js"
CONTROLLER = ROOT / "backend" / "controllers" / "styleSpeakerController.js"

required = [FRONTEND, SERVICE, CONTROLLER]
missing = [str(p.relative_to(ROOT)) for p in required if not p.is_file()]
if missing:
    print("ERROR: Run this script from the style-silhouette repository root.")
    print("Missing file(s): " + ", ".join(missing))
    sys.exit(1)

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
for path in required:
    backup = path.with_name(path.name + f".before-camera-analysis-fix-{stamp}.bak")
    shutil.copy2(path, backup)
    print(f"Backup: {backup.relative_to(ROOT)}")

# Replace backend vision service so the uploaded/captured image is truly analyzed.
SERVICE.write_text(r'''const fs = require('fs')

function parseJsonResponse(text) {
    const cleaned = String(text || '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')

    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end <= start) {
        throw new Error('Vision model did not return a JSON analysis.')
    }

    const result = JSON.parse(cleaned.slice(start, end + 1))
    const stringArray = value => Array.isArray(value) ? value.filter(v => typeof v === 'string') : []

    if (!result.outfitSummary && !result.spokenResponse) {
        throw new Error('Vision model returned an empty outfit analysis.')
    }

    return {
        outfitSummary: String(result.outfitSummary || result.spokenResponse || 'The visible outfit was analyzed.'),
        visibleItems: stringArray(result.visibleItems),
        colors: stringArray(result.colors),
        styleCategory: String(result.styleCategory || 'Style analysis'),
        recommendations: stringArray(result.recommendations),
        spokenResponse: String(result.spokenResponse || result.outfitSummary || 'Here is my feedback on the outfit visible in your image.')
    }
}

function createPrompt(occasion = 'Casual') {
    return `You are an evidence-based fashion stylist. Analyze ONLY the clothing and accessories visible in the single image attached to THIS request. This image is the user's own camera capture or uploaded photo. Do not use or infer anything from UI avatars, example images, previous requests, or other people. Describe what is actually visible; if lighting or image quality makes a detail uncertain, say so instead of guessing. Do not identify the person or infer sensitive traits. The user's selected occasion is ${String(occasion || 'Casual')}.
Return ONLY valid JSON, no markdown, with this exact shape:
{
  "outfitSummary": "One sentence describing the actual visible outfit",
  "visibleItems": ["actual visible garment or accessory"],
  "colors": ["colors actually visible"],
  "styleCategory": "a short style category",
  "recommendations": ["three specific styling tips based on this image"],
  "spokenResponse": "Two or three friendly sentences referring to the actual garments and colors visible in this image"
}`
}

async function analyzeWithGemini(imageBytes, mimeType, occasion) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) return null

    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const client = new GoogleGenerativeAI(apiKey)
    const modelName = process.env.STYLE_VISION_MODEL || 'gemini-3.8-flash'
    const model = client.getGenerativeModel({ model: modelName })
    const result = await model.generateContent([
        createPrompt(occasion),
        {
            inlineData: {
                data: imageBytes.toString('base64'),
                mimeType: mimeType || 'image/jpeg'
            }
        }
    ])
    const response = await result.response
    return parseJsonResponse(response.text())
}

async function analyzeWithOpenAI(imageBytes, mimeType, occasion) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return null

    const OpenAI = require('openai')
    const client = new OpenAI({ apiKey })
    const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'
    const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBytes.toString('base64')}`
    const response = await client.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: createPrompt(occasion) },
                { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } }
            ]
        }]
    })
    return parseJsonResponse(response.choices?.[0]?.message?.content)
}

/** Analyze only the actual image uploaded to /api/style-speaker/analyze. */
async function analyzeOutfitImage(filePath, mimeType = 'image/jpeg', occasion = 'Casual') {
    if (!filePath || !fs.existsSync(filePath)) {
        const error = new Error('Uploaded image file was not found for analysis.')
        error.statusCode = 400
        throw error
    }

    const imageBytes = fs.readFileSync(filePath)
    if (!imageBytes.length) {
        const error = new Error('Uploaded image is empty.')
        error.statusCode = 400
        throw error
    }

    const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)
    if (!hasGemini && !hasOpenAI) {
        const error = new Error('No vision API key is configured. Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env, then restart the backend.')
        error.statusCode = 503
        throw error
    }

    const errors = []
    if (hasGemini) {
        try {
            return await analyzeWithGemini(imageBytes, mimeType, occasion)
        } catch (err) {
            errors.push(`Gemini: ${err.message}`)
            console.warn('[styleVisionService] Gemini image analysis failed:', err.message)
        }
    }

    if (hasOpenAI) {
        try {
            return await analyzeWithOpenAI(imageBytes, mimeType, occasion)
        } catch (err) {
            errors.push(`OpenAI: ${err.message}`)
            console.warn('[styleVisionService] OpenAI image analysis failed:', err.message)
        }
    }

    const error = new Error(`The uploaded image could not be analyzed by the configured vision provider. ${errors.join(' | ')}`)
    error.statusCode = 502
    throw error
}

/** Handle conversational follow-up dialogue. */
async function chatWithStylist(message, conversationHistory = [], occasion = 'Casual', currentOutfit = null) {
    const lowerMsg = (message || '').toLowerCase()
    let spokenResponse
    let recommendations = []
    let suggestedItem = null

    const outfitContext = currentOutfit?.outfitSummary
        ? ` Your current outfit is: ${currentOutfit.outfitSummary}.`
        : ''

    if (lowerMsg.includes('shoe') || lowerMsg.includes('footwear') || lowerMsg.includes('sneaker')) {
        spokenResponse = `For a ${String(occasion).toLowerCase()} setting, clean white sneakers or tan loafers can work well.${outfitContext}`
        recommendations = ['White minimalist sneakers', 'Tan loafers', 'Choose footwear that complements the actual outfit colors']
        suggestedItem = { id: 'shoe-1', name: 'Classic Neutral Footwear', category: 'Footwear', color: 'Neutral', style: occasion }
    } else if (lowerMsg.includes('party') || lowerMsg.includes('evening') || lowerMsg.includes('night')) {
        spokenResponse = `For a party look, consider one elevated layer and a subtle accessory while keeping the outfit balanced.${outfitContext}`
        recommendations = ['Structured jacket', 'One subtle accessory', 'Coordinated trousers and footwear']
    } else if (lowerMsg.includes('college') || lowerMsg.includes('work') || lowerMsg.includes('office') || lowerMsg.includes('formal')) {
        spokenResponse = `For ${String(occasion).toLowerCase()}, clean proportions and coordinated neutral trousers can make the outfit look more polished.${outfitContext}`
        recommendations = ['Keep the fit comfortable and neat', 'Coordinate trouser and footwear colors', 'Add a light outer layer if appropriate']
    } else {
        spokenResponse = `I can help refine your ${String(occasion).toLowerCase()} look. Tell me which part you want to improve, and I’ll tailor the advice to the outfit we analyzed.${outfitContext}`
        recommendations = ['Keep the color palette coordinated', 'Check that the fit is comfortable', 'Choose accessories that complement the visible outfit']
    }

    return { success: true, spokenResponse, recommendations, suggestedItem, occasion, currentOutfit }
}

module.exports = { analyzeOutfitImage, chatWithStylist }
''', encoding='utf-8')
print('Updated: backend/services/styleVisionService.js')

# Pass the occasion and return meaningful HTTP status codes from the controller.
controller_text = CONTROLLER.read_text(encoding='utf-8')
old_call = 'styleVisionService.analyzeOutfitImage(filePath, mimeType)'
new_call = 'styleVisionService.analyzeOutfitImage(filePath, mimeType, req.body?.occasion || \'Casual\')'
if old_call in controller_text:
    controller_text = controller_text.replace(old_call, new_call)
else:
    print('NOTE: Controller vision call already differs; left that call unchanged.')
old_status = "return res.status(500).json({\n            success: false,\n            message: err.message || 'Style analysis failed. Please try again.'\n        })"
new_status = "return res.status(err.statusCode || 500).json({\n            success: false,\n            message: err.message || 'Style analysis failed. Please try again.'\n        })"
if old_status in controller_text:
    controller_text = controller_text.replace(old_status, new_status, 1)
CONTROLLER.write_text(controller_text, encoding='utf-8')
print('Updated: backend/controllers/styleSpeakerController.js')

# Replace the frontend analysis function only, preserving the existing camera-preview fix.
frontend_text = FRONTEND.read_text(encoding='utf-8')
start_marker = '    const runAnalysisOnBlob = async (imageBlob) => {'
end_marker = '    const fetchElevenLabsSpeech = async (textToSpeak) => {'
start = frontend_text.find(start_marker)
end = frontend_text.find(end_marker, start + len(start_marker)) if start >= 0 else -1
if start < 0 or end < 0:
    print('ERROR: Could not safely locate runAnalysisOnBlob in Voice.jsx; no frontend changes written.')
    sys.exit(2)
replacement = '''    const runAnalysisOnBlob = async (imageBlob) => {
        if (!imageBlob) {
            setCameraError('No camera or uploaded image was provided.');
            return;
        }

        setCameraError(null);
        setAnalysisResult(null);
        setIsAnalyzing(true);
        setCharacterState('THINKING');
        setCharacterText('Analyzing the image shown in the left Camera Feed...');

        const formData = new FormData();
        formData.append('image', imageBlob, imageBlob.name || 'user-outfit.jpg');
        formData.append('occasion', selectedOccasion);

        try {
            // The only image sent to the server is this camera capture or selected upload.
            const res = await axios.post('/api/style-speaker/analyze', formData, {
                headers: getAuthHeaders(),
            });

            const analysis = res.data?.analysis;
            if (!analysis || (!analysis.outfitSummary && !analysis.spokenResponse)) {
                throw new Error('The vision service returned no image-specific analysis.');
            }

            setAnalysisResult(analysis);
            const speechAdvice = analysis.spokenResponse || analysis.outfitSummary;
            setCharacterText(speechAdvice);
            setCharacterState('IDLE');
            setMessages(prev => [...prev, { sender: 'AI', text: speechAdvice }]);
            fetchElevenLabsSpeech(speechAdvice);
        } catch (err) {
            console.error('[Voice] Image analysis failed:', err);
            const message = err.response?.data?.message || err.message || 'Unknown error';
            setCameraError(`Image analysis failed: ${message}`);
            setCharacterState('IDLE');
            setCharacterText('I could not analyze that image. Check the error shown beneath the Camera Feed.');
            setMessages(prev => [...prev, {
                sender: 'AI',
                text: `I could not analyze the image you supplied. ${message}`,
            }]);
        } finally {
            setIsAnalyzing(false);
        }
    };

'''
frontend_text = frontend_text[:start] + replacement + frontend_text[end:]
FRONTEND.write_text(frontend_text, encoding='utf-8')
print('Updated: frontend/src/pages/Voice.jsx')

print('\nPatch applied. The backend no longer returns canned outfit advice when vision analysis is unavailable.')
print('Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env and restart the Node backend.')
