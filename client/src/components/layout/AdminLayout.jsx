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
  { to: '/admin/coding-bank', icon: Code, label: 'Ngân hàng Coding' },
  { to: '/admin/templates', icon: FileText, label: 'Mẫu CV' },
  { to: '/admin/logs', icon: ShieldAlert, label: 'Nhật ký hệ thống' },
  { to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm shrink-0">
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="flex flex-col mb-8 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <h1 className="font-bold text-primary-700 text-xl tracking-tight leading-tight">AI Interview<br/>Admin</h1>
            <span className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Hệ thống quản trị</span>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-400/10 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          <div className="w-96 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm hệ thống..." 
              className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-100 focus:outline-none placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-500">
              <button className="hover:text-gray-900 transition-colors"><Bell className="w-5 h-5" /></button>
              <button className="hover:text-gray-900 transition-colors"><HelpCircle className="w-5 h-5" /></button>
              <button className="hover:text-gray-900 transition-colors"><Grid className="w-5 h-5" /></button>
            </div>
            
            <div className="h-8 w-px bg-gray-200"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 leading-none">Admin User</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Quản trị viên</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                <img src={`https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff`} alt="Admin" className="w-full h-full object-cover" />
              </div>
              <button onClick={logout} className="ml-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                Đăng xuất
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
