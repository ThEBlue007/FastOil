import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../utils/api'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
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
    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 py-4">
      <div className="relative">
        <svg viewBox="-1 -1 2 2" className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90">
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
      <div className="grid grid-cols-2 sm:flex sm:flex-col gap-3 w-full sm:w-auto">
        {data.map((s, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <div className="text-[11px] sm:text-[12px] truncate">
              <span className="font-bold text-gray-900 block sm:inline">{s.fuel_type}</span>
              <span className="text-gray-400 sm:ml-2 font-black">{Math.round(((mode === 'revenue' ? s.revenue : s.liters) / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- ป็อปอัพรายละเอียดออเดอร์ ---
const OrderModal = ({ order, isOpen, onClose, STATUS_TH }) => {
  if (!order || !isOpen) return null
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm shadow-2xl" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
        <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">รายละเอียดคำสั่งซื้อ</h3>
          <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center transition-all">✕</button>
        </div>
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ประเภทน้ำมัน</p><p className="font-black text-lg text-gray-900">{order.fuel_type}</p></div>
            <div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">จำนวน</p><p className="font-black text-lg text-gray-900">{order.liters.toLocaleString()} ลิตร</p></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ลูกค้า</p>
                <p className="text-sm font-bold text-gray-700">{order.user_name || 'ไม่ระบุ'}</p>
             </div>
             <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">เวลาสั่งซื้อ</p>
                <p className="text-[11px] font-bold text-gray-700">{new Date(order.created_at).toLocaleString('th-TH')}</p>
             </div>
          </div>

          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ที่อยู่จัดส่ง</p><p className="text-sm text-gray-600 leading-relaxed font-semibold bg-gray-50/30 p-4 rounded-2xl border border-dashed border-gray-200">{order.delivery_address || '-'}</p></div>

          {order.cancel_reason && (
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">หมายเหตุการยกเลิก</p>
              <p className="text-sm text-red-600 font-bold">{order.cancel_reason}</p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ยอดชำระสุทธิ</p><p className="text-4xl font-black text-[#dc2626] tracking-tighter">฿{order.total_price.toLocaleString()}</p></div>
            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{STATUS_TH[order.status] || order.status}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const CancelReasonModal = ({ isOpen, onClose, onConfirm, reason, setReason }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight text-center">ระบุเหตุผลการยกเลิก</h3>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="เช่น สินค้าหมด, ลูกค้าขอยกเลิก..." className="w-full h-32 p-5 bg-gray-50 border border-gray-100 rounded-2xl mb-6 outline-none focus:ring-4 focus:ring-red-100 font-bold transition-all" />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition-all text-sm uppercase tracking-widest">ยกเลิก</button>
          <button onClick={onConfirm} disabled={!reason} className="flex-1 py-3.5 bg-[#dc2626] text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 text-sm uppercase tracking-widest">ยืนยันการยกเลิก</button>
        </div>
      </motion.div>
    </div>
  )
}

const STATUS_TH = { pending: 'รอดำเนินการ', confirmed: 'ยืนยันแล้ว', delivering: 'กำลังจัดส่ง', delivered: 'ส่งสำเร็จ', cancelled: 'ยกเลิกแล้ว' }

export default function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'
  
  const setActiveTab = (tab) => {
    setSearchParams({ tab })
  }

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { logout } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [pieMode, setPieMode] = useState('revenue')
  const location = useLocation()

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  const [filterLogRole, setFilterLogRole] = useState('all') 
  const [filterAction, setFilterAction] = useState('')
  const [filterRole, setFilterRole] = useState('all') 
  const [selectedUsers, setSelectedUsers] = useState([])
  const [filterOrderStatus, setFilterOrderStatus] = useState('all')

  useEffect(() => { loadData() }, [activeTab])
  useEffect(() => { if (activeTab === 'orders') loadData() }, [filterOrderStatus])

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

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม', icon: '📊' },
    { id: 'orders', label: 'ออเดอร์', icon: '🛒' },
    { id: 'users', label: 'สมาชิก', icon: '👥' },
    { id: 'logs', label: 'บันทึก', icon: '📋' }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 pb-24 md:pb-8">

      {/* ── TOP HEADER (Minimal for Mobile) ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 sm:h-20 flex items-center px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="FastOil Logo" className="h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation Tab */}
          <nav className="hidden md:flex gap-8 lg:gap-12 flex-1 justify-center border-l border-gray-100 ml-8 px-8">
            {menuItems.map(m => (
              <button
                key={m.id} onClick={() => setActiveTab(m.id)}
                className={`text-sm lg:text-base font-black transition-all relative whitespace-nowrap py-4 ${activeTab === m.id ? 'text-gray-900 border-b-2 border-[#dc2626]' : 'text-gray-400 hover:text-gray-600'}`}>
                {m.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="p-2 sm:px-4 sm:py-2 bg-white border border-gray-100 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
              🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
            </Link>
            <button onClick={logout} className="p-2 sm:px-4 sm:py-2 bg-[#dc2626] text-white font-black text-xs rounded-xl shadow-lg shadow-red-200/50 hover:bg-red-700 transition-all flex items-center gap-2">
              <span className="sm:hidden">🚪</span>
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-[100] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 sm:h-20">
          {menuItems.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:bg-gray-50 transition-all relative overflow-hidden"
            >
              <span className={`text-xl sm:text-2xl transition-all ${activeTab === m.id ? 'scale-125' : 'grayscale opacity-40'}`}>
                {m.icon}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === m.id ? 'text-[#dc2626]' : 'text-gray-400'}`}>
                {m.label}
              </span>
              {activeTab === m.id && (
                <motion.div layoutId="admNavInd" className="absolute top-0 w-12 h-1 bg-[#dc2626] rounded-b-full shadow-lg shadow-red-200" />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Page Title & Search */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {activeTab === 'dashboard' ? 'แดชบอร์ดจัดการระบบ' : activeTab === 'orders' ? 'รายการสั่งซื้อ' : activeTab === 'users' ? 'จัดการสมาชิก' : 'ประวัติกิจกรรม'}
            </h1>
            <p className="text-gray-400 font-bold mt-1 text-xs sm:text-sm">FastOil Administrative Portal</p>
          </div>
          {(activeTab === 'users' || activeTab === 'orders' || activeTab === 'logs') && (
            <div className="relative w-full sm:w-80">
              <input type="text" placeholder="🔍 ค้นหาข้อมูล..." value={search} onChange={e => setSearch(e.target.value)} className="bg-white border border-gray-100 p-3.5 px-6 rounded-2xl w-full outline-none focus:ring-4 focus:ring-red-50 font-bold text-sm shadow-sm transition-all" />
            </div>
          )}
        </header>

        {loading ? (
          <div className="py-20 text-center animate-pulse">
             <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">ขอเวลาเตรียมข้อมูลสักครู่...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">

              {/* --- DASHBOARD TAB --- */}
              {activeTab === 'dashboard' && stats && (
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  {/* Left Column: Stats Cards */}
                  <div className="lg:w-72 xl:w-80 space-y-4 sm:space-y-6 flex-shrink-0">
                    {[
                      { l: 'ยอดขายสะสม', v: `฿${stats.totalRevenue.toLocaleString()}`, c: 'text-[#dc2626]', icon: '💰' },
                      { l: 'ออเดอร์รวม', v: stats.totalOrders, c: 'text-amber-500', icon: '📦' },
                      { l: 'สมาชิก', v: stats.totalUsers, c: 'text-blue-600', icon: '👥' }
                    ].map((x, i) => (
                      <div key={i} className="glass-card p-6 sm:p-8 rounded-[2rem] shadow-sm border border-white relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute -right-4 -top-4 text-6xl opacity-[0.03] group-hover:scale-125 transition-transform">{x.icon}</div>
                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{x.l}</p>
                        <h3 className={`text-3xl sm:text-4xl font-black ${x.c} tracking-tighter`}>{x.v}</h3>
                      </div>
                    ))}
                    <div className="bg-gradient-to-br from-[#dc2626] to-[#b91c1c] p-6 sm:p-8 rounded-[2rem] text-white shadow-xl shadow-red-200 relative overflow-hidden group">
                       <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mb-8 transition-transform group-hover:scale-150" />
                       <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mb-1">เซิร์ฟเวอร์</p>
                       <p className="font-black text-xl italic uppercase flex items-center gap-2">ออนไลน์ ✅</p>
                    </div>
                  </div>

                  {/* Right Column: Analytics & Latest */}
                  <div className="flex-1 space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                      <div className="glass-card p-6 sm:p-8 rounded-[2rem] shadow-sm">
                        <h3 className="font-black text-gray-900 border-b border-gray-50 pb-4 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">📈 แนวโน้มรายได้</h3>
                        <LineChart data={stats.dailyStats} />
                      </div>
                      <div className="glass-card p-6 sm:p-8 rounded-[2rem] shadow-sm flex flex-col h-full bg-white/40">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">⛽ สัดส่วนเชื้อเพลิง</h3>
                           <button onClick={() => setPieMode(pieMode === 'revenue' ? 'liters' : 'revenue')} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all">
                             หน่วย: {pieMode === 'revenue' ? 'เงิน' : 'ลิตร'}
                           </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <PieChart data={stats.fuelStats} mode={pieMode} />
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] shadow-sm overflow-hidden">
                      <h3 className="font-black text-gray-900 p-2 text-sm uppercase tracking-widest mb-4">🛒 ออเดอร์ล่าสุด</h3>
                      
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50"><th className="pb-4 px-4">ลูกค้า</th><th className="pb-4 px-4">น้ำมัน</th><th className="pb-4 px-4 text-center">สถานะ</th><th className="pb-4 px-4 text-right">ยอดรวม</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {stats.latestOrders.map(o => (
                              <tr key={o.id} onClick={() => setSelectedOrder(o)} className="hover:bg-gray-50/50 cursor-pointer transition-colors group">
                                <td className="py-6 px-4"><span className="font-bold text-sm block">{o.user_name}</span></td>
                                <td className="py-6 px-4"><span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{o.fuel_type}</span></td>
                                <td className="py-6 px-4 text-center"><span className={`px-4 py-1 rounded-full text-[10px] font-black shadow-sm ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : o.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{STATUS_TH[o.status] || o.status}</span></td>
                                <td className="py-6 px-4 text-right font-black text-[#dc2626]">฿{o.total_price.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards for Dashboard Latest Orders */}
                      <div className="md:hidden space-y-3">
                        {stats.latestOrders.map(o => (
                          <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center active:scale-[0.98] transition-all">
                             <div>
                               <p className="text-sm font-black text-gray-800">{o.user_name}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{o.fuel_type} • {o.liters}L</p>
                             </div>
                             <div className="text-right">
                               <p className="text-sm font-black text-[#dc2626]">฿{o.total_price.toLocaleString()}</p>
                               <span className={`text-[9px] font-black uppercase mt-1 px-2 py-0.5 rounded-md inline-block ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {STATUS_TH[o.status] || o.status}
                               </span>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- USERS & ORDERS TAB --- */}
              {(activeTab === 'users' || activeTab === 'orders') && (
                <div className="space-y-4">
                  
                  {/* Category Filters for Orders */}
                  {activeTab === 'orders' && (
                    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white/50 rounded-2xl border border-gray-100 backdrop-blur-sm overflow-x-auto no-scrollbar">
                      {[{id:'all',l:'📄 ทั้งหมด',c:'bg-gray-100'}, {id:'pending',l:'⏳ รอดำเนินการ',c:'bg-blue-50 text-blue-600'}, {id:'confirmed',l:'📋 ยืนยันแล้ว',c:'bg-amber-50 text-amber-600'}, {id:'delivering',l:'🛵 ส่งของ',c:'bg-purple-50 text-purple-600'}, {id:'delivered',l:'✅ สำเร็จ',c:'bg-emerald-50 text-emerald-600'}, {id:'cancelled',l:'❌ ยกเลิก',c:'bg-red-50 text-red-600'}]
                      .map(tab => (
                        <button key={tab.id} onClick={() => setFilterOrderStatus(tab.id)} className={`px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black transition-all whitespace-nowrap border ${filterOrderStatus === tab.id ? `${tab.c} border-current ring-4 ring-offset-1 ring-current/10` : 'bg-white border-gray-50 text-gray-400'}`}>{tab.l}</button>
                      ))}
                    </div>
                  )}

                  {/* Bulk Actions for Users */}
                    {selectedUsers.length > 0 && (
                      <div className="bg-[#dc2626] p-4 rounded-2xl text-white flex justify-between items-center shadow-lg animate-bounce-short">
                        <span className="font-black text-sm">เลือกสมาชิกไว้ {selectedUsers.length} รายการ</span>
                        <button onClick={handleBulkDeleteUsers} className="bg-white text-red-600 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">ลบที่เลือกทั้งหมด</button>
                      </div>
                    )}

                  <div className="glass-card rounded-[2.5rem] shadow-sm overflow-hidden p-2 sm:p-4">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">
                          <tr>
                            {activeTab === 'users' && <th className="px-6 py-8 w-12"><input type="checkbox" onChange={handleSelectAllUsers} checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length} className="w-5 h-5 rounded-lg text-[#dc2626] outline-none" /></th>}
                            <th className="px-6 py-8">{activeTab === 'users' ? 'รายชื่อสมาชิก' : 'รหัสคำสั่งซื้อ'}</th>
                            <th className="px-6 py-8">{activeTab === 'users' ? 'ข้อมูลติดต่อ' : 'รายละเอียด'}</th>
                            <th className="px-6 py-8 text-center">สถานะปัจจุบัน</th>
                            <th className="px-6 py-8">ระดับสิทธิ์</th>
                            <th className="px-6 py-8 text-right">ดำเนินการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {activeTab === 'users' ? filteredUsers.map(u => (
                            <tr key={u.id} className={`transition-all ${selectedUsers.includes(u.id) ? 'bg-red-50/40' : 'hover:bg-gray-50/50'}`}>
                              <td className="px-6 py-8"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleSelectUser(u.id)} className="w-5 h-5 rounded-lg text-[#dc2626] outline-none" /></td>
                              <td className="px-6 py-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#dc2626] to-[#fbbf24] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0">{u.name.substring(0, 1).toUpperCase()}</div>
                                <span className="font-black text-base text-gray-900">{u.name}</span>
                              </td>
                              <td className="px-6 py-8 text-sm font-bold text-gray-500">{u.email}</td>
                              <td className="px-6 py-8 text-center">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${u.is_banned ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {u.is_banned ? 'BANNED' : 'ACTIVE'}
                                </span>
                              </td>
                              <td className="px-6 py-8">
                                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} className="bg-gray-50 p-2.5 rounded-xl text-xs font-black outline-none uppercase border-none ring-1 ring-gray-100 cursor-pointer hover:bg-white transition-all">
                                  {['user', 'admin'].map(r => (<option key={r} value={r}>{r.toUpperCase()}</option>))}
                                </select>
                              </td>
                              <td className="px-6 py-8 text-right flex justify-end gap-2">
                                <button 
                                  onClick={() => handleBanUser(u.id, !u.is_banned)} 
                                  className={`px-4 py-2 rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-2 ${
                                    u.is_banned 
                                    ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' 
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'
                                  }`}
                                >
                                  {u.is_banned ? 'ปลดแบน' : 'ระงับไอดี'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteSingleUser(u.id)} 
                                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                >
                                  ลบทิ้ง
                                </button>
                              </td>
                            </tr>
                          )) : filteredOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/50 transition-all group">
                              <td className="px-6 py-8 font-black text-xs text-gray-400 group-hover:text-[#dc2626] transition-colors">#{o.id.substring(0, 8).toUpperCase()}</td>
                              <td className="px-6 py-8">
                                <p className="font-black text-base text-gray-900">{o.user_name}</p>
                                <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mt-1">{o.fuel_type} • {o.liters}L</p>
                              </td>
                              <td className="px-6 py-8 text-center"><span className="text-base font-black text-[#dc2626] tabular-nums">฿{o.total_price.toLocaleString()}</span></td>
                              <td className="px-6 py-8">
                                <select value={o.status} onChange={e => handleUpdateStatus(o.id, e.target.value)} className="bg-gray-50/50 px-4 py-2.5 rounded-xl text-xs font-black outline-none border-none uppercase shadow-sm cursor-pointer hover:bg-white transition-all ring-1 ring-gray-100">
                                  {Object.entries(STATUS_TH).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
                                </select>
                              </td>
                              <td className="px-6 py-8 text-right space-x-2">
                                <button onClick={() => setSelectedOrder(o)} className="text-xs font-black text-blue-600 bg-blue-50 px-5 py-3.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-sm">ดูข้อมูล</button>
                                <button onClick={() => handleDeleteOrder(o.id)} className="text-xs font-black text-red-500 bg-red-100 px-5 py-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest shadow-sm">ลบ</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View (The Transformation) */}
                    <div className="md:hidden space-y-4 p-2">
                       {activeTab === 'users' ? filteredUsers.map(u => (
                         <div key={u.id} className={`p-5 rounded-3xl border-2 transition-all ${selectedUsers.includes(u.id) ? 'bg-red-50 border-[#dc2626]' : 'bg-white border-gray-50 shadow-sm'}`}>
                            <div className="flex items-center gap-4 mb-4">
                               <div className="w-12 h-12 bg-[#dc2626] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">{u.name.charAt(0).toUpperCase()}</div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="font-black text-gray-900 truncate">{u.name}</h4>
                                  <p className="text-[11px] font-bold text-gray-400 truncate uppercase mt-0.5">{u.email}</p>
                               </div>
                               <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleSelectUser(u.id)} className="w-6 h-6 rounded-lg text-[#dc2626]" />
                            </div>
                            <div className="flex gap-2 items-center mb-4">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.is_banned ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{u.is_banned ? 'BANNED' : 'ACTIVE'}</span>
                               <span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">{u.role}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                               <button onClick={() => handleBanUser(u.id, !u.is_banned)} className="py-2.5 bg-orange-50 text-orange-600 rounded-xl font-black text-[10px] uppercase tracking-widest">{u.is_banned ? 'ปลดแบน' : 'ระงับการใช้'}</button>
                               <button onClick={() => handleDeleteSingleUser(u.id)} className="py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest">ลบบัญชี</button>
                            </div>
                         </div>
                       )) : filteredOrders.map(o => (
                         <div key={o.id} className="p-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden active:scale-[0.98] transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-4xl font-black italic">#{o.id.substring(0, 4)}</div>
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">ออเดอร์ #{o.id.substring(0, 8).toUpperCase()}</span>
                                  <h4 className="font-black text-gray-900 mt-1">{o.user_name}</h4>
                               </div>
                               <p className="text-lg font-black text-[#dc2626] tabular-nums">฿{o.total_price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2 mb-6">
                               <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-500 uppercase">{o.fuel_type}</span>
                               <span className="text-[10px] font-bold text-gray-400 uppercase">{o.liters}L</span>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => setSelectedOrder(o)} 
                                 className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm active:bg-blue-100 transition-all"
                               >
                                 ดูข้อมูล
                               </button>
                               <button 
                                 onClick={() => handleDeleteOrder(o.id)} 
                                 className="flex-[0.5] bg-red-50 text-red-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm active:bg-red-100 transition-all font-display"
                               >
                                 ลบ
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- LOGS TAB --- */}
              {activeTab === 'logs' && (
                <div className="glass-card rounded-[2.5rem] shadow-sm p-4 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">กรองระดับผู้ใช้</p>
                      <select value={filterLogRole} onChange={e => setFilterLogRole(e.target.value)} className="w-full bg-gray-50/50 border border-gray-100 p-3 rounded-2xl text-xs font-black shadow-inner outline-none">
                        <option value="all">ทุกระดับ</option>
                        <option value="user">User เท่านั้น</option>
                        <option value="admin">Admin เท่านั้น</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">หมวดหมู่กิจกรรม</p>
                      <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="w-full bg-gray-50/50 border border-gray-100 p-3 rounded-2xl text-xs font-black shadow-inner outline-none">
                        <option value="">ทั้งหมด</option>
                        {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  {filteredLogs.length === 0 ? (
                    <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs opacity-50">ไม่พบประวัติที่คุณค้นหา</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLogs.map((l, i) => {
                        const act = l.action || 'Unknown';
                        const isPrimary = act.includes('ORDER') || act.includes('REGISTER');
                        return (
                          <div key={i} className="flex gap-4 sm:gap-6 items-center border-b border-gray-50 pb-6 sm:pb-8 last:border-0 hover:bg-gray-50 transition-colors p-3 rounded-[2rem]">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm ${isPrimary ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'}`}>
                              {act.includes('ORDER') ? '🛒' : act.includes('EMAIL') ? '✉️' : act.includes('USER') ? '👤' : '🔧'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1 gap-2">
                                <h4 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">{act}</h4>
                                <span className="text-[9px] font-black text-gray-300 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-lg">{new Date(l.created_at).toLocaleDateString('th-TH')}</span>
                              </div>
                              <p className="text-[11px] sm:text-xs font-bold text-gray-500 line-clamp-2 md:line-clamp-none">{l.details}</p>
                              <div className="mt-3 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.1em] text-gray-300">
                                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>{l.user_name || 'System'}</span>
                                <span className="hidden sm:inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>IP: {l.ip_address}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Modals with passing Status Dict */}
      <OrderModal order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} STATUS_TH={STATUS_TH} />
      <CancelReasonModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={confirmCancel} reason={cancelReason} setReason={setReason => setCancelReason(setReason)} />
    </div>
  )
}