import { useState, useEffect } from 'react';
import { Ticket, X, Clock, AlertTriangle } from 'lucide-react';

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds for demo

  const loadBookings = () => {
    const saved = JSON.parse(localStorage.getItem('swasth_bookings') || '[]');
    setBookings(saved.reverse());
  };

  useEffect(() => {
    loadBookings();
    
    // Live countdown timer for the demo
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Helper to format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCancel = async (index, booking) => {
    // Extract token ID from the details string (e.g., "Token: EMG-402 (H-001-D-GEN)")
    const tokenMatch = booking.details.match(/Token:\s*(\S+)/);
    
    if (tokenMatch) {
      const tokenId = tokenMatch[1];
      try {
        const res = await fetch(`http://localhost:8080/api/v1/tokens/${tokenId}/cancel`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          alert(`${data.message}\nSlot reallocated to: ${data.slot_reallocated_to || 'Next patient in queue'}\nTime saved: ~${data.time_saved_minutes} minutes`);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Update localStorage
    const saved = JSON.parse(localStorage.getItem('swasth_bookings') || '[]');
    const actualIndex = saved.length - 1 - index; // reverse index
    saved[actualIndex].status = 'cancelled';
    localStorage.setItem('swasth_bookings', JSON.stringify(saved));
    loadBookings();
  };

  return (
    <>
      <div className="section-header" style={{ background: '#e8f5e9', color: 'var(--green)', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Ticket size={28} />
          <h1 style={{ color: 'var(--green)' }}>My Bookings</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>View, manage, or cancel your OPD tokens and bed allocations.</p>
      </div>

      <div style={{ padding: 24 }}>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
            <Ticket size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>You have no active bookings.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((b, i) => {
              const isCancelled = b.status === 'cancelled';
              return (
                <div key={i} className="stats-card" style={{ 
                  marginBottom: 0, padding: 16, 
                  borderLeft: `4px solid ${isCancelled ? 'var(--danger-red)' : 'var(--green)'}`,
                  opacity: isCancelled ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{b.type}</span>
                      {isCancelled && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'white', background: 'var(--danger-red)', padding: '2px 8px', borderRadius: 12 }}>CANCELLED</span>
                      )}
                      {!isCancelled && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'white', background: 'var(--green)', padding: '2px 8px', borderRadius: 12 }}>ACTIVE</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.date}</span>
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--navy)' }}>{b.hospitalName}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{b.details}</p>
                  
                  {!isCancelled && (
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 8, 
                      background: timeLeft < 300 ? '#ffebee' : '#f5f5f5', 
                      color: timeLeft < 300 ? '#cc0000' : 'var(--text-secondary)',
                      padding: '8px 12px', borderRadius: 8, marginBottom: 12,
                      fontSize: '0.85rem', fontWeight: 500
                    }}>
                      {timeLeft < 300 ? <AlertTriangle size={16} /> : <Clock size={16} />}
                      <span>Grace Period Expires in: <strong>{formatTime(b.type === 'Bed Allocation' ? timeLeft + 900 : timeLeft)}</strong></span>
                    </div>
                  )}
                  
                  {!isCancelled && b.type === 'OPD Token' && (
                    <button 
                      onClick={() => handleCancel(i, b)} 
                      className="action-btn red"
                      style={{ width: '100%', padding: 10 }}
                    >
                      <X size={16} style={{ display: 'inline', marginRight: 8 }} />
                      Cancel Token & Reallocate Slot
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
