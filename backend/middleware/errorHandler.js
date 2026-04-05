/**
 * Global Error Handler Middleware
 * 
 * This middleware catches all errors thrown in the express application
 * and returns a standard JSON response to the client.
 */

const errorHandler = (err, req, res, next) => {
  // Log the detailed error to the console for developers
  console.error(`❌ [ERROR] ${new Date().toISOString()}`)
  console.error(`Path: ${req.method} ${req.url}`)
  console.error(`Message: ${err.message}`)
  
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }

  // Handle specific error types
  
  // 1. JWT Authentication Errors
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'เซสชันหมดอายุหรือรหัสอ้างอิงไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่'
    })
  }

  // 2. Validation Errors (e.g. from express-validator)
  if (err.isValidationError) {
    return res.status(400).json({
      error: 'validation_error',
      message: err.message,
      details: err.details
    })
  }

  // 3. Rate Limit Errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'rate_limit',
      message: 'คุณส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่'
    })
  }

  // 4. Turso / Database Errors
  if (err.code && err.code.startsWith('libsql_')) {
    return res.status(500).json({
      error: 'database_error',
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่อีกครั้ง'
    })
  }

  // Default: Generic Internal Server Error
  const statusCode = err.status || 500
  const message = err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'

  res.status(statusCode).json({
    error: 'server_error',
    message: process.env.NODE_ENV === 'production' 
      ? 'ขออภัย ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
      : message
  })
}

module.exports = errorHandler
