import { Link } from 'react-router-dom';
import { UserCog, LayoutDashboard, Ticket, Settings, Ambulance, BarChart3 } from 'lucide-react';

export default function MoreOptions() {
  return (
    <>
      <div className="section-header">
        <h1>More Options</h1>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <Link to="/provider" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div style={{ background: '#e3f2fd', padding: 12, borderRadius: '50%', color: 'var(--navy)' }}>
              <UserCog size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Provider Portal</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Update active doctors & bed counts</p>
            </div>
          </Link>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div style={{ background: '#fff3e0', padding: 12, borderRadius: '50%', color: 'var(--saffron)' }}>
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Analytics Dashboard</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>City-wide metrics (via Home)</p>
            </div>
          </Link>

          <Link to="/tickets" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div style={{ background: '#e8f5e9', padding: 12, borderRadius: '50%', color: 'var(--green)' }}>
              <Ticket size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>My Bookings</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View your active OPD tokens</p>
            </div>
          </Link>

          <Link to="/ambulance" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div style={{ background: '#ffebee', padding: 12, borderRadius: '50%', color: '#cc0000' }}>
              <Ambulance size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ambulance Dispatch</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Find and request emergency transport</p>
            </div>
          </Link>

          <Link to="/comparison" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div style={{ background: '#f3e5f5', padding: 12, borderRadius: '50%', color: '#6a1b9a' }}>
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>NIC Comparison</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Compare SwasthQueue vs baseline HMIS</p>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)' }}>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: '50%' }}>
              <Settings size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Settings & Language</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Coming Soon</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
