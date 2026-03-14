const OutfitAnalysis = require('../models/OutfitAnalysis')

const analyzeImage = async (req, res) => {
    try {
        const result = "Nice outfit! Try adding contrast for better styling."

        if (req.user) {
            await OutfitAnalysis.create({
                userId: req.user._id,
                source: 'camera',
                aiText: result
            })
        }

        res.json({ result })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "AI analysis failed" })
    }
}

const voiceStyling = async (req, res) => {
    try {
        const { transcript } = req.body

        res.json({
            success: true,
            outfit: ["White Shirt", "Blue Jeans"],
            reasoning: "Clean smart casual",
            score: 8
        })
    } catch (err) {
        res.status(500).json({ message: "Voice styling failed" })
    }
}

module.exports = { analyzeImage, voiceStyling }