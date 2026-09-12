const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/db')

// ── Route imports ─────────────────────────────────────────
const authRoutes = require('./routes/authRoutes')
const analyzeRoutes = require('./routes/analyzeRoutes')
const aiRoutes = require('./routes/aiRoutes')
const cameraRoutes = require('./routes/cameraRoutes')
const virtualTryOnRoutes = require('./routes/virtualTryOnRoutes')

// ── Connect to MongoDB ────────────────────────────────────
connectDB()

const app = express()

// ── Global Middleware ─────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// ── Static uploads ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/analyze', analyzeRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/camera', cameraRoutes)
app.use('/api/virtual-tryon', virtualTryOnRoutes)

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 handler ───────────────────────────────────────────
app.use((req, res, next) => {
    const err = new Error(`Not Found — ${req.originalUrl}`)
    err.status = 404
    next(err)
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500
    console.error(`[ERROR] ${statusCode} — ${err.message}`)
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
})

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`\n🚀  Server running on http://localhost:${PORT}`)
    console.log(`📦  ENV: ${process.env.NODE_ENV}`)
    console.log(`🗄️   DB:  ${process.env.MONGO_URI ? 'Connected (Atlas)' : '⚠️  MONGO_URI not set'}\n`)
})
