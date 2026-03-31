export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
          📋
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">ประวัติการสั่งซื้อ</h1>
        <p className="text-gray-500 mb-1">ยังไม่มีประวัติการสั่งซื้อ</p>
        <p className="text-gray-400 text-sm">
          ฟีเจอร์นี้จะพร้อมใช้งานใน Phase 2 (ระบบล็อกอิน)
        </p>
      </div>
    </div>
  )
}
