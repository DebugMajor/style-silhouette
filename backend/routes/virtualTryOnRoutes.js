const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
    saveTryOn,
    getHistory,
    deleteTryOn,
} = require('../controllers/virtualTryOnController')

const router = express.Router()

// All Virtual Try-On routes are protected by JWT authentication
router.use(authMiddleware)

router.post('/save', saveTryOn)
router.get('/history', getHistory)
router.delete('/:id', deleteTryOn)

module.exports = router
