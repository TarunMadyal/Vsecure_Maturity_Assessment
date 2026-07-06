import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header({ cta = true }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="border-b border-edge bg-navy/85 backdrop-blur sticky top-0 z-30 no-print">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <Link to="/" aria-label="vSecure home" className="flex-none rounded-md">
            <Logo className="h-12 md:h-14" />
          </Link>
          {cta && (
            <a
              href="https://vsecure.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient flex-none text-sm font-semibold text-white rounded-full px-5 py-2.5 hover:opacity-90 transition-opacity"
            >
              Book a demo
            </a>
          )}
        </div>
      </header>
    </>
  );
}
