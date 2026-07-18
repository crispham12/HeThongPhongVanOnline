import { Outlet, useLocation } from 'react-router-dom';
import GlassNavbar from './GlassNavbar';

export default function AppLayout() {
  const location = useLocation();
  const isUiTest = location.pathname === '/ui-test';

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* Liquid Glass Navbar on Top */}
      <GlassNavbar />

      {/* Main Content Area */}
      <main className="w-full h-full pt-20 pb-4 overflow-y-auto bg-white">
        <div className="max-w-7xl mx-auto px-6 bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
