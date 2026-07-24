import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Receipt, Package, CreditCard, ArrowRight, ShoppingBasket, User as UserIcon } from 'lucide-react';
import { Avatar, ProductArt } from '../../components/Visuals';
import { formatUsd } from '../../lib/money';

interface Order { id: string; userId: string; total: number; status: string; createdAt: string; items?: any[]; products?: any[]; }
interface P { id: string; name: string; category: string; imageUrl?: string; }

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, P>>({});

  useEffect(() => {
    if (!currentUser) return;
    const oR = ref(database, 'orders');
    const pR = ref(database, 'products');
    const u1 = onValue(oR, (s) => {
      const v = s.val() || {};
      const mine = Object.entries(v).map(([id, o]: [string, any]) => ({ id, ...o })).filter((o: Order) => o.userId === currentUser.id).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setOrders(mine);
    });
    const u2 = onValue(pR, (s) => {
      const v = s.val() || {};
      const m: Record<string, P> = {};
      Object.entries(v).forEach(([id, p]: [string, any]) => (m[id] = { id, name: p.name, category: p.category, imageUrl: p.imageThumbUrl || p.imageUrl || '' }));
      setProducts(m);
    });
    return () => { off(oR, 'value', u1); off(pR, 'value', u2); };
  }, [currentUser]);

  const spent = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const items = orders.reduce((s, o) => s + ((o.items || o.products || []).reduce((a: number, l: any) => a + (l.quantity || 0), 0)), 0);
  const avg = orders.filter((o) => o.status !== 'cancelled').length ? spent / orders.filter((o) => o.status !== 'cancelled').length : 0;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const activeTransmissions = orders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length;

  const isAdmin = currentUser?.role === 'admin';
  const stats = isAdmin
    ? [
        { label: 'Admin Balance', value: formatUsd(currentUser?.balance), icon: CreditCard },
        { label: 'Total Orders', value: orders.length, icon: Receipt },
        { label: 'Total Spent', value: formatUsd(spent), icon: ShoppingBag },
        { label: 'Avg Order', value: formatUsd(avg), icon: Package },
      ]
    : [
        { label: 'My Orders', value: orders.length, icon: Receipt },
        { label: 'Items Acquired', value: items, icon: Package },
        { label: 'Delivered Drops', value: delivered, icon: ShoppingBag },
        { label: 'Active Orders', value: activeTransmissions, icon: CreditCard },
      ];

  const lines = (o: Order) => o.items || o.products || [];
  const nameOf = (l: any) => l.name || products[l.productId]?.name || 'Archived item';
  const imageOf = (l: any) => l.imageUrl || products[l.productId]?.imageUrl || '';

  const quick = [
    { to: '/shop', label: 'Browse Arsenal', icon: ShoppingBasket, grad: 'from-purple-500/30 to-purple-700/20' },
    { to: '/cart', label: 'Cargo Bay', icon: ShoppingBag, grad: 'from-amber-500/25 to-orange-700/15' },
    { to: '/orders', label: 'My Manifest', icon: Receipt, grad: 'from-emerald-500/25 to-teal-700/15' },
    { to: '/profile', label: 'Operator', icon: UserIcon, grad: 'from-rose-500/25 to-pink-700/15' },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      {/* welcome banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-7 border border-purple-500/20" style={{ background: 'radial-gradient(120% 140% at 0% 0%, rgba(124,58,237,0.35), transparent 60%), linear-gradient(135deg, #1a1030 0%, #0a0814 60%, #1a1030 120%)' }}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 opacity-50"><div className="et-ring" /></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar name={currentUser?.displayName} email={currentUser?.email} imageUrl={currentUser?.photoURL} size={64} ring />
          <div className="flex-1 min-w-0">
            <div className="font-tech text-[10px] tracking-[0.35em] uppercase text-purple-300/70">Welcome back, operator</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold chrome-text font-display tracking-wider truncate">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'OPERATOR'}</h1>
            <p className="mt-1 font-tech text-sm text-purple-200/65">Your console is live · clearance <span className="text-purple-200">{currentUser?.role === 'admin' ? 'ADMIN' : 'USER'}</span></p>
          </div>
          <Link to="/shop" className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display text-xs tracking-[0.2em] text-white" style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}>
            ENTER ARSENAL <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* stats */}
      <div className="et-stagger grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between"><s.icon className="h-5 w-5 text-purple-300" /><span className="et-chip">LIVE</span></div>
            <div className="mt-3 font-display text-2xl sm:text-3xl text-purple-50">{s.value}</div>
            <div className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-200/55 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// RECENT TRANSMISSIONS</h2>
            <Link to="/orders" className="font-tech text-[11px] tracking-[0.2em] uppercase text-purple-300 hover:text-white inline-flex items-center gap-1">Manifest <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {orders.length === 0 ? (
            <div className="py-10 text-center">
              <div className="h-16 w-16 mx-auto grid place-items-center rounded-2xl border border-purple-500/20 bg-purple-500/5" style={{ boxShadow: 'inset 0 0 20px rgba(124,58,237,.2)' }}><Receipt className="h-7 w-7 text-purple-300" /></div>
              <h3 className="mt-4 font-display text-base tracking-wider text-purple-50">NO TRANSMISSIONS YET</h3>
              <p className="mt-1 font-tech text-sm text-purple-200/60">Authorise your first drop to see it stream in here.</p>
              <Link to="/shop" className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-400/40 bg-purple-500/10 text-purple-100 font-display text-[11px] tracking-[0.2em]">BROWSE ARSENAL</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 4).map((o) => {
                const head = lines(o)[0];
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#07060f]/50 border border-purple-500/10">
                    {head ? <ProductArt id={head.productId} title={nameOf(head)} imageUrl={imageOf(head)} className="h-12 w-12 shrink-0" rounded="rounded-xl" /> : <div className="h-12 w-12 shrink-0 rounded-xl bg-purple-500/10" />}
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-xs text-purple-100">#{o.id.slice(0, 8)}</div>
                      <div className="font-tech text-[11px] text-purple-300/55 truncate">{lines(o).length} item{lines(o).length === 1 ? '' : 's'} · {new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="font-display text-sm text-purple-50">${(o.total || 0).toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full font-tech text-[9px] tracking-[0.2em] uppercase ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : o.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'}`}>{o.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* quick actions */}
        <div className="bg-white rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-sm tracking-[0.2em] text-purple-50 mb-5">// QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 gap-3">
            {quick.map((q) => (
              <Link key={q.to} to={q.to} className="group p-4 rounded-xl border border-purple-500/15 bg-purple-500/[0.04] hover:bg-purple-500/10 hover:border-purple-400/40 transition-all flex flex-col items-center gap-2">
                <div className={`h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br ${q.grad} text-purple-100 group-hover:scale-105 transition-transform`}><q.icon className="h-5 w-5" /></div>
                <span className="font-tech text-[11px] tracking-[0.18em] uppercase text-purple-100/85 text-center">{q.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-xl border border-purple-500/15 bg-[#07060f]/50">
            <div className="font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/60">Operator since</div>
            <div className="mt-1 font-display text-lg text-purple-50">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
