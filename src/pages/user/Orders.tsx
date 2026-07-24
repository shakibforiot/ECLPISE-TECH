import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductArt, EmptyState } from '../../components/Visuals';

interface OrderLine { productId: string; quantity: number; name?: string; price?: number; imageUrl?: string; }
interface Order { id: string; userId: string; items?: OrderLine[]; products?: OrderLine[]; total: number; status: string; createdAt: string; }
interface ProductLite { id: string; name: string; price: number; category: string; imageUrl?: string; }

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  processing: 'bg-blue-100 text-blue-600',
  shipped: 'bg-violet-100 text-violet-600',
  delivered: 'bg-emerald-100 text-emerald-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function UserOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, ProductLite>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const oR = ref(database, 'orders');
    const pR = ref(database, 'products');
    const u1 = onValue(oR, (s) => {
      const v = s.val() || {};
      const mine: Order[] = Object.entries(v)
        .map(([id, o]: [string, any]) => ({ id, ...o }))
        .filter((o: Order) => o.userId === currentUser.id)
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setOrders(mine);
      setLoading(false);
    });
    const u2 = onValue(pR, (s) => {
      const v = s.val() || {};
      const m: Record<string, ProductLite> = {};
      Object.entries(v).forEach(([id, p]: [string, any]) => (m[id] = { id, name: p.name, price: p.price, category: p.category, imageUrl: p.imageThumbUrl || p.imageUrl || '' }));
      setProducts(m);
    });
    return () => { off(oR, 'value', u1); off(pR, 'value', u2); };
  }, [currentUser]);

  const lines = (o: Order): OrderLine[] => o.items || o.products || [];
  const nameOf = (l: OrderLine) => l.name || products[l.productId]?.name || 'Archived item';
  const catOf = (l: OrderLine) => products[l.productId]?.category || '';
  const imageOf = (l: OrderLine) => l.imageUrl || products[l.productId]?.imageUrl || '';

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-purple-50">My Manifest</h1>
        <p className="text-purple-200/55 mt-1 font-tech text-sm">Every transmission you have authorised, in realtime.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center font-tech text-purple-200/50">Decrypting manifest…</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl">
          <EmptyState
            icon={ShoppingBag}
            title="No transmissions yet"
            hint="Your order history will appear here the moment you authorise a drop from the arsenal."
            action={
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display text-xs tracking-[0.2em] text-white"
                style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}
              >
                BROWSE ARSENAL <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const ls = lines(o);
            const head = ls[0];
            return (
              <div key={o.id} className="bg-white rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {head && (
                      <ProductArt id={head.productId} title={nameOf(head)} category={catOf(head)} imageUrl={imageOf(head)} className="h-12 w-12 shrink-0" rounded="rounded-xl" />
                    )}
                    <div className="min-w-0">
                      <div className="font-display text-sm text-purple-50">ORDER #{o.id.slice(0, 8)}</div>
                      <div className="font-tech text-[11px] text-purple-200/55">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-purple-50">${(o.total || 0).toFixed(2)}</span>
                    <span className={`px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-600'}`}>{o.status}</span>
                  </div>
                </div>

                {/* status timeline */}
                <div className="flex items-center gap-1 mb-4">
                  {['pending', 'processing', 'shipped', 'delivered'].map((s, i, arr) => {
                    const reached = ['pending', 'processing', 'shipped', 'delivered'].indexOf(o.status) >= i;
                    const cancelled = o.status === 'cancelled';
                    return (
                      <div key={s} className="flex-1 flex items-center gap-1">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${cancelled ? 'bg-red-500/40' : reached ? 'bg-gradient-to-r from-purple-500 to-purple-300' : 'bg-purple-500/15'}`} />
                        {i === arr.length - 1 && <div className={`h-1.5 w-1.5 rounded-full ${cancelled ? 'bg-red-500/40' : reached ? 'bg-purple-300' : 'bg-purple-500/15'}`} />}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ls.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[#07060f]/50 border border-purple-500/10">
                      <ProductArt id={l.productId} title={nameOf(l)} category={catOf(l)} imageUrl={imageOf(l)} className="h-10 w-10 shrink-0" rounded="rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <div className="font-tech text-sm text-purple-50 truncate">{nameOf(l)}</div>
                        <div className="font-tech text-[10px] text-purple-300/50">qty {l.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {ls.length === 0 && (
                    <div className="col-span-full py-4 text-center font-tech text-xs text-purple-200/50 flex items-center justify-center gap-2">
                      <Package className="h-4 w-4" /> Line items archived
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
