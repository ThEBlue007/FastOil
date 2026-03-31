import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import riderImg from '../assets/hero/rider.png'
import news1Img from '../assets/news/news1.png'
import news2Img from '../assets/news/news2.png'
import news3Img from '../assets/news/news3.png'

// ── Data ──────────────────────────────────────────────────────────────────────
const TRACKING_STEPS = [
    { label: 'รับคำสั่งซื้อ', icon: '📦', done: true, active: false },
    { label: 'เตรียมน้ำมัน', icon: '⛽', done: true, active: false },
    { label: 'คนขับรับงาน', icon: '🏍️', done: true, active: false },
    { label: 'กำลังจัดส่ง', icon: '📍', done: false, active: true },
    { label: 'ส่งสำเร็จ', icon: '✅', done: false, active: false },
]

const NEWS = [
    {
        img: news1Img,
        cat: 'พลังงาน',
        date: '31 มี.ค. 2569',
        title: 'ราคาน้ำมันโลกปรับลดลง หลังซาอุดีอาระเบียประกาศขยายกำลังการผลิตเพิ่ม 5 ล้านบาร์เรลต่อวัน',
        excerpt: 'ตลาดน้ำมันโลกปรับตัวลดลงต่อเนื่อง หลังซาอุฯ ประกาศขยายกำลังผลิต ส่งผลราคาดิบลดกว่า 2%',
    },
    {
        img: news2Img,
        cat: 'ยานยนต์',
        date: '30 มี.ค. 2569',
        title: 'รถ EV ไทยยอดขายพุ่ง 40% นักวิเคราะห์ชี้ตลาดน้ำมันยังแข็งแกร่ง ครองใจผู้บริโภค 78%',
        excerpt: 'แม้รถไฟฟ้าเติบโตเร็ว แต่รถสันดาปยังครองตลาด ความต้องการน้ำมันยังคงสูงอย่างต่อเนื่อง',
    },
    {
        img: news3Img,
        cat: 'FastOil',
        date: '29 มี.ค. 2569',
        title: 'FastOil เปิดตัว AI ส่งน้ำมันอัจฉริยะ ครอบคลุม 75 จังหวัดทั่วไทย ภายในสิ้นปี 2569',
        excerpt: 'FastOil ประกาศขยายบริการทั่วประเทศ ด้วยระบบ AI คาดการณ์เวลาส่งแม่นยำสูงสุด 95%',
    },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } }
const stagger = { show: { transition: { staggerChildren: 0.09 } } }

// ── Sub-components ────────────────────────────────────────────────────────────
function TrackingCard() {
    return (
        <div className="glass-card w-full rounded-2xl p-5"
            style={{ boxShadow: '0 20px 50px rgba(30,58,138,0.10), 0 4px 10px rgba(0,0,0,0.04)' }}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center shadow-sm shadow-amber-200 flex-shrink-0">
                    <span className="text-base">⛽</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-blue-950 text-sm">คำสั่งซื้อ #4821</p>
                    <p className="text-gray-400 text-xs truncate">แก๊สโซฮอล์ 95 — 40 ลิตร</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                    กำลังจัดส่ง
                </span>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-5">
                {TRACKING_STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${s.done ? 'bg-green-500 text-white shadow-sm shadow-green-200' :
                                s.active ? 'bg-amber-400 text-white animate-pulse shadow-sm shadow-amber-200' :
                                    'bg-gray-100 text-gray-400'
                            }`}>
                            {s.done ? '✓' : s.active ? '●' : '○'}
                        </div>
                        <span className={`text-sm flex-1 ${s.done ? 'text-gray-700 font-medium' :
                                s.active ? 'text-amber-700 font-bold' :
                                    'text-gray-400'
                            }`}>{s.label}</span>
                        {s.active && (
                            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                                กำลังดำเนินการ
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-400 text-xs">คาดว่าถึง</span>
                <span className="text-blue-950 font-black text-2xl">~12 นาที</span>
            </div>
        </div>
    )
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ onNavigate }) {
    return (
        <section className="relative overflow-hidden pt-14 pb-20 px-4"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #fffbeb 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/60 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-100/50 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* ── Left: Text ── */}
                <motion.div initial="hidden" animate="show" variants={stagger}>
                    {/* Badge */}
                    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        <span className="text-amber-700 text-sm font-semibold">พร้อมจัดส่งตลอด 24 ชั่วโมง</span>
                    </motion.div>

                    {/* H1 */}
                    <motion.h1 variants={fadeUp}
                        className="text-4xl md:text-5xl xl:text-6xl font-black text-blue-950 leading-tight mb-5">
                        เติมน้ำมัน<br />
                        <span className="text-red-600">ส่งถึงที่</span><br />
                        รวดเร็ว ปลอดภัย
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p variants={fadeUp} className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                        บริการจัดส่งน้ำมันนอกสถานที่ ส่งตรงถึงบ้านหรือที่ทำงาน ภายใน 30 นาที รองรับทุกประเภทน้ำมัน
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-5">
                        <motion.button id="hero-order-btn"
                            whileHover={{ scale: 1.04, boxShadow: '0 10px 30px rgba(251,191,36,0.45)' }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onNavigate('order')}
                            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-7 py-3.5 rounded-2xl text-base shadow-lg shadow-amber-200/60 transition-colors">
                            <span>⛽</span> สั่งซื้อเลย
                        </motion.button>
                        <motion.button id="hero-learn-btn"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onNavigate('support')}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3.5 rounded-2xl text-base border border-gray-200 shadow-sm transition-colors">
                            เรียนรู้เพิ่มเติม
                        </motion.button>
                    </motion.div>

                    {/* Speed badge */}
                    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-8">
                        <span className="text-red-500 text-sm">⚡</span>
                        <span className="text-red-700 text-sm font-semibold">30 นาที ส่งไวที่สุด</span>
                    </motion.div>

                    {/* Stats */}
                    <motion.div variants={fadeUp} className="flex items-center gap-8">
                        <div>
                            <p className="text-2xl font-black text-blue-950">10,000+</p>
                            <p className="text-gray-400 text-sm">ลูกค้า</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div>
                            <p className="text-2xl font-black text-blue-950">50+ เขต</p>
                            <p className="text-gray-400 text-sm">พื้นที่บริการ</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── Right: Rider + Card ── */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65, delay: 0.2 }}
                    className="flex flex-col items-center gap-5">
                    {/* 3D Rider */}
                    <div className="relative flex justify-center">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-72 h-72 bg-amber-200/50 rounded-full blur-3xl" />
                        </div>
                        <img src={riderImg} alt="FastOil Delivery Rider"
                            className="relative z-10 w-56 h-56 md:w-72 md:h-72 xl:w-80 xl:h-80 object-contain"
                            style={{ filter: 'drop-shadow(0 24px 32px rgba(0,0,0,0.14))' }} />
                    </div>
                    {/* Glassmorphism tracking card */}
                    <TrackingCard />
                </motion.div>
            </div>
        </section>
    )
}

// ── Fuel Prices Section ───────────────────────────────────────────────────────
function FuelPricesSection({ fuels, loading, lastUpdate }) {
    return (
        <section className="py-16 bg-white px-4 relative">
            <div className="max-w-7xl mx-auto">
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
                    className="text-center mb-10">
                    <motion.h2 variants={fadeUp} className="text-3xl font-black text-blue-950 flex items-center justify-center gap-3">
                        ราคาน้ำมัน PTT วันนี้
                        {loading && <span className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>}
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-gray-400 mt-2 text-sm">
                        {lastUpdate ? `อัปเดตข้อมูลสดจาก Kapook.com: ${lastUpdate}` : 'กำลังดึงข้อมูลเรียลไทม์...'}
                    </motion.p>
                </motion.div>

                <motion.div initial="hidden" animate="show" variants={stagger}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {fuels.map((f) => (
                        <motion.div key={f.id} variants={fadeUp}
                            whileHover={{ y: -8, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' }}
                            className="bg-white rounded-2xl p-5 cursor-pointer transition-all border border-gray-100 relative overflow-hidden group"
                            style={{ borderTop: `4px solid ${f.color}`}}>
                            
                            <p className="text-sm font-bold text-gray-500 mb-4">{f.name}</p>
                            
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">วันนี้</p>
                                    <p className="text-4xl font-black text-blue-950">{(f.price || 0).toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">พรุ่งนี้</p>
                                    <p className={`text-2xl font-black ${f.tomorrow > f.price ? 'text-red-500' : f.tomorrow < f.price ? 'text-green-500' : 'text-gray-400'}`}>
                                        {(f.tomorrow || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${f.change < 0 ? 'bg-green-50 text-green-700' : f.change > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {f.change < 0 ? `▼ ลดลง ${Math.abs(f.change).toFixed(2)} บาท` : f.change > 0 ? `▲ ขึ้น ${f.change.toFixed(2)} บาท` : '— ราคาคงพรุ่งนี้'}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">บาท/ลิตร</span>
                            </div>

                            {/* Decorative background glow */}
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: f.color }} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// ── News Section ──────────────────────────────────────────────────────────────
function NewsSection() {
    return (
        <section className="py-16 bg-slate-50 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                    className="text-3xl font-black text-blue-950 mb-10">
                    ข่าวสารพลังงานล่าสุด 🗞️
                </motion.h2>
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {NEWS.map((n, i) => (
                        <motion.article key={i} variants={fadeUp} whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-shadow hover:shadow-xl"
                            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <div className="h-44 overflow-hidden bg-gray-100">
                                <img src={n.img} alt={n.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{n.cat}</span>
                                    <span className="text-gray-400 text-xs">{n.date}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 leading-snug text-sm mb-2 line-clamp-3">{n.title}</h3>
                                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{n.excerpt}</p>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner({ onNavigate }) {
    return (
        <section className="py-16 px-4 text-center"
            style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)' }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
                <motion.h2 variants={fadeUp} className="text-3xl font-black text-white mb-3">
                    พร้อมสั่งน้ำมันแล้วหรือยัง?
                </motion.h2>
                <motion.p variants={fadeUp} className="text-red-100 mb-8 text-lg">
                    ไม่ต้องเสียเวลาออกไปปั๊ม — เราส่งให้ถึงที่
                </motion.p>
                <motion.button variants={fadeUp} id="cta-bottom-order"
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(251,191,36,0.5)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onNavigate('order')}
                    className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-10 py-4 rounded-2xl text-lg transition-colors shadow-lg">
                    ⛽ สั่งซื้อเลย
                </motion.button>
            </motion.div>
        </section>
    )
}

// ── Page Export ───────────────────────────────────────────────────────────────
export default function Home({ onNavigate, fuels, loading, lastUpdate }) {
    return (
        <div>
            <HeroSection onNavigate={onNavigate} />
            <FuelPricesSection fuels={fuels} loading={loading} lastUpdate={lastUpdate} />
            <NewsSection />
            <CTABanner onNavigate={onNavigate} />
        </div>
    )
}
