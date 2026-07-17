import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, BarChart3, CreditCard,
  Activity, Database, FileText, Settings,
  LogOut, Bell, HelpCircle, Grid, Search, BrainCircuit, ShieldAlert, Code
} from 'lucide-react';

const menuItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
  { to: '/admin/users', icon: Users, label: 'Người dùng' },
  { to: '/admin/interviews', icon: BarChart3, label: 'Dữ liệu phỏng vấn' },
  { to: '/admin/payments', icon: CreditCard, label: 'Thanh toán' },
  { to: '/admin/ai-monitor', icon: Activity, label: 'Giám sát AI' },
  { to: '/admin/question-bank', icon: Database, label: 'Ngân hàng câu hỏi' },
  { to: '/admin/coding-bank', icon: Code, label: 'Ngân hàng Coding' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 z-20">
        {/* Logo area */}
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#333333] flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm tracking-tight leading-none">AI Interview</h1>
              <span className="text-[10px] font-bold text-gray-400 mt-0.5 block uppercase tracking-wider">Hệ thống quản trị</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          <div>
            <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Hệ thống</span>
            <nav className="space-y-1">
              {menuItems.slice(0, 5).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all relative ${isActive
                      ? 'bg-gray-100 text-[#333333]'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#333333] rounded-r-md" />}
                      <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#333333]' : 'text-gray-400 group-hover:text-gray-700'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Tài nguyên</span>
            <nav className="space-y-1">
              {menuItems.slice(5).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all relative ${isActive
                      ? 'bg-gray-100 text-[#333333]'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#333333] rounded-r-md" />}
                      <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#333333]' : 'text-gray-400 group-hover:text-gray-700'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-250/30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
          <div className="w-80 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm hệ thống..."
              className="w-full bg-gray-50 border border-gray-200/60 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#333333]/5 focus:border-[#333333] transition-all placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-bold border border-gray-200 shrink-0">
                {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="text-left min-w-[100px]">
                <p className="text-xs font-bold text-gray-900 leading-none">{user?.fullName || 'Admin User'}</p>
                <p className="text-[10px] text-gray-400 mt-1">{user?.email || 'admin@system.com'}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
