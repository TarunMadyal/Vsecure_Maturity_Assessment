import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header({ cta = true }) {
  return (
    <header className="border-b border-edge bg-navy/80 backdrop-blur sticky top-0 z-30 no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" aria-label="vSecure home">
          <Logo size={34} />
        </Link>
        {cta && (
          <a
            href="mailto:vijay@vsecure.ai?subject=vSecure%20demo%20request"
            className="btn-gradient text-sm font-semibold text-white rounded-full px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            Book a demo
          </a>
        )}
      </div>
    </header>
  );
}
