import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const currentPath = location.pathname

  const navItems = [
    { id: '/', label: 'หน้าหลัก', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
    { id: '/order', label: 'สั่งน้ำมัน', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /> },
    { id: '/history', label: 'ประวัติ', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { id: '/support', label: 'ช่วยเหลือ', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
  ]

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  return (
    <>
    <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer select-none">
          <img src="/logo.png" alt="FastOil Logo" className="h-10 md:h-12 w-auto object-contain" />
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = currentPath === item.id || (item.id !== '/' && currentPath.startsWith(item.id))
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  isActive 
                    ? 'text-[#881337] bg-red-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div 
                    layoutId="navDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#dc2626] rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Auth / CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-[#dc2626] to-[#fbbf24] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden lg:block">{user.name.split(' ')[0]}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#dc2626] font-bold hover:bg-red-50 transition-colors">
                          <span className="text-lg">⚙️</span>
                          แผงควบคุมแอดมิน
                        </Link>
                      )}
                      
                      <Link to="/dashboard" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                        <span className="text-lg">📊</span>
                        แดชบอร์ด
                      </Link>
                      
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 font-semibold hover:bg-red-50 hover:text-[#dc2626] transition-colors">
                          <span className="text-lg">🚪</span>
                          ออกจากระบบ
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden lg:flex gap-2">
              <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-700 hover:text-[#dc2626] hover:bg-red-50 transition-colors">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-full text-sm font-bold bg-[#dc2626] text-white shadow-md shadow-red-200 hover:bg-[#b91c1c] hover:shadow-lg transition-all">
                สมัครสมาชิก
              </Link>
            </div>
          )}

          {/* Order Button (Always visible) */}
          <Link 
            to="/order"
            className="flex items-center gap-2 bg-[#ffb703] hover:bg-[#fbbf24] text-gray-900 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm shadow-[0_4px_14px_rgba(251,191,36,0.39)] transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 hidden md:block">
              <path d="M19.5 9.5V18.5H17.5V11.5H15.5V18.5H13.5V6.5C13.5 5.4 12.6 4.5 11.5 4.5H5.5C4.4 4.5 3.5 5.4 3.5 6.5V18.5H1.5V20.5H15.5V19.5H17.5V20.5H21.5V9.5H19.5ZM11.5 11.5H5.5V6.5H11.5V11.5Z"/>
            </svg>
            <span className="md:hidden">⛽</span> สั่งเลย
          </Link>
        </div>
      </div>
    </nav>

    {/* Mobile Bottom Navigation */}
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.id || (item.id !== '/' && currentPath.startsWith(item.id))
          return (
            <Link
              key={item.id}
              to={item.id}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:bg-gray-50 transition-colors relative"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={isActive ? "2.5" : "2"} 
                className={`w-6 h-6 transition-all ${isActive ? 'text-[#dc2626] scale-110' : 'text-gray-400'}`}
              >
                {item.icon}
              </svg>
              <span className={`text-[10px] font-bold transition-all ${isActive ? 'text-[#dc2626]' : 'text-gray-400'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-1 bg-[#dc2626] rounded-b-full shadow-sm shadow-red-200"
                />
              )}
            </Link>
          )
        })}
        {/* Mobile menu item for Login if not logged in */}
        {!user && (
           <Link
             to="/login"
             className="flex flex-col items-center justify-center w-full h-full gap-1 active:bg-gray-50 transition-colors relative"
           >
             <span className={`text-xl transition-all ${currentPath === '/login' ? 'text-[#dc2626] scale-110' : 'text-gray-400 grayscale'}`}>
               👤
             </span>
             <span className={`text-[10px] font-bold transition-all ${currentPath === '/login' ? 'text-[#dc2626]' : 'text-gray-400'}`}>
               เข้าสู่ระบบ
             </span>
           </Link>
        )}
      </div>
    </div>
    </>
  )
}