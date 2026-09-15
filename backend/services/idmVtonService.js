const path = require('path')
const fs = require('fs')

const DEFAULT_TIMEOUT_MS = 180000 // 3 minutes

function getWorkerUrl() {
    const url = (process.env.IDM_VTON_WORKER_URL || '').trim().replace(/\/+$/, '')
    if (!url) {
        throw new Error(
            'IDM_VTON_WORKER_URL is not configured. Run tools/IDM_VTON_Worker.ipynb in Colab and put its public Gradio URL in backend/.env.'
        )
    }
    return url
}

function dataUrlToBuffer(value) {
    if (typeof value !== 'string') {
        throw new Error('Image must be provided as a data URL.')
    }

    const match = value.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
        throw new Error('Virtual Try-On currently expects uploaded images as data URLs.')
    }

    return {
        mimeType: match[1],
        buffer: Buffer.from(match[2], 'base64')
    }
}

async function fileToDataUrl(file) {
    if (!file) {
        throw new Error('IDM-VTON did not return a result image.')
    }

    if (typeof file === 'string') {
        if (file.startsWith('data:image/')) return file

        if (/^https?:\/\//i.test(file)) {
            const response = await fetch(file)
            if (!response.ok) {
                throw new Error(`Unable to download IDM-VTON result (${response.status}).`)
            }
            const buffer = Buffer.from(await response.arrayBuffer())
            const contentType = response.headers.get('content-type') || 'image/png'
            return `data:${contentType};base64,${buffer.toString('base64')}`
        }

        const absolutePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file)
        if (fs.existsSync(absolutePath)) {
            const buffer = fs.readFileSync(absolutePath)
            return `data:image/png;base64,${buffer.toString('base64')}`
        }
    }

    if (typeof file === 'object') {
        if (file.url) return fileToDataUrl(file.url)
        if (file.path) return fileToDataUrl(file.path)
        if (file.name) return fileToDataUrl(file.name)
        if (typeof file.data === 'string') return fileToDataUrl(file.data)
    }

    throw new Error('IDM-VTON returned an unsupported result image format.')
}

async function processIdmVton({
    modelImage,
    clothingImage,
    category = 'upper_body',
    garmentDescription = 'fashion clothing'
}) {
    if (!modelImage || !clothingImage) {
        throw new Error('Both Model Photo and Clothing Photo are required for IDM-VTON try-on.')
    }

    const workerUrl = getWorkerUrl()

    // The worker is the patched official IDM-VTON Gradio demo from tools/IDM_VTON_Worker.ipynb.
    // Gradio Client handles image uploads and the queued /tryon prediction correctly.
    const { Client, handle_file } = await import('@gradio/client')

    const model = dataUrlToBuffer(modelImage)
    const garment = dataUrlToBuffer(clothingImage)

    const client = await Promise.race([
        Client.connect(workerUrl),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Unable to connect to the IDM-VTON worker.')), DEFAULT_TIMEOUT_MS)
        )
    ])

    const humanInput = {
        background: handle_file(model.buffer),
        layers: [],
        composite: null
    }

    const garmentInput = handle_file(garment.buffer)

    const result = await Promise.race([
        client.predict('/tryon', [
            humanInput,
            garmentInput,
            garmentDescription || category || 'fashion clothing',
            true,  // auto-generated mask
            false, // keep original framing by default
            30,    // denoising steps
            42     // deterministic seed for a stable demo
        ]),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('IDM-VTON generation timed out.')), DEFAULT_TIMEOUT_MS)
        )
    ])

    const resultImage = await fileToDataUrl(result?.data?.[0])

    return {
        success: true,
        resultImage,
        provider: 'IDM-VTON-Colab-Worker'
    }
}

module.exports = {
    processIdmVton
}
