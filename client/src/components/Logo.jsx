import { useState } from 'react';

/**
 * vSecure brand lockup (shield mark + wordmark + tagline) from
 * client/public/logo-text.png - white artwork on a transparent
 * background, so it sits cleanly on any dark surface. Falls back to the
 * square mark plus a text wordmark if the image is missing.
 *
 * variant="full"  - full lockup, sized by height (header, footer, report)
 * variant="mark"  - square shield mark only (tight spots)
 */
export default function Logo({ variant = 'full', className = '' }) {
  const [fallback, setFallback] = useState(false);

  if (variant === 'mark') {
    return (
      <img
        src="/logo.png"
        alt="vSecure"
        className={`object-contain ${className || 'h-10 w-10'}`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  if (fallback) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src="/logo.png"
          alt=""
          className="h-9 w-9 object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span className="font-bold tracking-tight text-ink text-xl">
          v<span className="text-accent">SECURE</span>
        </span>
      </span>
    );
  }

  return (
    <img
      src="/logo-text.png"
      alt="vSECURE - Securing and Empowering Organizations"
      className={`object-contain object-left ${className || 'h-12 md:h-14'}`}
      onError={() => setFallback(true)}
    />
  );
}
