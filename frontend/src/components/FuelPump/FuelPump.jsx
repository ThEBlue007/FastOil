import { useState } from 'react';
import { motion } from 'framer-motion';
import FuelSelector from './FuelSelector';
import PriceCalculator from './PriceCalculator';

export default function FuelPump() {
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmOrder = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Order Confirmed!");
      // setIsLoading(false); // ปลดล็อกหลังทำงานเสร็จ
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-10">

      {/* ── Step 1 ── */}
      <div className="mb-10">
        <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 transition-colors ${isLoading ? 'text-gray-400' : 'text-gray-900'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-colors ${isLoading ? 'bg-gray-300 text-white' : 'bg-red-600 text-white shadow-red-200'}`}>1</span>
          เลือกประเภทน้ำมัน
        </h2>

        {/* ✅ ส่ง isLocked เข้าไป */}
        <FuelSelector
          selectedFuel={selectedFuel}
          onSelect={setSelectedFuel}
          isLocked={isLoading}
        />
      </div>

      {/* ── Step 2 ── */}
      {selectedFuel && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="h-px bg-gray-100 w-full mb-10" />
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 transition-colors ${isLoading ? 'text-gray-400' : 'text-gray-900'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-colors ${isLoading ? 'bg-gray-300 text-white' : 'bg-red-600 text-white shadow-red-200'}`}>2</span>
            ระบุยอดเติม
          </h2>

          {/* ✅ ส่ง isLocked เข้าไปใน PriceCalculator */}
          <PriceCalculator fuel={selectedFuel} isLocked={isLoading} />

          <button
            onClick={handleConfirmOrder}
            disabled={isLoading}
            className={`w-full mt-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2
              ${isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-gray-900 shadow-amber-200/50 transform hover:-translate-y-0.5 active:scale-95'
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                กำลังทำรายการ...
              </>
            ) : (
              <>
                <span>⛽</span> ยืนยันการสั่งซื้อและปักหมุด
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}