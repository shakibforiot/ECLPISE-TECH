import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { DollarSign, ShoppingBag, Users, Package, LayoutDashboard, Receipt, Settings as SettingsIcon, Wrench, Layers3 } from 'lucide-react';
import { Avatar, EmptyState } from '../../components/Visuals';

interface Order { id: string; userId: string; total: number; status: string; createdAt: string; items?: any[]; products?: any[]; }
interface U { id: string; email: string; displayName?: string; createdAt?: string; }

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<U[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const oR = ref(database, 'orders');
    const uR = ref(database, 'users');
    const pR = ref(database, 'products');
    const cR = ref(database, 'categories');
    const u1 = onValue(oR, (s) => { const v = s.val() || {}; setOrders(Object.entries(v).map(([id, o]: [string, any]) => ({ id, ...o })).sort((a: Order, b: Order) => (b.createdAt || '').localeCompare(a.createdAt || ''))); setLoaded(true); });
    const u2 = onValue(uR, (s) => { const v = s.val() || {}; setUsers(Object.entries(v).map(([id, x]: [string, any]) => ({ id, email: x.email, displayName: x.displayName, createdAt: x.createdAt }))); });
    const u3 = onValue(pR, (s) => setProductCount(Object.keys(s.val() || {}).length));
    const u4 = onValue(cR, (s) => setCategoryCount(Object.keys(s.val() || {}).length));
    return () => { off(oR, 'value', u1); off(uR, 'value', u2); off(pR, 'value', u3); off(cR, 'value', u4); };
  }, []);

  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter((o) => o.status === 'pending').length;

  const stats = [
    { label: 'Net Revenue', value: `$${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, hint: `${orders.length} orders` },
    { label: 'Operators', value: users.length, icon: Users, hint: `${users.filter((u) => u.createdAt && Date.now() - new Date(u.createdAt).getTime() < 7 * 864e5).length} new / 7d` },
    { label: 'Catalogue', value: productCount, icon: Package, hint: `${categoryCount} categories` },
    { label: 'Pending', value: pending, icon: ShoppingBag, hint: 'awaiting fulfilment' },
  ];

  // monthly revenue bars (last 6 months)
  const months = useMemo(() => {
    const arr: { label: string; key: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      arr.push({ label: d.toLocaleString(undefined, { month: 'short' }), key, value: 0 });
    }
    orders.forEach((o) => {
      if (o.status === 'cancelled' || !o.createdAt) return;
      const k = o.createdAt.slice(0, 7);
      const m = arr.find((x) => x.key === k);
      if (m) m.value += o.total || 0;
    });
    return arr;
  }, [orders]);
  const maxBar = Math.max(1, ...months.map((m) => m.value));

  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const recentUsers = [...users].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);
  const empty = orders.length === 0 && productCount === 0 && categoryCount === 0;

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="mb-7 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-purple-50">Command Overview</h1>
          <p className="text-purple-200/55 mt-1 font-tech text-sm">Live telemetry from the realtime array.</p>
        </div>
        <Link to="/172.192.67.0/settings" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-400/40 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 font-display text-[11px] tracking-[0.2em]">
          <Wrench className="h-4 w-4" /> SYSTEM SETTINGS
        </Link>
      </div>

      {empty && loaded && (
        <div className="mb-6 et-card et-corners p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-11 w-11 grid place-items-center rounded-xl bg-amber-500/15 text-amber-300"><Wrench className="h-5 w-5" /></div>
          <div className="flex-1">
            <div className="font-display text-sm tracking-wider text-purple-50">ARRAY IS COLD</div>
            <p className="font-tech text-sm text-purple-200/65">No products, orders or operators yet. Create categories first, then add your real products.</p>
          </div>
          <Link to="/172.192.67.0/categories" className="px-4 py-2.5 rounded-xl font-display text-[11px] tracking-[0.2em] text-white" style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)' }}>CREATE CATEGORY</Link>
        </div>
      )}

      <div className="et-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/15 text-purple-300"><s.icon className="h-5 w-5" /></div>
              <span className="et-chip">LIVE</span>
            </div>
            <div className="mt-3 font-display text-3xl text-purple-50">{s.value}</div>
            <div className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-200/55 mt-1">{s.label}</div>
            <div className="font-tech text-[10px] text-purple-300/45 mt-0.5">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// REVENUE · 6 MO</h2>
            <span className="font-display text-lg text-purple-300">${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="h-52 flex items-end gap-2 sm:gap-3">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full text-center font-tech text-[10px] text-purple-200/70 opacity-0 group-hover:opacity-100 transition-opacity">${m.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="w-full rounded-t-lg transition-all relative overflow-hidden" style={{ height: `${Math.max(4, (m.value / maxBar) * 100)}%`, background: 'linear-gradient(180deg,#c084fc,#6d28d9)', boxShadow: '0 0 22px rgba(124,58,237,.35)' }}>
                  <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
                </div>
                <span className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/60">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// QUICK ACTIONS</h2>
            <LayoutDashboard className="h-4 w-4 text-purple-300/60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/172.192.67.0/products', label: 'Products', icon: Package },
              { to: '/172.192.67.0/categories', label: 'Categories', icon: Layers3 },
              { to: '/172.192.67.0/orders', label: 'Orders', icon: Receipt },
              { to: '/172.192.67.0/users', label: 'Operators', icon: Users },
              { to: '/172.192.67.0/settings', label: 'Settings', icon: SettingsIcon },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="group p-4 rounded-xl border border-purple-500/15 bg-purple-500/[0.04] hover:bg-purple-500/10 hover:border-purple-400/40 transition-all flex flex-col items-center gap-2">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-700/20 text-purple-200 group-hover:scale-105 transition-transform"><a.icon className="h-5 w-5" /></div>
                <span className="font-tech text-[11px] tracking-[0.2em] uppercase text-purple-100/85">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// RECENT ORDERS</h2>
            <Link to="/172.192.67.0/orders" className="font-tech text-[11px] tracking-[0.2em] uppercase text-purple-300 hover:text-white">Control →</Link>
          </div>
          {orders.length === 0 ? (
            <EmptyState icon={Receipt} title="No orders yet" hint="Orders stream in here the moment an operator authorises a drop." />
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => {
                const u = userMap[o.userId];
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#07060f]/50 border border-purple-500/10">
                    <Avatar name={u?.displayName} email={u?.email} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-xs text-purple-100">#{o.id.slice(0, 8)}</div>
                      <div className="font-tech text-[11px] text-purple-300/60 truncate">{u?.displayName || u?.email || 'unknown'}</div>
                    </div>
                    <span className="font-display text-sm text-purple-50">${(o.total || 0).toFixed(0)}</span>
                    <span className={`px-2 py-0.5 rounded-full font-tech text-[9px] tracking-[0.2em] uppercase ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : o.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'}`}>{o.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// NEW OPERATORS</h2>
            <Link to="/172.192.67.0/users" className="font-tech text-[11px] tracking-[0.2em] uppercase text-purple-300 hover:text-white">Roster →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <EmptyState icon={Users} title="No operators yet" hint="New identities appear here as they register." />
          ) : (
            <div className="space-y-2">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#07060f]/50 border border-purple-500/10">
                  <Avatar name={u.displayName} email={u.email} size={34} ring />
                  <div className="min-w-0 flex-1">
                    <div className="font-tech text-sm text-purple-50 truncate">{u.displayName || '—'}</div>
                    <div className="font-tech text-[11px] text-purple-300/55 truncate">{u.email}</div>
                  </div>
                  <span className="font-tech text-[10px] text-purple-300/50">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
