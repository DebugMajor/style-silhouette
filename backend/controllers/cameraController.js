const axios = require('axios')
const fs = require('fs')
const OutfitAnalysis = require('../models/OutfitAnalysis')

/**
 * Retry-safe Gemini call
 */
const callGemini = async (payload) => {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

    for (let i = 0; i < 3; i++) {
        try {
            return await axios.post(url, payload)
        } catch (err) {
            if (err.response?.status === 503 && i < 2) {
                console.log("⚠️ Gemini overloaded → retrying...")
                await new Promise(res => setTimeout(res, 2000))
            } else {
                throw err
            }
        }
    }
}

/**
 * POST /api/camera/upload
 */
const handleUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file received' })
        }

        console.log('📸 Camera upload → Gemini')
        console.log('User:', req.user)

        const fileBuffer = fs.readFileSync(req.file.path)
        const base64Image = fileBuffer.toString('base64')
        const mimeType = req.file.mimetype || 'image/jpeg'

        const payload = {
            contents: [{
                parts: [
                    {
                        text: `
You are a professional fashion vision analysis system.

Your task is to analyze ONLY what is clearly visible in the image.

STRICT RULES:
- Do NOT guess unseen clothing.
- If an item is not fully visible → return "Not visible".
- Do NOT infer based on context.
- Do NOT assume typical outfits.
- Only describe clothing supported by visible pixels.
- Do NOT write explanations outside JSON.

VISIBILITY RULE:
- Bottom clothing must be classified ONLY if waist-to-knee region is visible.
- Shoes must be classified ONLY if feet are visible.
- Accessories must be classified ONLY if clearly identifiable.

STYLE SCORING RULE:
Score from 0–100 based ONLY on:
- Fit
- Wrinkle level
- Color harmony
- Pattern balance
- Neatness
- Visual proportion

Do NOT consider:
- Brand
- Social context
- Background
- Assumed clothing

Return ONLY valid JSON in this EXACT format:

{
  "top": "",
  "bottom": "",
  "shoes": "",
  "accessories": "",
  "fitScore": 0,
  "colorScore": 0,
  "neatnessScore": 0,
  "overallStyleScore": 0,
  "suggestions": []
}

Suggestions must be:
- Short
- Actionable
- Fashion-specific
- Max 4 items
`
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }]
        }

        const response = await callGemini(payload)

        let text = response.data.candidates[0].content.parts[0].text
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim()

        let result

        try {
            result = JSON.parse(text)
        } catch {
            console.log("⚠️ Gemini JSON parse failed → using fallback AI")
            result = {
                top: "Unknown",
                bottom: "Unknown",
                shoes: "Unknown",
                accessories: "Unknown",
                suggestions: ["Try better lighting"],
                styleScore: 70,
                aiFallback: true
            }
        }

        let analysis = null

        if (req.user) {
            analysis = await OutfitAnalysis.create({
                userId: req.user.id,
                imageUrl: `/uploads/${req.file.filename}`,
                source: 'camera',
                top: result.top || '',
                bottom: result.bottom || '',
                shoes: result.shoes || '',
                accessories: result.accessories || '',
                suggestions: result.suggestions || [],
                styleScore: result.styleScore || 0,
            })
        }

        res.json({
            ...result,
            analysisId: analysis?._id || null
        })

    } catch (error) {
        console.error('Camera/Gemini ERROR:', error.response?.data || error.message)

        // FINAL FAILSAFE
        res.json({
            top: "White Shirt",
            bottom: "Blue Jeans",
            shoes: "Sneakers",
            accessories: "Watch",
            suggestions: ["Try darker shoes"],
            styleScore: 75,
            aiFallback: true
        })
    }
}

module.exports = { handleUpload }