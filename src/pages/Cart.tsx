import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, X, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, onValue, off, push, update } from 'firebase/database';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductArt } from '../components/Visuals';
import { toast } from 'react-hot-toast';
import { formatUsd } from '../lib/money';

const PAYMENTS = ['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL'];

export default function Cart() {
  const { items, subtotal, setQty, remove, clear, count } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [taxRate, setTaxRate] = useState(10);
  const [threshold, setThreshold] = useState(500);
  const isAdmin = currentUser?.role === 'admin';
  const [useBalance, setUseBalance] = useState(false);

  useEffect(() => {
    const r = ref(database, 'settings/general');
    const u = onValue(r, (s) => {
      const v = s.val();
      if (v) {
        if (typeof v.taxRate === 'number') setTaxRate(v.taxRate);
        if (typeof v.freeShippingThreshold === 'number') setThreshold(v.freeShippingThreshold);
      }
    });
    return () => off(r, 'value', u);
  }, []);

  const tax = (subtotal * taxRate) / 100;
  const shipping = subtotal >= threshold || subtotal === 0 ? 0 : 20;
  const total = subtotal + tax + shipping;
  const availableBalance = isAdmin ? Math.max(0, Number(currentUser?.balance) || 0) : 0;
  const balanceApplied = useBalance && isAdmin ? Math.min(availableBalance, total) : 0;
  const dueNow = Math.max(0, total - balanceApplied);

  const checkout = async () => {
    if (!items.length || !currentUser) return;
    try {
      setBusy(true);
      const orderRef = push(ref(database, 'orders'));
      if (!orderRef.key) throw new Error('Could not allocate an order id');
      const remainingBalance = Math.round((availableBalance - balanceApplied) * 100) / 100;
      await update(ref(database), {
        [`orders/${orderRef.key}`]: {
        userId: currentUser.id,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity, name: i.name, price: i.price, imageUrl: i.imageUrl || '' })),
        total,
        walletApplied: balanceApplied,
        dueNow,
        status: 'pending',
        createdAt: new Date().toISOString(),
        },
        [`users/${currentUser.id}/balance`]: remainingBalance,
      });
      clear();
      toast.success(balanceApplied > 0 ? `${formatUsd(balanceApplied)} balance applied — order authorised` : 'Order authorised — transmitting to fulfilment');
      navigate('/orders');
    } catch (e: any) {
      toast.error(e.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-purple-50">Cargo Bay</h1>
        <p className="text-purple-200/55 mt-1 font-tech text-sm">{count} item{count === 1 ? '' : 's'} queued for transmission</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-sm tracking-[0.2em] text-purple-50">// QUEUED DROPS</h2>
              {items.length > 0 && (
                <button onClick={() => { clear(); toast('Cargo bay cleared'); }} className="flex items-center gap-2 font-tech text-xs tracking-[0.2em] uppercase text-red-300 hover:text-red-200">
                  <Trash2 className="h-4 w-4" /> Clear
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-14">
                <div className="h-20 w-20 rounded-2xl grid place-items-center mx-auto mb-4 border border-purple-500/20 bg-purple-500/5" style={{ boxShadow: 'inset 0 0 24px rgba(124,58,237,.25)' }}>
                  <ShoppingCart className="h-8 w-8 text-purple-300" />
                </div>
                <h3 className="font-display text-lg tracking-wider text-purple-50">CARGO BAY EMPTY</h3>
                <p className="mt-2 font-tech text-sm text-purple-200/60">Nothing queued yet — browse the arsenal and add a drop.</p>
                <Link to="/shop" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display text-xs tracking-[0.2em] text-white" style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}>
                  BROWSE ARSENAL <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-[#07060f]/50 border border-purple-500/10">
                    <ProductArt id={it.id} title={it.name} category={it.category} imageUrl={it.imageUrl} className="h-16 w-16 sm:h-20 sm:w-20 shrink-0" rounded="rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <div className="font-tech text-sm sm:text-base text-purple-50 truncate">{it.name}</div>
                      <div className="font-tech text-[11px] tracking-[0.2em] uppercase text-purple-300/50 truncate">{it.category}</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-purple-500/[0.06] border border-purple-500/20 rounded-lg p-0.5">
                          <button onClick={() => setQty(it.id, it.quantity - 1)} className="p-1.5 rounded hover:bg-purple-500/15"><Minus className="h-3.5 w-3.5 text-purple-200" /></button>
                          <span className="font-display text-sm text-purple-50 min-w-[1.75rem] text-center">{it.quantity}</span>
                          <button onClick={() => setQty(it.id, it.quantity + 1)} className="p-1.5 rounded hover:bg-purple-500/15"><Plus className="h-3.5 w-3.5 text-purple-200" /></button>
                        </div>
                        <button onClick={() => remove(it.id)} className="p-1.5 text-purple-300/50 hover:text-red-300"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-base text-purple-50">${(it.price * it.quantity).toFixed(2)}</div>
                      <div className="font-tech text-[10px] text-purple-300/50">${it.price} ea</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 sm:p-6 lg:sticky lg:top-20">
            <h2 className="font-display text-sm tracking-[0.2em] text-purple-50 mb-5">// ORDER SUMMARY</h2>
            <div className="space-y-3 font-tech text-sm">
              <div className="flex justify-between text-purple-200/70"><span>Subtotal</span><span className="text-purple-50">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-purple-200/70"><span>Tax ({taxRate}%)</span><span className="text-purple-50">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-purple-200/70"><span>Shipping</span><span className="text-purple-50">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              {shipping > 0 && <div className="font-tech text-[11px] text-purple-300/50">Add ${(threshold - subtotal).toFixed(2)} more to unlock free shipping.</div>}
            </div>
            <div className="mt-5 pt-4 border-t border-purple-500/15 flex items-center justify-between">
              <span className="font-display text-sm tracking-[0.2em] text-purple-100">ORDER TOTAL</span>
              <span className="font-display text-2xl text-purple-300">{formatUsd(total)}</span>
            </div>
            {isAdmin && availableBalance > 0 && (
              <>
                <label className="mt-3 flex items-center gap-3 rounded-xl border border-purple-500/15 bg-purple-500/[0.04] px-3 py-2.5 font-tech text-xs cursor-pointer">
                  <input type="checkbox" checked={useBalance} onChange={(event) => setUseBalance(event.target.checked)} className="h-4 w-4 rounded accent-purple-500" />
                  <span className="flex-1 text-purple-200/70">Apply Admin Credit</span>
                  <span className="text-purple-100">{formatUsd(availableBalance)}</span>
                </label>
                {balanceApplied > 0 && (
                  <div className="mt-2 flex justify-between font-tech text-xs text-emerald-300">
                    <span>Credit applied</span>
                    <span>−{formatUsd(balanceApplied)}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between font-tech text-xs">
                  <span className="text-purple-200/70">DUE NOW</span>
                  <span className="font-display text-lg text-purple-100">{formatUsd(dueNow)}</span>
                </div>
              </>
            )}
            <button
              onClick={checkout}
              disabled={busy || items.length === 0}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-display text-xs tracking-[0.2em] text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg,#6d28d9,#a855f7)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8)' }}
            >
              <CreditCard className="h-4 w-4" /> {busy ? 'TRANSMITTING…' : 'AUTHORISE ORDER'}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 font-tech text-[10px] tracking-[0.25em] uppercase text-purple-300/50">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> encrypted checkout
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              {PAYMENTS.map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-md border border-purple-500/20 bg-purple-500/5 font-display text-[9px] tracking-[0.2em] text-purple-200/70">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
