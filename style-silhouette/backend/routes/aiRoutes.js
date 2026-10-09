const express = require('express')
const multer = require('multer')
const { analyzeImage, voiceStyling } = require('../controllers/aiController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/analyze', authMiddleware, upload.single('image'), analyzeImage)
router.post('/voice', authMiddleware, voiceStyling)

module.exports = router