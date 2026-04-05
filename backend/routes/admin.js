const express = require('express')
const { getDb, logActivity } = require('../db')
const { authenticate } = require('../middleware/auth')
const { adminOnly } = require('../middleware/adminOnly')
const { sendOrderStatusUpdateEmail } = require('../services/notifications')


const router = express.Router()

// Apply auth + admin check to all routes
router.use(authenticate, adminOnly)

// ─── Stats Overview ───────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  const db = getDb()
  try {
    const [
      usersResult,
      ordersResult,
      revenueResult,
      activeResult,
      recentOrdersCountResult,
      fuelStatsResult,
      dailyStatsResult,
      latestOrdersResult
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM users'),
      db.execute('SELECT COUNT(*) as count FROM orders'),
      db.execute(`SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status != 'cancelled'`),
      db.execute(`SELECT COUNT(*) as count FROM users WHERE last_login > datetime('now', '-7 days')`),
      db.execute(`SELECT COUNT(*) as count FROM orders WHERE created_at > datetime('now', '-7 days')`),
      db.execute(`SELECT fuel_type, SUM(total_price) as revenue, SUM(liters) as liters FROM orders WHERE status != 'cancelled' GROUP BY fuel_type`),
      db.execute(`
        SELECT SUBSTR(created_at, 1, 10) as date, SUM(total_price) as revenue, COUNT(*) as orders
        FROM orders 
        WHERE created_at > datetime('now', '-14 days') AND status != 'cancelled'
        GROUP BY date ORDER BY date ASC
      `),
      db.execute(`
        SELECT o.*, u.name as user_name 
        FROM orders o JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC LIMIT 5
      `)
    ])

    res.json({
      stats: {
        totalUsers: usersResult.rows[0].count,
        totalOrders: ordersResult.rows[0].count,
        totalRevenue: revenueResult.rows[0].total,
        activeUsers: activeResult.rows[0].count,
        recentOrdersCount: recentOrdersCountResult.rows[0].count,
        fuelStats: fuelStatsResult.rows,
        dailyStats: dailyStatsResult.rows,
        latestOrders: latestOrdersResult.rows
      }
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── List All Users ───────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  const db = getDb()
  const { search = '', page = 1, limit = 20 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  try {
    const searchPattern = `%${search}%`
    const result = await db.execute({
      sql: `SELECT id, name, email, phone, role, email_verified, phone_verified, is_banned, created_at, last_login
            FROM users WHERE (name LIKE ? OR email LIKE ?)
            ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [searchPattern, searchPattern, parseInt(limit), offset]
    })
    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM users WHERE name LIKE ? OR email LIKE ?',
      args: [searchPattern, searchPattern]
    })

    res.json({ users: result.rows, total: countResult.rows[0].count })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Delete Single User [NEW] ─────────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  const targetId = req.params.id
  if (targetId === req.user.id) return res.status(400).json({ error: 'ไม่สามารถลบบัญชีตัวเองได้' })

  const db = getDb()
  try {
    // ⚔️ ปลดล็อค Cascade Delete ด้วยตนเอง
    // 1. ลบออเดอร์ของสมาชิกคนนี้
    await db.execute({ sql: 'DELETE FROM orders WHERE user_id = ?', args: [targetId] })
    // 2. ลบประวัติกิจกรรมที่สร้างโดยสมาชิกคนนี้
    await db.execute({ sql: 'DELETE FROM activity_logs WHERE user_id = ?', args: [targetId] })
    // 3. ลบตัวบัญชีสมาชิกจริง
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [targetId] })

    await logActivity(req.user.id, 'DELETE_USER', `ลบบัญชีผู้ใช้ ${targetId} และข้อมูลที่เกี่ยวข้องสำเร็จ`, req.ip)
    res.json({ message: 'ลบบัญชีผู้ใช้และข้อมูลที่เกี่ยวข้องสำเสร็จ' })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' })
  }
})

// ─── Bulk Delete Users [NEW] ──────────────────────────────────────────────────
router.post('/users/bulk-delete', async (req, res) => {
  const { userIds } = req.body
  if (!Array.isArray(userIds) || userIds.length === 0) return res.status(400).json({ error: 'ไม่พบผู้ใช้ที่ต้องการลบ' })
  if (userIds.includes(req.user.id)) return res.status(400).json({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' })

  const db = getDb()
  try {
    const placeholders = userIds.map(() => '?').join(',')
    
    // ⚔️ กวาดล้างแบบกลุ่ม (Bulk Cascade)
    await db.execute({ sql: `DELETE FROM orders WHERE user_id IN (${placeholders})`, args: userIds })
    await db.execute({ sql: `DELETE FROM activity_logs WHERE user_id IN (${placeholders})`, args: userIds })
    await db.execute({ sql: `DELETE FROM users WHERE id IN (${placeholders})`, args: userIds })

    await logActivity(req.user.id, 'BULK_DELETE_USERS', `ลบบัญชีผู้ใช้จำนวน ${userIds.length} รายการ และข้อมูลที่เกี่ยวข้องสำเร็จ`, req.ip)
    res.json({ message: `ลบบัญชีผู้ใช้ ${userIds.length} รายการและข้อมูลที่เกี่ยวข้องสำเร็จ` })
  } catch (err) {
    console.error('Bulk delete error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้แบบกลุ่ม' })
  }
})

// ─── Change User Role ──────────────────────────────────────────────────────────
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Role ไม่ถูกต้อง' })
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'ไม่สามารถเปลี่ยน role ของตัวเองได้' })

  const db = getDb()
  try {
    await db.execute({ sql: 'UPDATE users SET role = ? WHERE id = ?', args: [role, req.params.id] })
    await logActivity(req.user.id, 'CHANGE_ROLE', `เปลี่ยน role ของ user ${req.params.id} เป็น ${role}`, req.ip)
    res.json({ message: `เปลี่ยน role เป็น ${role} สำเร็จ` })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Ban / Unban User ─────────────────────────────────────────────────────────
router.put('/users/:id/ban', async (req, res) => {
  const { banned } = req.body
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'ไม่สามารถ ban ตัวเองได้' })

  const db = getDb()
  try {
    await db.execute({ sql: 'UPDATE users SET is_banned = ? WHERE id = ?', args: [banned ? 1 : 0, req.params.id] })
    await logActivity(req.user.id, banned ? 'BAN_USER' : 'UNBAN_USER',
      `${banned ? 'Ban' : 'Unban'} user ${req.params.id}`, req.ip)
    res.json({ message: banned ? 'ระงับบัญชีสำเร็จ' : 'ปลดระงับบัญชีสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── All Orders ───────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  const db = getDb()
  const { page = 1, limit = 20, status } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  try {
    const whereClause = status ? 'WHERE o.status = ?' : ''
    const args = status
      ? [status, parseInt(limit), offset]
      : [parseInt(limit), offset]

    const result = await db.execute({
      sql: `SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o JOIN users u ON o.user_id = u.id
            ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      args
    })
    res.json({ orders: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Update Order Status (With Cancel Reason) [MODIFIED] ─────────────────────
router.put('/orders/:id/status', async (req, res) => {
  const { status, cancel_reason } = req.body
  const validStatuses = ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' })

  const db = getDb()
  try {
    // 🔍 ดึงข้อมูลผู้ใช้ก่อนอัปเดตเพื่อส่งอีเมล
    const orderInfoResult = await db.execute({
      sql: `SELECT o.id, u.name as user_name, u.email as user_email 
            FROM orders o JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?`,
      args: [req.params.id]
    })
    const orderInfo = orderInfoResult.rows[0]

    // อัปเดตทั้งสถานะ และหมายเหตุการยกเลิก (ถ้าไม่มีให้ใส่ค่า null)
    await db.execute({
      sql: `UPDATE orders SET status = ?, cancel_reason = ?, updated_at = datetime('now') WHERE id = ?`,
      args: [status, cancel_reason || null, req.params.id]
    })

    // 📧 ส่งอีเมลแจ้งเตือนสถานะใหม่
    if (orderInfo) {
      sendOrderStatusUpdateEmail(orderInfo.user_email, orderInfo.user_name, orderInfo.id, status)
        .catch(err => console.error('Delayed Status Email Error:', err))
    }

    let logMsg = `อัปเดตสถานะ order ${req.params.id} เป็น ${status}`
    if (status === 'cancelled' && cancel_reason) logMsg += ` (เหตุผล: ${cancel_reason})`

    await logActivity(req.user.id, 'UPDATE_ORDER_STATUS', logMsg, req.ip)
    res.json({ message: 'อัปเดตสถานะสำเร็จ' })
  } catch (err) {
    console.error('Update status error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }

})

// ─── Delete Order [NEW] ───────────────────────────────────────────────────────
router.delete('/orders/:id', async (req, res) => {
  const db = getDb()
  try {
    await db.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [req.params.id] })
    await logActivity(req.user.id, 'DELETE_ORDER', `ลบออเดอร์ ${req.params.id}`, req.ip)
    res.json({ message: 'ลบออเดอร์สำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบออเดอร์' })
  }
})

// ─── Activity Logs ────────────────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
  const db = getDb()
  const { page = 1, limit = 50 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  try {
    const result = await db.execute({
      // [แก้ตรงนี้] เพิ่ม u.role as user_role เข้ามาเพื่อส่งไปให้ Frontend กรอง
      sql: `SELECT l.*, u.name as user_name, u.email as user_email, u.role as user_role
            FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
      args: [parseInt(limit), offset]
    })
    res.json({ logs: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router