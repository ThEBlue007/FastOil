const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb, logActivity } = require('../db')
const { generateOTP, sendEmailOTP, sendPasswordResetEmail, sendSmsOTP } = require('../services/notifications')
const { loginLimiter, registerLimiter, otpLimiter } = require('../middleware/rateLimiter')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

function generateTokens(userId) {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_emergency'
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL ERROR: JWT_SECRET is missing! Logging in might fail.')
  }

  const accessToken = jwt.sign({ userId }, secret, { expiresIn: '1h' })
  const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

// ─── Register ─────────────────────────────────────────────────────────────────
router.post('/register', registerLimiter, [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('ชื่อต้องมี 2-50 ตัวอักษร'),
  body('email').isEmail().normalizeEmail().withMessage('อีเมลไม่ถูกต้อง'),
  body('password').isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  body('phone').optional().matches(/^\+?[0-9]{9,15}$/).withMessage('เบอร์โทรไม่ถูกต้อง'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  const { name, email, password, phone } = req.body
  const db = getDb()

  try {
    // ตรวจสอบ email ซ้ำ
    const existingEmail = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    })
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }

    // ตรวจสอบ phone ซ้ำ (ถ้ามีการระบุเบอร์)
    if (phone) {
      const existingPhone = await db.execute({
        sql: 'SELECT id FROM users WHERE phone = ?',
        args: [phone]
      })
      if (existingPhone.rows.length > 0) {
        return res.status(409).json({ error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' })
      }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userId = require('crypto').randomUUID().replace(/-/g, '')

    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`,
      args: [userId, name, email, phone || null, passwordHash]
    })

    // ส่ง OTP email verify
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await db.execute({
      sql: `INSERT INTO otp_codes (user_id, type, code, expires_at) VALUES (?, 'email', ?, ?)`,
      args: [userId, otp, expiresAt]
    })

    // Mock Email OTP Log
    // await sendEmailOTP(email, name, otp, 'verify')
    
    await logActivity(userId, 'REGISTER', `สมัครสมาชิกด้วย email: ${email}`, req.ip)

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลของคุณ',
      userId,
      email,
      otp // ส่ง OTP กลับไปให้ Frontend แสดงผล Mock Alert
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
  }
})

// ─── Verify Email OTP ─────────────────────────────────────────────────────────
router.post('/verify-email', [
  body('userId').notEmpty(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('OTP ต้องเป็น 6 หลัก'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  const { userId, code } = req.body
  const db = getDb()

  try {
    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `SELECT * FROM otp_codes WHERE user_id = ? AND type = 'email' AND used = 0
            AND expires_at > ? ORDER BY expires_at DESC LIMIT 1`,
      args: [userId, now]
    })

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'OTP ไม่ถูกต้องหรือหมดอายุแล้ว' })
    }

    const otpRecord = result.rows[0]
    if (otpRecord.code !== code) {
      return res.status(400).json({ error: 'รหัส OTP ไม่ถูกต้อง' })
    }

    // mark OTP used + verify email
    await db.execute({ sql: 'UPDATE otp_codes SET used = 1 WHERE id = ?', args: [otpRecord.id] })
    await db.execute({ sql: 'UPDATE users SET email_verified = 1 WHERE id = ?', args: [userId] })

    // Get user info
    const userResult = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] })
    const user = userResult.rows[0]
    const tokens = generateTokens(userId)

    await logActivity(userId, 'EMAIL_VERIFIED', 'ยืนยันอีเมลสำเร็จ', req.ip)

    res.json({
      message: 'ยืนยันอีเมลสำเร็จ!',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: true }
    })
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Resend Email OTP ─────────────────────────────────────────────────────────
router.post('/resend-email-otp', otpLimiter, [
  body('userId').notEmpty(),
], async (req, res) => {
  const { userId } = req.body
  const db = getDb()

  try {
    const userResult = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] })
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'ไม่พบผู้ใช้' })

    const user = userResult.rows[0]
    if (user.email_verified) return res.status(400).json({ error: 'อีเมลยืนยันแล้ว' })

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await db.execute({
      sql: `INSERT INTO otp_codes (user_id, type, code, expires_at) VALUES (?, 'email', ?, ?)`,
      args: [userId, otp, expiresAt]
    })
    
    // await sendEmailOTP(user.email, user.name, otp, 'verify')

    res.json({ message: 'ส่ง OTP ใหม่แล้ว กรุณาตรวจสอบอีเมล', otp })
  } catch (err) {
    console.error('Resend OTP error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })

  const { email, password } = req.body
  const db = getDb()

  try {
    const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] })
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    const user = result.rows[0]
    if (user.is_banned) return res.status(403).json({ error: 'บัญชีของคุณถูกระงับการใช้งาน' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })

    const tokens = generateTokens(user.id)
    await db.execute({ sql: `UPDATE users SET last_login = datetime('now') WHERE id = ?`, args: [user.id] })
    await logActivity(user.id, 'LOGIN', 'เข้าสู่ระบบสำเร็จ', req.ip)

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, emailVerified: !!user.email_verified,
        phoneVerified: !!user.phone_verified, phone: user.phone
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Send Phone OTP ───────────────────────────────────────────────────────────
router.post('/send-phone-otp', authenticate, otpLimiter, [
  body('phone').matches(/^\+?[0-9]{9,15}$/).withMessage('เบอร์โทรไม่ถูกต้อง'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  const { phone } = req.body
  const db = getDb()

  try {
    // Check phone not used by another user
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE phone = ? AND id != ?',
      args: [phone, req.user.id]
    })
    if (existing.rows.length > 0) return res.status(409).json({ error: 'เบอร์โทรนี้ถูกใช้งานแล้ว' })

    await db.execute({ sql: 'UPDATE users SET phone = ? WHERE id = ?', args: [phone, req.user.id] })

    // สร้าง Mock OTP และตั้งเวลาหมดอายุ 5 นาที
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // ลบหรือยกเลิก OTP เก่าก่อน
    await db.execute({
      sql: `DELETE FROM otp_codes WHERE user_id = ? AND type = 'phone'`,
      args: [req.user.id]
    })

    await db.execute({
      sql: `INSERT INTO otp_codes (user_id, type, code, expires_at) VALUES (?, 'phone', ?, ?)`,
      args: [req.user.id, otp, expiresAt]
    })
    
    // await sendSmsOTP(phone, otp)

    res.json({ message: 'ส่ง OTP (จำลอง) สำเร็จ กรุณาตรวจสอบรหัสใน Terminal', otp })
  } catch (err) {
    console.error('Send phone OTP error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Verify Phone OTP ─────────────────────────────────────────────────────────
router.post('/verify-phone', authenticate, [
  body('code').isLength({ min: 6, max: 6 }),
], async (req, res) => {
  const { code } = req.body
  const db = getDb()

  try {
    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `SELECT * FROM otp_codes WHERE user_id = ? AND type = 'phone' AND used = 0
            AND expires_at > ? ORDER BY expires_at DESC LIMIT 1`,
      args: [req.user.id, now]
    })

    if (result.rows.length === 0) return res.status(400).json({ error: 'OTP ไม่ถูกต้องหรือหมดอายุ' })
    if (result.rows[0].code !== code) return res.status(400).json({ error: 'รหัส OTP ไม่ถูกต้อง' })

    // ลบข้อมูล OTP ของเบอร์นั้นออกจากตารางหลังจากใช้งานเสร็จ
    await db.execute({ sql: 'DELETE FROM otp_codes WHERE id = ?', args: [result.rows[0].id] })
    // อัปเดตตาราง users ให้ phone_verified = 1
    await db.execute({ sql: 'UPDATE users SET phone_verified = 1 WHERE id = ?', args: [req.user.id] })
    
    await logActivity(req.user.id, 'PHONE_VERIFIED', 'ยืนยันเบอร์โทรสำเร็จ', req.ip)

    res.json({ message: 'ยืนยันเบอร์โทรสำเร็จ!' })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Forgot Password ──────────────────────────────────────────────────────────
router.post('/forgot-password', otpLimiter, [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const { email } = req.body
  const db = getDb()

  try {
    const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] })
    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      return res.json({ message: 'หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้' })
    }

    const user = result.rows[0]
    const resetToken = require('crypto').randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await db.execute({
      sql: `INSERT INTO otp_codes (user_id, type, code, expires_at) VALUES (?, 'reset_password', ?, ?)`,
      args: [user.id, resetToken, expiresAt]
    })

    const resetLink = `http://localhost:5173/FastOil/reset-password?token=${resetToken}`
    await sendPasswordResetEmail(email, user.name, resetLink)
    await logActivity(user.id, 'FORGOT_PASSWORD', 'ขอรีเซ็ตรหัสผ่าน', req.ip)

    res.json({ message: 'หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Reset Password ───────────────────────────────────────────────────────────
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  const { token, password } = req.body
  const db = getDb()

  try {
    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `SELECT * FROM otp_codes WHERE type = 'reset_password' AND code = ? AND used = 0
            AND expires_at > ?`,
      args: [token, now]
    })

    if (result.rows.length === 0) return res.status(400).json({ error: 'ลิงก์รีเซ็ตไม่ถูกต้องหรือหมดอายุแล้ว' })

    const record = result.rows[0]
    const passwordHash = await bcrypt.hash(password, 12)

    await db.execute({ sql: 'UPDATE otp_codes SET used = 1 WHERE id = ?', args: [record.id] })
    await db.execute({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [passwordHash, record.user_id] })
    await logActivity(record.user_id, 'PASSWORD_RESET', 'รีเซ็ตรหัสผ่านสำเร็จ', req.ip)

    res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Get Me ───────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  const db = getDb()
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, email, phone, role, email_verified, phone_verified, avatar_url, created_at, last_login FROM users WHERE id = ?',
      args: [req.user.id]
    })
    const user = result.rows[0]
    res.json({ 
      user: {
        ...user,
        emailVerified: !!user.email_verified,
        phoneVerified: !!user.phone_verified
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Update Profile ───────────────────────────────────────────────────────────
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
], async (req, res) => {
  const { name } = req.body
  const db = getDb()
  try {
    if (name) {
      await db.execute({ sql: 'UPDATE users SET name = ? WHERE id = ?', args: [name, req.user.id] })
    }
    res.json({ message: 'อัปเดตโปรไฟล์สำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Change Password ──────────────────────────────────────────────────────────
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const db = getDb()
  try {
    const result = await db.execute({ sql: 'SELECT password_hash FROM users WHERE id = ?', args: [req.user.id] })
    const user = result.rows[0]
    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })

    const newHash = await bcrypt.hash(newPassword, 12)
    await db.execute({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [newHash, req.user.id] })
    await logActivity(req.user.id, 'CHANGE_PASSWORD', 'เปลี่ยนรหัสผ่านสำเร็จ', req.ip)

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Refresh Token ────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ error: 'ไม่พบ Refresh Token' })
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const tokens = generateTokens(decoded.userId)
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
  } catch {
    res.status(401).json({ error: 'Refresh Token ไม่ถูกต้องหรือหมดอายุ' })
  }
})

module.exports = router
