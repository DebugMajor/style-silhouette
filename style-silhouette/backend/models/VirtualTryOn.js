const mongoose = require('mongoose')

const virtualTryOnSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            default: 'Virtual Try-On Look',
        },
        baseImage: String,
        clothingItems: [
            {
                id: String,
                name: String,
                category: String,
                imageSrc: String,
                x: Number,
                y: Number,
                width: Number,
                height: Number,
                scale: Number,
                rotation: Number,
                opacity: Number,
                zIndex: Number,
            },
        ],
        resultImage: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model('VirtualTryOn', virtualTryOnSchema)
