// Looks for the real logo at client/public/logo.png; if it hasn't been added
// yet, the broken image is hidden and the wordmark alone still reads fine.
export default function Logo({ size = 36, withName = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt="vSecure logo"
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {withName && (
        <span className="font-bold tracking-tight text-ink" style={{ fontSize: size * 0.55 }}>
          v<span className="text-accent">Secure</span>
        </span>
      )}
    </span>
  );
}
