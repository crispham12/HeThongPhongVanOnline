import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, History, GitBranch, Plus,
  Settings, LogOut, BrainCircuit, FileText, Database, Code2
} from 'lucide-react';

const menuItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Bảng điều khiển' },
  { to: '/question-bank',   icon: Database,         label: 'Ngân hàng câu hỏi' },
  { to: '/history',         icon: History,          label: 'Lịch sử phỏng vấn' },
  { to: '/github-analysis', icon: GitBranch,          label: 'Phân tích GitHub' },
  { to: '/create-cv',       icon: FileText,           label: 'Tạo CV' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-200">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">InterviewPro</span>
        </Link>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate('/setup')}
          className="w-full mb-6 flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-md shadow-primary-100 hover:bg-primary-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Bắt đầu phỏng vấn</span>
        </button>

        {/* Menu Items */}
        <nav className="space-y-1.5 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3 mb-2">Menu chính</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className={`w-4 h-4 ${location.pathname === item.to ? 'text-primary-600' : ''}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0">Người dùng</p>
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>ĐĂNG XUẤT</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
