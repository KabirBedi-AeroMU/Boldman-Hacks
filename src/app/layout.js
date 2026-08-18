'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: '📊', label: 'Dashboard', section: 'overview' },
  { href: '/opd', icon: '🏥', label: 'OPD Queue', badge: null, section: 'modules' },
  { href: '/beds', icon: '🛏️', label: 'Bed Availability', section: 'modules' },
  { href: '/admission', icon: '📋', label: 'Admissions', section: 'modules' },
  { href: '/inventory', icon: '💊', label: 'Pharmacy & Inventory', section: 'modules' },
  { href: '/api-status', icon: '🔌', label: 'City-Wide API', section: 'integration' },
];

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const overviewItems = NAV_ITEMS.filter(n => n.section === 'overview');
  const moduleItems = NAV_ITEMS.filter(n => n.section === 'modules');
  const integrationItems = NAV_ITEMS.filter(n => n.section === 'integration');

  return (
    <html lang="en">
      <head>
        <title>SwasthQueue — Hospital Queue & Resource Management</title>
        <meta name="description" content="Intelligent OPD queuing, bed availability tracking, admission management and pharmacy inventory for Delhi government hospitals. Built with M/M/c queuing models." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥</text></svg>" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js" defer></script>
      </head>
      <body>
        <div className="app-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="sidebar-brand-logo">🏥</div>
              <div>
                <h1>SwasthQueue</h1>
                <span>Hospital Management System</span>
              </div>
            </div>

            <nav className="sidebar-nav">
              <div className="sidebar-section-label">Overview</div>
              {overviewItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="sidebar-section-label">Modules</div>
              {moduleItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              ))}

              <div className="sidebar-section-label">Integration</div>
              {integrationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div className="hospital-info">
                <div className="hospital-avatar">🏛️</div>
                <div>
                  <div className="hospital-name">LNJP Hospital</div>
                  <div className="hospital-type">Super Specialty · Central Delhi</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
