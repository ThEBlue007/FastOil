import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      return setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน')
    }
    if (formData.password.length < 8) {
      return setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    }

    setLoading(true)

    try {
      const data = await api.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password
      })
      
      // แจ้งเตือน Mock OTP (เฉพาะช่วงพัฒนา)
      if (data.otp) {
        alert(`[MOCK OTP] รหัสยืนยันอีเมลของคุณคือ: ${data.otp}`)
      }

      // ส่งข้อมูลไปหน้า Verify Email
      navigate('/verify-email', { 
        state: { userId: data.userId, email: data.email },
        replace: true 
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #fffbeb 100%)' }}>
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/60 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-100/50 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl relative z-10"
        style={{ boxShadow: '0 20px 50px rgba(30,58,138,0.10), 0 4px 10px rgba(0,0,0,0.04)' }}
      >
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-[#dc2626] font-semibold bg-white/80 px-4 py-2 rounded-full shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <span>←</span> กลับหน้าหลัก
          </Link>
        </div>

        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 mb-4 text-center w-full justify-center">
            <img src="/logo.png" alt="FastOil Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-black text-[#1e3a8a] tracking-tight">สมัครสมาชิก</h2>
          <p className="mt-2 text-sm text-gray-500">
            มีบัญชีอยู่แล้วใช่ไหม?{' '}
            <Link to="/login" className="font-medium text-[#dc2626] hover:text-[#b91c1c] underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อ - นามสกุล</label>
            <input
              type="text" name="name" required
              className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24] transition-all"
              placeholder="สมชาย ใจดี"
              value={formData.name} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">อีเมล</label>
            <input
              type="email" name="email" required
              className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24] transition-all"
              placeholder="example@mail.com"
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
            <input
              type="tel" name="phone"
              className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24] transition-all"
              placeholder="0812345678"
              value={formData.phone} onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} name="password" required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24] transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24] transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.confirmPassword} onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-red-200/50 text-base font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] focus:outline-none transition-all
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
               <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'สร้างบัญชี'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
