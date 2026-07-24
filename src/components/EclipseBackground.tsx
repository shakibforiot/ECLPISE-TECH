import { useMemo } from 'react';

/**
 * Ambient background for Eclipse Tech:
 * - deep-space base with twin radial violet blooms
 * - responsive parallax starfields (two layers)
 * - a faint hairline grid with a radial mask
 * - drifting violet plasma orbs
 * - a slow vertical scanline
 */
function makeStars(count: number, maxSize: number) {
  const layers: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const s = (Math.random() * maxSize + 0.4).toFixed(2);
    const a = (Math.random() * 0.6 + 0.3).toFixed(2);
    layers.push(
      `radial-gradient(${s}px ${s}px at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(255,255,255,${a}), transparent 60%)`
    );
  }
  return layers.join(', ');
}

export default function EclipseBackground() {
  const starsA = useMemo(() => makeStars(70, 1.6), []);
  const starsB = useMemo(() => makeStars(30, 2.4), []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 800px at 80% -10%, rgba(124,58,237,0.28), transparent 60%),' +
            'radial-gradient(900px 700px at -10% 110%, rgba(91,33,182,0.30), transparent 60%),' +
            'radial-gradient(600px 500px at 50% 50%, rgba(76,29,149,0.12), transparent 70%),' +
            'linear-gradient(180deg, #050409 0%, #07060f 50%, #050409 100%)',
        }}
      />

      {/* hairline grid with radial fade */}
      <div
        className="absolute inset-0 et-grid-bg opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
        }}
      />

      {/* star layers */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: starsA, animation: 'et-twinkle 4s ease-in-out infinite' }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: starsB, animation: 'et-twinkle 6s ease-in-out infinite reverse' }}
      />

      {/* drifting plasma orbs */}
      <div
        className="absolute rounded-full"
        style={{
          width: 520, height: 520, top: '-10%', left: '8%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.35), transparent 65%)',
          filter: 'blur(40px)',
          animation: 'et-drift 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 420, height: 420, bottom: '-12%', right: '4%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.40), transparent 65%)',
          filter: 'blur(50px)',
          animation: 'et-drift-2 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 300, height: 300, top: '40%', right: '30%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.18), transparent 70%)',
          filter: 'blur(60px)',
          animation: 'et-drift 26s ease-in-out infinite',
        }}
      />

      {/* moving scanline */}
      <div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.55), transparent)',
          boxShadow: '0 0 24px rgba(192,132,252,0.5)',
          animation: 'et-scan 7s linear infinite',
          opacity: 0.5,
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
}
