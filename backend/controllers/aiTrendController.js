const path = require('path')
const fs = require('fs')
const tripoService = require('../services/tripoService')

/** GET /api/ai-trend/test-auth — validates the key via Tripo V3. */
async function testAuth(req, res) {
    const result = await tripoService.testAuthentication()
    return res.status(result.success ? 200 : (result.status || 500)).json(result)
}

/** POST /api/ai-trend/generate-3d — upload an image and start a V3 task. */
async function generate3D(req, res) {
    const filePath = req.file?.path
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a full-body image.' })
        }

        const originalName = req.file.originalname
        const mimeType = req.file.mimetype || 'image/jpeg'
        const fileToken = await tripoService.uploadImageToTripo(filePath, originalName, mimeType)
        const taskId = await tripoService.createImageToModelTask(fileToken, path.extname(originalName || '').replace('.', '') || 'jpg')

        return res.status(200).json({ success: true, taskId })
    } catch (err) {
        console.error('[AiTrendController] generate3D failed:', err.message)
        const status = err.status === 401 ? 502 : (err.status === 403 ? 502 : 502)
        return res.status(status).json({ success: false, message: err.message || '3D generation request failed.' })
    } finally {
        if (filePath) fs.unlink(filePath, () => {})
    }
}

/** GET /api/ai-trend/status/:taskId — polls a Tripo V3 task. */
async function get3DStatus(req, res) {
    try {
        const { taskId } = req.params
        if (!taskId) {
            return res.status(400).json({ success: false, status: 'failed', message: 'Task ID is required.' })
        }

        const taskData = await tripoService.getTaskStatus(taskId)
        const rawStatus = String(taskData.status || '').toLowerCase()
        const progress = Number(taskData.progress || 0)

        if (rawStatus === 'queued' || rawStatus === 'running') {
            return res.json({ success: true, status: rawStatus, progress })
        }

        if (rawStatus === 'success') {
            const output = taskData.output || {}
            const remoteUrl = output.model_url || output.pbr_model || output.model || output.rendered_image_url || output.rendered_image || null
            let localModelUrl = null

            if (remoteUrl && /\.glb(?:[?#]|$)/i.test(remoteUrl)) {
                try {
                    localModelUrl = await tripoService.downloadAndSaveModel(remoteUrl, taskId)
                } catch (downloadError) {
                    console.warn('[AiTrendController] Could not cache model locally; returning Tripo URL:', downloadError.message)
                }
            }

            return res.json({
                success: Boolean(localModelUrl || remoteUrl),
                status: 'success',
                progress: 100,
                model: {
                    url: localModelUrl || remoteUrl,
                    originalUrl: remoteUrl,
                    taskId,
                },
            })
        }

        if (rawStatus === 'failed' || rawStatus === 'banned' || rawStatus === 'cancelled') {
            return res.json({
                success: false,
                status: rawStatus,
                message: taskData.error_message || taskData.message || 'Tripo could not generate the model. Check your account credits and try another image.',
            })
        }

        return res.json({ success: true, status: rawStatus || 'running', progress })
    } catch (err) {
        console.error('[AiTrendController] get3DStatus failed:', err.message)
        return res.status(502).json({ success: false, status: 'failed', message: err.message || 'Unable to check Tripo task status.' })
    }
}

module.exports = { testAuth, generate3D, get3DStatus }
