import React, { useState } from 'react';
import {
  LayoutDashboard,
  History,
  Database,
  FlaskConical,
  Plus
} from 'lucide-react';

export default function UserTest() {
  const [activeTab, setActiveTab] = useState('/ui-test');

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { to: '/setup', icon: Plus, label: 'Bắt đầu phỏng vấn' },
    { to: '/question-bank', icon: Database, label: 'Ngân hàng câu hỏi' },
    { to: '/history', icon: History, label: 'Lịch sử phỏng vấn' },
    { to: '/ui-test', icon: FlaskConical, label: 'Kiểm tra giao diện' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-white font-sans flex flex-col justify-start items-center p-8 overflow-hidden">
      {/* Test Blobs to check transparency */}
      <div className="absolute top-[5%] left-[35%] w-[180px] h-[180px] rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 opacity-80 blur-xl animate-pulse pointer-events-none z-0" />
      <div className="absolute top-[8%] left-[48%] w-[160px] h-[160px] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-85 blur-xl pointer-events-none z-0" />
      <div className="absolute top-[4%] left-[55%] w-[150px] h-[150px] rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 opacity-75 blur-xl pointer-events-none z-0" />

      {/* Floating Liquid Glass Nav at the top center */}
      <div className="w-full flex justify-center mt-10 z-10">
        <nav className="flex items-center gap-0.5 px-4 py-2 rounded-full border border-white/60 bg-white/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.05),inset_0_1px_3px_rgba(255,255,255,0.5)] transition-all duration-500 ease-out">
          
          {/* Navigation Icons with Slide-Out Text Hover Effect */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.to;
            return (
              <button
                key={item.to}
                onClick={() => setActiveTab(item.to)}
                className={`flex items-center gap-0 px-2.5 py-2 rounded-full transition-all duration-500 ease-out overflow-hidden group ${
                  isActive
                    ? 'bg-white/30 text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-white/40'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/20'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform duration-500 group-hover:scale-105" />
                
                {/* Slided text out dynamically */}
                <span className="max-w-0 opacity-0 whitespace-nowrap font-bold text-xs tracking-tight transition-all duration-500 ease-out group-hover:max-w-[180px] group-hover:opacity-100 group-hover:ml-2">
                  {item.label}
                </span>
              </button>
            );
          })}

        </nav>
      </div>
    </div>
  );
}
