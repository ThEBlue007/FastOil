const { Resend } = require('resend')
const twilio = require('twilio')

let resend = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
} else {
  console.warn('⚠️ Warning: RESEND_API_KEY is missing. Email notifications will not work.')
}

const COLORS = {
  primary: '#dc2626', // Red-600 (เว็บหลัก)
  accent: '#ffb703',  // Yellow-500 (ปุ่มสั่งเลย)
  dark: '#0f172a',    // Slate-900 (พื้นหลัง Header)
  info: '#3b82f6',
  success: '#16a34a',
  danger: '#dc2626',
  bg: '#f8fafc',
  text: '#475569',
  heading: '#1e293b'
}

// 🌐 URL สำหรับดึง Logo บน Production (Render)
const BASE_URL = process.env.BASE_URL || 'https://fastoil-backend.onrender.com'
const LOGO_URL = `${BASE_URL}/logo.png`

/**
 * Base Email Template (Global Wrapper)
 */
const getBaseTemplate = (title, content, footerText = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body { margin:0; padding:0; background-color:${COLORS.bg}; font-family: 'Sarabun', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 50px rgba(30, 41, 59, 0.1); border: 1px solid #f1f5f9; }
    .header { background: ${COLORS.dark}; padding: 60px 40px; text-align: center; border-bottom: 4px solid ${COLORS.accent}; }
    .header-logo { width: 180px; height: auto; max-width: 100%; }
    .content { padding: 60px 50px; }
    .footer { background-color: #f8fafc; padding: 30px 50px; border-top: 1px solid #f1f5f9; text-align: center; }
    .footer-text { color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0; }
    .button { display: inline-block; padding: 18px 45px; background: ${COLORS.primary}; color: #ffffff !important; font-weight: 800; text-decoration: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(220, 38, 38, 0.2); transition: all 0.3s ease; }
    .nitro-box { background: linear-gradient(135deg, ${COLORS.bg}, #f1f5f9); border: 2px solid #e2e8f0; border-radius: 30px; padding: 40px; text-align: center; margin: 30px 0; }
    .otp-code { font-size: 48px; font-weight: 800; color: ${COLORS.primary}; letter-spacing: 12px; margin: 0; }
    .label { color: #94a3b8; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="FastOil Logo" class="header-logo" onerror="this.src='https://fastoil-backend.onrender.com/logo.png'">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">${footerText || 'FastOil Service — พลังงานที่ส่งตรงถึงที่ ตลอด 24 ชม.'}</p>
      <p class="footer-text" style="margin-top: 8px;">&copy; 2026 FastOil Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * ⛽ ส่งอีเมลยืนยันตัวตน (OTP) — Nitro Elite Design
 */
async function sendEmailOTP(email, name, code, type = 'verify') {
  const titles = { verify: 'ยืนยันอีเมลของคุณ', reset: 'รีเซ็ตรหัสผ่าน' }
  const descriptions = {
    verify: 'กรุณาใช้รหัสด้านล่างเพื่อยืนยันอีเมลและเริ่มสั่งซื้อน้ำมันครับ รหัสนี้จะหมดอายุใน 10 นาที',
    reset: 'เราได้รับคำขอยืนยันเพื่อรีเซ็ตรหัสผ่านของคุณ กรุณาใช้รหัสด้านล่างนี้เพื่อดำเนินการต่อครับ'
  }

  const content = `
    <h2 style="color:${COLORS.heading}; font-size:26px; font-weight:800; margin-bottom:15px; letter-spacing:-0.5px;">${titles[type]}</h2>
    <p style="color:${COLORS.text}; font-size:16px; line-height:1.7; margin-bottom:30px;">
      สวัสดีคุณ <strong style="color:${COLORS.heading}">${name}</strong>,<br>
      ${descriptions[type]}
    </p>
    <div class="nitro-box">
      <div class="label">รหัสอ้างอิงความปลอดภัย</div>
      <div class="otp-code">${code}</div>
    </div>
    <p style="color:#94a3b8; font-size:13px; text-align:center; margin:0;">
      * หากคุณไม่ใช่ผู้ที่ทำรายการนี้ กรุณาละเว้นอีเมลนี้ได้เลยครับ *
    </p>
  `

  const html = getBaseTemplate(titles[type], content)

  if (!resend) {
    console.log(`[DEV/MOCK] Email OTP to ${email} [${type}]: ${code}`)
    return
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FastOil <noreply@resend.dev>',
      to: email,
      subject: `${titles[type]} — FastOil`,
      html,
    })
  } catch (err) { console.error('Resend Error:', err) }
}

/**
 * ⛽ ส่งอีเมลใบเสร็จ/ยืนยันออเดอร์ — Nitro Detail Design
 */
async function sendOrderConfirmationEmail(email, order) {
  const { id, fuel_type, liters, total_price, delivery_address, name } = order
  const shortId = id.substring(0, 8).toUpperCase()

  const content = `
    <h2 style="color:${COLORS.heading}; font-size:26px; font-weight:800; margin-bottom:10px; letter-spacing:-0.5px;">รับออเดอร์ของคุณแล้ว! 🎉</h2>
    <p style="color:${COLORS.text}; font-size:15px; margin-bottom:35px;">
      สวัสดีคุณ <strong>${name}</strong>,<br>
      เราได้รับคำสั่งซื้อเรียบร้อยแล้ว และกำลังเตรียมความพร้อมเพื่อจัดส่งให้เร็วที่สุดครับ
    </p>
    
    <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:24px; padding:30px; margin-bottom:35px;">
      <div class="label" style="margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">รายการสั่งซื้อ #${shortId}</div>
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0; color:#64748b; font-size:14px;">ประเภทน้ำมัน</td>
          <td style="padding:10px 0; text-align:right; color:${COLORS.heading}; font-weight:800;">${fuel_type}</td>
        </tr>
        <tr>
          <td style="padding:10px 0; color:#64748b; font-size:14px;">ปริมาณ</td>
          <td style="padding:10px 0; text-align:right; color:${COLORS.heading}; font-weight:800;">${liters} ลิตร</td>
        </tr>
        <tr style="border-top:1px dashed #cbd5e1;">
          <td style="padding:20px 0 10px; color:${COLORS.heading}; font-weight:800; font-size:16px;">ยอดรวมสุทธิ</td>
          <td style="padding:20px 0 10px; text-align:right; color:${COLORS.danger}; font-size:22px; font-weight:800;">฿${total_price.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom:35px;">
      <div class="label">สถานที่จัดส่ง</div>
      <p style="color:${COLORS.text}; line-height:1.6; font-size:14px; margin:0;">${delivery_address}</p>
    </div>

    <div style="text-align:center;">
      <a href="https://fastoil-backend.onrender.com/history" class="button">ติดตามสถานะออเดอร์</a>
    </div>
  `

  const html = getBaseTemplate(`ออเดอร์ #${shortId} — FastOil`, content, 'ขอบคุณที่เลือกใช้บริการ FastOil ครับ')

  if (!resend) {
    console.log(`[DEV/MOCK] Order Email to ${email}: #${shortId}`)
    return
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FastOil <noreply@resend.dev>',
      to: email,
      subject: `ยืนยันออเดอร์ #${shortId} — FastOil`,
      html,
    })
  } catch (err) { console.error('Resend Error:', err) }
}

/**
 * ⛽ ส่งอีเมลอัปเดตสถานะออเดอร์
 */
async function sendOrderStatusUpdateEmail(email, orderName, orderId, status) {
  const statusTh = { confirmed: 'ได้รับการยืนยัน', delivering: 'อยู่ระหว่างจัดส่ง', delivered: 'จัดส่งสำเร็จ', cancelled: 'ยกเลิกแล้ว' }
  const shortId = orderId.substring(0, 8).toUpperCase()
  
  const content = `
    <h2 style="color:${COLORS.heading}; font-size:26px; font-weight:800; margin-bottom:15px;">อัปเดตสถานะออเดอร์ #${shortId}</h2>
    <p style="color:${COLORS.text}; font-size:16px; margin-bottom:35px;">
      สวัสดีคุณ <strong>${orderName}</strong>, สถานะคำสั่งซื้อของคุณมีการเปลี่ยนแปลง:
    </p>
    
    <div class="nitro-box" style="padding:30px; border-color:${status === 'delivered' ? COLORS.success : COLORS.info};">
      <div class="label">สถานะปัจจุบัน</div>
      <h3 style="margin:0; font-size:32px; color:${status === 'delivered' ? COLORS.success : COLORS.primary}; font-weight:800;">${statusTh[status] || status}</h3>
    </div>

    <div style="text-align:center; margin-top:30px;">
       <a href="https://fastoil-backend.onrender.com/history" class="button" style="background:${COLORS.success}">ดูรายละเอียด</a>
    </div>
  `

  const html = getBaseTemplate(`อัปเดตออเดอร์ #${shortId} — FastOil`, content)

  if (!resend) {
    console.log(`[DEV/MOCK] Status Email to ${email}: ${status}`)
    return
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FastOil <noreply@resend.dev>',
      to: email,
      subject: `อัปเดตสถานะออเดอร์ #${shortId} — FastOil`,
      html,
    })
  } catch (err) { console.error('Resend Error:', err) }
}

async function sendSmsOTP(phone, code) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[DEV] SMS OTP for ${phone}: ${code}`)
    return
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  await client.messages.create({
    body: `รหัสยืนยัน FastOil ของคุณคือ: ${code} (มีอายุ 10 นาที)`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  })
}

module.exports = { 
  generateOTP, 
  sendEmailOTP, 
  sendOrderConfirmationEmail, 
  sendOrderStatusUpdateEmail,
  sendSmsOTP 
}
