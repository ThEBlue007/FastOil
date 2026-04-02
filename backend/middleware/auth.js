const jwt = require('jsonwebtoken')
const { getDb } = require('../db')

/**
 * Middleware: ตรวจสอบ JWT token
 * ใส่ req.user = { id, email, role } ถ้า valid
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' })
    }

    const token = authHeader.slice(7)
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' })
    }

    // ตรวจสอบ user ยังอยู่ใน DB + ไม่ถูก ban
    const db = getDb()
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, is_banned, email_verified FROM users WHERE id = ?',
      args: [decoded.userId]
    })

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'ไม่พบผู้ใช้งาน' })
    }

    const user = result.rows[0]
    if (user.is_banned) {
      return res.status(403).json({ error: 'บัญชีของคุณถูกระงับการใช้งาน' })
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: !!user.email_verified
    }
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
}

module.exports = { authenticate }
