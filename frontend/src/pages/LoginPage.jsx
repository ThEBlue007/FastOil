import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #fffbeb 100%)' }}>
      
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/60 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-100/50 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl relative z-10"
        style={{ boxShadow: '0 20px 50px rgba(30,58,138,0.10), 0 4px 10px rgba(0,0,0,0.04)' }}
      >
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-[#dc2626] font-semibold bg-white/80 px-4 py-2 rounded-full shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <span>←</span> กลับหน้าหลัก
          </Link>
        </div>

        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 mb-6 text-center w-full justify-center">
            <img src="/logo.png" alt="FastOil Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-black text-[#1e3a8a] tracking-tight">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-gray-500">
            ยังไม่มีบัญชีใช่หรือไม่?{' '}
            <Link to="/register" className="font-medium text-[#dc2626] hover:text-[#b91c1c] transition-colors">
              สมัครสมาชิกฟรี
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                placeholder="อีเมลของคุณ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700">รหัสผ่าน</label>
                <Link to="/forgot-password" className="text-xs font-medium text-[#dc2626] hover:text-[#b91c1c]">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-amber-200/50 text-base font-bold text-gray-900 bg-[#fbbf24] hover:bg-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fbbf24] transition-all
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
