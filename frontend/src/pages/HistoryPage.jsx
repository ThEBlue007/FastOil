import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const STATUS_MAP = {
  pending: { label: 'รอการยืนยัน', color: 'bg-amber-50 text-amber-600', icon: '⏳' },
  confirmed: { label: 'รับคำสั่งซื้อแล้ว', color: 'bg-blue-50 text-blue-600', icon: '📋' },
  delivering: { label: 'กำลังจัดส่ง', color: 'bg-purple-50 text-purple-600', icon: '🛵' },
  delivered: { label: 'สำเร็จ', color: 'bg-green-50 text-green-600', icon: '✅' },
  cancelled: { label: 'ยกเลิก', color: 'bg-red-50 text-red-600', icon: '❌' }
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ✅ รับ Props ชื่อ onTrack เข้ามา
export default function HistoryPage({ onTrack }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await api.getOrders();
        setOrders(res.orders || res);
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 md:h-20 flex items-center px-4 md:px-8 mb-8">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#dc2626] rounded-xl flex items-center justify-center text-white font-black text-xs">F</div>
            <div className="flex font-black text-xl italic tracking-tighter text-red-500">Fast<span className="text-amber-500">Oil</span></div>
          </Link>
          <button onClick={() => navigate('/order')} className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
            <span>+</span> สั่งน้ำมันเพิ่ม
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-blue-950 tracking-tight">ประวัติการสั่งซื้อ</h1>
          <p className="text-gray-400 font-medium mt-1">รายการสั่งซื้อทั้งหมดของคุณ</p>
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-gray-300 font-bold uppercase tracking-widest text-sm">กำลังดึงข้อมูล...</div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600', icon: '🔹' };
              const isTrackable = ['pending', 'confirmed', 'delivering'].includes(order.status);

              return (
                <motion.div key={order.id} variants={fadeUp} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-gray-100 text-2xl flex-shrink-0">⛽</div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{order.fuel_type}</h3>
                        <p className="text-xs text-gray-400 font-medium">#ID: {order.id.substring(0, 8).toUpperCase()} • {new Date(order.created_at || order.date).toLocaleString('th-TH')}</p>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${statusInfo.color}`}>
                          <span>{statusInfo.icon}</span> {statusInfo.label}
                        </span>
                        {/* 🚩 แสดงเหตุผลการยกเลิกที่นี่ */}
                        {order.status === 'cancelled' && order.cancel_reason && (
                          <span className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 flex items-center gap-1 animate-pulse">
                            💔 {order.cancel_reason}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {isTrackable && (
                          <button
                            // ✅ เมื่อกดปุ่ม ให้ส่งข้อมูลออเดอร์กลับไปที่ App.jsx
                            onClick={() => onTrack({
                              id: order.id.substring(0, 8).toUpperCase(),
                              details: `${order.fuel_type} — ${order.liters} ลิตร`,
                              status: order.status,
                              cancel_reason: order.cancel_reason // ส่งเหตุผลไปด้วยเพื่อให้วิดเจ็ตแสดงผล
                            })}
                            className="text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-full hover:bg-amber-100 transition-colors uppercase tracking-widest shadow-sm"
                          >
                            📍 ติดตามสถานะ
                          </button>
                        )}
                        <p className="text-2xl font-black text-[#dc2626]">฿{Number(order.total_price || order.price).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                    <p className="flex items-center gap-1.5 truncate pr-4"><span className="text-red-400">📍</span> {order.delivery_address || '-'}</p>
                    <p className="flex-shrink-0 font-bold text-gray-400">{order.liters} ลิตร</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
      {/* ❌ ลบส่วน Floating Widget ที่นี่ทิ้งไป เพราะมันจะไปขึ้นที่ App.jsx แทนแล้ว */}
    </div>
  );
}