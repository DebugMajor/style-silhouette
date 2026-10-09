const express = require('express')
const { testAuth, generate3D, get3DStatus } = require('../controllers/aiTrendController')
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware')

const router = express.Router()

router.get('/test-auth', authMiddleware, testAuth)
router.post('/generate-3d', authMiddleware, uploadMiddleware.single('image'), generate3D)
router.get('/status/:taskId', authMiddleware, get3DStatus)

module.exports = router
