/**
 * Middleware: ตรวจสอบว่าเป็น Admin เท่านั้น
 * ต้องใช้หลัง authenticate middleware
 */
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' })
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' })
  }
  next()
}

module.exports = { adminOnly }
