import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  History,
  Database,
  FlaskConical,
  Plus,
  LogOut,
  Users,
  BarChart3,
  CreditCard,
  Activity,
  Code,
  ShieldAlert
} from 'lucide-react';

export default function GlassNavbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const userMenuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { to: '/setup', icon: Plus, label: 'Bắt đầu phỏng vấn' },
    { to: '/question-bank', icon: Database, label: 'Ngân hàng câu hỏi' },
    { to: '/history', icon: History, label: 'Lịch sử phỏng vấn' },
  ];

  const adminMenuItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { to: '/admin/users', icon: Users, label: 'Người dùng' },
    { to: '/admin/interviews', icon: BarChart3, label: 'Dữ liệu phỏng vấn' },
    { to: '/admin/payments', icon: CreditCard, label: 'Thanh toán' },
    { to: '/admin/ai-monitor', icon: Activity, label: 'Giám sát AI' },
    { to: '/admin/question-bank', icon: Database, label: 'Ngân hàng câu hỏi' },
    { to: '/admin/coding-bank', icon: Code, label: 'Ngân hàng Coding' }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-auto">
      <nav className="flex items-center gap-0.5 px-4 py-2 rounded-full border border-white/60 bg-white/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.05),inset_0_1px_3px_rgba(255,255,255,0.5)] transition-all duration-500 ease-out">
        
        {/* Navigation Links with Slide-Out Text Hover Effect */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-0 px-2.5 py-2 rounded-full transition-all duration-500 ease-out overflow-hidden group ${
                  isActive
                    ? 'bg-white/30 text-slate-950 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-white/40 font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/20'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-500 group-hover:scale-105" />
              
              {/* Slided text out dynamically */}
              <span className="max-w-0 opacity-0 whitespace-nowrap font-bold text-xs tracking-tight transition-all duration-500 ease-out group-hover:max-w-[180px] group-hover:opacity-100 group-hover:ml-2">
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Logout Button integrated into the same design */}
        <button
          onClick={logout}
          className="flex items-center gap-0 px-2.5 py-2 rounded-full transition-all duration-500 ease-out overflow-hidden group text-red-500 hover:text-red-600 hover:bg-white/20"
        >
          <LogOut className="w-5 h-5 shrink-0 transition-transform duration-500 group-hover:scale-105" />
          <span className="max-w-0 opacity-0 whitespace-nowrap font-bold text-xs tracking-tight transition-all duration-500 ease-out group-hover:max-w-[180px] group-hover:opacity-100 group-hover:ml-2">
            Đăng xuất
          </span>
        </button>

      </nav>
    </div>
  );
}
