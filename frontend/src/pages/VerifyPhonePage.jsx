import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function VerifyPhonePage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState(1) // 1: Enter Phone, 2: Enter OTP
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const inputsRef = useRef([])

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!phone || phone.length < 9) return setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')
    
    setLoading(true)
    setError('')
    try {
      const data = await api.sendPhoneOtp({ phone })
      if (data.otp) {
        alert(`[MOCK OTP] รหัส SMS ของคุณคือ: ${data.otp}`)
      }
      setStep(2)
      setResendCooldown(60)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) inputsRef.current[index + 1].focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus()
    }
  }

  const handleSubmitOTP = async (e) => {
    e.preventDefault()
    const otpString = code.join('')
    if (otpString.length !== 6) return setError('กรุณากรอก OTP ให้ครบ 6 หลัก')

    setLoading(true)
    setError('')
    try {
      await api.verifyPhone({ code: otpString })
      await refreshUser()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-[#f8fafc]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 rounded-3xl text-center"
      >
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          📱
        </div>
        
        <h2 className="text-2xl font-black text-[#1e3a8a] mb-2">ยืนยันเบอร์โทรศัพท์</h2>
        
        {step === 1 ? (
          <>
            <p className="text-gray-500 mb-8 text-sm">
              กรุณากรอกเบอร์โทรศัพท์มือถือ เพื่อรับ OTP
            </p>
            <form onSubmit={handleSendOTP} className="space-y-4 text-left">
              {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
              <div>
                <input
                  type="tel" required placeholder="08xxxxxxxx"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 font-bold py-3.5 rounded-xl shadow-lg transition-all"
              >
                {loading ? 'กำลังส่ง...' : 'ขอรับรหัส OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-8 text-sm">
              เราได้ส่งรหัส OTP 6 หลักไปที่เบอร์ <strong className="text-gray-800">{phone}</strong>
            </p>
            <form onSubmit={handleSubmitOTP}>
              {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</div>}
              <div className="flex justify-between gap-2 mb-8">
                {code.map((digit, i) => (
                  <input
                    key={i} type="text" maxLength="1"
                    ref={el => inputsRef.current[i] = el}
                    value={digit} onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
                  />
                ))}
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-[#1e3a8a] text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 shadow-lg transition-colors"
              >
                {loading ? 'ตรวจสอบ...' : 'ยืนยัน OTP'}
              </button>
            </form>
            <div className="text-sm text-gray-500 mt-6">
              <button 
                type="button" onClick={handleSendOTP} disabled={resendCooldown > 0}
                className={`font-semibold ${resendCooldown > 0 ? 'text-gray-400' : 'text-[#dc2626] hover:underline'}`}
              >
                ส่งรหัสอีกครั้ง {resendCooldown > 0 && `(${resendCooldown}s)`}
              </button>
              <br/><br/>
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-xs text-underline">เปลี่ยนเบอร์โทร</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
