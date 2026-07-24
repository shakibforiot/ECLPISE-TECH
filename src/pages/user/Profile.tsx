import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../../lib/firebase';
import { ref, onValue, off, update } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { Save, X, ShoppingBag, Receipt, Camera, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Avatar } from '../../components/Visuals';
import { uploadImageToImageBB } from '../../lib/imgbb';
import { formatUsd } from '../../lib/money';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(currentUser?.displayName || '');
    setPhotoURL(currentUser?.photoURL || '');
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    // load extended profile fields
    const pR = ref(database, `users/${currentUser.id}`);
    const u1 = onValue(pR, (s) => {
      const v = s.val() || {};
      setPhone(v.phone || '');
      setBio(v.bio || '');
      setPhotoURL(v.photoURL || currentUser.photoURL || '');
    });
    const oR = ref(database, 'orders');
    const u2 = onValue(oR, (s) => {
      const v = s.val() || {};
      const mine = Object.entries(v).map(([id, o]: [string, any]) => ({ id, ...o })).filter((o: any) => o.userId === currentUser.id).sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setOrders(mine);
    });
    return () => { off(pR, 'value', u1); off(oR, 'value', u2); };
  }, [currentUser]);

  const items = orders.reduce((s, o) => s + ((o.items || o.products || []).reduce((a: number, l: any) => a + (l.quantity || 0), 0)), 0);
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  const save = async () => {
    if (!currentUser) return;
    try {
      setSaving(true);
      await updateProfile({ displayName, photoURL });
      await update(ref(database, `users/${currentUser.id}`), {
        phone,
        bio,
      });
      setEditing(false);
      toast.success('Profile committed');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const uploaded = await uploadImageToImageBB(file, `operator-${displayName || currentUser?.email || 'avatar'}`);
      setPhotoURL(uploaded.url);
      await updateProfile({ photoURL: uploaded.url });
      toast.success('Operator image updated');
    } catch (error: any) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setUploadingPhoto(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const field = 'w-full px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50 placeholder:text-purple-300/30 disabled:opacity-50';
  const label = 'block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2';

  const isAdmin = currentUser?.role === 'admin';
  const stats = [
    { label: 'Orders', value: orders.length, icon: Receipt },
    ...(isAdmin ? [{ label: 'Admin Balance', value: formatUsd(currentUser?.balance), icon: ShoppingBag }] : [{ label: 'Delivered', value: delivered, icon: ShoppingBag }]),
    { label: 'Items', value: items, icon: Package },
    { label: 'Clearance', value: currentUser?.role === 'admin' ? 'ADMIN' : 'USER', icon: Camera },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-purple-50">Operator Profile</h1>
        <p className="text-purple-200/55 mt-1 font-tech text-sm">Identity, clearance and transmission history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* identity card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="relative inline-block">
              <Avatar name={displayName || currentUser?.email} email={currentUser?.email} imageUrl={photoURL} size={96} ring />
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
              <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingPhoto} className="absolute -bottom-1 -right-1 h-9 w-9 grid place-items-center rounded-full border border-purple-400/50 bg-[#0a0814] text-purple-200 hover:text-white transition-colors disabled:opacity-60" style={{ boxShadow: '0 0 18px rgba(192,132,252,.5)' }}>
                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
            </div>
            <h2 className="mt-4 font-display text-xl tracking-wider text-purple-50">{displayName || 'Operator'}</h2>
            <p className="font-tech text-xs text-purple-300/60 truncate">{currentUser?.email}</p>
            <span className="mt-3 inline-block et-chip">{currentUser?.role === 'admin' ? 'ADMIN CLEARANCE' : 'USER CLEARANCE'}</span>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-purple-500/[0.05] border border-purple-500/10">
                  <s.icon className="h-4 w-4 text-purple-300 mx-auto" />
                  <div className="mt-1.5 font-display text-lg text-purple-50">{s.value}</div>
                  <div className="font-tech text-[9px] tracking-[0.25em] uppercase text-purple-300/55">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* details + activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// IDENTITY FIELDS</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl border border-purple-400/40 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 font-tech text-xs tracking-[0.2em] uppercase transition-colors">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl font-tech text-xs tracking-[0.2em] uppercase text-white disabled:opacity-60 inline-flex items-center gap-2" style={{ background: 'linear-gradient(90deg,#059669,#10b981)' }}><Save className="h-3.5 w-3.5" /> {saving ? '…' : 'Save'}</button>
                  <button onClick={() => { setEditing(false); setDisplayName(currentUser?.displayName || ''); }} className="px-4 py-2 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-200 font-tech text-xs tracking-[0.2em] uppercase inline-flex items-center gap-2"><X className="h-3.5 w-3.5" /> Cancel</button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>// Callsign</label>
                  <input className={field} value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!editing} />
                </div>
                <div>
                  <label className={label}>// Uplink (email)</label>
                  <input className={field} value={currentUser?.email || ''} disabled />
                </div>
                <div>
                  <label className={label}>// Comms (phone)</label>
                  <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} placeholder="+1 …" />
                </div>
                <div>
                  <label className={label}>// Clearance</label>
                  <input className={field} value={currentUser?.role || 'user'} disabled />
                </div>
              </div>
              <div>
                <label className={label}>// Bio</label>
                <textarea className={`${field} resize-none`} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} disabled={!editing} placeholder="Transmit a short operator bio…" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// RECENT TRANSMISSIONS</h2>
              <Link to="/orders" className="font-tech text-[11px] tracking-[0.2em] uppercase text-purple-300 hover:text-white inline-flex items-center gap-1">Manifest <ArrowRight className="h-3 w-3" /></Link>
            </div>
            {orders.length === 0 ? (
              <div className="py-8 text-center font-tech text-sm text-purple-200/50">No transmissions yet.</div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#07060f]/50 border border-purple-500/10">
                    <div className="min-w-0">
                      <div className="font-display text-xs text-purple-100">#{o.id.slice(0, 8)}</div>
                      <div className="font-tech text-[11px] text-purple-300/55">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="font-display text-sm text-purple-50">${(o.total || 0).toFixed(2)}</span>
                    <span className={`px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : o.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
