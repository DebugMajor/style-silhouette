const path = require('path')
const fs = require('fs')
const styleVisionService = require('../services/styleVisionService')
const textToSpeechService = require('../services/textToSpeechService')

/**
 * POST /api/style-speaker/analyze
 * Analyzes captured outfit frame from camera
 */
async function analyzeStyle(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image frame provided for analysis.'
            })
        }

        const filePath = req.file.path
        const mimeType = req.file.mimetype || 'image/jpeg'

        const analysis = await styleVisionService.analyzeOutfitImage(filePath, mimeType)

        // Asynchronously clean up uploaded temporary file
        fs.unlink(filePath, () => {})

        return res.json({
            success: true,
            analysis
        })
    } catch (err) {
        console.error('[styleSpeakerController] analyzeStyle Error:', err)
        return res.status(500).json({
            success: false,
            message: err.message || 'Style analysis failed. Please try again.'
        })
    }
}

/**
 * POST /api/style-speaker/chat
 * Handles multi-turn conversational dialogue with AI Stylist
 */
async function chatStylist(req, res) {
    try {
        const { message, conversationHistory, occasion, currentOutfit } = req.body

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required.'
            })
        }

        const reply = await styleVisionService.chatWithStylist(message, conversationHistory, occasion, currentOutfit)

        return res.json(reply)
    } catch (err) {
        console.error('[styleSpeakerController] chatStylist Error:', err)
        return res.status(500).json({
            success: false,
            message: 'Unable to complete chat request.'
        })
    }
}

/**
 * POST /api/style-speaker/speak
 * Generates ElevenLabs natural female speech audio stream from text
 */
async function speakText(req, res) {
    try {
        const { text } = req.body
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Text prompt is required.' })
        }

        try {
            const audioBuffer = await textToSpeechService.generateElevenLabsSpeech(text)
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Content-Length', audioBuffer.length)
            return res.send(audioBuffer)
        } catch (elevenLabsErr) {
            console.warn('[styleSpeakerController] ElevenLabs fallback:', elevenLabsErr.message)
            return res.status(200).json({
                success: false,
                fallback: true,
                message: 'Voice is temporarily unavailable.',
                text
            })
        }
    } catch (err) {
        console.error('[styleSpeakerController] speakText Error:', err.message)
        return res.status(500).json({
            success: false,
            message: err.message || 'Speech generation failed.'
        })
    }
}

module.exports = {
    analyzeStyle,
    chatStylist,
    speakText
}
