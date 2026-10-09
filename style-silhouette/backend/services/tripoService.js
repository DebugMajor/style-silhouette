const fs = require('fs')
const path = require('path')

const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi'

function getApiKey() {
    let apiKey = process.env.TRIPO_API_KEY ? process.env.TRIPO_API_KEY.trim() : ''
    if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
        apiKey = apiKey.slice(1, -1).trim()
    }
    if (apiKey.toLowerCase().startsWith('bearer ')) {
        apiKey = apiKey.slice(7).trim()
    }
    if (!apiKey) {
        throw new Error('TRIPO_API_KEY is not configured in backend environment (.env)')
    }
    return apiKey
}

/**
 * Diagnostic endpoint calling GET /user/balance to verify Tripo API key
 */
async function testAuthentication() {
    const apiKey = getApiKey()
    const response = await fetch(`${TRIPO_BASE_URL}/user/balance`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })

    const json = await response.json().catch(() => ({}))

    if (!response.ok || (json.code !== undefined && json.code !== 0)) {
        console.error('[TRIPO AUTH TEST FAILED] HTTP Status:', response.status, 'Tripo Code:', json.code, 'Message:', json.message || json.msg)
        return {
            success: false,
            authenticated: false,
            status: response.status,
            message: json.message || json.msg || 'Tripo authentication failed'
        }
    }

    return {
        success: true,
        authenticated: true,
        balance: json.data || json
    }
}

/**
 * Upload image to Tripo API (POST /upload/sts)
 */
async function uploadImageToTripo(filePath, originalName, mimeType) {
    const apiKey = getApiKey()
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer], { type: mimeType || 'image/jpeg' })
    
    const formData = new FormData()
    formData.append('file', blob, originalName || 'upload.jpg')

    const response = await fetch(`${TRIPO_BASE_URL}/upload/sts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        body: formData
    })

    const json = await response.json().catch(() => ({}))

    if (!response.ok || (json.code !== undefined && json.code !== 0)) {
        console.error('[TRIPO UPLOAD ERROR] HTTP Status:', response.status, 'Code:', json.code, 'Message:', json.message || json.msg)
        throw new Error(json.message || json.msg || `Tripo image upload failed with status ${response.status}`)
    }

    const data = json.data || json
    const fileToken = data.image_token || data.file_token || data.token
    if (!fileToken) {
        throw new Error('Image token not returned from Tripo upload API')
    }

    return fileToken
}

/**
 * Create image-to-model task (POST /task)
 */
async function createImageToModelTask(fileToken, fileType) {
    const apiKey = getApiKey()
    
    let cleanType = (fileType || 'jpg').toLowerCase().replace('.', '')
    if (cleanType === 'jpeg') cleanType = 'jpg'

    const payload = {
        type: 'image_to_model',
        model_version: 'P1-20260311',
        file: {
            type: cleanType,
            file_token: fileToken
        },
        texture: true,
        pbr: true
    }

    const response = await fetch(`${TRIPO_BASE_URL}/task`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    const json = await response.json().catch(() => ({}))

    if (!response.ok || (json.code !== undefined && json.code !== 0)) {
        console.error('[TRIPO TASK CREATION ERROR] HTTP Status:', response.status, 'Code:', json.code, 'Message:', json.message || json.msg)
        throw new Error(json.message || json.msg || `Tripo task creation failed with status ${response.status}`)
    }

    const data = json.data || json
    const taskId = data.task_id || data.id

    if (!taskId) {
        throw new Error('Task ID not returned from Tripo task API')
    }

    return taskId
}

/**
 * Get task status (GET /task/:taskId)
 */
async function getTaskStatus(taskId) {
    const apiKey = getApiKey()

    const response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })

    const json = await response.json().catch(() => ({}))

    if (!response.ok) {
        console.error('[TRIPO STATUS CHECK ERROR] HTTP Status:', response.status, 'Message:', json.message || json.msg)
        throw new Error(json.message || `Tripo status check failed with HTTP ${response.status}`)
    }

    return json.data || json
}

/**
 * Download GLB model from Tripo temporary URL and store locally on backend server
 */
async function downloadAndSaveModel(modelUrl, taskId) {
    if (!modelUrl) return null

    const modelsDir = path.join(__dirname, '../uploads/models')
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true })
    }

    const targetPath = path.join(modelsDir, `${taskId}.glb`)
    
    if (fs.existsSync(targetPath)) {
        return `/uploads/models/${taskId}.glb`
    }

    const response = await fetch(modelUrl)
    if (!response.ok) {
        throw new Error(`Failed to download GLB model from Tripo URL: HTTP ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(targetPath, buffer)

    return `/uploads/models/${taskId}.glb`
}

module.exports = {
    testAuthentication,
    uploadImageToTripo,
    createImageToModelTask,
    getTaskStatus,
    downloadAndSaveModel
}
