import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, Activity, MoreHorizontal } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}
      >
        <Home size={24} />
        <span>Home</span>
      </Link>
      
      <Link 
        to="/beds" 
        className={`bottom-nav-item ${pathname === '/beds' ? 'active' : ''}`}
      >
        <Bed size={24} />
        <span>Beds</span>
      </Link>
      
      <Link 
        to="/opd" 
        className={`bottom-nav-item ${pathname === '/opd' ? 'active' : ''}`}
      >
        <Activity size={24} />
        <span>OPD</span>
      </Link>
      
      <Link 
        to="/more" 
        className={`bottom-nav-item ${pathname === '/more' ? 'active' : ''}`}
      >
        <MoreHorizontal size={24} />
        <span>More</span>
      </Link>
    </nav>
  );
}
