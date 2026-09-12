const VirtualTryOn = require('../models/VirtualTryOn')

/**
 * POST /api/virtual-tryon/save
 * Save a 2D Virtual Try-On composition for the authenticated user
 */
const saveTryOn = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id
        const { title, baseImage, clothingItems, resultImage } = req.body

        if (!resultImage) {
            return res.status(400).json({ message: 'Result image is required to save try-on look.' })
        }

        const newTryOn = await VirtualTryOn.create({
            userId,
            title: title || `Style Look ${new Date().toLocaleDateString()}`,
            baseImage: baseImage || '',
            clothingItems: clothingItems || [],
            resultImage,
        })

        res.status(201).json({
            success: true,
            message: 'Virtual Try-On look saved successfully!',
            data: newTryOn,
        })
    } catch (error) {
        console.error('Save Virtual Try-On Error:', error)
        res.status(500).json({ success: false, message: 'Failed to save Virtual Try-On look.' })
    }
}

/**
 * GET /api/virtual-tryon/history
 * Fetch all saved virtual try-on items for the authenticated user
 */
const getHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id
        const history = await VirtualTryOn.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)

        res.json({
            success: true,
            count: history.length,
            data: history,
        })
    } catch (error) {
        console.error('Get Virtual Try-On History Error:', error)
        res.status(500).json({ success: false, message: 'Failed to fetch try-on history.' })
    }
}

/**
 * DELETE /api/virtual-tryon/:id
 * Delete a specific saved virtual try-on item
 */
const deleteTryOn = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id
        const { id } = req.params

        const deleted = await VirtualTryOn.findOneAndDelete({ _id: id, userId })

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Try-On item not found or unauthorized.' })
        }

        res.json({
            success: true,
            message: 'Try-On item deleted successfully.',
            id,
        })
    } catch (error) {
        console.error('Delete Virtual Try-On Error:', error)
        res.status(500).json({ success: false, message: 'Failed to delete try-on item.' })
    }
}

module.exports = {
    saveTryOn,
    getHistory,
    deleteTryOn,
}
