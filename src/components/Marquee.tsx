interface MarqueeProps {
  items: string[];
  duration?: number;
  className?: string;
}

/**
 * Seamless horizontal ticker. Renders the row twice inside a max-content
 * track and translates -50% so the loop is invisible.
 */
export default function Marquee({ items, duration = 34, className = '' }: MarqueeProps) {
  const row = (
    <div className="flex shrink-0">
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-3 px-6 font-tech text-[11px] tracking-[0.3em] uppercase text-purple-200/70">
          <span className="text-purple-400">◆</span>
          <span>{t}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`et-marquee-mask ${className}`}>
      <div className="et-marquee et-marquee-track" style={{ animationDuration: `${duration}s` }}>
        {row}
        <div aria-hidden>{row}</div>
      </div>
    </div>
  );
}
