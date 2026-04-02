import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AnimatePresence } from 'framer-motion'
import { api } from './utils/api'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar/Navbar'
import FloatingOrderWidget from './components/FloatingOrderWidget'

// Pages
import Home from './pages/Home'
import OrderPage from './pages/OrderPage'
import HistoryPage from './pages/HistoryPage'
import SupportPage from './pages/SupportPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import VerifyPhonePage from './pages/VerifyPhonePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import AdminPanel from './pages/admin/AdminPanel'

const DEFAULT_FUELS = [
  { id: 'g91', name: 'แก๊สโซฮอล์ 91', price: 99.99, tomorrow: 35.94, change: 0, color: '#16a34a' },
  { id: 'g95', name: 'แก๊สโซฮอล์ 95', price: 99.99, tomorrow: 38.44, change: 0, color: '#dc2626' },
  { id: 'e20', name: 'แก๊สโซฮอล์ E20', price: 99.99, tomorrow: 33.34, change: 0, color: '#d97706' },
  { id: 'e85', name: 'แก๊สโซฮอล์ E85', price: 99.99, tomorrow: 28.66, change: 0, color: '#059669' },
  { id: 'b7', name: 'ดีเซล', price: 99.99, tomorrow: 29.94, change: 0, color: '#ea580c' },
]

function AppContent() {
  const [fuels, setFuels] = useState(DEFAULT_FUELS)
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')
  const [activeOrder, setActiveOrder] = useState(null)
  const location = useLocation()

  // ── 1. ดึงราคาน้ำมันเรียลไทม์ (คงเดิม) ──────────────────────────────────────────
  useEffect(() => {
    const fetchKapookPrices = async () => {
      try {
        const url = encodeURIComponent('https://gasprice.kapook.com/gasprice.php')
        const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${url}`)
        const html = await res.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        let pttHtml = ''
        const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, article')
        for (let i = 0; i < headers.length; i++) {
          if (headers[i].textContent.includes('ปตท.') || headers[i].textContent.includes('PTT')) {
            pttHtml = headers[i].parentElement.innerHTML
            break
          }
        }
        if (!pttHtml) pttHtml = doc.body.innerHTML
        const getPrice = (namePattern) => {
          const regex = new RegExp(`${namePattern}[^\\d]*?(\\d{2}\\.\\d{2})`, 'i')
          const match = pttHtml.match(regex)
          return match ? parseFloat(match[1]) : null
        }
        const g91 = getPrice('แก๊สโซฮอล์\\s*91') || 99.99
        const g95 = getPrice('แก๊สโซฮอล์\\s*95') || 99.99
        const e20 = getPrice('แก๊สโซฮอล์\\s*E20') || 99.99
        const e85 = getPrice('แก๊สโซฮอล์\\s*E85') || 99.99
        const d7 = getPrice('ดีเซล(?!\\s*พรีเมียม)') || 99.99
        let changeStatus = 0
        if (html.includes('ปรับลด')) changeStatus = -0.40
        if (html.includes('ปรับขึ้น')) changeStatus = 0.40
        setFuels([
          { id: 'g91', name: 'แก๊สโซฮอล์ 91', price: g91, tomorrow: g91 + changeStatus, change: changeStatus, color: '#019B91' },
          { id: 'g95', name: 'แก๊สโซฮอล์ 95', price: g95, tomorrow: g95 + changeStatus, change: changeStatus, color: '#0078B7' },
          { id: 'e20', name: 'แก๊สโซฮอล์ E20', price: e20, tomorrow: e20 + changeStatus, change: changeStatus, color: '#F2572B' },
          { id: 'e85', name: 'แก๊สโซฮอล์ E85', price: e85, tomorrow: e85 + changeStatus, change: changeStatus, color: '#CC2129' },
          { id: 'b7', name: 'ดีเซล', price: d7, tomorrow: d7 + (html.includes('ปรับขึ้น ดีเซล') ? 0.5 : 0), change: (html.includes('ปรับขึ้น ดีเซล') ? 0.5 : 0), color: '#282C69' },
        ])
        setLastUpdate(new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok' }))
        setLoadingPrices(false)
      } catch (error) {
        console.error('Error fetching Kapook prices:', error)
        setLoadingPrices(false)
      }
    }
    fetchKapookPrices()
  }, [])

  // ── 2. ✨ ระบบตรวจสอบสถานะออเดอร์อัตโนมัติ (แก้อาการไม่ยอมหาย) ────────────────
  useEffect(() => {
    // ถ้าไม่ได้เปิดกล่องติดตามไว้ ไม่ต้องทำงาน
    if (!activeOrder) return;

    const syncStatus = async () => {
      try {
        const res = await api.getOrders();
        const allOrders = res.orders || res;

        // ค้นหาออเดอร์ล่าสุดที่กำลังติดตามอยู่ (เช็คจาก ID 8 ตัวอักษรตามหน้าประวัติ)
        const current = allOrders.find(o => o.id.substring(0, 8).toUpperCase() === activeOrder.id);

        if (current) {
          // ถ้าสถานะเปลี่ยน หรือมีข้อมูลใหม่ (เช่น เหตุผลการยกเลิก) ให้ Update กล่องตาม
          if (current.status !== activeOrder.status || current.cancel_reason !== activeOrder.cancel_reason) {
            setActiveOrder(prev => ({ 
              ...prev, 
              status: current.status,
              cancel_reason: current.cancel_reason 
            }));
          }
        }
      } catch (err) {
        console.error("Status Sync Failed:", err);
      }
    };

    // แอบไปถามหลังบ้านทุกๆ 3 วินาที
    const timer = setInterval(syncStatus, 3000);
    return () => clearInterval(timer);
  }, [activeOrder]);

  const navigateFallback = () => { }
  const hideNavbarRoutes = ['/login', '/register', '/verify-email']
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin')

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col">
      {shouldShowNavbar && <Navbar currentPage={location.pathname.substring(1) || 'home'} onNavigate={navigateFallback} />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home fuels={fuels} loading={loadingPrices} lastUpdate={lastUpdate} />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/order" element={<ProtectedRoute><OrderPage fuels={fuels} onNavigate={navigateFallback} /></ProtectedRoute>} />

          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage onTrack={(order) => setActiveOrder(order)} />
            </ProtectedRoute>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-phone" element={<ProtectedRoute><VerifyPhonePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AnimatePresence>
        {activeOrder && (
          <FloatingOrderWidget
            order={activeOrder}
            onClose={() => setActiveOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}