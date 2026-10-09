const path = require('path')
const fs = require('fs')
const tripoService = require('../services/tripoService')

/**
 * GET /api/ai-trend/test-auth
 * Diagnostic endpoint to test Tripo authentication
 */
async function testAuth(req, res) {
    try {
        const hasKey = Boolean(process.env.TRIPO_API_KEY)
        const keyPrefix = process.env.TRIPO_API_KEY ? process.env.TRIPO_API_KEY.trim().substring(0, 4) + '...' : 'MISSING'
        console.log(`[TRIPO DIAGNOSTIC] Key Present: ${hasKey}, Prefix: ${keyPrefix}`)

        const result = await tripoService.testAuthentication()
        if (!result.success) {
            return res.status(result.status || 401).json(result)
        }
        return res.json(result)
    } catch (err) {
        console.error('[AiTrendController] testAuth Error:', err.message)
        return res.status(500).json({
            success: false,
            authenticated: false,
            message: err.message || 'Tripo authentication check failed'
        })
    }
}

/**
 * POST /api/ai-trend/generate-3d
 * 1. Validates uploaded image
 * 2. Uploads image to Tripo API
 * 3. Creates image_to_model 3D generation task
 * 4. Returns task ID
 */
async function generate3D(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a full-body image.'
            })
        }

        const filePath = req.file.path
        const originalName = req.file.originalname
        const mimeType = req.file.mimetype
        const ext = path.extname(originalName || req.file.filename).replace('.', '') || 'jpg'

        // 1. Upload image to Tripo
        let fileToken
        try {
            fileToken = await tripoService.uploadImageToTripo(filePath, originalName, mimeType)
        } catch (uploadError) {
            console.error('[AiTrendController] Upload to Tripo failed:', uploadError.message)
            return res.status(502).json({
                success: false,
                message: uploadError.message || 'Unable to upload your image to 3D generation service.'
            })
        }

        // 2. Create 3D task on Tripo
        let taskId
        try {
            taskId = await tripoService.createImageToModelTask(fileToken, ext)
        } catch (taskError) {
            console.error('[AiTrendController] Task creation failed:', taskError.message)
            return res.status(502).json({
                success: false,
                message: taskError.message || 'Task creation failed. Please try again.'
            })
        }

        // Clean up temporary local image file asynchronously
        fs.unlink(filePath, () => {})

        return res.status(200).json({
            success: true,
            taskId
        })
    } catch (err) {
        console.error('[AiTrendController] generate3D Error:', err)
        return res.status(500).json({
            success: false,
            message: err.message || 'An unexpected error occurred during 3D generation request.'
        })
    }
}

/**
 * GET /api/ai-trend/status/:taskId
 * Polls Tripo task status and returns normalized response
 */
async function get3DStatus(req, res) {
    try {
        const { taskId } = req.params

        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: 'Task ID is required'
            })
        }

        const taskData = await tripoService.getTaskStatus(taskId)
        const rawStatus = (taskData.status || '').toLowerCase()
        const progress = taskData.progress || 0

        if (rawStatus === 'queued') {
            return res.json({
                success: true,
                status: 'queued',
                progress
            })
        }

        if (rawStatus === 'running') {
            return res.json({
                success: true,
                status: 'running',
                progress
            })
        }

        if (rawStatus === 'success') {
            const output = taskData.output || {}
            const remoteUrl = output.pbr_model || output.model || output.rendered_image

            let localModelUrl = null
            if (remoteUrl) {
                try {
                    localModelUrl = await tripoService.downloadAndSaveModel(remoteUrl, taskId)
                } catch (dlErr) {
                    console.warn('[AiTrendController] Local model save fallback:', dlErr.message)
                    localModelUrl = remoteUrl
                }
            }

            return res.json({
                success: true,
                status: 'success',
                progress: 100,
                model: {
                    url: localModelUrl || remoteUrl,
                    originalUrl: remoteUrl,
                    taskId
                }
            })
        }

        if (rawStatus === 'failed' || rawStatus === 'banned') {
            return res.json({
                success: false,
                status: rawStatus,
                message: 'AI generation failed. Please try another image.'
            })
        }

        return res.json({
            success: true,
            status: rawStatus || 'running',
            progress
        })
    } catch (err) {
        console.error('[AiTrendController] get3DStatus Error:', err)
        return res.status(500).json({
            success: false,
            status: 'failed',
            message: err.message || 'Unable to check 3D generation status.'
        })
    }
}

module.exports = {
    testAuth,
    generate3D,
    get3DStatus
}
