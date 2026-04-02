import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)

  const location = useLocation()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const inputsRef = useRef([])

  // Redirect if no userId in state (meaning they didn't come from register)
  if (!location.state?.userId) {
    return <Navigate to="/login" replace />
  }

  const { userId, email } = location.state

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputsRef.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
    if (pastedData.some(char => !/^[0-9]$/.test(char))) return

    const newCode = [...code]
    pastedData.forEach((char, i) => {
      if (i < 6) newCode[i] = char
    })
    setCode(newCode)
    
    const focusIndex = Math.min(pastedData.length, 5)
    if (inputsRef.current[focusIndex]) {
      inputsRef.current[focusIndex].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = code.join('')
    if (otpString.length !== 6) {
      return setError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก')
    }

    setLoading(true)
    setError('')

    try {
      const data = await api.verifyEmail({ userId, code: otpString })
      localStorage.setItem('fastoil_token', data.accessToken)
      localStorage.setItem('fastoil_refresh', data.refreshToken)
      setUser(data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการยืนยันรหัส')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    try {
      const data = await api.resendEmailOtp({ userId })
      if (data.otp) {
        alert(`[MOCK OTP] รหัสยืนยันอีเมลใหม่ของคุณคือ: ${data.otp}`)
      }
      setResendCooldown(60)
      setCode(['', '', '', '', '', ''])
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a]/5 via-white to-[#dc2626]/5 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 glass-card p-6 sm:p-10 rounded-3xl relative z-10"
        style={{ boxShadow: '0 20px 50px rgba(30,58,138,0.10), 0 4px 10px rgba(0,0,0,0.04)' }}
      >
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-[#dc2626] font-semibold bg-white/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm border border-gray-100 transition-all hover:shadow-md text-xs sm:text-sm">
            <span>←</span> กลับหน้าหลัก
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mt-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl">
            ✉️
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1e3a8a] mb-2 font-display">ยืนยันอีเมลของคุณ</h2>
          <p className="text-gray-500 mb-6 sm:mb-8 text-xs sm:text-sm">
            เราได้ส่งรหัส OTP 6 หลักไปที่<br />
            <strong className="text-gray-800 break-all">{email}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-xs sm:text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-1 sm:gap-2 mb-8" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                inputMode="numeric"
                pattern="[0-9]*"
                ref={el => inputsRef.current[i] = el}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1e3a8a] text-white py-3 sm:py-3.5 rounded-xl font-bold mb-4 flex justify-center shadow-lg hover:bg-blue-900 transition-colors text-sm sm:text-base"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'ยืนยันรหัส'
            )}
          </motion.button>
        </form>

        {/* Resend Section */}
        <div className="text-xs sm:text-sm text-gray-500 text-center mt-4 sm:mt-6">
          ไม่ได้รหัสใช่ไหม?{' '}
          <button 
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className={`font-semibold ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#dc2626] hover:underline'}`}
          >
            ส่งรหัสอีกครั้ง {resendCooldown > 0 && `(${resendCooldown}s)`}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
