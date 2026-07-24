import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Share2, Truck, ShieldCheck, Clock, Minus, Plus, ArrowLeft } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useCart } from '../context/CartContext';
import { ProductArt, Avatar } from '../components/Visuals';
import { toast } from 'react-hot-toast';

interface P { id: string; name: string; description: string; price: number; category: string; colors?: string[]; stock: number; imageUrl?: string; imageThumbUrl?: string; }

const FEATURE_SET = ['Unlimited revisions', 'Vector + raster delivery', 'Source files included', '24/7 operator support', 'Money-back guarantee'];
const REVIEWERS = ['Aria Vex', 'Kade Orion', 'Mira Sol', 'Juno Reyes', 'Cass Nyx'];

export default function ProductDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);
  const [all, setAll] = useState<Record<string, P>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const r = ref(database, 'products');
    const u = onValue(r, (s) => {
      const v = s.val() || {};
      const m: Record<string, P> = {};
      Object.entries(v).forEach(([k, p]: [string, any]) => (m[k] = { id: k, name: p.name, description: p.description, price: p.price, category: p.category, colors: p.colors || [], stock: p.stock || 0, imageUrl: p.imageUrl || '', imageThumbUrl: p.imageThumbUrl || '' }));
      setAll(m);
      setLoaded(true);
    });
    return () => off(r, 'value', u);
  }, []);

  const product: P | undefined = all[id];
  const related = Object.values(all).filter((p) => p.id !== id).slice(0, 4);

  if (loaded && !product) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-2xl p-12 text-center">
          <h2 className="font-display text-2xl text-purple-50">SIGNAL LOST</h2>
          <p className="mt-2 font-tech text-purple-200/60">That drop is no longer in the array.</p>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-purple-300 hover:text-white font-tech text-sm tracking-wide"><ArrowLeft className="h-4 w-4" /> Back to arsenal</Link>
        </div>
      </div>
    );
  }
  if (!product) return <div className="p-8 font-tech text-purple-200/50">Loading intel…</div>;

  const addToCart = () => { add({ id: product.id, name: product.name, price: product.price, category: product.category, imageUrl: product.imageThumbUrl || product.imageUrl }, qty); toast.success(`${qty} × ${product.name} → cargo`); };
  const buyNow = () => { addToCart(); navigate('/cart'); };

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 font-tech text-[11px] tracking-[0.2em] uppercase text-purple-300/60 mb-5">
        <Link to="/" className="hover:text-purple-100">Home</Link> / <Link to="/shop" className="hover:text-purple-100">Arsenal</Link> / <span className="text-purple-100 truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* gallery */}
        <div>
          <ProductArt id={product.id} title={product.name} category={product.category} imageUrl={product.imageUrl} className="w-full h-72 sm:h-96" rounded="rounded-2xl" />
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[0, 1, 2, 3].map((i) => (
              <ProductArt key={i} id={product.id + i} title={product.name} category={product.category} imageUrl={product.imageThumbUrl || product.imageUrl} className="h-20 sm:h-24" rounded="rounded-xl" />
            ))}
          </div>
        </div>

        {/* details */}
        <div>
          <div className="bg-white rounded-2xl p-5 sm:p-7">
            <span className="et-chip mb-3">{product.category}</span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-purple-50 leading-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />)}</div>
              <span className="font-tech text-sm text-purple-200/60">4.9 · 128 transmissions</span>
            </div>
            <div className="mt-5 font-display text-4xl text-purple-300">${product.price}</div>
            <p className="mt-4 font-tech text-purple-200/70 leading-relaxed">{product.description}</p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[{ i: Truck, t: 'Free delivery' }, { i: ShieldCheck, t: 'Money-back' }, { i: Clock, t: '3–5 days' }].map(({ i: I, t }) => (
                <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/[0.05] border border-purple-500/10">
                  <I className="h-4 w-4 text-purple-300" />
                  <span className="font-tech text-xs text-purple-100/80">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2">// Colorways</div>
              <div className="flex flex-wrap gap-2">
                {(product.colors || []).map((c) => (
                  <span key={c} className="px-3 py-1 rounded-full font-tech text-xs text-purple-100/80 border border-purple-500/20 bg-purple-500/5">{c}</span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 rounded-lg hover:bg-purple-500/15"><Minus className="h-4 w-4 text-purple-200" /></button>
                <span className="font-display text-purple-50 min-w-[2.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2.5 rounded-lg hover:bg-purple-500/15"><Plus className="h-4 w-4 text-purple-200" /></button>
              </div>
              <span className="font-tech text-xs text-purple-300/50">{product.stock > 0 ? `${product.stock} available` : 'sold out'}</span>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button onClick={addToCart} className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-display text-xs tracking-[0.2em] text-white" style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}>
                <ShoppingCart className="h-4 w-4" /> ADD TO CARGO
              </button>
              <button onClick={buyNow} className="flex-1 py-3.5 rounded-xl border border-purple-400/40 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 font-display text-xs tracking-[0.2em] transition-colors">BUY NOW</button>
              <button onClick={() => setWish((w) => !w)} aria-label="Save" className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:border-purple-400/50 transition-colors">
                <Heart className={`h-5 w-5 ${wish ? 'fill-red-500 text-red-500' : 'text-purple-200'}`} />
              </button>
              <button onClick={() => toast.success('Link copied to clipboard')} aria-label="Share" className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:border-purple-400/50 transition-colors">
                <Share2 className="h-5 w-5 text-purple-200" />
              </button>
            </div>
          </div>

          <div className="mt-5 bg-white rounded-2xl p-5 sm:p-7">
            <h3 className="font-display text-sm tracking-[0.2em] text-purple-50">// WHAT'S INCLUDED</h3>
            <ul className="mt-4 space-y-2.5">
              {FEATURE_SET.map((f) => (
                <li key={f} className="flex items-center gap-3 font-tech text-sm text-purple-100/85">
                  <span className="h-5 w-5 grid place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* related */}
      <div className="mt-12">
        <h2 className="font-display text-xl tracking-[0.15em] text-purple-50 mb-5">RELATED DROPS</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {related.map((r) => (
            <Link key={r.id} to={`/product/${r.id}`} className="bg-white rounded-2xl overflow-hidden group">
              <ProductArt id={r.id} title={r.name} category={r.category} imageUrl={r.imageThumbUrl || r.imageUrl} className="h-36 group-hover:scale-[1.02] transition-transform" rounded="rounded-none" />
              <div className="p-3.5">
                <div className="font-tech text-sm text-purple-50 truncate">{r.name}</div>
                <div className="mt-1 font-display text-sm text-purple-300">${r.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* reviews */}
      <div className="mt-12 bg-white rounded-2xl p-5 sm:p-7">
        <h2 className="font-display text-xl tracking-[0.15em] text-purple-50 mb-5">OPERATOR REVIEWS</h2>
        <div className="space-y-5">
          {REVIEWERS.slice(0, 3).map((name, i) => (
            <div key={name} className="flex gap-4">
              <Avatar name={name} size={44} ring />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-tech text-sm text-purple-50">{name}</div>
                    <div className="flex mt-0.5">{[0, 1, 2, 3, 4].map((j) => <Star key={j} className="h-3.5 w-3.5 text-amber-400 fill-current" />)}</div>
                  </div>
                  <span className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/50">{i + 2}d ago</span>
                </div>
                <p className="mt-2 font-tech text-sm text-purple-200/70 leading-relaxed">
                  Exceeded the brief on every axis. The handover was clean, the files were organised and the support channel actually responded. Would commission again.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
