import { useEffect, useState } from 'react';

/** Fictional "launch" timestamp used to render a live system uptime. */
export const LAUNCH = new Date('2024-03-01T00:00:00Z').getTime();

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

/** Live UTC clock, ticks every second. */
export function LiveClock({ className = '' }: { className?: string }) {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={className}>
      {pad(t.getUTCHours())}:{pad(t.getUTCMinutes())}:{pad(t.getUTCSeconds())}
      <span className="opacity-50"> UTC</span>
    </span>
  );
}

/** Live uptime since LAUNCH, formatted as `Dd HH:MM:SS`. */
export function Uptime({ className = '' }: { className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, now - LAUNCH);
  const d = Math.floor(diff / 86_400_000);
  let r = diff % 86_400_000;
  const h = Math.floor(r / 3_600_000); r %= 3_600_000;
  const m = Math.floor(r / 60_000); r %= 60_000;
  const s = Math.floor(r / 1000);
  return (
    <span className={className}>
      {d}D {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

/** Tiny animated signal-strength bars. */
export function SignalBars({ className = '' }: { className?: string }) {
  return (
    <span className={`et-bars ${className}`} aria-hidden>
      <i /><i /><i /><i />
    </span>
  );
}
