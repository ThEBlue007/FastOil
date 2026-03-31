import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default function PriceCalculator({ fuel }) {
  const [liters, setLiters] = useState('')
  const [baht, setBaht] = useState('')
  const [lastEdited, setLastEdited] = useState(null) // 'liters' | 'baht'

  const pricePerLiter = fuel?.pricePerLiter ?? 35.94
  const accentColor = fuel?.color ?? '#3b82f6'
  const accentBg = fuel?.bg ?? 'rgba(59,130,246,0.12)'
  const accentBorder = fuel?.border ?? 'rgba(59,130,246,0.45)'

  // ── ตัวจัดการอินพุต ─────────────────────────────────────────
  const handleLitersChange = useCallback(
    (e) => {
      const raw = e.target.value
      if (/[^0-9.]/.test(raw) || (raw.match(/\./g) || []).length > 1) return
      setLastEdited('liters')
      setLiters(raw)
      const num = parseFloat(raw)
      if (!isNaN(num) && num >= 0) {
        const computed = clamp(num * pricePerLiter, 0, 99999)
        setBaht(computed.toFixed(2))
      } else {
        setBaht('')
      }
    },
    [pricePerLiter]
  )

  const handleBahtChange = useCallback(
    (e) => {
      const raw = e.target.value
      if (/[^0-9.]/.test(raw) || (raw.match(/\./g) || []).length > 1) return
      setLastEdited('baht')
      setBaht(raw)
      const num = parseFloat(raw)
      if (!isNaN(num) && num >= 0) {
        const computed = clamp(num / pricePerLiter, 0, 9999)
        setLiters(computed.toFixed(2))
      } else {
        setLiters('')
      }
    },
    [pricePerLiter]
  )

  const handleReset = () => {
    setLiters('')
    setBaht('')
    setLastEdited(null)
  }

  // ── ปุ่มเติมด่วน (บาท) ──────────────────────────────────────
  const presets = [100, 200, 500, 1000]

  const applyPreset = (amount) => {
    setLastEdited('baht')
    setBaht(amount.toString())
    const computed = clamp(amount / pricePerLiter, 0, 9999)
    setLiters(computed.toFixed(2))
  }

  const hasValue = liters !== '' || baht !== ''
  const litersNum = parseFloat(liters) || 0

  return (
    <div className="w-full space-y-4">
      {/* ── ปุ่มเติมด่วน ── */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
          เติมด่วน (บาท)
        </p>
        <div className="flex gap-2">
          {presets.map((amount) => (
            <motion.button
              key={amount}
              id={`preset-btn-${amount}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => applyPreset(amount)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background:
                  parseFloat(baht) === amount
                    ? accentBg
                    : 'rgba(0,0,0,0.03)',
                border: `1px solid ${parseFloat(baht) === amount
                    ? accentBorder
                    : 'rgba(0,0,0,0.06)'
                  }`,
                color:
                  parseFloat(baht) === amount ? accentColor : '#64748b',
              }}
            >
              ฿{amount}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── อินพุตสองทิศทาง ── */}
      <div className="relative flex flex-col gap-3">
        {/* อินพุตลิตร */}
        <InputField
          id="input-liters"
          label="จำนวนลิตร"
          unit="ล."
          value={liters}
          onChange={handleLitersChange}
          placeholder="0.00"
          accentColor={accentColor}
          accentBg={accentBg}
          accentBorder={accentBorder}
          isActive={lastEdited === 'liters'}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          }
        />

        {/* ไอคอนสลับ */}
        <div className="flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: accentBg,
              border: `1px solid ${accentBorder}`,
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke={accentColor} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
              />
            </svg>
          </div>
        </div>

        {/* อินพุตบาท */}
        <InputField
          id="input-baht"
          label="จำนวนเงิน (บาท)"
          unit="฿"
          value={baht}
          onChange={handleBahtChange}
          placeholder="0.00"
          accentColor={accentColor}
          accentBg={accentBg}
          accentBorder={accentBorder}
          isActive={lastEdited === 'baht'}
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
      </div>

      {/* ── การ์ดสรุปคำสั่งซื้อ ── */}
      <AnimatePresence>
        {hasValue && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-4 space-y-2"
            style={{
              background: accentBg,
              border: `1px solid ${accentBorder}`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                สรุปรายการ
              </span>
              <button
                id="btn-reset-calculator"
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150 underline underline-offset-2"
              >
                รีเซ็ต
              </button>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p
                  className="text-3xl font-black tracking-tight"
                  style={{ color: accentColor }}
                >
                  {litersNum.toFixed(2)}
                  <span className="text-base font-semibold ml-1 opacity-70">ล.</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  @ ฿{pricePerLiter.toFixed(2)}/ลิตร
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-900 tracking-tight">
                  ฿{(litersNum * pricePerLiter).toFixed(2)}
                </p>
                <p className="text-xs font-bold text-gray-400">ยอดรวม</p>
              </div>
            </div>

            {/* แถบความจุถัง */}
            <div className="mt-2 h-1.5 rounded-full bg-black/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: accentColor }}
                initial={{ width: '0%' }}
                animate={{
                  width: `${Math.min((litersNum / 60) * 100, 100)}%`,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-gray-400 font-bold text-right pt-1">
              {Math.min((litersNum / 60) * 100, 100).toFixed(0)}% ของถังเต็ม (60 ลิตร)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── คอมโพเนนต์ย่อย: InputField ──────────────────────────────────
function InputField({
  id,
  label,
  unit,
  value,
  onChange,
  placeholder,
  accentColor,
  accentBg,
  accentBorder,
  isActive,
  icon,
}) {
  return (
    <div
      className="rounded-xl p-3.5 transition-all duration-200"
      style={{
        background: isActive ? accentBg : 'rgba(0,0,0,0.02)',
        border: `1.5px solid ${isActive ? accentBorder : 'rgba(0,0,0,0.06)'}`,
        boxShadow: isActive ? `0 0 20px ${accentBg}` : 'none',
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ color: isActive ? accentColor : '#475569' }}>{icon}</span>
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider cursor-pointer"
          style={{ color: isActive ? accentColor : '#64748b' }}
        >
          {label}
        </label>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl font-black"
          style={{ color: isActive ? accentColor : '#334155' }}
        >
          {unit}
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-2xl font-black outline-none placeholder:text-gray-300 transition-colors duration-200"
          style={{ color: isActive ? '#0f172a' : '#475569' }}
        />
      </div>
    </div>
  )
}
