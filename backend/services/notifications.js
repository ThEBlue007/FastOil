const { Resend } = require('resend')
const twilio = require('twilio')

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendEmailOTP(email, name, code, type = 'verify') {
  const subjects = {
    verify: 'ยืนยันอีเมลของคุณ — FastOil',
    reset: 'รีเซ็ตรหัสผ่าน — FastOil',
  }
  const headings = {
    verify: 'ยืนยันอีเมลของคุณ',
    reset: 'รีเซ็ตรหัสผ่านของคุณ',
  }
  const descriptions = {
    verify: 'ใช้รหัสด้านล่างเพื่อยืนยันอีเมลของคุณ รหัสนี้จะหมดอายุใน 10 นาที',
    reset: 'ใช้รหัสด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ รหัสนี้จะหมดอายุใน 10 นาที',
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Sarabun',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#b91c1c,#dc2626);padding:32px 40px;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:20px;">⛽</span>
        </div>
        <span style="font-size:28px;font-weight:900;color:white;letter-spacing:-0.5px;">
          Fast<span style="color:#fbbf24;">Oil</span>
        </span>
      </div>
    </div>
    <!-- Content -->
    <div style="padding:40px;">
      <h2 style="margin:0 0 8px;color:#1e3a8a;font-size:22px;font-weight:800;">${headings[type]}</h2>
      <p style="color:#64748b;margin:0 0 32px;line-height:1.6;">
        สวัสดี <strong style="color:#1e293b;">${name}</strong>, ${descriptions[type]}
      </p>
      <!-- OTP Box -->
      <div style="background:linear-gradient(135deg,#eff6ff,#f8fafc);border:2px solid #e2e8f0;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">รหัสยืนยัน</p>
        <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:8px;color:#1e3a8a;">${code}</p>
      </div>
      <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
        รหัสนี้ใช้ได้เพียงครั้งเดียว และจะหมดอายุใน <strong>10 นาที</strong>
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        หากคุณไม่ได้ขอรหัสนี้ กรุณาละเว้นอีเมลนี้
      </p>
      <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">
        &copy; 2025 FastOil. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: email,
    subject: subjects[type],
    html,
  })
}

async function sendPasswordResetEmail(email, name, resetLink) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Sarabun',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#b91c1c,#dc2626);padding:32px 40px;text-align:center;">
      <span style="font-size:28px;font-weight:900;color:white;">Fast<span style="color:#fbbf24;">Oil</span></span>
    </div>
    <div style="padding:40px;">
      <h2 style="margin:0 0 8px;color:#1e3a8a;font-size:22px;font-weight:800;">รีเซ็ตรหัสผ่าน</h2>
      <p style="color:#64748b;margin:0 0 32px;line-height:1.6;">
        สวัสดี <strong style="color:#1e293b;">${name}</strong>, คลิกปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ
        ลิงก์นี้จะหมดอายุใน <strong>1 ชั่วโมง</strong>
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1e293b;font-weight:800;font-size:16px;padding:16px 40px;border-radius:14px;text-decoration:none;box-shadow:0 4px 14px rgba(251,191,36,0.4);">
          🔑 รีเซ็ตรหัสผ่าน
        </a>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;">
        หรือคัดลอกลิงก์นี้: <br><span style="color:#3b82f6;word-break:break-all;">${resetLink}</span>
      </p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้</p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: email,
    subject: 'รีเซ็ตรหัสผ่าน — FastOil',
    html,
  })
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

module.exports = { generateOTP, sendEmailOTP, sendPasswordResetEmail, sendSmsOTP }
