import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../utils/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// --- กราฟเส้น (เทรนด์รายได้) สไตล์ Glass UI ---
const LineChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-400 font-bold">ยังไม่มีข้อมูล</div>
  const maxVal = Math.max(...data.map(d => d.revenue)) * 1.2 || 1
  const height = 180
  const width = 400
  const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d.revenue / maxVal) * height}`).join(' ')
  return (
    <div className="w-full h-48 mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <path d={`M 0 ${height} ${points} L ${width} ${height} Z`} fill="url(#blueGrad)" opacity="0.05" />
        <path d={`M ${points}`} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#fff" opacity="0" />
          </linearGradient>
        </defs>
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * width} cy={height - (d.revenue / maxVal) * height} r="3" fill="#dc2626" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold">
        <span>{data[0].date}</span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  )
}

// --- กราฟวงกลม (สัดส่วนน้ำมัน) สไตล์ Glass UI ---
const PieChart = ({ data, mode = 'revenue' }) => {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
  const total = data.reduce((acc, curr) => acc + (mode === 'revenue' ? curr.revenue : curr.liters), 0)
  let cumulativePercent = 0
  const getCoordinatesForPercent = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)]
  const colors = ['#dc2626', '#1e3a8a', '#fbbf24', '#10b981', '#6366f1']
  return (
    <div className="flex items-center gap-8 py-4">
      <div className="relative">
        <svg viewBox="-1 -1 2 2" className="w-40 h-40 -rotate-90">
          {data.map((slice, i) => {
            const value = mode === 'revenue' ? slice.revenue : slice.liters
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
            cumulativePercent += value / total
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
            const largeArcFlag = value / total > 0.5 ? 1 : 0
            return <path key={i} d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`} fill={colors[i % colors.length]} className="stroke-white stroke-[0.02]" />
          })}
        </svg>
      </div>
      <div className="space-y-3">
        {data.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <div className="text-[12px]">
              <span className="font-bold text-gray-900">{s.fuel_type}</span>
              <span className="text-gray-400 ml-2">{Math.round(((mode === 'revenue' ? s.revenue : s.liters) / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- ป็อปอัพรายละเอียดออเดอร์ ---
const OrderModal = ({ order, isOpen, onClose }) => {
  if (!order || !isOpen) return null
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-gray-900/10 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">ประเภทน้ำมัน</p><p className="font-bold text-gray-900">{order.fuel_type}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">จำนวนลิตร</p><p className="font-bold text-gray-900">{order.liters.toLocaleString()} ลิตร</p></div>
          </div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ที่อยู่จัดส่ง</p><p className="text-sm text-gray-600 leading-relaxed font-medium">{order.delivery_address || '-'}</p></div>

          {/* แสดงเหตุผลการยกเลิกถ้ามี */}
          {order.cancel_reason && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-[10px] font-bold text-red-400 uppercase mb-1">หมายเหตุการยกเลิก</p>
              <p className="text-sm text-red-600 font-medium">{order.cancel_reason}</p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">ยอดชำระสุทธิ</p><p className="text-3xl font-black text-[#dc2626]">฿{order.total_price.toLocaleString()}</p></div>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{order.status}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// --- มอดัลขอเหตุผลการยกเลิก ---
const CancelReasonModal = ({ isOpen, onClose, onConfirm, reason, setReason }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 italic">
          <h3 className="text-xl font-black text-gray-900 italic uppercase">ระบุเหตุผลการยกเลิก</h3>
          <p className="text-xs font-bold text-gray-400 mt-1">กรุณาระบุสาเหตุเพื่อให้ลูกค้าทราบถึงสถานะออเดอร์</p>
        </div>
        <div className="p-8 space-y-6">
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="เช่น สินค้าหมด, อยู่นอกพื้นที่บริการ..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold min-h-[120px] outline-none focus:ring-4 focus:ring-red-50 transition-all resize-none"
          />
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all text-sm uppercase">ยกเลิก</button>
            <button onClick={onConfirm} className="flex-[2] py-4 bg-[#dc2626] text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all text-sm uppercase">ยืนยันการยกเลิก</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// --- สถานะออเดอร์ภาษาไทย ---
const STATUS_TH = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  delivering: 'กำลังจัดส่ง',
  delivered: 'ส่งสำเร็จ',
  cancelled: 'ยกเลิกแล้ว'
}

// --- หน้าหลัก Admin Panel ---
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { logout } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [pieMode, setPieMode] = useState('revenue')

  // สถานะสำหรับการยกเลิกออเดอร์
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

   const [filterLogRole, setFilterLogRole] = useState('all') 
   const [filterAction, setFilterAction] = useState('')
   const [filterRole, setFilterRole] = useState('all') 
   const [selectedUsers, setSelectedUsers] = useState([])
   const [filterOrderStatus, setFilterOrderStatus] = useState('all') // หมวดหมู่สถานะออเดอร์
 
   useEffect(() => { loadData() }, [activeTab])
   
   // โหลดข้อมูลใหม่เมื่อมีการเปลี่ยนหมวดหมู่สถานะออเดอร์
   useEffect(() => {
     if (activeTab === 'orders') loadData()
   }, [filterOrderStatus])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'dashboard') { const d = await api.getAdminStats(); setStats(d.stats) }
      else if (activeTab === 'users') { const d = await api.getAdminUsers(); setUsers(d.users || []); setSelectedUsers([]); }
      else if (activeTab === 'orders') { 
        const params = filterOrderStatus !== 'all' ? `?status=${filterOrderStatus}` : ''
        const d = await api.getAdminOrders(params); 
        setOrders(d.orders || []) 
      }
      else if (activeTab === 'logs') { const d = await api.getActivityLogs(); setLogs(d.logs || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleUpdateStatus = async (id, s) => {
    if (s === 'cancelled') {
      setCancelOrderId(id);
      setCancelReason('');
      setIsCancelModalOpen(true);
      return;
    }

    try {
      await api.updateOrderStatus(id, s, '');
      loadData();
      console.log(`Order ${id} updated to ${s}`);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  }

  const confirmCancel = async () => {
    try {
      await api.updateOrderStatus(cancelOrderId, 'cancelled', cancelReason);
      setIsCancelModalOpen(false);
      loadData();
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  }

  const handleDeleteOrder = async (id) => {
    if (window.confirm('คุณต้องการลบออเดอร์นี้ทิ้งถาวร ใช่หรือไม่?')) {
      try { await api.deleteOrder(id); loadData() } catch (err) { alert(err.message) }
    }
  }

  const handleRoleChange = async (id, r) => { if (window.confirm('ยืนยันการเปลี่ยนระดับผู้ใช้?')) try { await api.changeUserRole(id, r); loadData() } catch (err) { alert(err.message) } }
  const handleBanUser = async (id, b) => { if (window.confirm('ยืนยันการเปลี่ยนสถานะ?')) try { await api.banUser(id, b); loadData() } catch (err) { alert(err.message) } }

  const handleDeleteSingleUser = async (id) => {
    if (window.confirm('คุณต้องการลบบัญชีผู้ใช้นี้ทิ้งถาวร ใช่หรือไม่?')) {
      try { await api.deleteUser(id); loadData() } catch (err) { alert(err.message) }
    }
  }

  const handleBulkDeleteUsers = async () => {
    if (window.confirm(`คุณต้องการลบผู้ใช้ที่เลือกจำนวน ${selectedUsers.length} รายการ ใช่หรือไม่?`)) {
      try { await api.bulkDeleteUsers(selectedUsers); loadData() } catch (err) { alert(err.message) }
    }
  }

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) setSelectedUsers(filteredUsers.map(u => u.id));
    else setSelectedUsers([]);
  }

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  // --- การกรองข้อมูล (Filters) ---
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  })

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const s = search.toLowerCase();
    return orders.filter(o => 
      (o.user_name || '').toLowerCase().includes(s) || 
      (o.id || '').toLowerCase().includes(s) ||
      (o.status || '').toLowerCase().includes(s)
    );
  }, [orders, search]);

  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    const s = search.toLowerCase();
    return logs.filter(l => {
      const action = (l.action || '').toLowerCase();
      const details = (l.details || '').toLowerCase();
      const userName = (l.user_name || '').toLowerCase();
      const userEmail = (l.user_email || '').toLowerCase();

      const matchesSearch = action.includes(s) || details.includes(s) || userName.includes(s) || userEmail.includes(s);
      const matchesRole = filterLogRole === 'all' || (l.user_role && l.user_role.toLowerCase() === filterLogRole.toLowerCase());
      const matchesAction = filterAction ? l.action === filterAction : true;
      
      return matchesSearch && matchesRole && matchesAction;
    });
  }, [logs, search, filterLogRole, filterAction]);

  const uniqueActions = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return [...new Set(logs.map(l => l?.action).filter(Boolean))];
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 md:h-20 flex items-center px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 pr-8">
            <img src="/logo.png" alt="FastOil Logo" className="h-8 md:h-10 w-auto object-contain" />
          </Link>

          <nav className="flex-1 flex gap-8 md:gap-12 overflow-x-auto no-scrollbar scroll-smooth px-8 md:px-12 border-l border-gray-100">
            {['dashboard', 'orders', 'users', 'logs'].map(t => (
              <button
                key={t} onClick={() => setActiveTab(t)}
                className={`text-sm md:text-base font-black transition-all relative whitespace-nowrap py-4 ${activeTab === t ? 'text-gray-900 border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-600'}`}>
                {t === 'dashboard' ? 'ภาพรวมระบบ' : t === 'orders' ? 'รายการสั่งซื้อ' : t === 'users' ? 'จัดการสมาชิก' : 'ประวัติกิจกรรม'}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="bg-orange-50 px-4 py-1.5 rounded-full flex items-center gap-2 border border-orange-100 hidden sm:flex">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest">โหมดผู้ดูแล</span>
            </div>
            <Link to="/" className="px-5 py-2 bg-white border border-gray-100 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
              🏠 <span className="hidden md:inline">กลับหน้าหลัก</span>
            </Link>
            <button onClick={logout} className="px-5 py-2 bg-[#dc2626] text-white font-black text-xs rounded-xl shadow-lg shadow-red-200/50 hover:bg-red-700 transition-all">ออกจากระบบ</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {activeTab === 'dashboard' ? 'แดชบอร์ดจัดการระบบ' : activeTab === 'orders' ? 'จัดการรายการสั่งซื้อ' : activeTab === 'users' ? 'จัดการฐานข้อมูลสมาชิก' : 'บันทึกเหตุการณ์ระบบ'}
            </h1>
            <p className="text-gray-400 font-medium mt-1">ขยายธุรกิจของคุณด้วยข้อมูลที่แม่นยำ</p>
          </div>
          {(activeTab === 'users' || activeTab === 'orders' || activeTab === 'logs') && (
            <input type="text" placeholder="ค้นหาข้อมูล..." value={search} onChange={e => setSearch(e.target.value)} className="bg-white border border-gray-100 p-3.5 px-6 rounded-2xl w-full md:w-80 outline-none focus:ring-4 focus:ring-red-50 font-bold text-sm shadow-sm" />
          )}
        </header>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-gray-300 font-bold uppercase tracking-widest text-sm">กำลังดึงข้อมูล...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

              {/* --- DASHBOARD TAB --- */}
              {activeTab === 'dashboard' && stats && (
                <div className="flex flex-col xl:flex-row gap-8">
                  {/* Left Column: Stats Cards */}
                  <div className="xl:w-80 space-y-8 flex-shrink-0">
                    {[
                      { l: 'ยอดขายสะสมทั้งหมด', v: `฿${stats.totalRevenue.toLocaleString()}`, c: 'text-red-600' },
                      { l: 'รายการสั่งซื้อรวม', v: `${stats.totalOrders.toLocaleString()} รายการ`, c: 'text-amber-500' },
                      { l: 'สมาชิกในระบบ', v: `${stats.totalUsers.toLocaleString()} คน`, c: 'text-blue-600' }
                    ].map((x, i) => (
                      <div key={i} className="glass-card p-10 rounded-[2.5rem] shadow-sm border border-white hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{x.l}</p>
                        <h3 className={`text-4xl font-black ${x.c} tracking-tighter`}>{x.v}</h3>
                      </div>
                    ))}
                    <div className="bg-gradient-to-br from-red-600 to-red-700 p-10 rounded-[2.5rem] text-white shadow-xl shadow-red-200">
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-2">สถานะเซิร์ฟเวอร์</p>
                      <p className="font-black text-2xl italic uppercase flex items-center gap-2">
                        ปกติ <span className="text-xl">✅</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Analytics & List */}
                  <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card p-8 rounded-[2rem] shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">แนวโน้มรายได้ (14 วัน)</h3>
                        <LineChart data={stats.dailyStats} />
                      </div>
                      <div className="glass-card p-8 rounded-[2rem] shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between">
                          <h3 className="font-bold text-gray-900">สัดส่วนเชื้อเพลิง</h3>
                          <button 
                            onClick={() => setPieMode(pieMode === 'revenue' ? 'liters' : 'revenue')} 
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-red-100 shadow-sm shadow-red-100/50"
                          >
                            สลับหน่วย: {pieMode === 'revenue' ? 'บาท' : 'ลิตร'}
                          </button>
                        </div>
                        <PieChart data={stats.fuelStats} mode={pieMode} />
                      </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2rem] shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-6">รายการสั่งซื้อล่าสุด</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50"><th className="pb-4">ลูกค้า</th><th className="pb-4">รายการ</th><th className="pb-4">สถานะ</th><th className="pb-4 text-right">ยอดรวม</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {stats.latestOrders.map(o => (
                              <tr key={o.id} onClick={() => setSelectedOrder(o)} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                                <td className="py-8 font-bold text-sm">{o.user_name}</td>
                                <td className="py-8 text-xs font-bold text-gray-400">{o.fuel_type}</td>
                                <td className="py-8"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : o.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{STATUS_TH[o.status] || o.status}</span></td>
                                <td className="py-8 text-right font-bold text-[#dc2626]">฿{o.total_price.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- USERS & ORDERS TAB --- */}
              {(activeTab === 'users' || activeTab === 'orders') && (
                <div className="glass-card rounded-[2.5rem] shadow-sm overflow-hidden p-4">

                  {/* แถบตัวกรองพิเศษสำหรับหน้าสมาชิก */}
                  {activeTab === 'users' && (
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl mb-4 border border-gray-100">
                      <div className="flex gap-4 items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">กรองตามระดับ</span>
                        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer">
                          <option value="all">ทั้งหมด</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      {selectedUsers.length > 0 && (
                        <button onClick={handleBulkDeleteUsers} className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-red-200">
                          ลบที่เลือก ({selectedUsers.length})
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── [🆕 หมวดหมู่แบ่งรายการ] ── */}
                  {activeTab === 'orders' && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                      {[
                        { id: 'all', l: '📄 ทั้งหมด', c: 'bg-gray-100 text-gray-600' },
                        { id: 'pending', l: '⏳ รอดำเนินการ', c: 'bg-blue-50 text-blue-600' },
                        { id: 'confirmed', l: '📋 ยืนยันแล้ว', c: 'bg-amber-50 text-amber-600' },
                        { id: 'delivering', l: '🛵 กำลังจัดส่ง', c: 'bg-purple-50 text-purple-600' },
                        { id: 'delivered', l: '✅ ส่งสำเร็จ', c: 'bg-emerald-50 text-emerald-600' },
                        { id: 'cancelled', l: '❌ ยกเลิกแล้ว', c: 'bg-red-50 text-red-600' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setFilterOrderStatus(tab.id)}
                          className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all border ${
                            filterOrderStatus === tab.id 
                              ? `${tab.c} border-current shadow-sm scale-110 -translate-y-0.5` 
                              : 'bg-white border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200'
                          }`}
                        >
                          {tab.l}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <tr>
                          {activeTab === 'users' && (
                            <th className="px-6 py-8 w-12">
                              <input type="checkbox" onChange={handleSelectAllUsers} checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length} className="w-4 h-4 rounded text-red-500 border-gray-300 cursor-pointer" />
                            </th>
                          )}
                          <th className="px-6 py-8">{activeTab === 'users' ? 'สมาชิก' : 'เลขออเดอร์'}</th>
                          <th className="px-6 py-8">{activeTab === 'users' ? 'ข้อมูลติดต่อ' : 'รายละเอียด'}</th>
                          <th className="px-6 py-8">สถานะ</th>
                          <th className="px-6 py-8">ระดับ/สถานะ</th>
                          <th className="px-6 py-8 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {activeTab === 'users' ? filteredUsers.map(u => (
                          <tr key={u.id} className={`transition-all ${selectedUsers.includes(u.id) ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}>
                            <td className="px-6 py-8">
                              <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleSelectUser(u.id)} className="w-4 h-4 rounded text-red-500 border-gray-300 cursor-pointer" />
                            </td>
                            <td className="px-6 py-8 flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#dc2626] rounded-full flex items-center justify-center text-white font-bold text-xs">{u.name.substring(0, 1).toUpperCase()}</div>
                              <span className="font-bold text-sm">{u.name}</span>
                            </td>
                            <td className="px-6 py-8 text-sm font-medium text-gray-500">{u.email}</td>
                            <td className="px-6 py-8"><span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${u.is_banned ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>{u.is_banned ? 'ถูกระงับ' : 'ปกติ'}</span></td>
                            <td className="px-6 py-8"><select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} className="bg-gray-50/50 p-2 rounded-xl text-[10px] font-bold outline-none border-none uppercase cursor-pointer">{['user', 'admin'].map(r => (<option key={r} value={r}>{r === 'admin' ? 'ผู้ดูแล (Admin)' : 'ผู้ใช้ (User)'}</option>))}</select></td>
                            <td className="px-6 py-8 text-right space-x-2">
                              <button onClick={() => handleBanUser(u.id, !u.is_banned)} className={`text-[9px] font-bold px-4 py-2 rounded-xl border transition-all ${u.is_banned ? 'bg-white' : 'bg-orange-50 text-orange-500 border-orange-50 hover:bg-orange-500 hover:text-white'}`}>{u.is_banned ? 'ปลดระงับ' : 'ระงับ'}</button>
                              <button onClick={() => handleDeleteSingleUser(u.id)} className="text-[9px] font-bold px-4 py-2 rounded-xl border bg-red-50 text-red-500 border-red-50 hover:bg-red-600 hover:text-white transition-all">ลบ</button>
                            </td>
                          </tr>
                        )) : filteredOrders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-all">
                            <td className="px-6 py-8 font-bold text-xs text-gray-300">#{o.id.substring(0, 12).toUpperCase()}</td>
                            <td className="px-6 py-8"><p className="font-bold text-sm">{o.user_name}</p><p className="text-[10px] font-bold text-gray-400 capitalize">{o.fuel_type} • {o.liters}L</p></td>
                            <td className="px-6 py-8 font-bold text-[#dc2626]">฿{o.total_price.toLocaleString()}</td>
                            <td className="px-6 py-8">
                              <select value={o.status} onChange={e => handleUpdateStatus(o.id, e.target.value)} className="bg-gray-50/50 p-2 rounded-xl text-[10px] font-bold outline-none border-none uppercase cursor-pointer">
                                {Object.entries(STATUS_TH).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
                              </select>
                            </td>
                            <td className="px-6 py-8 text-right space-x-2">
                              <button onClick={() => setSelectedOrder(o)} className="text-[10px] font-black text-blue-600 bg-blue-50 border-none px-5 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">รายละเอียด</button>
                              <button onClick={() => handleDeleteOrder(o.id)} className="text-[10px] font-black text-red-500 bg-red-50 border-none px-5 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">ลบ</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- LOGS TAB --- */}
              {activeTab === 'logs' && (
                <div className="glass-card rounded-[2.5rem] shadow-sm p-8 space-y-6">
                  {/* Filter Controls */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">

                    {/* [แก้ไขแล้ว] Dropdown กรองตาม Role */}
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">กรองตามระดับ (ระดับผู้ใช้)</p>
                      <select
                        value={filterLogRole}
                        onChange={e => setFilterLogRole(e.target.value)}
                        className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-red-50 transition-all cursor-pointer"
                      >
                        <option value="all">ทั้งหมด (ทุกระดับ)</option>
                        <option value="user">ผู้ใช้ทั่วไป (User)</option>
                        <option value="admin">ผู้ดูแล (Admin)</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">ประเภทเหตุการณ์</p>
                      <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-red-50 transition-all cursor-pointer"
                      >
                        <option value="">ทั้งหมด (ทุกประเภท)</option>
                        {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  {(!logs || logs.length === 0) ? (
                    <div className="py-20 text-center text-gray-300">
                      <span className="text-4xl mb-4 block opacity-30">📋</span>
                      <p className="font-bold">ยังไม่มีรายการบันทึก</p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="py-20 text-center text-gray-300">
                      <span className="text-4xl mb-4 block opacity-30">🔍</span>
                      <p className="font-bold">ไม่พบรายการที่ตรงตามเงื่อนไข (ลองเปลี่ยนคำค้นหา)</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredLogs.map((l, i) => {
                        if (!l) return null;
                        const act = l.action || 'Unknown Action';
                        const isOrder = act.includes('ORDER');
                        const isBan = act.includes('BAN');
                        const isDelete = act.includes('DELETE');
                        const isUser = act.includes('USER');
                        
                        return (
                          <div key={i} className="flex gap-6 items-center border-b border-gray-50 pb-6 last:border-0 hover:bg-gray-50/30 transition-colors p-2 rounded-2xl">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm ${
                              isOrder ? 'bg-blue-50 text-blue-500' : isBan ? 'bg-orange-50 text-orange-500' : isDelete ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                            }`}>
                              {isOrder ? '🛒' : isUser ? '👤' : (isDelete || isBan) ? '🚫' : '🔧'}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base">{act}</h4>
                                <span className="text-[10px] font-bold text-gray-400">
                                  {l.created_at ? new Date(l.created_at).toLocaleString('th-TH') : '-'}
                                </span>
                              </div>
                              <p className="text-xs md:text-sm font-medium text-gray-500">{l.details || 'ไม่มีรายละเอียด'}</p>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> โดย: {l.user_name || 'ระบบ'}</span>
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> IP: {l.ip_address || 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Modals */}
      <OrderModal order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
      <CancelReasonModal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        onConfirm={confirmCancel}
        reason={cancelReason}
        setReason={setReason => setCancelReason(setReason)}
      />
    </div>
  )
}