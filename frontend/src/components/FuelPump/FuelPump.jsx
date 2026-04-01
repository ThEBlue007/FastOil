import { useState } from 'react';
import { motion } from 'framer-motion';
import FuelSelector from './FuelSelector';
import PriceCalculator from './PriceCalculator';

export default function FuelPump() {
  const [selectedFuel, setSelectedFuel] = useState(null);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-10">
      
      {/* ── Step 1 ── */}
      <div className="mb-10">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shadow-red-200">1</span>
          เลือกประเภทน้ำมัน
        </h2>
        <FuelSelector selectedFuel={selectedFuel} onSelect={setSelectedFuel} />
      </div>

      {/* ── Step 2 ── */}
      {selectedFuel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="h-px bg-gray-100 w-full mb-10" />
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shadow-red-200">2</span>
            ระบุยอดเติม
          </h2>
          
          <PriceCalculator fuel={selectedFuel} />

          <button className="w-full mt-10 bg-amber-400 hover:bg-amber-300 text-gray-900 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-amber-200/50 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
            <span>⛽</span> ยืนยันการสั่งซื้อและปักหมุด
          </button>
        </motion.div>
      )}
    </div>
  );
}