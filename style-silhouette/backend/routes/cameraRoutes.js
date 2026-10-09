const express = require('express')
const multer = require('multer')
const path = require('path')
const { handleUpload } = require('../controllers/cameraController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) =>
        cb(null, `cam-${Date.now()}${path.extname(file.originalname || '.jpg')}`)
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
})

router.post('/upload', authMiddleware, upload.single('image'), handleUpload)

module.exports = router