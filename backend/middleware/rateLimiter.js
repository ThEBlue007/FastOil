const rateLimit = require('express-rate-limit')

const isDev = process.env.NODE_ENV === 'development'

/** Rate limiter สำหรับ Login — 5 ครั้งต่อ 15 นาที (Dev: 1000) */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 5,
  message: { error: 'พยายาม Login มากเกินไป กรุณารอ 15 นาทีแล้วลองใหม่' },
  standardHeaders: true,
  legacyHeaders: false,
})

/** Rate limiter สำหรับ Register — 3 ครั้งต่อชั่วโมง (Dev: 1000) */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 1000 : 3,
  message: { error: 'สมัครสมาชิกมากเกินไป กรุณารอ 1 ชั่วโมง' },
  standardHeaders: true,
  legacyHeaders: false,
})

/** Rate limiter สำหรับ OTP — 3 ครั้งต่อ 10 นาที (Dev: 1000) */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 1000 : 3,
  message: { error: 'ขอ OTP มากเกินไป กรุณารอ 10 นาที' },
  standardHeaders: true,
  legacyHeaders: false,
})

/** Rate limiter ทั่วไป — 100 ครั้งต่อนาที (Dev: 5000) */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 5000 : 100,
  message: { error: 'Request มากเกินไป กรุณาลองใหม่ภายหลัง' },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { loginLimiter, registerLimiter, otpLimiter, generalLimiter }
