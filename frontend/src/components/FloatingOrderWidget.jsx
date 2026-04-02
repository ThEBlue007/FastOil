import { motion } from 'framer-motion';

const TRACKING_STEPS = [
    { label: 'รับคำสั่งซื้อ', status: 'pending' },
    { label: 'เตรียมน้ำมัน', status: 'confirmed' },
    { label: 'กำลังจัดส่ง', status: 'delivering' },
    { label: 'ส่งสำเร็จ', status: 'delivered' },
];

export default function FloatingOrderWidget({ order, onClose }) {
    if (!order) return null;

    const flow = ['pending', 'confirmed', 'delivering', 'delivered'];
    const currentIndex = flow.indexOf(order.status);

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            // ✅ ปรับความกว้างเหลือ 360px และ Padding เหลือ p-7
            className="fixed bottom-8 right-8 z-[999] w-[calc(100%-4rem)] md:w-[360px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-7 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/50"
        >
            {/* ปุ่มปิดขนาดพอดีๆ */}
            <button onClick={onClose} className="absolute top-5 right-6 text-gray-300 hover:text-red-500 transition-colors text-lg font-bold">✕</button>

            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-lg text-2xl ${order.status === 'cancelled' ? 'bg-red-500 shadow-red-200 text-white' : 'bg-amber-400 shadow-amber-200/50'}`}>
                    {order.status === 'cancelled' ? '✕' : '⛽'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${order.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'}`}>
                        {order.status === 'cancelled' ? 'Order Cancelled' : 'Live Tracking'}
                    </p>
                    <h3 className="font-black text-blue-950 text-xl uppercase italic truncate">#{order.id}</h3>
                    <p className="text-gray-400 text-xs font-bold truncate">{order.details}</p>
                </div>
            </div>

            {order.status === 'cancelled' ? (
                <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[1.5rem]">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-red-500 text-lg">⚠️</span>
                        <span className="text-red-700 font-black text-sm uppercase">ถูกยกเลิกโดยระบบ</span>
                    </div>
                    <p className="text-red-600/70 text-xs font-bold leading-relaxed">
                        {order.cancel_reason || 'ขออภัย ทางเราไม่สามารถจัดส่งออเดอร์นี้ได้ในขณะนี้'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4 mb-8">
                    {TRACKING_STEPS.map((s, i) => {
                        const isDone = currentIndex > i || order.status === 'delivered';
                        const isActive = currentIndex === i && order.status !== 'delivered';
                        return (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-amber-400 text-white animate-pulse' : 'bg-gray-100 text-gray-300'
                                    }`}>
                                    {isDone ? '✓' : i + 1}
                                </div>
                                <span className={`text-sm flex-1 ${isDone ? 'text-gray-700 font-bold' : isActive ? 'text-amber-700 font-black' : 'text-gray-300'}`}>
                                    {s.label}
                                </span>
                                {isActive && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex items-end justify-between">
                <div>
                    <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">
                        {order.status === 'cancelled' ? 'สถานะล่าสุด' : 'คาดว่าจะถึงใน'}
                    </span>
                    <div className="text-blue-950 font-black text-3xl mt-0.5 tracking-tighter">
                        {order.status === 'cancelled' ? (
                            <span className="text-red-600 uppercase italic">CANCEL</span>
                        ) : (
                            <>12 <span className="text-base font-medium">MIN</span></>
                        )}
                    </div>
                </div>
                <div className={`p-3 rounded-xl text-xl ${order.status === 'cancelled' ? 'bg-gray-50 text-gray-400 italic' : 'bg-red-50 text-red-500 animate-bounce'}`}>
                    📍
                </div>
            </div>
        </motion.div>
    );
}