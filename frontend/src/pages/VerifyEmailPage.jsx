import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
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
    
    // Focus last filled input or very last input
    const focusIndex = Math.min(pastedData.length, 5)
    inputsRef.current[focusIndex].focus()
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
      // Auto login user after verify successfully
      localStorage.setItem('fastoil_token', data.accessToken)
      localStorage.setItem('fastoil_refresh', data.refreshToken)
      
      // Update context state immediately
      setUser(data.user)
      
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
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
      setCode(['', '', '', '', '', '']) // reset fields
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-[#f8fafc]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 rounded-3xl text-center"
      >
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          ✉️
        </div>
        
        <h2 className="text-2xl font-black text-[#1e3a8a] mb-2">ยืนยันอีเมลของคุณ</h2>
        <p className="text-gray-500 mb-8 text-sm">
          เราได้ส่งรหัส OTP 6 หลักไปที่<br />
          <strong className="text-gray-800">{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

          <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
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
                className="w-12 h-14 text-center text-2xl font-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full bg-[#1e3a8a] text-white py-3.5 rounded-xl font-bold mb-4 flex justify-center shadow-lg hover:bg-blue-900 transition-colors"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'ยืนยันรหัส'}
          </motion.button>
        </form>

        <div className="text-sm text-gray-500 mt-6">
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
