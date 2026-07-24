import { ReactNode } from 'react';

/* deterministic 32-bit hash from a string */
export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* on-brand palette pairs (deep jewel tones, never rainbow) */
const PALETTE: [string, string][] = [
  ['#7c3aed', '#c084fc'],
  ['#4f46e5', '#a855f7'],
  ['#9333ea', '#f0abfc'],
  ['#6d28d9', '#818cf8'],
  ['#a21caf', '#c084fc'],
  ['#4338ca', '#e879f9'],
  ['#5b21b6', '#d8b4fe'],
];

/* Generative monogram avatar — no external images. */
export function Avatar({
  name = '',
  email = '',
  size = 40,
  ring = false,
  imageUrl = '',
  className = '',
}: {
  name?: string;
  email?: string;
  size?: number;
  ring?: boolean;
  imageUrl?: string;
  className?: string;
}) {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? email?.[0] ?? '?';
  const b = parts[1]?.[0] ?? '';
  const initials = (a + b).toUpperCase();
  const seed = seedFromString(src);
  const [c1, c2] = PALETTE[seed % PALETTE.length];
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full font-display font-bold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        boxShadow: ring
          ? `0 0 0 2px #0a0814, 0 0 0 4px ${c2}99, 0 6px 18px -6px ${c1}`
          : `inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px -4px ${c1}aa`,
        textShadow: '0 1px 2px rgba(0,0,0,0.45)',
      }}
      aria-hidden
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full rounded-full object-cover"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
      ) : (
        initials || 'ET'
      )}
    </div>
  );
}

/* Generative product cover art — distinct per item, no external images. */
export function ProductArt({
  title = '',
  category = '',
  id = '',
  imageUrl = '',
  className = '',
  rounded = 'rounded-xl',
}: {
  title?: string;
  category?: string;
  id?: string;
  imageUrl?: string;
  className?: string;
  rounded?: string;
}) {
  const seed = seedFromString((id || '') + title + category);
  const [c1, c2] = PALETTE[seed % PALETTE.length];
  const letter = (title.trim()[0] || 'E').toUpperCase();
  const motif = seed % 4;
  const gid = `pg${seed}`;
  return (
    <div
      className={`relative overflow-hidden et-art ${rounded} ${className}`}
      style={{
        background: `radial-gradient(120% 120% at 20% 10%, ${c2}40, transparent 60%), linear-gradient(135deg, ${c1} 0%, #0a0814 55%, ${c2} 140%)`,
      }}
    >
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c2} stopOpacity="0.9" />
            <stop offset="1" stopColor={c1} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={'v' + i} x1={i * 50} y1="0" x2={i * 50} y2="300" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={'h' + i} x1="0" y1={i * 50} x2="400" y2={i * 50} />
          ))}
        </g>
        {motif === 0 && (
          <g fill="none" stroke={`url(#${gid})`} strokeWidth="2">
            {[40, 80, 120, 160].map((r) => (
              <circle key={r} cx="300" cy="80" r={r} />
            ))}
          </g>
        )}
        {motif === 1 && (
          <g stroke={`url(#${gid})`} strokeWidth="2">
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={i} x1={-60 + i * 60} y1="320" x2={140 + i * 60} y2="-20" />
            ))}
          </g>
        )}
        {motif === 2 && (
          <g fill={`url(#${gid})`}>
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 7 }).map((_, c) => (
                <circle key={r + '-' + c} cx={30 + c * 55} cy={30 + r * 60} r="3" />
              ))
            )}
          </g>
        )}
        {motif === 3 && (
          <g fill="none" stroke={`url(#${gid})`} strokeWidth="2">
            <rect x="40" y="40" width="320" height="220" rx="14" />
            <rect x="72" y="72" width="256" height="156" rx="10" />
            <rect x="104" y="104" width="192" height="92" rx="8" />
          </g>
        )}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Orbitron, sans-serif"
          fontWeight="900"
          fontSize="210"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth="1.2"
        >
          {letter}
        </text>
      </svg>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title || 'Product image'}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
      )}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 opacity-50">
        <div className="et-ring" />
      </div>
      {category && (
        <span
          className="absolute left-3 top-3 et-chip"
          style={{ background: 'rgba(7,6,15,0.55)', backdropFilter: 'blur(6px)' }}
        >
          {category}
        </span>
      )}
      <span className="absolute right-3 bottom-2 font-display text-[10px] tracking-[0.3em] text-white/40">ET</span>
    </div>
  );
}

/* Shared empty-state block. */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: (p: { className?: string }) => ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="relative h-20 w-20 grid place-items-center rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] mb-5">
        <Icon className="h-8 w-8 text-purple-300" />
        <span className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 24px rgba(124,58,237,.25)' }} />
      </div>
      <h3 className="font-display text-lg tracking-wider text-purple-50">{title}</h3>
      {hint && <p className="mt-2 max-w-sm font-tech text-sm text-purple-200/60">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
