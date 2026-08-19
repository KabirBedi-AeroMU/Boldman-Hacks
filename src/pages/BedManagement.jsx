import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bed, CheckCircle } from 'lucide-react';

export default function BedManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleBook = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/hospitals/${selectedHospital}/beds/book`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setBooking(data);
        // Update local available beds so user sees immediate feedback
        setHospitalDetails(prev => ({
          ...prev,
          hospital: {
            ...prev.hospital,
            available_beds: data.beds_remaining
          }
        }));
        
        // Save to localStorage for My Bookings
        const existing = JSON.parse(localStorage.getItem('swasth_bookings') || '[]');
        existing.push({
          type: 'Bed Allocation',
          hospitalName: hospitalDetails.hospital.name,
          details: `Bed allocated successfully`,
          date: new Date().toLocaleString()
        });
        localStorage.setItem('swasth_bookings', JSON.stringify(existing));
        
      } else {
        alert(data.detail || "Booking failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="section-header">
        <h1>Bed Management System</h1>
      </div>
      <div style={{ padding: 24 }}>
        {!selectedHospital ? (
          <>
            <h2 style={{ color: 'var(--primary-theme)', marginBottom: 16 }}>Select a Hospital for Bed Admission</h2>
            <div className="hospital-list">
              {hospitals.map(h => (
                <div key={h.id} className="hospital-card" onClick={() => loadHospital(h.id)} style={{ cursor: 'pointer' }}>
                  <div className="hospital-info">
                    <h4>{h.name}</h4>
                    <p style={{ color: h.available_beds > 0 ? 'var(--success-green)' : 'var(--danger-red)' }}>
                      {h.available_beds} Beds Available / {h.total_beds} Total
                    </p>
                  </div>
                  <button className="action-btn green" style={{ flex: 0, padding: '8px 16px' }}>View</button>
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
                  <div className="stats-subtitle">Live Bed Occupancy</div>
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: '3rem', fontWeight: 700, color: hospitalDetails.hospital.available_beds > 0 ? 'var(--success-green)' : 'var(--danger-red)' }}>
                    {hospitalDetails.hospital.available_beds}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>
                    Beds Currently Available
                  </div>
                </div>

                {booking && (
                  <div style={{ textAlign: 'center', padding: '16px', background: '#e8f5e9', borderRadius: 'var(--radius)', marginBottom: 16 }}>
                    <CheckCircle size={24} color="var(--success-green)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--success-green)', fontWeight: 600 }}>{booking.message}</p>
                  </div>
                )}
                
                <button 
                  onClick={handleBook} 
                  className="action-btn green" 
                  disabled={hospitalDetails.hospital.available_beds <= 0}
                  style={{ width: '100%', opacity: hospitalDetails.hospital.available_beds <= 0 ? 0.5 : 1 }}
                >
                  <Bed size={20} /> Allocate Bed
                </button>
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
