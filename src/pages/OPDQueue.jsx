import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Stethoscope, CheckCircle, Clock } from 'lucide-react';

export default function OPDQueue() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState("");
  const [triage, setTriage] = useState("General");
  
  const [booking, setBooking] = useState(null);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialHospitalId = searchParams.get('hospitalId');

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/city/dashboard')
      .then(r => r.json())
      .then(d => {
        setHospitals(d.hospitals);
        if (initialHospitalId && !selectedHospital) {
          loadHospital(initialHospitalId);
        }
      })
      .catch(e => console.error(e));
  }, []);

  const loadHospital = async (id) => {
    setSelectedHospital(id);
    setBooking(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/hospitals/${id}`);
      const data = await res.json();
      setHospitalDetails(data);
      if (data.live_departments.length > 0) {
        setDeptId(data.live_departments[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/v1/hospitals/${selectedHospital}/opd/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: deptId,
          patient_name: name,
          triage_level: triage
        })
      });
      const data = await res.json();
      setBooking(data);
      
      // Save to localStorage for My Bookings
      const existing = JSON.parse(localStorage.getItem('swasth_bookings') || '[]');
      existing.push({
        type: 'OPD Token',
        hospitalName: hospitalDetails.hospital.name,
        details: `Token: ${data.token} (${data.department})`,
        date: new Date().toLocaleString()
      });
      localStorage.setItem('swasth_bookings', JSON.stringify(existing));
      
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="section-header">
        <h1>OPD Queue Booking</h1>
      </div>
      <div style={{ padding: 24 }}>
        {!selectedHospital ? (
          <>
            <h2 style={{ color: 'var(--primary-theme)', marginBottom: 16 }}>Select a Hospital</h2>
            <div className="hospital-list">
              {hospitals.map(h => (
                <div key={h.id} className="hospital-card" onClick={() => loadHospital(h.id)} style={{ cursor: 'pointer' }}>
                  <div className="hospital-info">
                    <h4>{h.name}</h4>
                    <p>{h.total_beds} Total Beds</p>
                  </div>
                  <button className="action-btn saffron" style={{ flex: 0, padding: '8px 16px' }}>Select</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <button 
              onClick={() => setSelectedHospital(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 16 }}
            >
              ← Back to list
            </button>
            
            {hospitalDetails ? (
              <div className="stats-card">
                <div className="stats-header">
                  <div className="stats-title">{hospitalDetails.hospital.name}</div>
                  <div className="stats-subtitle">Live Queue Status (M/M/c Engine)</div>
                </div>
                
                {booking ? (
                  <div style={{ textAlign: 'center', padding: 24, background: '#e8f5e9', borderRadius: 'var(--radius)' }}>
                    <CheckCircle size={48} color="var(--success-green)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: 'var(--success-green)' }}>{booking.message}</h3>
                    <p style={{ fontSize: '1.2rem', margin: '12px 0' }}>Token Number: <strong>{booking.token}</strong></p>
                    <p style={{ color: 'var(--text-secondary)' }}>Please wait for your token to be called on the display board.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Patient Name</label>
                      <input 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Department</label>
                      <select 
                        value={deptId} 
                        onChange={e => setDeptId(e.target.value)}
                        style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} 
                      >
                        {hospitalDetails.live_departments.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} (Wait: {d.estimated_wait_mins}m, {d.counters} counters)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Triage Level</label>
                      <select 
                        value={triage} 
                        onChange={e => setTriage(e.target.value)}
                        style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} 
                      >
                        <option value="General">General (Priority 3)</option>
                        <option value="Senior/Pregnant/Disabled">Senior/Pregnant/Disabled (Priority 2)</option>
                        <option value="Emergency">Emergency (Priority 1)</option>
                      </select>
                    </div>
                    <button type="submit" className="action-btn saffron" style={{ marginTop: 8 }}>
                      <Stethoscope size={20} /> Get Queue Token
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div>Loading hospital details...</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
