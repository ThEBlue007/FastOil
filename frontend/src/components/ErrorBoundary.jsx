import React from 'react'
import { api } from '../utils/api'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Remote Logging: ส่งรายงานไปยัง Server อัตโนมัติ
    api.reportError({
      type: 'REACT_ERROR',
      message: error.message,
      stack: error.stack,
      path: window.location.pathname,
      source: 'ErrorBoundary'
    })

    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Error path
      return (
        <div className="min-h-screen bg-[#f8fafc] font-['Sarabun',_sans-serif] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_30px_100px_rgba(30,41,59,0.1)] p-8 sm:p-12 text-center border border-gray-100 relative overflow-hidden">
            {/* Decorative background circle (FastOil Style) */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-50 rounded-full opacity-50 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full opacity-50 blur-3xl" />
            
            <div className="relative">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-8 shadow-sm border border-amber-100/50">
                ⚠️
              </div>
              
              <h1 className="text-3xl font-black text-blue-950 mb-4 tracking-tight">
                อุ๊ปส์! พบปัญหาบางอย่าง
              </h1>
              
              <p className="text-gray-400 font-bold mb-10 leading-relaxed text-sm">
                ขออภัยครับ ระบบพบข้อผิดพลาดที่ไม่คาดคิด <br className="hidden sm:block" />
                เราได้บันทึกข้อมูลเพื่อแก้ไขแล้วครับ
              </p>

              <div className="space-y-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 bg-blue-950 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest text-xs"
                >
                  รีโหลดหน้าเว็บ
                </button>
                
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full py-4 bg-gray-50 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all text-xs uppercase tracking-widest border border-gray-100"
                >
                  กลับไปหน้าแรก
                </button>
              </div>

              {/* Error Detail Box (Collapsible) - Nitro Dark Style */}
              <div className="mt-10 pt-8 border-t border-gray-50">
                <div className="bg-blue-950 rounded-[2rem] p-6 text-left overflow-hidden shadow-inner relative">
                  <div className="absolute top-0 right-0 p-3 opacity-20 text-[10px] text-white font-mono uppercase tracking-tighter">System Log</div>
                  <p className="text-red-400 font-mono text-[11px] leading-relaxed break-words font-bold">
                    {this.state.error && this.state.error.toString()}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 pt-4 border-t border-white/5 h-32 overflow-y-auto no-scrollbar">
                         <p className="text-gray-400 font-mono text-[9px] opacity-60">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    // Normally, just render children
    return this.props.children
  }
}

export default ErrorBoundary
