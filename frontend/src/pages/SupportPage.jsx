import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    icon: '⛽',
    q: 'FastOil จัดส่งน้ำมันถึงที่ได้อย่างไร?',
    a: 'เราใช้รถบรรทุกน้ำมันเคลื่อนที่ที่ผ่านการรับรองมาตรฐานความปลอดภัยระดับสากล ส่งตรงถึงพิกัดที่คุณระบุบนแผนที่อย่างแม่นยำ',
  },
  {
    icon: '⏱️',
    q: 'ใช้เวลานานแค่ไหนในการจัดส่ง?',
    a: 'โดยเฉลี่ย 20–30 นาทีสำหรับเขตกรุงเทพฯ และปริมณฑล และไม่เกิน 45-60 นาทีในพื้นที่ส่วนภูมิภาค',
  },
  {
    icon: '💳',
    q: 'ชำระเงินด้วยวิธีใดได้บ้าง?',
    a: 'เรารองรับการโอนผ่านบัญชีพร้อมเพย์ (PromptPay), บัตรเครดิต/เดบิต ทุกธนาคาร และการเก็บเงินปลายทาง',
  },
  {
    icon: '📦',
    q: 'สั่งน้ำมันขั้นต่ำเท่าไหร่?',
    a: 'ยอดการสั่งซื้อขั้นต่ำเพียง 1 ลิตร หรือเทียบเท่ามูลค่า 50 บาทต่อรายการคำสั่งซื้อ',
  },
]

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-gray-100 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 -left-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-red-500/10 flex items-center justify-center text-4xl mx-auto mb-6 border border-gray-100"
          >
            🆘
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1e3a8a] mb-4 tracking-tight">ศูนย์ช่วยเหลือ</h1>
          <p className="text-gray-500 text-lg">พบปัญหาการใช้งาน หรือมีข้อสงสัย? เราพร้อมซัพพอร์ตคุณตลอด 24 ชม.</p>
        </header>

        {/* FAQ Section */}
        <section className="space-y-4 mb-16">
          <h2 className="text-xl font-black text-gray-900 border-l-4 border-red-500 pl-4 mb-8">คำถามที่พบบ่อย (FAQs)</h2>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${isOpen ? 'border-red-200 shadow-xl shadow-red-500/5' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left outline-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl grayscale-0">{faq.icon}</span>
                    <span className={`font-bold transition-colors ${isOpen ? 'text-red-600' : 'text-gray-800'}`}>{faq.q}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-400' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-gray-600 text-sm md:text-base leading-relaxed pl-[72px]"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </section>

        {/* Contact Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] p-8 md:p-12 text-center overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">ยังไม่พบคำตอบที่คุณต้องการ?</h3>
            <p className="text-red-100 mb-8 max-w-md mx-auto">ไม่ต้องกังวล! ทีมงานผู้เชี่ยวชาญของเราสแตนด์บายรอช่วยเหลือคุณโดยตรง</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://line.me"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-[#06c755] hover:bg-[#05b14a] text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Line Official
              </a>
              <a
                href="tel:0800001234"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-8 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                โทร 080-000-1234
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

