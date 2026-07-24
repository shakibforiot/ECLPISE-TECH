import { useState } from 'react';
import { ArrowUp, Send, Diamond, Radio, Shield } from 'lucide-react';
import EclipseLogo from './EclipseLogo';
import Marquee from './Marquee';
import { LiveClock, Uptime, SignalBars } from './hud';

const TICKER = [
  'SIGNAL STABLE',
  'BUILD 0xA17',
  'NODE EU-WEST-1',
  '42 OPERATORS ONLINE',
  'ECLIPSE ARRAY NOMINAL',
  'LAT 35.6895 / LON 139.6917',
  'UPLINK ENCRYPTED',
  'NEW DROPS EVERY FRIDAY',
];

const NAV: { tag: string; links: [string, string][] }[] = [
  { tag: 'STUDIO', links: [['Command', '/'], ['Arsenal', '/shop'], ['Cargo', '/cart'], ['Operator', '/profile']] },
  { tag: 'SYSTEM', links: [['Status', '#'], ['Changelog', '#'], ['Docs', '#'], ['API', '#']] },
  { tag: 'LEGAL', links: [['Terms', '#'], ['Privacy', '#'], ['Charter', '#'], ['Security', '#']] },
];

function Social({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="group relative h-10 w-10 grid place-items-center rounded-lg border border-purple-500/20 bg-purple-500/[0.04] text-purple-200/70 hover:text-white hover:border-purple-400/60 transition-all"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: '0 0 22px rgba(192,132,252,0.45), inset 0 0 14px rgba(124,58,237,0.35)' }} />
      <span className="relative h-4 w-4">{children}</span>
    </a>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 4000);
  };

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative mt-16 overflow-hidden text-purple-100">
      {/* horizon glow line */}
      <div className="et-horizon" />

      {/* ambient layers */}
      <div className="pointer-events-none absolute inset-0 et-grid-bg opacity-40"
        style={{
          maskImage: 'radial-gradient(ellipse at 50% 0%, #000 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, #000 10%, transparent 70%)',
        }} />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.35), transparent 65%)', filter: 'blur(30px)' }} />

      {/* ticker */}
      <div className="relative border-y border-purple-500/15 bg-[#07060f]/70 backdrop-blur-xl py-2.5">
        <Marquee items={TICKER} />
      </div>

      {/* monument + transmission */}
      <div className="relative px-6 lg:px-12 pt-14 pb-10 grid lg:grid-cols-12 gap-10 lg:gap-14">
        {/* LEFT — monument */}
        <div className="lg:col-span-7 relative">
          {/* rotating faint ring behind wordmark */}
          <div className="pointer-events-none absolute -right-16 -top-10 h-[360px] w-[360px] opacity-40">
            <div className="et-ring" />
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <EclipseLogo size={46} />
            <div className="font-tech text-[10px] tracking-[0.35em] uppercase text-purple-300/70 leading-relaxed">
              DEEP-SPACE<br />DIGITAL STUDIO
            </div>
            <span className="ml-auto hidden sm:inline-flex et-chip">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 et-pulse-dot" />
              AVAILABLE FOR COMMISSION
            </span>
          </div>

          <div className="relative overflow-hidden">
            <div className="et-monument chrome-text">ECLIPSE</div>
            <div className="et-monument et-outline">TECH_</div>
          </div>

          <p className="relative mt-6 max-w-xl font-tech text-purple-200/65 text-base sm:text-lg leading-relaxed">
            We engineer brand systems, AR filters and digital arsenals in the dark —
            then deploy them at light-speed. Realtime console, encrypted sync, zero compromise.
          </p>

          {/* live readouts */}
          <div className="relative mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-tech text-[11px] tracking-[0.22em] uppercase text-purple-200/70">
            <span className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-purple-400" /> UPTIME <span className="text-purple-100 tabular-nums"><Uptime /></span>
            </span>
            <span className="h-3 w-px bg-purple-500/25" />
            <span className="flex items-center gap-2">
              <SignalBars /> 42 ONLINE
            </span>
            <span className="h-3 w-px bg-purple-500/25" />
            <span className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" /> AES-256
            </span>
            <span className="h-3 w-px bg-purple-500/25" />
            <span className="text-purple-100 tabular-nums"><LiveClock /></span>
          </div>
        </div>

        {/* RIGHT — transmission console */}
        <div className="lg:col-span-5">
          <div className="et-card et-corners p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm tracking-[0.3em] text-purple-100">// OPEN A CHANNEL</h3>
              <span className="font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/50">ENCRYPTED</span>
            </div>
            <p className="font-tech text-sm text-purple-200/65 mb-5">
              Subscribe to the signal — drops, field notes, and operator dispatches. No noise.
            </p>

            <form onSubmit={submit} className="flex items-center gap-2 p-1.5 rounded-xl border border-purple-500/25 bg-[#07060f]/80 focus-within:border-purple-400/60 transition-colors">
              <span className="pl-3 font-display text-purple-400 text-sm select-none">&gt;_</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@eclipse.tech"
                className="flex-1 bg-transparent outline-none px-2 py-2.5 font-tech text-sm text-purple-50 placeholder:text-purple-300/30"
              />
              <button
                type="submit"
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg font-display text-[11px] tracking-[0.2em] text-white"
                style={{
                  background: 'linear-gradient(90deg,#6d28d9,#a855f7)',
                  boxShadow: '0 8px 22px -8px rgba(124,58,237,0.8), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              >
                SEND <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="h-4 mt-2 font-tech text-[10px] tracking-[0.3em] uppercase">
              {sent ? (
                <span className="text-emerald-300">◆ SIGNAL RECEIVED — WELCOME ABOARD</span>
              ) : (
                <span className="text-purple-300/40">no spam • unsubscribe anytime</span>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-purple-500/15 flex items-center justify-between">
              <span className="font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/50">// TRANSMIT VIA</span>
              <div className="flex items-center gap-2">
                <Social label="X" href="#">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>
                </Social>
                <Social label="GitHub" href="#">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" /></svg>
                </Social>
                <Social label="Discord" href="#">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.2.36-.43.84-.59 1.22a18.27 18.27 0 0 0-5.59 0A12.6 12.6 0 0 0 9.11 3 19.74 19.74 0 0 0 4.677 4.37C1.86 8.55 1.094 12.62 1.476 16.64a19.9 19.9 0 0 0 6.073 3.06c.49-.67.927-1.38 1.302-2.13-.713-.27-1.396-.6-2.04-.99.171-.126.339-.257.5-.39 3.927 1.82 8.18 1.82 12.061 0 .164.138.332.269.5.39-.646.39-1.33.72-2.044.99.376.75.812 1.46 1.302 2.13a19.86 19.86 0 0 0 6.078-3.06c.448-4.66-.766-8.694-3.208-12.27ZM8.02 14.17c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.335-.955 2.42-2.157 2.42Zm7.96 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.335-.946 2.42-2.157 2.42Z" /></svg>
                </Social>
                <Social label="Instagram" href="#">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                </Social>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* nav strip — inline console list, NOT a column grid */}
      <div className="relative px-6 lg:px-12 py-6 border-t border-purple-500/15">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-tech text-xs tracking-[0.18em] uppercase">
          {NAV.map((group, gi) => (
            <div key={group.tag} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-purple-400/80">[{group.tag}]</span>
              {group.links.map(([label, href], li) => (
                <span key={label} className="flex items-center gap-4">
                  {li > 0 && <Diamond className="h-2 w-2 text-purple-500/40" />}
                  <a href={href} className="et-link text-purple-200/70 hover:text-white transition-colors">{label}</a>
                </span>
              ))}
              {gi < NAV.length - 1 && <span className="hidden sm:block h-3 w-px bg-purple-500/20 ml-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* utility bar */}
      <div className="relative px-6 lg:px-12 py-5 border-t border-purple-500/15 bg-[#07060f]/70 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-tech text-[10px] tracking-[0.28em] uppercase text-purple-300/55">
          <span>© 2026 ECLIPSE TECH — ALL SIGNALS RESERVED</span>
          <span className="flex items-center gap-4">
            <span className="text-purple-300/40">v2.6.1 // build 0xA17</span>
            <span className="hidden sm:inline h-3 w-px bg-purple-500/25" />
            <span className="text-purple-100 tabular-nums"><LiveClock /></span>
          </span>
          <button
            onClick={toTop}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/25 bg-purple-500/[0.04] hover:bg-purple-500/15 hover:border-purple-400/60 text-purple-200 transition-all"
          >
            <ArrowUp className="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform" />
            BACK TO TOP
          </button>
        </div>
      </div>
    </footer>
  );
}
