require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { initDb } = require('./db')
const { generalLimiter } = require('./middleware/rateLimiter')

const authRoutes = require('./routes/auth')
const ordersRoutes = require('./routes/orders')
const adminRoutes = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 3001

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:4173',
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json({ limit: '10kb' }))
app.use(generalLimiter)

// Trust proxy for rate limiting behind Render/Heroku
app.set('trust proxy', 1)

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/admin', adminRoutes)

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'ไม่พบ endpoint นี้' })
})

// ── Error Handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' })
})

// ── Start Server ───────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDb()
    app.listen(PORT, () => {
      console.log(`🚀 FastOil API running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
