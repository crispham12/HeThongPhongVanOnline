import { Outlet, useLocation } from 'react-router-dom';
import GlassNavbar from './GlassNavbar';

export default function AppLayout() {
  const location = useLocation();
  const isUiTest = location.pathname === '/ui-test';
  const isInterview = location.pathname.includes('/interview') || location.pathname.includes('/interviews');

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Liquid Glass Navbar on Top */}
      {!isInterview && <GlassNavbar />}

      {/* Main Content Area */}
      <main className={`w-full h-full pb-4 overflow-y-auto bg-white ${isInterview ? 'pt-0 no-scrollbar' : 'pt-20'}`}>
        {isInterview ? (
          <Outlet />
        ) : (
          <div className="max-w-7xl mx-auto px-6 bg-white">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
