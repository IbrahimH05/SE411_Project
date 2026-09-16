import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Dashboard', isActive: (path) => path === '/' },
  { to: '/assets', label: 'Assets', isActive: (path) => path === '/assets' || path.endsWith('/edit') },
  { to: '/assets/new', label: 'Add asset', isActive: (path) => path === '/assets/new' },
  { to: '/about', label: 'About', isActive: (path) => path === '/about' },
];

export function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="nav-inner">
        <div className="nav-brand">
          <span aria-hidden="true">◆</span>
          AssetVault
        </div>
        <div className="nav-links">
          {LINKS.map((link) => {
            const active = link.isActive(pathname);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={active ? 'nav-link active' : 'nav-link'}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
