import { useEffect, useState } from 'react';
import { database } from '../../lib/firebase';
import { ref, onValue, off, set } from 'firebase/database';
import { Search, Edit2, Trash2, Shield, User as UserIcon, Mail, Phone, ChevronUp, ChevronDown } from 'lucide-react';
import { Modal, ConfirmDialog } from '../../components/Modal';
import { Avatar, EmptyState } from '../../components/Visuals';
import { toast } from 'react-hot-toast';

interface U { id: string; email: string; displayName?: string; role: 'user' | 'admin'; createdAt?: string; phone?: string; }

export default function AdminUsers() {
  const [users, setUsers] = useState<U[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'role'>('date');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const [editing, setEditing] = useState<U | null>(null);
  const [deleting, setDeleting] = useState<U | null>(null);
  const [form, setForm] = useState({ displayName: '', phone: '', role: 'user' as 'user' | 'admin' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = ref(database, 'users');
    const u = onValue(r, (s) => {
      const v = s.val() || {};
      setUsers(Object.entries(v).map(([id, x]: [string, any]) => ({ id, email: x.email || '', displayName: x.displayName || '', role: x.role || 'user', createdAt: x.createdAt, phone: x.phone || '' })));
      setLoaded(true);
    });
    return () => off(r, 'value', u);
  }, []);

  const filtered = users
    .filter((u) => (role === 'all' || u.role === role) && ((u.displayName || '').toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => {
      const m = dir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return (a.displayName || a.email).localeCompare(b.displayName || b.email) * m;
      if (sortBy === 'role') return a.role.localeCompare(b.role) * m;
      return ((a.createdAt || '').localeCompare(b.createdAt || '')) * m;
    });

  const openEdit = (u: U) => { setEditing(u); setForm({ displayName: u.displayName || '', phone: u.phone || '', role: u.role }); };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      await set(ref(database, `users/${editing.id}`), { ...editing, displayName: form.displayName, phone: form.phone, role: form.role });
      toast.success('Operator updated');
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await set(ref(database, `users/${deleting.id}`), null as any);
      toast.success('Operator removed');
      setDeleting(null);
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const stats = [
    { label: 'Operators', value: users.length, icon: UserIcon },
    { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, icon: Shield },
    { label: 'Users', value: users.filter((u) => u.role === 'user').length, icon: Mail },
    { label: 'With Comms', value: users.filter((u) => u.phone).length, icon: Phone },
  ];

  const field = 'w-full px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50 placeholder:text-purple-300/30';
  const label = 'block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2';

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-purple-50">Operator Roster</h1>
        <p className="text-purple-200/55 mt-1 font-tech text-sm">{users.length} identities · edit clearance and comms in realtime</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between"><s.icon className="h-5 w-5 text-purple-300" /><span className="et-chip">LIVE</span></div>
            <div className="mt-3 font-display text-2xl text-purple-50">{s.value}</div>
            <div className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-200/55 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/70" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roster…" className="w-full pl-11 pr-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 font-tech text-purple-50 placeholder:text-purple-300/30" />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={field}>
            <option value="all">All clearance</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={`${field} flex-1`}>
              <option value="date">Joined</option>
              <option value="name">Callsign</option>
              <option value="role">Clearance</option>
            </select>
            <button onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))} className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-200">{dir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
          </div>
        </div>
      </div>

      {!loaded ? (
        <div className="bg-white rounded-2xl p-10 text-center font-tech text-purple-200/50">Decrypting roster…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl"><EmptyState icon={UserIcon} title="No operators match" hint="Adjust the search or clearance filter." /></div>
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden md:block bg-white rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50">
                  <tr className="font-tech text-[10px] tracking-[0.25em] uppercase text-purple-200/60">
                    <th className="text-left px-5 py-3">Operator</th>
                    <th className="text-left px-5 py-3">Uplink</th>
                    <th className="text-left px-5 py-3">Clearance</th>
                    <th className="text-left px-5 py-3">Comms</th>
                    <th className="text-left px-5 py-3">Joined</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-purple-500/5 transition-colors">
                      <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar name={u.displayName} email={u.email} size={34} /><div className="min-w-0"><div className="font-tech text-sm text-purple-50 truncate">{u.displayName || '—'}</div><div className="font-tech text-[10px] text-purple-300/50 truncate">#{u.id.slice(0, 8)}</div></div></div></td>
                      <td className="px-5 py-3 font-tech text-sm text-purple-200/80 truncate max-w-[220px]">{u.email}</td>
                      <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                      <td className="px-5 py-3 font-tech text-sm text-purple-200/70">{u.phone || '—'}</td>
                      <td className="px-5 py-3 font-tech text-xs text-purple-200/60">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3"><div className="flex items-center justify-end gap-2"><button onClick={() => openEdit(u)} className="p-2 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-200 hover:text-white hover:border-purple-400/50" title="Edit"><Edit2 className="h-4 w-4" /></button><button onClick={() => setDeleting(u)} className="p-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 hover:text-white" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={u.displayName} email={u.email} size={42} ring />
                  <div className="min-w-0 flex-1">
                    <div className="font-tech text-sm text-purple-50 truncate">{u.displayName || '—'}</div>
                    <div className="font-tech text-xs text-purple-300/60 truncate">{u.email}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-tech text-[10px] tracking-[0.2em] uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(u)} className="flex-1 py-2 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-100 font-tech text-[11px] tracking-[0.2em] uppercase inline-flex items-center justify-center gap-1"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => setDeleting(u)} className="flex-1 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 font-tech text-[11px] tracking-[0.2em] uppercase inline-flex items-center justify-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="EDIT OPERATOR" subtitle={editing?.email} size="md" footer={
        <>
          <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-100 font-tech text-sm tracking-wide">Cancel</button>
          <button onClick={saveEdit} disabled={saving} className="px-4 py-2.5 rounded-xl font-tech text-sm tracking-wide text-white disabled:opacity-60" style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)' }}>{saving ? '…' : 'Commit'}</button>
        </>
      }>
        <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <Avatar name={form.displayName || editing?.email} email={editing?.email} size={48} ring />
          <div className="min-w-0"><div className="font-tech text-sm text-purple-50 truncate">{form.displayName || '—'}</div><div className="font-tech text-xs text-purple-300/60 truncate">{editing?.email}</div></div>
        </div>
        <div className="space-y-4">
          <div><label className={label}>// Callsign</label><input className={field} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></div>
          <div><label className={label}>// Comms (phone)</label><input className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 …" /></div>
          <div><label className={label}>// Clearance</label>
            <select className={field} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'user' | 'admin' })}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} title="REMOVE OPERATOR" confirmLabel="Remove" message={`Delete ${deleting?.displayName || deleting?.email} from the roster? Their order history will remain but the identity record is erased.`} />
    </div>
  );
}
