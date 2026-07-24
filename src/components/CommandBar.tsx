import { useLocation } from 'react-router-dom';
import { Search, Diamond } from 'lucide-react';
import { LiveClock, SignalBars } from './hud';

function section(pathname: string): string {
  if (pathname.startsWith('/172.192.67.0/products')) return 'ADMIN // ARSENAL';
  if (pathname.startsWith('/172.192.67.0/users')) return 'ADMIN // OPERATORS';
  if (pathname.startsWith('/172.192.67.0')) return 'ADMIN // OVERVIEW';
  if (pathname.startsWith('/shop')) return 'ARSENAL';
  if (pathname.startsWith('/cart')) return 'CARGO BAY';
  if (pathname.startsWith('/profile')) return 'OPERATOR';
  if (pathname.startsWith('/product')) return 'INTEL';
  return 'COMMAND DECK';
}

/**
 * Thin HUD strip pinned under the top edge on desktop. Streams the current
 * section, route, a live clock and a faux signal readout to keep the console
 * feeling alive.
 */
export default function CommandBar() {
  const { pathname } = useLocation();
  return (
    <div className="hidden lg:flex items-center gap-4 px-6 lg:px-8 py-2 border-b border-purple-500/15 bg-[#07060f]/60 backdrop-blur-xl font-tech text-[10px] tracking-[0.28em] uppercase text-purple-200/70 sticky lg:top-14 z-20">
      <span className="flex items-center gap-2 text-purple-100">
        <Diamond className="h-3 w-3 text-purple-400" />
        {section(pathname)}
      </span>
      <span className="h-3 w-px bg-purple-500/25" />
      <span className="text-purple-300/50 truncate max-w-[260px]">{pathname}</span>

      <div className="ml-auto flex items-center gap-5">
        <span className="flex items-center gap-2">
          <SignalBars />
          <span className="text-emerald-300/80">SIGNAL</span>
        </span>
        <span className="text-purple-300/50">PING 12ms</span>
        <span className="text-purple-100 tabular-nums">
          <LiveClock />
        </span>
        <span className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-purple-500/25 bg-purple-500/5 text-purple-200/80">
          <Search className="h-3 w-3" />⌘K
        </span>
      </div>
    </div>
  );
}
