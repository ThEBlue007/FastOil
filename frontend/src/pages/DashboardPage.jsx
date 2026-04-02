import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersData = await api.getOrders()
        setOrders(ordersData.orders || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      delivering: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    const labels = {
      pending: 'รอยืนยัน',
      confirmed: 'รับคำสั่งซื้อแล้ว',
      delivering: 'กำลังจัดส่ง',
      delivered: 'จัดส่งสำเร็จ',
      cancelled: 'ยกเลิกแล้ว',
    }
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${badges[status] || badges.pending}`}>{labels[status] || 'ไม่ทราบสถานะ'}</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1e3a8a]">แดชบอร์ดของฉัน</h1>
          <p className="text-gray-500 mt-1">ยินดีต้อนรับกลับมา, {user?.name}</p>
        </div>
        <button 
          onClick={logout}
          className="bg-red-50 hover:bg-red-100 text-[#dc2626] font-semibold px-4 py-2 rounded-lg transition-colors border border-red-200"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl md:col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#dc2626] to-[#b91c1c] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-500">สถานะอีเมล</span>
              {user?.emailVerified ? <span className="text-green-600 font-bold">✓ ยืนยันแล้ว</span> : <span className="text-amber-500 font-bold">รอการยืนยัน</span>}
            </div>
            <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-500">สถานะเบอร์โทร</span>
              {user?.phoneVerified ? <span className="text-green-600 font-bold">✓ ยืนยันแล้ว</span> : <span className="text-gray-400 font-medium">ยังไม่เพิ่ม</span>}
            </div>
            <div className="flex justify-between text-sm pb-2">
              <span className="text-gray-500">ระดับบัญชี</span>
              <span className={`font-bold ${user?.role === 'admin' ? 'text-[#dc2626]' : 'text-blue-600'}`}>{user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}</span>
            </div>
          </div>
        </motion.div>

        {/* Orders Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl md:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ประวัติการสั่งซื้อล่าสุด</h2>
          
          {loading ? (
             <div className="flex justify-center py-8">
               <span className="w-8 h-8 border-4 border-[#dc2626] border-t-transparent rounded-full animate-spin"></span>
             </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-sm">
                    <th className="pb-3 font-semibold">วันที่</th>
                    <th className="pb-3 font-semibold">ประเภทน้ำมัน</th>
                    <th className="pb-3 font-semibold">จำนวน</th>
                    <th className="pb-3 font-semibold">ราคา</th>
                    <th className="pb-3 font-semibold">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString('th-TH')}</td>
                      <td className="py-4 font-medium text-gray-900">{order.fuel_type}</td>
                      <td className="py-4 text-sm text-gray-600">{order.liters} ลิตร</td>
                      <td className="py-4 font-bold text-[#1e3a8a]">฿{order.total_price.toFixed(2)}</td>
                      <td className="py-4">{getStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-4xl block mb-3">⛽</span>
              <p className="text-gray-500 font-medium">ยังไม่มีประวัติการสั่งซื้อ</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
