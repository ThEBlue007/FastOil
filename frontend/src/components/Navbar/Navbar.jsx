import { motion } from 'framer-motion'

export default function Navbar({ currentPage, onNavigate }) {
  const navItems = [
    { 
      id: 'home', 
      label: 'หน้าหลัก', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    },
    { 
      id: 'order', 
      label: 'สั่งน้ำมัน', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    },
    { 
      id: 'history', 
      label: 'ประวัติ', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    { 
      id: 'support', 
      label: 'ช่วยเหลือ', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    },
  ]

  return (
    <>
    <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
        {/* Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 bg-[#dc2626] rounded-full flex items-center justify-center shadow-md shadow-red-200">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M19.5 9.5V18.5H17.5V11.5H15.5V18.5H13.5V6.5C13.5 5.4 12.6 4.5 11.5 4.5H5.5C4.4 4.5 3.5 5.4 3.5 6.5V18.5H1.5V20.5H15.5V19.5H17.5V20.5H21.5V9.5H19.5ZM11.5 11.5H5.5V6.5H11.5V11.5ZM21.5 6.5C21.5 5.4 20.6 4.5 19.5 4.5C18.4 4.5 17.5 5.4 17.5 6.5V7.5H19.5V8.5H21.5V6.5Z"/>
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-[#dc2626]">Fast</span>
            <span className="text-[#fbbf24]">Oil</span>
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
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
              </button>
            )
          })}
        </div>

        {/* Right CTA / Mobile Order Button */}
        <button 
          onClick={() => onNavigate('order')}
          className="flex items-center gap-2 bg-[#ffb703] hover:bg-[#fbbf24] text-gray-900 px-5 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm shadow-[0_4px_14px_rgba(251,191,36,0.39)] transition-all active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 hidden md:block">
            <path d="M19.5 9.5V18.5H17.5V11.5H15.5V18.5H13.5V6.5C13.5 5.4 12.6 4.5 11.5 4.5H5.5C4.4 4.5 3.5 5.4 3.5 6.5V18.5H1.5V20.5H15.5V19.5H17.5V20.5H21.5V9.5H19.5ZM11.5 11.5H5.5V6.5H11.5V11.5Z"/>
          </svg>
          <span className="md:hidden">⛽</span> สั่งเลย
        </button>
      </div>
    </nav>

    {/* Mobile Bottom Navigation */}
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
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
            </button>
          )
        })}
      </div>
    </div>
    </>
  )
}