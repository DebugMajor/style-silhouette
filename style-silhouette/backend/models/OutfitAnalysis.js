const mongoose = require('mongoose')

const outfitAnalysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        imageUrl: String,
        source: String,
        top: String,
        bottom: String,
        shoes: String,
        accessories: String,
        suggestions: [String],
        styleScore: Number,
    },
    { timestamps: true }
)

module.exports = mongoose.model('OutfitAnalysis', outfitAnalysisSchema)