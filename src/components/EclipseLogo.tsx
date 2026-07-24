interface EclipseLogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/**
 * The Eclipse Tech mark:
 * an ET monogram wrapped by a rotating eclipse ring with a lens-flare bloom.
 * Reusable at any pixel size; wordmark optional.
 */
export default function EclipseLogo({ size = 64, withWordmark = false, className = '' }: EclipseLogoProps) {
  const monoSize = size * 0.44;
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ lineHeight: 1 }}>
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        aria-label="Eclipse Tech logo"
      >
        {/* outer glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.55), rgba(124,58,237,0) 70%)',
            filter: 'blur(8px)',
          }}
        />
        {/* rotating conic ring */}
        <div className="et-ring" />
        {/* static inner ring */}
        <div className="et-ring-static" />
        {/* core */}
        <div
          className="absolute inset-[14%] rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #140f26 0%, #070512 80%)',
            boxShadow: 'inset 0 0 18px rgba(124,58,237,0.45)',
          }}
        >
          <span
            className="font-display chrome-text italic font-black select-none"
            style={{
              fontSize: monoSize,
              transform: 'skewX(-8deg)',
              lineHeight: 1,
            }}
          >
            ET
          </span>
        </div>
        {/* lens flare */}
        <div className="et-flare" />
      </div>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className="font-display chrome-text font-extrabold tracking-[0.18em]"
            style={{ fontSize: size * 0.34 }}
          >
            ECLIPSE
          </span>
          <span
            className="font-display violet-text font-semibold tracking-[0.5em] mt-1"
            style={{ fontSize: size * 0.16 }}
          >
            TECH
          </span>
        </div>
      )}
    </div>
  );
}
