import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNavigationBar() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[#333333]/20 bg-[#FFFFFF] z-10 shrink-0 font-sans">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 text-[#333333] hover:bg-[#333333]/5 rounded-lg transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 text-sm font-semibold text-[#333333] bg-[#FFFFFF] border border-[#333333]/30 rounded-lg hover:bg-[#333333]/5">
          Preview
        </button>
        <button className="px-4 py-2 text-sm font-semibold text-[#FFFFFF] bg-[#333333] rounded-lg hover:bg-[#333333]/90">
          Publish Template
        </button>
      </div>
    </div>
  );
}
