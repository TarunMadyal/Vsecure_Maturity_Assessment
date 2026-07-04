export default function Logo({ size = 36, withName = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/logo.svg" alt="vSecure logo" width={size} height={size} />
      {withName && (
        <span className="font-bold tracking-tight text-ink" style={{ fontSize: size * 0.55 }}>
          v<span className="text-accent">Secure</span>
        </span>
      )}
    </span>
  );
}
