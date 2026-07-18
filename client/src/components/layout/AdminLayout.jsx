import { Outlet } from 'react-router-dom';
import GlassNavbar from './GlassNavbar';

export default function AdminLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#F8F9FA] font-sans">
      {/* Liquid Glass Navbar on Top */}
      <GlassNavbar />

      {/* Main Content Area */}
      <main className="w-full pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
