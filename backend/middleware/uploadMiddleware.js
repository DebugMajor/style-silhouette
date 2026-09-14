const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
        cb(null, `aitrend-${uniqueSuffix}${ext}`)
    }
})

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    
    const ext = path.extname(file.originalname).toLowerCase()
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error('Invalid image file type. Only JPG, JPEG, PNG, and WebP are allowed.'), false)
    }
}

const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter
})

module.exports = uploadMiddleware
