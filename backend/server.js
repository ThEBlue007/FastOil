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

app.set('trust proxy', 1)

// 🔍 Log ทุก request ที่เข้ามา (เพื่อดูว่า Render ส่งหน่วยตรวจมาจริงไหม)
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.url} - UserAgent: ${req.get('user-agent')}`)
  next()
})

// ⚡ Health Check (Top level - ตอบกลับเร็วที่สุดและเรียบง่ายที่สุด)
app.get('/', (req, res) => res.send('ok'))
app.get('/health', (req, res) => res.send('ok'))
app.get('/healthz', (req, res) => res.send('ok'))

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
function start() {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 FastOil API is online & listening on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`)
    
    try {
      console.log('⏳ Initializing database...')
      await initDb()
      console.log('✅ Database connected & ready!')
    } catch (err) {
      console.error('❌ Failed to initialize database:', err)
      // Keep server running so we can see the logs, but API will fail
    }
  })
}

start()
