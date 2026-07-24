import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ShoppingCart, ChevronDown, LogOut, User as UserIcon, Settings, Package, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { database } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import EclipseLogo from './EclipseLogo';
import { Avatar } from './Visuals';
import { LiveClock, SignalBars } from './hud';

function useClickOutside<T extends HTMLElement>(onOutside: () => void, active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [active, onOutside]);
  return ref;
}

interface ProductLite { id: string; name: string; category: string; price: number; }

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<ProductLite[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const r = ref(database, 'products');
    const unsub = onValue(r, (snap) => {
      const v = snap.val() || {};
      setProducts(
        Object.entries(v).map(([id, p]: [string, any]) => ({
          id, name: p.name || '', category: p.category || '', price: p.price || 0,
        }))
      );
    });
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => { off(r, 'value', unsub); clearTimeout(t); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  const ql = q.trim().toLowerCase();
  const results = ql
    ? products.filter((p) => p.name.toLowerCase().includes(ql) || p.category.toLowerCase().includes(ql)).slice(0, 8)
    : products.slice(0, 6);

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md et-fade" onClick={onClose} />
      <div className="relative w-full max-w-xl et-card et-pop rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-purple-500/15">
          <Search className="h-5 w-5 text-purple-300" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the arsenal…"
            className="flex-1 bg-transparent outline-none py-4 font-tech text-purple-50 placeholder:text-purple-300/40"
          />
          <button onClick={onClose} className="p-1.5 rounded-md border border-purple-500/20 text-purple-300/70 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-10 text-center font-tech text-sm text-purple-200/50">No signals match “{q}”.</div>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => { navigate(`/product/${p.id}`); onClose(); }}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left hover:bg-purple-500/10 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-tech text-sm text-purple-50 truncate">{p.name}</div>
                  <div className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-300/50 truncate">{p.category}</div>
                </div>
                <span className="font-display text-sm text-purple-200">${p.price}</span>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2.5 border-t border-purple-500/15 font-tech text-[10px] tracking-[0.25em] uppercase text-purple-300/50 flex items-center justify-between">
          <span>ESC to close</span>
          <span>{products.length} items indexed</span>
        </div>
      </div>
    </div>
  );
}

export default function TopNavbar({ onMenu }: { onMenu: () => void }) {
  const { currentUser, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const userRef = useClickOutside<HTMLDivElement>(() => setUserOpen(false), userOpen);
  const notifRef = useClickOutside<HTMLDivElement>(() => setNotifOpen(false), notifOpen);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleLogout = async () => {
    setUserOpen(false);
    await logout();
    navigate('/login');
  };

  const notifications = [
    { tag: 'SYSTEM', text: 'Welcome to Eclipse Tech — your console is live.', time: 'now' },
    { tag: 'DROP', text: 'New arsenal drop lands Friday 00:00 UTC.', time: '2h' },
    { tag: 'SECURITY', text: 'Two-factor hardening available in settings.', time: '1d' },
  ];

  const btnIcon = 'p-2 rounded-lg border border-purple-500/20 bg-purple-500/[0.04] text-purple-200 hover:text-white hover:border-purple-400/50 transition-colors relative';

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-purple-500/15 bg-[#07060f]/85 backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-14">
          {/* left: drawer + brand (mobile/tablet) */}
          <button onClick={onMenu} className={`lg:hidden ${btnIcon}`} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="lg:hidden flex items-center">
            <EclipseLogo size={34} withWordmark />
          </Link>

          {/* center: search (desktop) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-3 ml-2 flex-1 max-w-md px-3.5 py-2 rounded-xl border border-purple-500/20 bg-purple-500/[0.04] text-purple-200/60 hover:border-purple-400/40 hover:text-purple-100 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="font-tech text-sm tracking-wide">Search the arsenal…</span>
            <span className="ml-auto font-tech text-[10px] tracking-[0.2em] px-1.5 py-0.5 rounded border border-purple-500/25 text-purple-300/70">⌘K</span>
          </button>

          {/* right cluster */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button onClick={() => setSearchOpen(true)} className={`lg:hidden ${btnIcon}`} aria-label="Search">
              <Search className="h-5 w-5" />
            </button>

            <span className="hidden xl:flex items-center gap-2 px-2.5 h-9 rounded-lg border border-purple-500/15 font-tech text-[10px] tracking-[0.25em] uppercase text-purple-200/70">
              <SignalBars /> <span className="text-emerald-300/80">LINK</span>
              <span className="h-3 w-px bg-purple-500/20" />
              <span className="tabular-nums text-purple-100"><LiveClock /></span>
            </span>

            {/* notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }} className={btnIcon} aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 grid place-items-center rounded-full bg-purple-500 text-white text-[9px] font-bold font-display" style={{ boxShadow: '0 0 10px rgba(192,132,252,.8)' }}>3</span>
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 et-card et-pop rounded-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-purple-500/15 flex items-center justify-between">
                    <span className="font-display text-xs tracking-[0.25em] text-purple-100">NOTIFICATIONS</span>
                    <span className="et-chip">3 NEW</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className="px-4 py-3 border-b border-purple-500/10 last:border-0 hover:bg-purple-500/5 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-tech text-[9px] tracking-[0.3em] text-purple-400">{n.tag}</span>
                          <span className="font-tech text-[10px] text-purple-300/50">{n.time}</span>
                        </div>
                        <p className="mt-1 font-tech text-sm text-purple-100/85 leading-snug">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* cart */}
            <Link to="/cart" className={btnIcon} aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 grid place-items-center rounded-full bg-purple-500 text-white text-[9px] font-bold font-display" style={{ boxShadow: '0 0 10px rgba(192,132,252,.8)' }}>{count}</span>
              )}
            </Link>

            {/* user menu */}
            {currentUser && (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2 pl-1 pr-2 h-9 rounded-lg border border-purple-500/20 bg-purple-500/[0.04] hover:border-purple-400/50 transition-colors"
                >
                  <Avatar name={currentUser.displayName} email={currentUser.email} imageUrl={currentUser.photoURL} size={28} />
                  <span className="hidden sm:block font-tech text-xs text-purple-100 max-w-[110px] truncate">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-purple-300/70 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-64 et-card et-pop rounded-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-purple-500/15 flex items-center gap-3">
                      <Avatar name={currentUser.displayName} email={currentUser.email} imageUrl={currentUser.photoURL} size={36} ring />
                      <div className="min-w-0">
                        <div className="font-tech text-sm text-purple-50 truncate">{currentUser.displayName || 'Operator'}</div>
                        <div className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/60 truncate">
                          {currentUser.role === 'admin' ? 'Admin Access' : 'User Access'}
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5">
                      {[
                        { to: '/profile', icon: UserIcon, label: 'Operator Profile' },
                        { to: '/orders', icon: Package, label: 'My Manifest' },
                        ...(currentUser.role === 'admin' ? [{ to: '/172.192.67.0/settings', icon: Settings, label: 'System Settings' }] : []),
                      ].map((it) => (
                        <Link
                          key={it.to}
                          to={it.to}
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-tech text-sm text-purple-100/80 hover:bg-purple-500/10 hover:text-white transition-colors"
                        >
                          <it.icon className="h-4 w-4 text-purple-300" />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                    <div className="p-1.5 border-t border-purple-500/15">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-tech text-sm text-red-300 hover:bg-red-500/10 hover:text-white transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
