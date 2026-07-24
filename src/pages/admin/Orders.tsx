import { useEffect, useState } from 'react';
import { database } from '../../lib/firebase';
import { ref, onValue, off, set } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Package, Eye } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Avatar, EmptyState } from '../../components/Visuals';
import { toast } from 'react-hot-toast';

interface OrderLine { productId: string; quantity: number; name?: string; price?: number; imageUrl?: string; }
interface Order { id: string; userId: string; items?: OrderLine[]; products?: OrderLine[]; total: number; status: string; createdAt: string; }
interface UserLite { id: string; displayName?: string; email: string; }
interface ProductLite { id: string; name: string; price: number; imageUrl?: string; }

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  processing: 'bg-blue-100 text-blue-600',
  shipped: 'bg-violet-100 text-violet-600',
  delivered: 'bg-emerald-100 text-emerald-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<string, UserLite>>({});
  const [products, setProducts] = useState<Record<string, ProductLite>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState<Order | null>(null);

  useEffect(() => {
    const oR = ref(database, 'orders');
    const uR = ref(database, 'users');
    const pR = ref(database, 'products');
    const u1 = onValue(oR, (s) => {
      const v = s.val() || {};
      setOrders(Object.entries(v).map(([id, o]: [string, any]) => ({ id, ...o })).sort((a: Order, b: Order) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      setLoading(false);
    });
    const u2 = onValue(uR, (s) => {
      const v = s.val() || {};
      const m: Record<string, UserLite> = {};
      Object.entries(v).forEach(([id, u]: [string, any]) => (m[id] = { id, displayName: u.displayName, email: u.email }));
      setUsers(m);
    });
    const u3 = onValue(pR, (s) => {
      const v = s.val() || {};
      const m: Record<string, ProductLite> = {};
      Object.entries(v).forEach(([id, p]: [string, any]) => (m[id] = { id, name: p.name, price: p.price, imageUrl: p.imageThumbUrl || p.imageUrl || '' }));
      setProducts(m);
    });
    return () => { off(oR, 'value', u1); off(uR, 'value', u2); off(pR, 'value', u3); };
  }, []);

  const lines = (o: Order): OrderLine[] => o.items || o.products || [];
  const resolveName = (l: OrderLine) => l.name || products[l.productId]?.name || l.productId.slice(0, 8);
  const resolveImage = (l: OrderLine) => l.imageUrl || products[l.productId]?.imageUrl || '';

  const changeStatus = async (id: string, status: string) => {
    try {
      await set(ref(database, `orders/${id}/status`), status);
      toast.success(`Order ${id.slice(0, 6)} → ${status}`);
    } catch (e: any) {
      toast.error(e.message || 'Update failed');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const totals = orders.reduce(
    (a, o) => {
      a.count++;
      if (o.status !== 'cancelled') a.revenue += o.total || 0;
      if (o.status === 'pending') a.pending++;
      return a;
    },
    { count: 0, revenue: 0, pending: 0 }
  );

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-purple-50">Order Control</h1>
          <p className="text-purple-200/55 mt-1 font-tech text-sm">Monitor, fulfil and override every transmission.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full font-tech text-[11px] tracking-[0.2em] uppercase transition-colors border ${
                filter === s ? 'border-purple-400/60 bg-purple-500/20 text-white' : 'border-purple-500/15 text-purple-200/60 hover:border-purple-400/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {[
          { label: 'Total Orders', value: totals.count, icon: ShoppingBag },
          { label: 'Net Revenue', value: `$${totals.revenue.toLocaleString()}`, icon: Package },
          { label: 'Awaiting Fulfilment', value: totals.pending, icon: Eye },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-purple-300" />
              <span className="et-chip">LIVE</span>
            </div>
            <div className="mt-3 text-3xl font-bold text-purple-50 font-display">{s.value}</div>
            <div className="font-tech text-xs tracking-[0.2em] uppercase text-purple-200/55 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center font-tech text-purple-200/50">Scanning order array…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl">
          <EmptyState
            icon={ShoppingBag}
            title={orders.length === 0 ? 'No orders yet' : 'No orders in this state'}
            hint={orders.length === 0 ? 'Orders placed by operators will stream in here in realtime once real products are published.' : 'Try a different status filter.'}
          />
        </div>
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-slate-50">
                  <tr className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-200/60">
                    <th className="text-left px-5 py-3">Order</th>
                    <th className="text-left px-5 py-3">Operator</th>
                    <th className="text-left px-5 py-3">Items</th>
                    <th className="text-left px-5 py-3">Total</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-right px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((o) => {
                    const u = users[o.userId];
                    return (
                      <tr key={o.id} className="hover:bg-purple-500/5 transition-colors">
                        <td className="px-5 py-3 font-display text-xs text-purple-100">#{o.id.slice(0, 8)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u?.displayName} email={u?.email} size={30} />
                            <div className="min-w-0">
                              <div className="font-tech text-sm text-purple-50 truncate">{u?.displayName || 'Unknown'}</div>
                              <div className="font-tech text-[10px] text-purple-300/50 truncate">{u?.email || o.userId.slice(0, 10)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-tech text-sm text-purple-200/80">{lines(o).length}</td>
                        <td className="px-5 py-3 font-display text-sm text-purple-50">${(o.total || 0).toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <select
                            value={o.status}
                            onChange={(e) => changeStatus(o.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-600'}`}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3 font-tech text-xs text-purple-200/60">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setActive(o)} className="px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-200 hover:text-white hover:border-purple-400/50 font-tech text-[11px] tracking-[0.2em] uppercase transition-colors">Inspect</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((o) => {
              const u = users[o.userId];
              return (
                <div key={o.id} className="bg-white rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={u?.displayName} email={u?.email} size={34} />
                      <div className="min-w-0">
                        <div className="font-display text-xs text-purple-100">#{o.id.slice(0, 8)}</div>
                        <div className="font-tech text-xs text-purple-200/70 truncate">{u?.displayName || u?.email || 'Unknown'}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-tech text-xs text-purple-200/60">{lines(o).length} items · {new Date(o.createdAt).toLocaleDateString()}</span>
                    <span className="font-display text-sm text-purple-50">${(o.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/20 font-tech text-xs text-purple-100">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setActive(o)} className="px-3 py-2 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-200 font-tech text-xs tracking-[0.2em] uppercase">Inspect</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `ORDER #${active.id.slice(0, 8)}` : ''}
        subtitle={active ? `placed ${new Date(active.createdAt).toLocaleString()}` : ''}
        size="lg"
        footer={
          active && (
            <div className="flex items-center justify-between w-full">
              <span className="font-display text-lg text-purple-50">${(active.total || 0).toFixed(2)}</span>
              <select
                value={active.status}
                onChange={(e) => { changeStatus(active.id, e.target.value); setActive({ ...active, status: e.target.value }); }}
                className={`px-3 py-2 rounded-full font-tech text-[11px] tracking-[0.2em] uppercase ${STATUS_COLOR[active.status]}`}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )
        }
      >
        {active && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <Avatar name={users[active.userId]?.displayName} email={users[active.userId]?.email} size={40} ring />
              <div>
                <div className="font-tech text-sm text-purple-50">{users[active.userId]?.displayName || 'Unknown operator'}</div>
                <div className="font-tech text-xs text-purple-300/60">{users[active.userId]?.email || active.userId}</div>
              </div>
              <span className={`ml-auto px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${STATUS_COLOR[active.status]}`}>{active.status}</span>
            </div>
            {lines(active).length === 0 ? (
              <div className="py-8 text-center font-tech text-sm text-purple-200/50">No line items recorded.</div>
            ) : (
              lines(active).map((l, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#07060f]/50 border border-purple-500/10">
                  <div className="min-w-0">
                    <div className="font-tech text-sm text-purple-50 truncate">{resolveName(l)}</div>
                    <div className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/50">qty {l.quantity} · #{l.productId.slice(0, 6)}</div>
                  </div>
                    {resolveImage(l) && <img src={resolveImage(l)} alt="" className="h-9 w-9 rounded-lg object-cover border border-purple-500/20" />}
                  <span className="font-display text-sm text-purple-100">${((l.price ?? products[l.productId]?.price ?? 0) * l.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* silence unused warning if role not referenced */}
      <span className="hidden">{currentUser?.role}</span>
    </div>
  );
}
