import { useEffect, useState } from 'react';
import { database } from '../../lib/firebase';
import { ref, onValue, off, set, remove } from 'firebase/database';
import { Link } from 'react-router-dom';
import { Save, Trash2, Store, Percent, Truck, Layers3 } from 'lucide-react';
import { ConfirmDialog } from '../../components/Modal';
import { toast } from 'react-hot-toast';

interface SettingsData {
  storeName: string;
  tagline: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
}

const DEFAULTS: SettingsData = {
  storeName: 'Eclipse Tech',
  tagline: 'Deep-space digital studio',
  currency: 'USD',
  taxRate: 10,
  freeShippingThreshold: 500,
};

export default function AdminSettings() {
  const [data, setData] = useState<SettingsData>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    const r = ref(database, 'settings/general');
    const u = onValue(r, (s) => {
      const v = s.val();
      if (v) setData({ ...DEFAULTS, ...v });
      setLoaded(true);
    });
    return () => off(r, 'value', u);
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await set(ref(database, 'settings/general'), data);
      toast.success('Settings committed');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const wipe = async () => {
    try {
      setWiping(true);
      await Promise.all([
        remove(ref(database, 'products')),
        remove(ref(database, 'orders')),
        remove(ref(database, 'categories')),
        remove(ref(database, 'settings')),
      ]);
      setData(DEFAULTS);
      setWipeOpen(false);
      toast.success('Array wiped clean');
    } catch (e: any) {
      toast.error(e.message || 'Wipe failed');
    } finally {
      setWiping(false);
    }
  };

  const field = 'w-full px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 text-purple-50 font-tech';
  const label = 'block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2';

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-purple-50">System Settings</h1>
          <p className="text-purple-200/55 mt-1 font-tech text-sm">Tune the live store and manage real catalogue data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* store config */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/15 text-purple-300"><Store className="h-5 w-5" /></div>
            <div>
              <h2 className="font-display text-lg tracking-wider text-purple-50">STORE CONFIG</h2>
              <p className="font-tech text-xs text-purple-200/55">Public-facing identity & checkout maths.</p>
            </div>
          </div>

          {!loaded ? (
            <div className="py-8 text-center font-tech text-sm text-purple-200/50">Loading config…</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>// Store Name</label>
                  <input className={field} value={data.storeName} onChange={(e) => setData({ ...data, storeName: e.target.value })} />
                </div>
                <div>
                  <label className={label}>// Currency</label>
                  <select className={field} value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })}>
                    {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'BDT'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={label}>// Tagline</label>
                <input className={field} value={data.tagline} onChange={(e) => setData({ ...data, tagline: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}><span className="inline-flex items-center gap-2"><Percent className="h-3.5 w-3.5" /> Tax Rate (%)</span></label>
                  <input type="number" min={0} step={0.5} className={field} value={data.taxRate} onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={label}><span className="inline-flex items-center gap-2"><Truck className="h-3.5 w-3.5" /> Free Shipping Over</span></label>
                  <input type="number" min={0} className={field} value={data.freeShippingThreshold} onChange={(e) => setData({ ...data, freeShippingThreshold: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-display text-sm tracking-[0.2em] text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}
              >
                <Save className="h-4 w-4" /> {saving ? 'COMMITTING…' : 'COMMIT SETTINGS'}
              </button>
            </div>
          )}
        </div>

        {/* array control */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/15 text-purple-300"><Layers3 className="h-5 w-5" /></div>
              <h2 className="font-display text-base tracking-wider text-purple-50">CATEGORY CONTROL</h2>
            </div>
            <p className="font-tech text-sm text-purple-200/65 mb-4">
              Create and remove the categories used by the product editor and storefront filters. No sample products are added automatically.
            </p>
            <Link to="/172.192.67.0/categories" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-purple-400/40 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 font-display text-xs tracking-[0.2em] transition-colors">
              <Layers3 className="h-4 w-4" /> MANAGE CATEGORIES
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-red-500/15 text-red-300"><Trash2 className="h-5 w-5" /></div>
              <h2 className="font-display text-base tracking-wider text-purple-50">DANGER ZONE</h2>
            </div>
            <p className="font-tech text-sm text-purple-200/65 mb-4">
              Permanently erase all products, categories, orders and settings from the realtime array. Users are preserved.
            </p>
            <button
              onClick={() => setWipeOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 font-display text-xs tracking-[0.2em] transition-colors"
            >
              <Trash2 className="h-4 w-4" /> WIPE ALL DATA
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={wipeOpen}
        onClose={() => setWipeOpen(false)}
        onConfirm={wipe}
        loading={wiping}
        title="WIPE ALL DATA"
        confirmLabel="Erase everything"
        message="This removes every product, category, order and setting from the realtime array. This cannot be undone. Operators (users) will be kept."
      />
    </div>
  );
}
