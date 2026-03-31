const FAQS = [
  {
    q: 'FastOil จัดส่งน้ำมันถึงที่ได้อย่างไร?',
    a: 'เราใช้รถบรรทุกน้ำมันเคลื่อนที่ที่ผ่านการรับรองความปลอดภัย ส่งตรงถึงสถานที่ที่คุณระบุ',
  },
  {
    q: 'ใช้เวลานานแค่ไหนในการจัดส่ง?',
    a: 'โดยเฉลี่ย 20–30 นาทีในเขตกรุงเทพฯ และ 45 นาทีในต่างจังหวัด',
  },
  {
    q: 'ชำระเงินด้วยวิธีใดได้บ้าง?',
    a: 'รองรับโอนพร้อมเพย์ บัตรเครดิต และเงินสดเมื่อรับสินค้า',
  },
  {
    q: 'สั่งน้ำมันขั้นต่ำเท่าไหร่?',
    a: 'ขั้นต่ำ 10 ลิตร หรือ 300 บาท ต่อคำสั่งซื้อ',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🛟</div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">ศูนย์ช่วยเหลือ</h1>
          <p className="text-gray-500">มีคำถาม? เราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง</p>
        </div>

        {/* FAQ */}
        <div className="space-y-4 mb-10">
          <h2 className="text-lg font-bold text-gray-700">คำถามที่พบบ่อย</h2>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <p className="font-bold text-gray-900 mb-2">❓ {faq.q}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-red-600 rounded-2xl p-6 text-center text-white">
          <p className="font-bold text-lg mb-1">ยังไม่พบคำตอบ?</p>
          <p className="text-red-100 text-sm mb-4">ติดต่อทีมงานของเราได้เลย</p>
          <a
            id="support-line-btn"
            href="tel:0800001234"
            className="inline-block bg-yellow-400 text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            📞 โทร 080-000-1234
          </a>
        </div>
      </div>
    </div>
  )
}
