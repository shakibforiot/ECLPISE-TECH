import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ShoppingBag, User, LayoutDashboard, LogOut, ShoppingCart, Package, Users, Settings, ChevronLeft, ChevronRight, Receipt, Layers3 } from 'lucide-react';
import EclipseLogo from './EclipseLogo';
import TopNavbar from './TopNavbar';
import CommandBar from './CommandBar';
import Footer from './Footer';

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${p}%`,
          background: 'linear-gradient(90deg, #6d28d9, #a855f7, #f3e8ff)',
          boxShadow: '0 0 14px rgba(192,132,252,0.85)',
        }}
      />
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const userNav = [
    { path: '/', label: 'Command', icon: Home },
    { path: '/shop', label: 'Arsenal', icon: ShoppingBag },
    { path: '/cart', label: 'Cargo', icon: ShoppingCart },
    { path: '/orders', label: 'Manifest', icon: Receipt },
    { path: '/profile', label: 'Operator', icon: User },
  ];
  const adminNav = [
    { path: '/172.192.67.0/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/172.192.67.0/products', label: 'Products', icon: Package },
    { path: '/172.192.67.0/categories', label: 'Categories', icon: Layers3 },
    { path: '/172.192.67.0/orders', label: 'Orders', icon: Receipt },
    { path: '/172.192.67.0/users', label: 'Operators', icon: Users },
    { path: '/172.192.67.0/settings', label: 'Settings', icon: Settings },
  ];
  const navItems = currentUser?.role === 'admin' ? adminNav : userNav;

  return (
    <div className="min-h-screen text-purple-50 lg:flex">
      <ScrollProgress />

      {/* Sidebar / drawer */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:shrink-0 z-50 top-0 left-0 h-full lg:h-screen border-r border-purple-500/15 transform transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, rgba(10,8,20,0.97) 0%, rgba(7,6,15,0.98) 100%)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="absolute inset-y-0 right-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(192,132,252,0.55), transparent)' }} />

        <div className="flex items-center justify-between px-4 py-5 border-b border-purple-500/15">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center">
            {sidebarCollapsed ? <EclipseLogo size={42} /> : <EclipseLogo size={42} withWordmark />}
          </Link>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:block p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-200">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="px-5 py-3 flex items-center gap-2 border-b border-purple-500/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 et-pulse-dot" />
            <span className="font-tech text-[10px] tracking-[0.3em] text-emerald-300/80 uppercase">System Online</span>
            <span className="ml-auto font-tech text-[10px] tracking-[0.2em] text-purple-300/50">v2.6</span>
          </div>
        )}

        <nav className="p-3">
          <ul className="space-y-1.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'text-white' : 'text-purple-100/65 hover:text-white'}`}
                    style={active ? { background: 'linear-gradient(90deg, rgba(124,58,237,0.55), rgba(124,58,237,0.08))', boxShadow: 'inset 0 0 0 1px rgba(192,132,252,0.35), 0 8px 24px -10px rgba(124,58,237,0.6)' } : undefined}
                  >
                    {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-gradient-to-b from-purple-300 to-purple-600 shadow-[0_0_10px_#c084fc]" />}
                    <Icon className={`h-5 w-5 transition-colors ${active ? 'text-purple-200' : 'text-purple-300/60 group-hover:text-purple-200'}`} />
                    {!sidebarCollapsed && <span className="font-tech font-semibold tracking-wide text-sm uppercase">{label}</span>}
                    {!sidebarCollapsed && !active && <span className="ml-auto h-1 w-1 rounded-full bg-purple-400/30 group-hover:bg-purple-300" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {currentUser && (
            <div className="mt-4 pt-4 border-t border-purple-500/10">
              <button
                onClick={async () => { await logout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:text-white border border-red-500/15 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="h-5 w-5" />
                {!sidebarCollapsed && <span className="font-tech font-semibold tracking-wide text-sm uppercase">Disconnect</span>}
              </button>
            </div>
          )}
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main column */}
      <main className="flex-1 min-w-0 flex flex-col">
        <TopNavbar onMenu={() => setSidebarOpen(true)} />
        <CommandBar />
        <div className="flex-1">
          <div className="et-rise" key={location.pathname}>
            {children}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
