const express = require('express')
const { analyzeStyle, chatStylist, speakText } = require('../controllers/styleSpeakerController')
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware')

const router = express.Router()

router.post('/analyze', authMiddleware, uploadMiddleware.single('image'), analyzeStyle)
router.post('/chat', authMiddleware, chatStylist)
router.post('/speak', authMiddleware, speakText)

module.exports = router
