import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Fuel Data (Real Thai Station Colors) ───────────────────────────────
const STATIC_FUELS = [
  { id: 'g95', name: 'แก๊สโซฮอล์ 95', color: '#ef4444', glow: 'rgba(239,68,68,0.4)', badge: 'พรีเมียม' },
  { id: 'g91', name: 'แก๊สโซฮอล์ 91', color: '#22c55e', glow: 'rgba(34,197,94,0.4)', badge: 'ยอดนิยม' },
  { id: 'e20', name: 'แก๊สโซฮอล์ E20', color: '#f97316', glow: 'rgba(249,115,22,0.4)', badge: 'ประหยัด' },
  { id: 'e85', name: 'แก๊สโซฮอล์ E85', color: '#0d9488', glow: 'rgba(13,148,136,0.4)', badge: 'พลังงานสะอาด' },
  { id: 'b7', name: 'ดีเซล B7', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)', badge: 'ดีเซลกำมะถันต่ำ' },
]

// ── Kiosk UI Component ────────────────────────────────────────────────
export default function OrderPage({ fuels: liveFuels, onNavigate }) {
  const [selectedFuelId, setSelectedFuelId] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Merge static UI data (colors, badges) with live prices
  const KIOSK_FUELS = STATIC_FUELS.map(staticFuel => {
    const live = liveFuels?.find(f => f.id === staticFuel.id);
    return {
      ...staticFuel,
      price: live ? live.price : 0,
      color: live?.color || staticFuel.color,
      glow: live?.color ? `${live.color}66` : staticFuel.glow // 40% hex opacity for glow
    };
  });

  const selectedFuel = KIOSK_FUELS.find(f => f.id === selectedFuelId) || null;
  const [inputMode, setInputMode] = useState('baht') // 'baht' or 'liter'
  const [amount, setAmount] = useState('')
  const [orderStep, setOrderStep] = useState(1) // 1: Amount, 2: Delivery Details
  const [deliveryMode, setDeliveryMode] = useState('delivery') // 'delivery' or 'walkin'
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')
  const [showSlip, setShowSlip] = useState(false)
  const [isDispensing, setIsDispensing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLocating, setIsLocating] = useState(false)

  // Get current GPS location and reverse geocode
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง GPS');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap Nominatim for free reverse geocoding (Thai language)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=th`);
          if (!res.ok) throw new Error('Network response was not ok');
          const data = await res.json();

          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          setLocation(`พิกัด: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (ไม่สามารถดึงชื่อที่อยู่ได้)`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert('ไม่สามารถดึงตำแหน่งได้ กรุณาเปิดสิทธิ์ GPS หรือพิมพ์ที่อยู่ด้วยตนเอง');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Simulation of dispensing
  useEffect(() => {
    if (isDispensing) {
      if (progress >= 100) {
        return
      }
      const timer = setTimeout(() => {
        setProgress(p => Math.min(p + 2, 100))
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setProgress(0)
    }
  }, [isDispensing, progress])

  // Keypad Logic
  const handleKeypad = (val) => {
    if (val === 'del') {
      setAmount(prev => prev.slice(0, -1))
    } else if (val === 'full') {
      setAmount('1500') // Mock full tank
    } else if (val === '00') {
      if (amount === '') return // Can't start with 00
      if (amount.includes('.') && amount.split('.')[1].length >= 2) return // limit decimal
      setAmount(prev => prev + '00')
    } else if (val === '.') {
      if (amount.includes('.')) return
      setAmount(prev => (prev === '' ? '0.' : prev + '.'))
    } else {
      // Prevent taking too many digits
      if (amount.replace('.', '').length > 5) return
      setAmount(prev => prev + val)
    }
  }

  // Quick preset buttons
  const applyPreset = (val) => {
    setInputMode('baht')
    setAmount(val.toString())
  }

  // Calculations
  const numericAmount = parseFloat(amount) || 0
  let calculatedLiters = 0
  let calculatedBaht = 0

  if (selectedFuel) {
    if (inputMode === 'baht') {
      calculatedBaht = numericAmount
      calculatedLiters = calculatedBaht / selectedFuel.price
    } else {
      calculatedLiters = numericAmount
      calculatedBaht = calculatedLiters * selectedFuel.price
    }
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-start md:justify-center items-center p-2 pb-28 sm:p-4 md:p-8 font-sans">

      {/* ── KIOSK SCREEN HARDWARE WRAPPER ── */}
      <div
        className="w-full max-w-6xl rounded-2xl md:rounded-[2rem] p-1 sm:p-3 shadow-2xl relative my-auto"
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 md:w-32 h-1.5 bg-gray-600 rounded-b-xl" />

        {/* ── ACTUAL SCREEN UI ── */}
        <div className="bg-[#0b101a] rounded-3xl overflow-hidden h-auto md:h-[85vh] md:max-h-[900px] flex flex-col relative border border-gray-800">

          {/* Top Status Bar */}
          <header className="h-14 md:h-16 px-4 md:px-8 flex justify-between items-center border-b border-gray-800/80 bg-[#0f1522]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-sm shadow-sm shadow-red-500/30">
                ⛽
              </div>
              <span className="text-xl font-black tracking-tight"><span className="text-red-500">Fast</span><span className="text-amber-400">Oil</span> Kiosk</span>
            </div>
            <div className="flex gap-6 text-sm font-semibold text-gray-400">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online</span>
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </header>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

            {/* ── LEFT PANEL: FUEL SELECTION ── */}
            <div className="w-full md:w-1/3 md:min-w-[320px] border-b md:border-b-0 md:border-r border-gray-800/80 bg-[#0d121c] p-4 md:p-6 overflow-x-hidden md:overflow-y-auto hidden-scrollbar flex-shrink-0">
              <h2 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 md:mb-6">1. เลือกประเภทน้ำมัน</h2>

              <div className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hidden-scrollbar snap-x">
                {KIOSK_FUELS.map(fuel => {
                  const isActive = selectedFuel?.id === fuel.id
                  return (
                    <motion.button // Ensure min width for mobile horizontal scroll
                      key={fuel.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedFuelId(fuel.id)}
                      className={`relative min-w-[200px] md:min-w-0 md:w-full snap-center rounded-2xl p-4 md:p-5 text-left transition-all duration-300 border-2 overflow-hidden flex-shrink-0 ${isActive ? 'bg-[#151c28]' : 'bg-[#0f1522] border-transparent hover:border-gray-700'
                        }`}
                      style={{
                        borderColor: isActive ? fuel.color : undefined,
                        boxShadow: isActive ? `0 0 30px ${fuel.glow}` : 'none'
                      }}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-20" style={{ background: fuel.color }} />
                      )}
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                            style={{ background: `${fuel.color}20`, color: fuel.color }}>
                            {fuel.badge}
                          </span>
                          <h3 className="text-2xl font-black text-white leading-tight">{fuel.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black" style={{ color: fuel.color }}>{fuel.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">THB / L</p>
                        </div>
                      </div>

                      {isActive && (
                        <motion.div layoutId="fuel-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-md" style={{ background: fuel.color }} />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* ── RIGHT PANEL: AMOUNT & PAY ── */}
            <div className="flex-1 p-4 md:p-8 flex flex-col relative md:overflow-y-auto hidden-scrollbar">
              <h2 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 md:mb-6">2. ระบุจำนวนที่ต้องการ</h2>

              <AnimatePresence mode="wait">
                {!selectedFuel ? (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center opacity-40 text-center py-20 md:py-0"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 mb-6 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center text-3xl md:text-4xl">👆</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-500">กรุณาเลือกประเภทน้ำมัน<br />ที่แผงควบคุม</h3>
                  </motion.div>
                ) : orderStep === 1 ? (
                  // Step 1: Input Amount State
                  <motion.div
                    key="input-panel"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >

                    {/* Big Display Screen */}
                    <div className="bg-[#05070a] rounded-3xl p-4 md:p-6 border border-gray-800 shadow-inner flex flex-col justify-between mb-6 md:mb-8"
                      style={{ boxShadow: `inset 0 0 50px ${selectedFuel.glow}` }}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 md:mb-6">
                        {/* Toggle Mode */}
                        <div className="flex bg-[#0f1522] rounded-xl p-1 border border-gray-800">
                          <button onClick={() => { setInputMode('baht'); setAmount(''); }}
                            className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${inputMode === 'baht' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>บาท (THB)</button>
                          <button onClick={() => { setInputMode('liter'); setAmount(''); }}
                            className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${inputMode === 'liter' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>ลิตร (Liters)</button>
                        </div>
                        <div className="text-right flex sm:block justify-between items-center sm:items-end">
                          <p className="text-xs md:text-sm text-gray-400 font-bold">{selectedFuel.name}</p>
                          <p className="text-xs text-gray-500">@ {selectedFuel.price}/ล.</p>
                        </div>
                      </div>

                      {/* Main Digits */}
                      <div className="flex justify-between items-end">
                        <div className="w-1/2">
                          <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest">{inputMode === 'baht' ? 'จำนวนเงิน (บาท)' : 'ที่ต้องชำระ (บาท)'}</p>
                          <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tighter truncate" style={{ color: inputMode === 'baht' ? '#fff' : selectedFuel.color }}>
                            {inputMode === 'baht' ? (amount || '0') : calculatedBaht.toFixed(2)}
                            <span className="text-base sm:text-lg md:text-2xl ml-1 md:ml-2 font-sans opacity-50">฿</span>
                          </p>
                        </div>
                        <div className="w-px h-12 md:h-16 bg-gray-800 mx-2 md:mx-6 shrink-0" />
                        <div className="w-1/2 text-right overflow-hidden">
                          <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest truncate">{inputMode === 'liter' ? 'จำนวนลิตร (Liters)' : 'ปริมาณน้ำมัน (Liters)'}</p>
                          <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tighter truncate" style={{ color: inputMode === 'liter' ? '#fff' : selectedFuel.color }}>
                            {inputMode === 'liter' ? (amount || '0') : calculatedLiters.toFixed(2)}
                            <span className="text-lg md:text-2xl ml-1 md:ml-2 font-sans opacity-50">L</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lower Area: Presets & Keypad split */}
                    <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8">
                      {/* Quick Presets */}
                      <div className="flex flex-col gap-3 md:gap-4 justify-end pb-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">เติมด่วน (บาท)</p>
                        <div className="grid grid-cols-4 md:grid-cols-2 gap-2 md:gap-3 mb-2">
                          {[300, 500, 1000, 1500].map(val => (
                            <button key={val} onClick={() => applyPreset(val)}
                              className="bg-[#0f1522] border border-gray-700 hover:border-gray-500 hover:bg-[#151c28] text-sm md:text-xl font-bold rounded-xl py-3 md:py-4 transition-all whitespace-nowrap">
                              ฿{val}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => applyPreset(2000)}
                          className="w-full bg-[#151c28] border border-gray-700 hover:border-white text-blue-400 text-sm md:text-xl font-bold rounded-xl py-3 md:py-4 transition-all flex items-center justify-center gap-2">
                          <span>⛽</span> เต็มถัง <span className="hidden md:inline">(Full Tank)</span>
                        </button>
                      </div>

                      {/* Numeric Keypad */}
                      <div className="bg-[#0a0e16] rounded-2xl p-3 md:p-4 border border-gray-800/50 my-2 md:my-0">
                        <div className="grid grid-cols-3 gap-2 h-full min-h-[220px]">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '.'].map(key => (
                            <button key={key} onClick={() => handleKeypad(key)}
                              className="bg-[#111827] hover:bg-[#1f2937] active:bg-[#374151] rounded-xl text-xl md:text-2xl font-bold font-mono transition-colors flex items-center justify-center border-b-[3px] border-[#0b0f19]">
                              {key}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.div className="mt-4 md:mt-8 flex gap-3 md:gap-4 h-16 md:h-20 shrink-0">
                      <button onClick={() => setAmount('')}
                        className="w-20 md:w-24 bg-red-950/30 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-xl md:rounded-2xl font-bold flex flex-col justify-center items-center transition-all">
                        <svg className="w-5 h-5 md:w-6 md:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        <span className="text-[10px] md:text-xs uppercase tracking-wider">ล้าง</span>
                      </button>
                      <button
                        onClick={() => {
                          if (numericAmount > 0) setOrderStep(2)
                        }}
                        disabled={numericAmount === 0 || isDispensing}
                        className={`flex-1 rounded-xl md:rounded-2xl font-black text-lg md:text-2xl tracking-wide uppercase transition-all duration-300 shadow-xl ${numericAmount > 0
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/30 hover:scale-[1.02] active:scale-95'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        {numericAmount > 0 ? 'ถัดไป ▶' : 'ระบุจำนวน'}
                      </button>
                    </motion.div>
                  </motion.div>
                ) : (
                  // Step 2: Delivery Details
                  <motion.div
                    key="delivery-panel"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="bg-[#05070a] rounded-3xl p-4 md:p-8 border border-gray-800 shadow-inner flex flex-col mb-4 md:mb-8 flex-1"
                      style={{ boxShadow: `inset 0 0 50px ${selectedFuel.glow}` }}>

                      <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                        <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs md:text-sm">3</span>
                        ข้อมูลการรับบริการ
                      </h3>

                      {/* Delivery Toggle */}
                      <div className="flex bg-[#0f1522] rounded-2xl p-1.5 border border-gray-800 mb-8">
                        <button
                          onClick={() => setDeliveryMode('delivery')}
                          className={`flex-1 flex-col sm:flex-row py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${deliveryMode === 'delivery' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'
                            }`}>
                          <span>🛵</span><span>เดลิเวอรี่ (Delivery)</span>
                        </button>
                        <button
                          onClick={() => setDeliveryMode('walkin')}
                          className={`flex-1 flex-col sm:flex-row py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${deliveryMode === 'walkin' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'
                            }`}>
                          <span>⛽</span><span>เติมที่สถานี (Walk-in)</span>
                        </button>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {deliveryMode === 'delivery' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-5"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-end pl-1">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">พิกัดจัดส่ง (Location)</label>
                                <button
                                  onClick={handleGetLocation}
                                  disabled={isLocating}
                                  className="text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  {isLocating ? (
                                    <><span className="w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>กำลังค้นหา...</>
                                  ) : (
                                    <><span>📍</span> ใช้ตำแหน่งปัจจุบัน</>
                                  )}
                                </button>
                              </div>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">🧭</span>
                                <input
                                  type="text"
                                  value={location}
                                  onChange={(e) => setLocation(e.target.value)}
                                  placeholder="พิมพ์ที่อยู่, จุดสังเกต หรือกดปุ่ม 📍"
                                  className={`w-full bg-[#0d121c] border ${isLocating ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-gray-700'} focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 text-white text-lg font-semibold outline-none transition-all placeholder:text-gray-600`}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">หมายเหตุ (Note to driver)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-4 text-xl">📝</span>
                                <textarea
                                  value={note}
                                  onChange={(e) => setNote(e.target.value)}
                                  placeholder="เช่น จอดรถสีขาวหน้าบ้าน, โทรหาเมื่อถึงปากซอย..."
                                  rows={3}
                                  className="w-full bg-[#0d121c] border border-gray-700 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 text-white text-lg font-semibold outline-none transition-all placeholder:text-gray-600 resize-none hidden-scrollbar"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-auto pt-6 md:pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between border-t border-gray-800/50 gap-2 sm:gap-4">
                        <div>
                          <p className="text-xs md:text-sm font-bold text-gray-500 mb-0 md:mb-1">สรุปคำสั่งซื้อ</p>
                          <p className="text-lg md:text-xl font-bold text-white">{selectedFuel.name} — {calculatedLiters.toFixed(2)} ลิตร</p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="hidden sm:block text-xs md:text-sm font-bold text-gray-500 mb-1">ยอดรวมชำระ</p>
                          <p className="text-3xl md:text-4xl font-black" style={{ color: selectedFuel.color }}>฿{calculatedBaht.toFixed(2)}</p>
                        </div>
                      </div>

                    </div>

                    {/* Action Button */}
                    <motion.div className="flex gap-3 md:gap-4 h-16 md:h-20 shrink-0">
                      <button onClick={() => setOrderStep(1)}
                        className="w-20 md:w-32 bg-[#0f1522] hover:bg-gray-800 text-gray-400 border border-gray-700 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-1 md:gap-2 transition-all">
                        <span>◀</span> <span className="hidden md:inline">กลับ</span>
                      </button>
                      <button
                        onClick={() => setShowSlip(true)}
                        disabled={deliveryMode === 'delivery' && location.trim() === ''}
                        className={`flex-1 rounded-xl md:rounded-2xl font-black text-sm md:text-2xl tracking-wide uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-2 md:gap-3 ${(deliveryMode === 'walkin' || location.trim() !== '')
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-95'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        {deliveryMode === 'delivery' && location.trim() === '' ? 'ระบุพิกัด' : '▶ เริ่มจ่ายน้ำมัน'}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── DISPENSING OVERLAY ── */}
              <AnimatePresence>
                {isDispensing && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed md:absolute inset-0 bg-[#05070a]/90 backdrop-blur-xl z-[60] flex flex-col items-center justify-center md:rounded-r-3xl border-0 md:border md:border-gray-800 p-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="w-48 h-48 rounded-full border-[6px] flex items-center justify-center relative mb-8"
                      style={{
                        borderColor: selectedFuel?.color,
                        boxShadow: `0 0 60px ${selectedFuel?.glow}, inset 0 0 30px ${selectedFuel?.glow}`
                      }}
                    >
                      <span className="text-5xl font-mono font-black">{progress}%</span>
                      {progress === 100 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center text-7xl">
                          ✅
                        </motion.div>
                      )}
                    </motion.div>

                    <h2 className="text-3xl font-black mb-2" style={{ color: selectedFuel?.color }}>
                      {progress < 100
                        ? (deliveryMode === 'delivery' ? 'กำลังดำเนินการขนส่ง...' : 'กำลังจ่ายน้ำมัน...')
                        : (deliveryMode === 'delivery' ? 'กำลังส่งไปหาคุณ 🛵' : 'จ่ายน้ำมันเสร็จสิ้น')}
                    </h2>
                    <p className="text-gray-400 font-mono text-xl mb-12">
                      {progress < 100
                        ? `${(calculatedLiters * (progress / 100)).toFixed(2)} / ${calculatedLiters.toFixed(2)} ลิตร`
                        : `${calculatedLiters.toFixed(2)} ลิตรเต็มจำนวน`
                      }
                    </p>

                    {progress === 100 ? (
                      <div className="flex flex-col gap-4 mt-8 w-full max-w-[280px]">
                        <button
                          onClick={() => onNavigate('history')}
                          className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-95 transition-all"
                        >
                          📋 ดูประวัติคำสั่งซื้อ
                        </button>
                        <button
                          onClick={() => {
                            setIsDispensing(false); setAmount(''); setSelectedFuelId(null); setProgress(0); setOrderStep(1); setLocation(''); setNote('');
                          }}
                          className="py-2 text-gray-500 hover:text-white font-bold transition-all text-sm"
                        >
                          สั่งน้ำมันรายการอื่นต่อ
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsDispensing(false); setAmount(''); setSelectedFuelId(null); setProgress(0); setOrderStep(1); setLocation(''); setNote('');
                        }}
                        className="opacity-50 hover:opacity-100 text-gray-400 font-bold underline underline-offset-4 mt-8"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── SLIP CONFIRMATION MODAL ── */}
              <AnimatePresence>
                {showSlip && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed md:absolute inset-0 bg-[#05070a]/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:rounded-r-3xl"
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                      className="bg-[#f8fafc] rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl overflow-hidden relative border border-gray-200 flex flex-col"
                    >
                      <div className="bg-white p-5 md:p-6 text-center border-b-[3px] border-dashed border-gray-300 relative shrink-0">
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#05070a]/80 backdrop-blur-md rounded-full border-r-[3px] border-t-[3px] border-dashed border-gray-300 rotate-45 hidden md:block" />
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#05070a]/80 backdrop-blur-md rounded-full border-l-[3px] border-t-[3px] border-dashed border-gray-300 -rotate-45 hidden md:block" />

                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center text-xl md:text-2xl mx-auto mb-2 md:mb-4 shadow-xl">🧾</div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">ตรวจสอบคำสั่งซื้อ</h2>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">โปรดตรวจสอบรายละเอียดก่อนกดยืนยัน</p>
                      </div>

                      <div className="p-5 md:p-8 space-y-3 md:space-y-4 font-mono text-sm md:text-base text-gray-700 bg-[#f8fafc] overflow-y-auto hidden-scrollbar flex-1">
                        <div className="flex justify-between border-b border-gray-200/60 pb-2 md:pb-3">
                          <span className="text-gray-500 font-sans">ประเภทน้ำมัน</span>
                          <span className="font-bold flex items-center gap-2">
                            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-inner" style={{ background: selectedFuel?.color }}></span>
                            {selectedFuel?.name}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200/60 pb-2 md:pb-3">
                          <span className="text-gray-500 font-sans">รูปแบบบริการ</span>
                          <span className="font-bold text-gray-900">{deliveryMode === 'delivery' ? '🛵 เดลิเวอรี่' : '⛽ เติมที่สถานี'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200/60 pb-2 md:pb-3">
                          <span className="text-gray-500 font-sans">ปริมาณ (L)</span>
                          <span className="font-bold text-gray-900">{calculatedLiters.toFixed(2)} ลิตร</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200/60 pb-2 md:pb-3">
                          <span className="text-gray-500 font-sans">ราคาต่อลิตร</span>
                          <span className="font-bold text-gray-900">฿{selectedFuel?.price.toFixed(2)}</span>
                        </div>

                        {deliveryMode === 'delivery' && (
                          <div className="border-b border-gray-200/60 pb-2 md:pb-3">
                            <span className="text-gray-500 font-sans block mb-1 md:mb-2">พิกัดจัดส่ง</span>
                            <span className="font-semibold text-[11px] md:text-xs leading-relaxed block break-words bg-white border border-gray-200 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm">{location}</span>
                            {note && <span className="text-[11px] md:text-xs text-gray-600 mt-1 md:mt-2 block px-1 font-sans"><span className="font-bold">หมายเหตุ:</span> {note}</span>}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between sm:items-end pt-2 md:pt-3 gap-1 md:gap-0">
                          <span className="text-gray-500 font-bold font-sans text-xs md:text-sm">ยอดรวมชำระ</span>
                          <span className="text-3xl md:text-4xl font-black text-[#dc2626] tracking-tighter text-right">฿{calculatedBaht.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="p-4 md:p-5 bg-white flex flex-row gap-2 md:gap-3 border-t border-gray-200 shrink-0">
                        <button
                          onClick={() => setShowSlip(false)}
                          className="flex-1 py-3 md:py-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors shadow-sm text-sm md:text-base"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => { setShowSlip(false); setIsDispensing(true); }}
                          className="flex-[2] py-3 md:py-3.5 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white rounded-lg md:rounded-xl font-black text-sm md:text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/30"
                        >
                          ยืนยัน สั่งซื้อเลย
                        </button>
                      </div>

                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
