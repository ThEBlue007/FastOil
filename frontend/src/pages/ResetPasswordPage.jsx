import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return setError('ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว')
    if (password !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน')
    if (password.length < 8) return setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')

    setLoading(true)
    setError('')
    try {
      await api.resetPassword({ token, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center p-8 glass-card rounded-3xl max-w-md w-full">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ลิงก์ไม่ถูกต้อง</h2>
          <p className="text-gray-500 mb-6">กรุณาร้องขอลิงก์รีเซ็ตรหัสผ่านใหม่</p>
          <Link to="/forgot-password" className="text-[#dc2626] font-bold hover:underline">ไปหน้าลืมรหัสผ่าน</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-[#f8fafc]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-8 rounded-3xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#1e3a8a]">ตั้งรหัสผ่านใหม่</h2>
          <p className="text-gray-500 text-sm mt-2">กรุณาตั้งรหัสผ่านใหม่ของคุณ</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <span className="text-4xl block">✅</span>
            <div className="text-green-600 font-bold text-lg">รีเซ็ตรหัสผ่านสำเร็จ!</div>
            <p className="text-gray-500 text-sm">กำลังพากลับไปหน้าเข้าสู่ระบบ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสผ่านใหม่</label>
              <input
                type="password" required placeholder="อย่างน้อย 8 ตัวอักษร"
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password" required placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
              />
            </div>
            
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-4"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
