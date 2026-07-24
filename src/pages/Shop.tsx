import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Search, Filter, ShoppingCart, Heart, Grid3X3, List } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductArt, EmptyState } from '../components/Visuals';
import { toast } from 'react-hot-toast';

interface P { id: string; name: string; description: string; price: number; category: string; colors?: string[]; stock: number; imageUrl?: string; imageThumbUrl?: string; }

const COLOR_HEX: Record<string, string> = {
  Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#f59e0b', Purple: '#a855f7',
  Pink: '#ec4899', Orange: '#f97316', Black: '#111111', White: '#f5f5f5', Gray: '#6b7280',
};

export default function Shop() {
  const { add } = useCart();
  const [products, setProducts] = useState<P[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const productRef = ref(database, 'products');
    const categoryRef = ref(database, 'categories');
    const productListener = onValue(productRef, (s) => {
      const v = s.val() || {};
      const list: P[] = Object.entries(v).map(([id, p]: [string, any]) => ({
        id, name: p.name || '', description: p.description || '', price: p.price || 0,
        category: p.category || '', colors: p.colors || [], stock: p.stock || 0, imageUrl: p.imageUrl || '', imageThumbUrl: p.imageThumbUrl || '',
      }));
      setProducts(list);
      setLoaded(true);
    });
    const categoryListener = onValue(categoryRef, (s) => {
      const value = s.val() || {};
      setCategories(
        Object.values(value)
          .map((category: any) => category.name as string)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      );
    });
    return () => {
      off(productRef, 'value', productListener);
      off(categoryRef, 'value', categoryListener);
    };
  }, []);

  useEffect(() => {
    if (category !== 'all' && !categories.includes(category)) setCategory('all');
  }, [categories, category]);

  const filtered = products
    .filter((p) => (category === 'all' || p.category === category) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) =>
      sort === 'low' ? a.price - b.price :
      sort === 'high' ? b.price - a.price :
      sort === 'name' ? a.name.localeCompare(b.name) : 0
    );

  const toggleWish = (id: string) =>
    setWishlist((w) => {
      const n = new Set(w);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const selectCls = 'w-full px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50';

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="mb-7 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-purple-50">The Arsenal</h1>
          <p className="text-purple-200/55 mt-1 font-tech text-sm">{filtered.length} drops · realtime catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={`p-2.5 rounded-lg border ${view === 'grid' ? 'border-purple-400/60 bg-purple-500/15 text-white' : 'border-purple-500/15 text-purple-200/60'}`}><Grid3X3 className="h-4 w-4" /></button>
          <button onClick={() => setView('list')} className={`p-2.5 rounded-lg border ${view === 'list' ? 'border-purple-400/60 bg-purple-500/15 text-white' : 'border-purple-500/15 text-purple-200/60'}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 mb-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/70" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the arsenal…" className="w-full pl-11 pr-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50 placeholder:text-purple-300/30" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
            <option value="featured">Featured</option>
            <option value="low">Price · low → high</option>
            <option value="high">Price · high → low</option>
            <option value="name">Name · A → Z</option>
          </select>
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="h-4 w-4 text-purple-300/60 shrink-0" />
          {['all', ...categories].map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`shrink-0 px-3 py-1 rounded-full font-tech text-[11px] tracking-[0.2em] uppercase transition-colors border ${category === c ? 'border-purple-400/60 bg-purple-500/20 text-white' : 'border-purple-500/15 text-purple-200/60 hover:border-purple-400/40'}`}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div className="bg-white rounded-2xl p-10 text-center font-tech text-purple-200/50">Indexing arsenal…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl">
          <EmptyState
            icon={Search}
            title={products.length === 0 ? 'No products published yet' : 'No matching signals'}
            hint={products.length === 0 ? 'The catalogue is controlled by the administrator. Check back after new products are published.' : 'Try clearing the search or picking a different category.'}
          />
        </div>
      ) : (
        <div className={`et-stagger grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {filtered.map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl overflow-hidden flex ${view === 'list' ? 'flex-row' : 'flex-col'}`}>
              <div className={`relative ${view === 'list' ? 'w-40 shrink-0' : ''}`}>
                <ProductArt id={p.id} title={p.name} category={p.category} imageUrl={p.imageThumbUrl || p.imageUrl} className={view === 'list' ? 'h-full min-h-[140px]' : 'h-44'} rounded="rounded-none" />
                <button onClick={() => toggleWish(p.id)} aria-label="Save" className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors">
                  <Heart className={`h-4 w-4 ${wishlist.has(p.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                {p.stock > 0 && p.stock <= 5 && (
                  <span className="absolute left-3 bottom-3 et-chip" style={{ background: 'rgba(245,158,11,0.18)', borderColor: 'rgba(245,158,11,0.4)', color: '#fbbf24' }}>LOW STOCK</span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-purple-50 leading-tight">{p.name}</h3>
                  <span className="font-display text-lg text-purple-300 shrink-0">${p.price}</span>
                </div>
                <p className="mt-2 font-tech text-sm text-purple-200/60 line-clamp-2 flex-1">{p.description}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {p.colors?.slice(0, 4).map((c) => (
                      <span key={c} title={c} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: COLOR_HEX[c] || '#888' }} />
                    ))}
                    {(p.colors?.length || 0) > 4 && <span className="font-tech text-[10px] text-purple-300/50">+{(p.colors?.length || 0) - 4}</span>}
                  </div>
                  <span className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/50">{p.stock > 0 ? `${p.stock} in stock` : 'sold out'}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => { add({ id: p.id, name: p.name, price: p.price, category: p.category, imageUrl: p.imageThumbUrl || p.imageUrl }); toast.success(`${p.name} → cargo`); }}
                    disabled={p.stock <= 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-display text-[11px] tracking-[0.2em] text-white disabled:opacity-40"
                    style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 8px 22px -10px rgba(124,58,237,0.8)' }}
                  >
                    <ShoppingCart className="h-4 w-4" /> ADD
                  </button>
                  <Link to={`/product/${p.id}`} className="px-4 py-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-100 hover:border-purple-400/50 font-tech text-[11px] tracking-[0.2em] uppercase transition-colors">
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
