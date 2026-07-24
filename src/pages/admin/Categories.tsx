import { useEffect, useMemo, useState } from 'react';
import { database } from '../../lib/firebase';
import { ref, onValue, off, push, set, update } from 'firebase/database';
import { FolderPlus, Layers3, Package, Plus, Search, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/Modal';
import { EmptyState } from '../../components/Visuals';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  createdAt?: string;
}

interface ProductLite {
  id: string;
  category?: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Category | null>(null);
  const [removingBusy, setRemovingBusy] = useState(false);

  useEffect(() => {
    const categoryRef = ref(database, 'categories');
    const productRef = ref(database, 'products');
    const categoryListener = onValue(categoryRef, (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value)
        .map(([id, category]: [string, any]) => ({ id, name: category.name || '', createdAt: category.createdAt }))
        .filter((category) => category.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      setCategories(list);
    });
    const productListener = onValue(productRef, (snapshot) => {
      const value = snapshot.val() || {};
      setProducts(Object.entries(value).map(([id, product]: [string, any]) => ({ id, category: product.category })));
    });
    return () => {
      off(categoryRef, 'value', categoryListener);
      off(productRef, 'value', productListener);
    };
  }, []);

  const productCount = (categoryName: string) =>
    products.filter((product) => product.category === categoryName).length;

  const filtered = useMemo(
    () => categories.filter((category) => category.name.toLowerCase().includes(query.trim().toLowerCase())),
    [categories, query]
  );

  const addCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.replace(/\s+/g, ' ').trim();
    if (!cleanName) return;
    if (categories.some((category) => category.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error('This category already exists');
      return;
    }
    try {
      setAdding(true);
      const id = push(ref(database, 'categories')).key;
      if (!id) throw new Error('Could not generate a category id');
      await set(ref(database, `categories/${id}`), {
        name: cleanName,
        createdAt: new Date().toISOString(),
      });
      setName('');
      toast.success(`${cleanName} category created`);
    } catch (error: any) {
      toast.error(error.message || 'Category creation failed');
    } finally {
      setAdding(false);
    }
  };

  const removeCategory = async () => {
    if (!removing) return;
    const usedBy = products.filter((product) => product.category === removing.name);
    try {
      setRemovingBusy(true);
      const updates: Record<string, unknown> = {
        [`categories/${removing.id}`]: null,
      };

      // Keep product records valid when an in-use category is removed.
      if (usedBy.length > 0) {
        const hasFallback = categories.some((category) => category.name.toLowerCase() === 'uncategorized');
        if (!hasFallback) {
          const fallbackId = push(ref(database, 'categories')).key;
          if (fallbackId) {
            updates[`categories/${fallbackId}`] = {
              name: 'Uncategorized',
              createdAt: new Date().toISOString(),
            };
          }
        }
        usedBy.forEach((product) => {
          updates[`products/${product.id}/category`] = 'Uncategorized';
        });
      }

      await update(ref(database), updates);
      toast.success(
        usedBy.length > 0
          ? `${removing.name} removed. ${usedBy.length} product${usedBy.length === 1 ? '' : 's'} moved to Uncategorized.`
          : `${removing.name} category removed`
      );
      setRemoving(null);
    } catch (error: any) {
      toast.error(error.message || 'Category removal failed');
    } finally {
      setRemovingBusy(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-7">
        <div>
          <h1 className="text-3xl font-bold text-purple-50">Category Control</h1>
          <p className="mt-1 font-tech text-sm text-purple-200/55">Create and remove the live category taxonomy.</p>
        </div>
        <span className="et-chip">{categories.length} ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white rounded-2xl p-5 sm:p-6 h-fit">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/15 text-purple-300">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-sm tracking-[0.18em] text-purple-50">NEW CATEGORY</h2>
              <p className="font-tech text-xs text-purple-200/55">Available instantly in the product form.</p>
            </div>
          </div>
          <form onSubmit={addCategory} className="space-y-3">
            <label className="block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70">// Category name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. UI Kits"
              maxLength={40}
              className="w-full px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50 placeholder:text-purple-300/30"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="w-full py-3 rounded-xl inline-flex items-center justify-center gap-2 font-display text-xs tracking-[0.2em] text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}
            >
              <Plus className="h-4 w-4" /> {adding ? 'CREATING…' : 'CREATE CATEGORY'}
            </button>
          </form>
          <p className="mt-4 font-tech text-xs leading-relaxed text-purple-300/50">
            Removing an active category safely moves connected products to <span className="text-purple-200">Uncategorized</span>.
          </p>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/15 text-purple-300"><Layers3 className="h-5 w-5" /></div>
              <div>
                <h2 className="font-display text-sm tracking-[0.18em] text-purple-50">LIVE TAXONOMY</h2>
                <p className="font-tech text-xs text-purple-200/55">Realtime category allocation and product usage.</p>
              </div>
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/70" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories…"
                className="w-full pl-10 pr-3 py-2.5 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-sm text-purple-50 placeholder:text-purple-300/30"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Layers3}
              title={categories.length === 0 ? 'No categories yet' : 'No categories match'}
              hint={categories.length === 0 ? 'Create a category before adding products to the catalogue.' : 'Try another search term.'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((category) => {
                const count = productCount(category.name);
                return (
                  <div key={category.id} className="flex items-center gap-3 rounded-xl border border-purple-500/15 bg-[#07060f]/45 p-4 hover:border-purple-400/40 transition-colors">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/15 text-purple-300"><Package className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-tech text-sm text-purple-50 truncate">{category.name}</div>
                      <div className="mt-1 font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/55">
                        {count} product{count === 1 ? '' : 's'}
                      </div>
                    </div>
                    <button
                      onClick={() => setRemoving(category)}
                      title={`Remove ${category.name}`}
                      className="p-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={removeCategory}
        loading={removingBusy}
        title="REMOVE CATEGORY"
        confirmLabel="Remove category"
        message={
          removing
            ? `Remove “${removing.name}”? ${productCount(removing.name) > 0 ? `${productCount(removing.name)} linked product${productCount(removing.name) === 1 ? '' : 's'} will be moved to Uncategorized.` : 'No products are currently linked to this category.'}`
            : ''
        }
      />
    </div>
  );
}