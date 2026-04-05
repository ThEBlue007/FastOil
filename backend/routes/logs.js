const express = require('express')
const router = express.Router()
const { logError } = require('../utils/logger')

// POST /api/logs/report
// Receive an error report from the frontend
router.post('/report', (req, res) => {
  const { type, message, stack, source, path, user } = req.body
  
  // Log it to the file
  logError({
    type: type || 'FRONTEND',
    message,
    stack,
    source: source || 'Browser',
    path: path || 'Unknown',
    user: user || null
  })

  // Log it to the server console as well
  console.error(`🚨 [FRONTEND ERROR] ${message} at ${path}`)

  res.status(200).json({ success: true, message: 'บันทึกรายงานข้อผิดพลาดแล้ว' })
})

module.exports = router
