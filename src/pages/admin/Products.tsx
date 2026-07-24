import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../../lib/firebase';
import { ref, onValue, off, push, set, remove } from 'firebase/database';
import { Plus, Search, Edit2, Trash2, Eye, Grid3X3, List, Filter } from 'lucide-react';
import { Modal, ConfirmDialog } from '../../components/Modal';
import ProductForm, { ProductFormData } from '../../components/ProductForm';
import { ProductArt, EmptyState } from '../../components/Visuals';
import { toast } from 'react-hot-toast';

interface P { id: string; name: string; description: string; price: number; category: string; colors?: string[]; stock: number; imageUrl?: string; imageThumbUrl?: string; createdAt?: string; }

export default function AdminProducts() {
  const [products, setProducts] = useState<P[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<P | null>(null);
  const [viewing, setViewing] = useState<P | null>(null);
  const [deleting, setDeleting] = useState<P | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const productRef = ref(database, 'products');
    const categoryRef = ref(database, 'categories');
    const productListener = onValue(productRef, (s) => {
      const v = s.val() || {};
      setProducts(Object.entries(v).map(([id, p]: [string, any]) => ({ id, name: p.name || '', description: p.description || '', price: p.price || 0, category: p.category || '', colors: p.colors || [], stock: p.stock || 0, imageUrl: p.imageUrl || '', imageThumbUrl: p.imageThumbUrl || '', createdAt: p.createdAt })));
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

  const filtered = products.filter((p) => (category === 'all' || p.category === category) && (p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())));

  const save = async (data: ProductFormData) => {
    try {
      setSubmitting(true);
      const now = new Date().toISOString();
      if (editing) {
        await set(ref(database, `products/${editing.id}`), { ...editing, ...data, updatedAt: now });
        toast.success('Product updated');
        setEditing(null);
      } else {
        const k = push(ref(database, 'products')).key!;
        await set(ref(database, `products/${k}`), { ...data, createdAt: now, updatedAt: now });
        toast.success('Product committed to array');
        setAddOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await remove(ref(database, `products/${deleting.id}`));
      toast.success('Product removed');
      setDeleting(null);
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const selectCls = 'w-full px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50';

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-purple-50">Product Control</h1>
          <p className="text-purple-200/55 mt-1 font-tech text-sm">{products.length} items in the realtime array</p>
        </div>
        <button onClick={() => setAddOpen(true)} disabled={categories.length === 0} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display text-xs tracking-[0.2em] text-white disabled:opacity-50" style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}>
          <Plus className="h-4 w-4" /> NEW PRODUCT
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 mb-7">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/70" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="w-full pl-11 pr-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50 placeholder:text-purple-300/30" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('grid')} className={`p-2.5 rounded-lg border ${view === 'grid' ? 'border-purple-400/60 bg-purple-500/15 text-white' : 'border-purple-500/15 text-purple-200/60'}`}><Grid3X3 className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={`p-2.5 rounded-lg border ${view === 'list' ? 'border-purple-400/60 bg-purple-500/15 text-white' : 'border-purple-500/15 text-purple-200/60'}`}><List className="h-4 w-4" /></button>
            <span className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/15 font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/60"><Filter className="h-3.5 w-3.5" /> {filtered.length} shown</span>
          </div>
        </div>
      </div>

      {!loaded ? (
        <div className="bg-white rounded-2xl p-10 text-center font-tech text-purple-200/50">Loading array…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl">
          <EmptyState
            icon={Plus}
            title={products.length === 0 ? 'Array is empty' : 'No matches'}
            hint={products.length === 0 ? (categories.length === 0 ? 'Create a category first, then publish your first real product.' : 'Publish your first real product to bring the catalogue online.') : 'Adjust the search or category filter.'}
            action={products.length === 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => setAddOpen(true)} disabled={categories.length === 0} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display text-xs tracking-[0.2em] text-white disabled:opacity-50" style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)' }}><Plus className="h-4 w-4" /> NEW PRODUCT</button>
                <Link to="/172.192.67.0/categories" className="px-5 py-3 rounded-xl border border-purple-400/40 bg-purple-500/10 text-purple-100 font-display text-xs tracking-[0.2em]">CONTROL CATEGORIES</Link>
              </div>
            ) : undefined}
          />
        </div>
      ) : (
        <div className={`et-stagger grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {filtered.map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl overflow-hidden flex ${view === 'list' ? 'flex-row' : 'flex-col'}`}>
              <div className={`relative ${view === 'list' ? 'w-40 shrink-0' : ''}`}>
                <ProductArt id={p.id} title={p.name} category={p.category} imageUrl={p.imageThumbUrl || p.imageUrl} className={view === 'list' ? 'h-full min-h-[140px]' : 'h-40'} rounded="rounded-none" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-purple-50 leading-tight">{p.name}</h3>
                  <span className="font-display text-lg text-purple-300 shrink-0">${p.price}</span>
                </div>
                <p className="mt-2 font-tech text-sm text-purple-200/60 line-clamp-2 flex-1">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${p.stock > 10 ? 'bg-emerald-100 text-emerald-600' : p.stock > 0 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{p.stock > 0 ? `${p.stock} in stock` : 'sold out'}</span>
                  <span className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/50">{p.colors?.length || 0} colors</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={() => setViewing(p)} className="py-2 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-100 hover:border-purple-400/50 font-tech text-[10px] tracking-[0.2em] uppercase inline-flex items-center justify-center gap-1"><Eye className="h-3.5 w-3.5" /> View</button>
                  <button onClick={() => setEditing(p)} className="py-2 rounded-lg border border-purple-400/40 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 font-tech text-[10px] tracking-[0.2em] uppercase inline-flex items-center justify-center gap-1"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => setDeleting(p)} className="py-2 rounded-lg border border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 font-tech text-[10px] tracking-[0.2em] uppercase inline-flex items-center justify-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="NEW PRODUCT" subtitle="Commit a drop to the realtime array" size="lg">
        <ProductForm categories={categories} submitting={submitting} onSubmit={save} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="EDIT PRODUCT" subtitle={editing?.name} size="lg">
        {editing && <ProductForm categories={categories} submitting={submitting} initial={editing} onSubmit={save} />}
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="PRODUCT INTEL" subtitle={viewing?.name} size="md">
        {viewing && (
          <div className="space-y-4">
            <ProductArt id={viewing.id} title={viewing.name} category={viewing.category} imageUrl={viewing.imageUrl} className="w-full h-44" rounded="rounded-xl" />
            <div className="grid grid-cols-2 gap-3 font-tech text-sm">
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10"><div className="text-[10px] tracking-[0.25em] uppercase text-purple-300/60">Price</div><div className="font-display text-lg text-purple-50 mt-1">${viewing.price}</div></div>
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10"><div className="text-[10px] tracking-[0.25em] uppercase text-purple-300/60">Stock</div><div className="font-display text-lg text-purple-50 mt-1">{viewing.stock}</div></div>
            </div>
            <div><div className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-300/60 mb-1">Category</div><div className="font-tech text-sm text-purple-100">{viewing.category}</div></div>
            <div><div className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-300/60 mb-1">Description</div><p className="font-tech text-sm text-purple-200/75">{viewing.description}</p></div>
            <div><div className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-300/60 mb-1">Colorways</div><div className="flex flex-wrap gap-2">{(viewing.colors || []).map((c) => <span key={c} className="px-2.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 font-tech text-xs text-purple-100">{c}</span>)}</div></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="DELETE PRODUCT"
        confirmLabel="Delete permanently"
        message={`Remove “${deleting?.name}” from the array? Existing orders keep their recorded line items, but the catalogue entry will be gone for good.`}
      />
    </div>
  );
}
