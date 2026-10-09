const express = require('express')
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8000'

// Proxy all /api/agent/* requests to the Python FastAPI agent
const agentProxy = createProxyMiddleware({
    target: AGENT_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/agent': '',   // strip /api/agent prefix before forwarding
    },
    on: {
        proxyReq: fixRequestBody,
        error: (err, req, res) => {
            console.error('[Agent Proxy Error]', err.message)
            res.status(503).json({
                success: false,
                message: 'AI Agent service is unavailable. Make sure the Python agent is running on port 8000.',
            })
        },
    },
})

// Protect all agent endpoints with JWT auth
router.use(authMiddleware, agentProxy)

module.exports = router
