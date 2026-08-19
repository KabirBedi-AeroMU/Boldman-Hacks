import { useState, useEffect } from 'react';
import { Ambulance, MapPin, Clock, Phone } from 'lucide-react';

export default function AmbulancePage() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/ambulances/nearest?lat=28.6139&lon=77.2090')
      .then(r => r.json())
      .then(d => { setAmbulances(d.results); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleDispatch = async (hospitalId, hospitalName) => {
    setDispatching(hospitalId);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/hospitals/${hospitalId}/ambulances/dispatch`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Ambulance dispatched from ${hospitalName}! ${data.ambulances_remaining} remaining.`);
        // Refresh list
        const r = await fetch('http://localhost:8080/api/v1/ambulances/nearest?lat=28.6139&lon=77.2090');
        const d = await r.json();
        setAmbulances(d.results);
      } else {
        alert(data.detail || 'Failed to dispatch');
      }
    } catch (e) {
      console.error(e);
    }
    setDispatching(null);
  };

  return (
    <>
      <div className="section-header" style={{ background: 'linear-gradient(135deg, #cc0000, #ff3333)', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Ambulance size={28} />
          <h1>Emergency Ambulance</h1>
        </div>
        <p style={{ opacity: 0.9 }}>Request nearest available ambulance in real-time</p>
      </div>

      {/* Emergency Banner */}
      <div style={{ background: '#fff3f3', padding: '16px 24px', borderBottom: '2px solid #cc0000', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Phone size={20} style={{ color: '#cc0000' }} />
        <div>
          <strong style={{ color: '#cc0000' }}>National Emergency: 112</strong>
          <span style={{ marginLeft: 16, color: 'var(--text-secondary)' }}>Ambulance Helpline: 102</span>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Locating nearest ambulances...</p>
        ) : ambulances.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No ambulances available nearby.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ambulances.map((a, i) => (
              <div key={a.hospital_id} className="stats-card" style={{ 
                marginBottom: 0, padding: 16, 
                borderLeft: i === 0 ? '4px solid #cc0000' : '4px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--navy)' }}>{a.hospital_name}</h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {a.distance_km} km</span>
                      <span><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> ETA: {a.eta_minutes} min</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: a.ambulances_available > 1 ? 'var(--green)' : '#cc0000' }}>
                      {a.ambulances_available}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Available</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDispatch(a.hospital_id, a.hospital_name)}
                  disabled={dispatching === a.hospital_id}
                  className="action-btn red"
                  style={{ width: '100%', marginTop: 12, padding: 10 }}
                >
                  <Ambulance size={16} style={{ display: 'inline', marginRight: 8 }} />
                  {dispatching === a.hospital_id ? 'Dispatching...' : `Request Ambulance (ETA ${a.eta_minutes} min)`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
