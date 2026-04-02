const express = require('express')
const { body, validationResult } = require('express-validator')
const { getDb, logActivity } = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// ─── Get My Orders ────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  const db = getDb()
  try {
    const result = await db.execute({
      sql: `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      args: [req.user.id]
    })
    res.json({ orders: result.rows })
  } catch (err) {
    console.error('Get orders error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ─── Create Order ─────────────────────────────────────────────────────────────
router.post('/', authenticate, [
  body('fuelType').notEmpty().withMessage('กรุณาระบุประเภทน้ำมัน'),
  body('liters').isFloat({ min: 1 }).withMessage('จำนวนลิตรต้องมากกว่า 0'),
  body('pricePerLiter').isFloat({ min: 0 }).withMessage('ราคาต่อลิตรไม่ถูกต้อง'),
  body('deliveryAddress').notEmpty().withMessage('กรุณาระบุที่อยู่จัดส่ง'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  if (!req.user.emailVerified) {
    return res.status(403).json({ error: 'กรุณายืนยันอีเมลก่อนสั่งซื้อ' })
  }

  const { fuelType, liters, pricePerLiter, deliveryAddress, notes } = req.body
  const totalPrice = liters * pricePerLiter
  const db = getDb()

  try {
    const orderId = require('crypto').randomUUID().replace(/-/g, '')
    await db.execute({
      sql: `INSERT INTO orders (id, user_id, fuel_type, liters, price_per_liter, total_price, delivery_address, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [orderId, req.user.id, fuelType, liters, pricePerLiter, totalPrice, deliveryAddress, notes || null]
    })

    await logActivity(req.user.id, 'ORDER_CREATED',
      `สั่งซื้อ ${fuelType} ${liters}L ราคา ${totalPrice.toFixed(2)} บาท`, req.ip)

    res.status(201).json({ message: 'สั่งซื้อสำเร็จ!', orderId })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router
