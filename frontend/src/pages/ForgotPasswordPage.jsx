import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.forgotPassword({ email })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-[#f8fafc]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-8 rounded-3xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔑
          </div>
          <h2 className="text-2xl font-black text-[#1e3a8a]">ลืมรหัสผ่าน?</h2>
          <p className="text-gray-500 text-sm mt-2">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100 font-semibold">
              ✅ ลิงก์ถูกส่งไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความ
            </div>
            <Link to="/login" className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
              กลับไปเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
            
            <div>
              <input
                type="email" required placeholder="อีเมลของคุณ"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
              />
            </div>
            
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 font-bold py-3.5 rounded-xl shadow-lg transition-all"
            >
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-gray-600">กลับไปเข้าสู่ระบบ</Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
