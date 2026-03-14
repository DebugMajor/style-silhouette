const express = require('express')
const { analyzeOutfit } = require('../controllers/analyzeController')

const router = express.Router()

router.post('/analyze-outfit', analyzeOutfit)

module.exports = router