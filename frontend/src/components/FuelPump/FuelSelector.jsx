import { motion } from 'framer-motion'

const FUELS = [
  {
    id: 'gasohol91',
    label: 'แก๊สโซฮอล์ 91',
    shortLabel: '91',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.45)',
    pricePerLiter: 35.94,
    octane: '91 RON',
    tagline: 'เบนซินมาตรฐาน',
  },
  {
    id: 'gasohol95',
    label: 'แก๊สโซฮอล์ 95',
    shortLabel: '95',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.12)',
    border: 'rgba(220,38,38,0.45)',
    pricePerLiter: 38.44,
    octane: '95 RON',
    tagline: 'เบนซินพรีเมียม',
  },
  {
    id: 'e20',
    label: 'แก๊สโซฮอล์E20',
    shortLabel: 'E20',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.45)',
    pricePerLiter: 33.34,
    octane: '91 RON + เอทานอล 20%',
    tagline: 'น้ำมันผสมเอทานอล',
  },
  {
    id: 'e85',
    label: 'แก๊สโซฮอล์ E85',
    shortLabel: 'E85',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.45)',
    pricePerLiter: 28.66,
    octane: 'เอทานอล 85%',
    tagline: 'เชื้อเพลิงยืดหยุ่น',
  },
  {
    id: 'diesel',
    label: 'ดีเซล B7',
    shortLabel: 'B7',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.45)',
    pricePerLiter: 29.94,
    octane: 'ยูโร 5',
    tagline: 'ดีเซลกำมะถันต่ำ',
  },
]

export { FUELS }

export default function FuelSelector({ selectedFuel, onSelect }) {
  return (
    <div className="w-full">
      <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
        เลือกประเภทน้ำมัน
      </p>
      <div className="flex flex-wrap gap-2">
        {FUELS.map((fuel) => {
          const isActive = selectedFuel?.id === fuel.id
          return (
            <motion.button
              key={fuel.id}
              id={`fuel-btn-${fuel.id}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(fuel)}
              className="relative flex-1 min-w-[72px] py-2.5 px-3 rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              style={{
                background: isActive ? fuel.bg : 'rgba(0,0,0,0.02)',
                border: `1.5px solid ${isActive ? fuel.border : 'rgba(0,0,0,0.06)'}`,
                color: isActive ? fuel.color : '#64748b',
                boxShadow: isActive
                  ? `0 0 18px ${fuel.bg}, 0 2px 8px rgba(0,0,0,0.05)`
                  : 'none',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="fuel-active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: fuel.bg }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 block text-center">
                {fuel.shortLabel}
              </span>
              <span
                className="relative z-10 block text-center text-[10px] font-bold mt-0.5"
                style={{ color: isActive ? fuel.color : '#94a3b8', opacity: 0.9 }}
              >
                ฿{fuel.pricePerLiter.toFixed(2)}/ล.
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* แถบข้อมูลน้ำมันที่เลือก */}
      {selectedFuel && (
        <motion.div
          key={selectedFuel.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-3 rounded-xl px-4 py-2.5"
          style={{
            background: selectedFuel.bg,
            border: `1px solid ${selectedFuel.border}`,
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: selectedFuel.color,
              boxShadow: `0 0 8px ${selectedFuel.color}`,
            }}
          />
          <div className="flex-1 text-left">
            <span
              className="text-sm font-bold"
              style={{ color: selectedFuel.color }}
            >
              {selectedFuel.label}
            </span>
            <span className="text-xs text-gray-500 font-medium ml-2">
              — {selectedFuel.tagline}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-mono font-bold">
            {selectedFuel.octane}
          </span>
        </motion.div>
      )}
    </div>
  )
}
