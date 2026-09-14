const DEFAULT_FEMALE_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // ElevenLabs 'Rachel' - Natural Conversational Female Voice

/**
 * Generate audio speech from text using ElevenLabs REST API
 */
async function generateElevenLabsSpeech(text) {
    const apiKey = process.env.ELEVENLABS_API_KEY ? process.env.ELEVENLABS_API_KEY.trim() : ''
    const voiceId = process.env.ELEVENLABS_VOICE_ID ? process.env.ELEVENLABS_VOICE_ID.trim() : DEFAULT_FEMALE_VOICE_ID

    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY is not configured in backend environment (.env)')
    }

    const cleanText = (text || '').trim()
    if (!cleanText) {
        throw new Error('Text prompt is required for speech generation.')
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    })

    if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}))
        console.error('[ElevenLabs API Error]', response.status, errorJson)
        throw new Error(errorJson.detail?.message || errorJson.message || `ElevenLabs API error: HTTP ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

module.exports = {
    generateElevenLabsSpeech
}
