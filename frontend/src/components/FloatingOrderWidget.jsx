import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const TRACKING_STEPS = [
    { label: 'รับคำสั่งซื้อ', status: 'pending' },
    { label: 'เตรียมน้ำมัน', status: 'confirmed' },
    { label: 'กำลังจัดส่ง', status: 'delivering' },
    { label: 'ส่งสำเร็จ', status: 'delivered' },
];

const STATUS_ICONS = {
    pending: '⏳',
    confirmed: '📋',
    delivering: '🛵',
    delivered: '✅',
    cancelled: '❌'
};

const STATUS_COLORS = {
    pending: 'bg-blue-500',
    confirmed: 'bg-amber-500',
    delivering: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500'
};

export default function FloatingOrderWidget({ order, onClose }) {
    const [isMinimized, setIsMinimized] = useState(false);

    if (!order) return null;

    const flow = ['pending', 'confirmed', 'delivering', 'delivered'];
    const currentIndex = flow.indexOf(order.status);

    const getStatusLabel = (status) => {
        if (status === 'cancelled') return 'ยกเลิกแล้ว';
        const step = TRACKING_STEPS.find(s => s.status === status);
        return step ? step.label : status;
    };

    return (
        <AnimatePresence mode="wait">
            {!isMinimized ? (
                <motion.div
                    key="expanded"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[999] w-[calc(100%-2rem)] md:w-[360px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-7 shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/50 overflow-hidden"
                >
                    {/* Header Buttons */}
                    <div className="absolute top-5 right-6 flex items-center gap-3">
                        <button 
                            onClick={() => setIsMinimized(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs"
                            title="ย่อหน้าต่าง"
                        >
                            ─
                        </button>
                        <button 
                            onClick={onClose} 
                            className="bg-red-50 hover:bg-red-100 text-red-400 w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm font-bold"
                            title="ปิด"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6 pr-12">
                        <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-lg text-2xl ${order.status === 'cancelled' ? 'bg-red-500 shadow-red-200 text-white' : 'bg-amber-400 shadow-amber-200/50'}`}>
                            {order.status === 'cancelled' ? '✕' : '⛽'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${order.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'}`}>
                                {order.status === 'cancelled' ? 'Order Cancelled' : 'Live Tracking'}
                            </p>
                            <h3 className="font-black text-blue-950 text-xl uppercase italic truncate">#{order.id.substring(0,8)}</h3>
                            <p className="text-gray-400 text-xs font-bold truncate">{order.details || (order.fuel_type + ' — ' + order.liters + ' ลิตร')}</p>
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
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isDone ? 'bg-green-500 text-white shadow-md shadow-green-100' : isActive ? 'bg-amber-400 text-white animate-pulse shadow-md shadow-amber-100' : 'bg-gray-100 text-gray-300'
                                            }`}>
                                            {isDone ? '✓' : i + 1}
                                        </div>
                                        <span className={`text-sm flex-1 ${isDone ? 'text-gray-700 font-bold' : isActive ? 'text-amber-700 font-black' : 'text-gray-300'}`}>
                                            {s.label}
                                        </span>
                                        {isActive && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />}
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
            ) : (
                <motion.div
                    key="minimized"
                    initial={{ opacity: 0, x: 50, scale: 0.5 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-24 right-4 md:bottom-12 md:right-12 z-[999] cursor-pointer"
                >
                    <div className="bg-white/90 backdrop-blur-xl rounded-full p-2 pr-5 shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-white/50 flex items-center gap-3 group overflow-hidden">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner ${STATUS_COLORS[order.status] || 'bg-blue-500'} text-white`}>
                           {STATUS_ICONS[order.status] || '⛽'}
                           <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">ติดตาม #{order.id.substring(0,4)}</span>
                            <span className="text-[11px] font-black text-gray-900 leading-none flex items-center gap-2">
                                {getStatusLabel(order.status)}
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            </span>
                        </div>
                        {/* Status Glow for Mini Badge */}
                        <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-12 blur-lg opacity-40 ${STATUS_COLORS[order.status] || 'bg-blue-500'}`} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}