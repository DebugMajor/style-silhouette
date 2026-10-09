const fs = require('fs')
const path = require('path')

// Tripo V3 API base URL. V2 endpoints can reject a valid V3-capable key.
const TRIPO_BASE_URL = 'https://openapi.tripo3d.ai/v3'
const DEFAULT_MODEL = 'v3.1-20260211'

function getApiKey() {
    let apiKey = process.env.TRIPO_API_KEY ? process.env.TRIPO_API_KEY.trim() : ''

    // Tolerate a key accidentally wrapped in quotes or pasted with a Bearer prefix.
    if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
        apiKey = apiKey.slice(1, -1).trim()
    }
    if (apiKey.toLowerCase().startsWith('bearer ')) {
        apiKey = apiKey.slice(7).trim()
    }
    if (!apiKey) {
        throw new Error('TRIPO_API_KEY is missing from backend/.env')
    }
    return apiKey
}

function getErrorMessage(json, status) {
    const code = json?.code
    const message = json?.message || json?.msg || `HTTP ${status}`
    const suggestion = json?.suggestion ? ` ${json.suggestion}` : ''

    if (Number(code) === 2010 || /insufficient credits/i.test(message)) {
        return `Tripo account has insufficient credits. Add credits in the Tripo Console before generating a 3D model.${suggestion}`
    }
    if (status === 401 || Number(code) === 1000 || Number(code) === 1001) {
        return `Tripo rejected TRIPO_API_KEY (HTTP ${status}, code ${code ?? 'unknown'}). The V3 balance check worked previously; verify this process is loading the same backend/.env key.${suggestion}`
    }
    return `Tripo API error (HTTP ${status}${code !== undefined ? `, code ${code}` : ''}): ${message}.${suggestion}`.trim()
}

async function tripoRequest(endpoint, options = {}) {
    const apiKey = getApiKey()
    const response = await fetch(`${TRIPO_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            ...(options.headers || {}),
        },
    })

    const json = await response.json().catch(() => ({}))
    if (!response.ok || (json.code !== undefined && Number(json.code) !== 0)) {
        const error = new Error(getErrorMessage(json, response.status))
        error.status = response.status
        error.tripoCode = json.code
        error.suggestion = json.suggestion
        throw error
    }
    return json.data ?? json
}

/** Test the key against the V3 balance endpoint. A zero balance still means auth worked. */
async function testAuthentication() {
    try {
        const data = await tripoRequest('/account/balance', { method: 'GET' })
        return {
            success: true,
            authenticated: true,
            balance: {
                balance: Number(data.balance ?? 0),
                frozen: Number(data.frozen ?? 0),
            },
            message: Number(data.balance ?? 0) <= 0
                ? 'Tripo authentication succeeded, but the account has zero available credits.'
                : 'Tripo authentication succeeded.',
        }
    } catch (err) {
        return {
            success: false,
            authenticated: false,
            status: err.status || 500,
            message: err.message || 'Tripo authentication check failed.',
        }
    }
}

/** Upload a local image using V3 POST /files and return its file_token. */
async function uploadImageToTripo(filePath, originalName, mimeType) {
    if (!fs.existsSync(filePath)) {
        throw new Error('The uploaded image could not be found on the server.')
    }

    const fileBuffer = fs.readFileSync(filePath)
    if (!fileBuffer.length) {
        throw new Error('The uploaded image is empty.')
    }

    const blob = new Blob([fileBuffer], { type: mimeType || 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', blob, originalName || path.basename(filePath) || 'upload.jpg')

    const data = await tripoRequest('/files', {
        method: 'POST',
        body: formData,
    })

    const fileToken = data.file_token || data.token
    if (!fileToken) {
        throw new Error('Tripo V3 file upload did not return a file_token.')
    }
    return fileToken
}

/** Create a V3 image-to-model task from the uploaded file token. */
async function createImageToModelTask(fileToken, fileType) {
    if (!fileToken) throw new Error('A Tripo file token is required to generate a model.')

    const model = (process.env.TRIPO_MODEL || DEFAULT_MODEL).trim()
    const payload = {
        input: fileToken,
        model,
        texture: true,
        pbr: true,
        texture_quality: 'detailed',
    }

    const data = await tripoRequest('/generation/image-to-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    const taskId = data.task_id || data.id
    if (!taskId) {
        throw new Error('Tripo V3 did not return a task_id.')
    }
    return taskId
}

/** Query an asynchronous V3 task. */
async function getTaskStatus(taskId) {
    if (!taskId) throw new Error('A Tripo task ID is required.')
    return tripoRequest(`/tasks/${encodeURIComponent(taskId)}`, { method: 'GET' })
}

/** Download a completed GLB model to backend/uploads/models. */
async function downloadAndSaveModel(modelUrl, taskId) {
    if (!modelUrl) return null

    const modelsDir = path.join(__dirname, '../uploads/models')
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true })
    }

    const safeTaskId = String(taskId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_')
    const targetPath = path.join(modelsDir, `${safeTaskId}.glb`)

    if (fs.existsSync(targetPath)) {
        return `/uploads/models/${safeTaskId}.glb`
    }

    const response = await fetch(modelUrl)
    if (!response.ok) {
        throw new Error(`Failed to download GLB model from Tripo: HTTP ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(targetPath, buffer)
    return `/uploads/models/${safeTaskId}.glb`
}

module.exports = {
    testAuthentication,
    uploadImageToTripo,
    createImageToModelTask,
    getTaskStatus,
    downloadAndSaveModel,
}
