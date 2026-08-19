import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Bed, Clock, Stethoscope, Ambulance, MapPin, Navigation } from 'lucide-react';

const RADII = [0.5, 1, 2, 5, 10, 20, 100];

const MOCK_LOCATIONS = [
  { name: 'Central Delhi (CP)', lat: 28.6304, lon: 77.2177 },
  { name: 'South Delhi (Saket)', lat: 28.5246, lon: 77.2066 },
  { name: 'West Delhi (Dwarka)', lat: 28.5823, lon: 77.0500 },
  { name: 'North Delhi (Rohini)', lat: 28.7366, lon: 77.1132 },
  { name: 'East Delhi (Preet Vihar)', lat: 28.6391, lon: 77.2954 }
];

export default function Home() {
  const [radius, setRadius] = useState(5);
  const [userLoc, setUserLoc] = useState(MOCK_LOCATIONS[0]);
  const [cityStats, setCityStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/hospitals/nearest?lat=${userLoc.lat}&lon=${userLoc.lon}&radius_km=${radius}`);
        const nearestData = await response.json();
        
        const dashResponse = await fetch('http://localhost:8080/api/v1/city/dashboard');
        const dashData = await dashResponse.json();
        
        const mappedHospitals = nearestData.results.map(item => ({
          id: item.hospital.id,
          name: item.hospital.name,
          lat: item.hospital.latitude,
          lon: item.hospital.longitude,
          distance: item.distance_km,
          bedsAvailable: item.hospital.available_beds,
          opdWaitTime: item.estimated_wait_time_minutes
        }));
        
        const nearbyTotalBeds = mappedHospitals.reduce((sum, h) => sum + h.bedsAvailable, 0);
        const avgWait = mappedHospitals.length > 0 
          ? Math.round(mappedHospitals.reduce((sum, h) => sum + h.opdWaitTime, 0) / mappedHospitals.length) 
          : 0;

        setCityStats({
          totalHospitals: mappedHospitals.length,
          totalAvailableBeds: nearbyTotalBeds,
          avgWaitTime: avgWait,
          hospitals: mappedHospitals
        });
      } catch (err) {
        console.error("Error fetching live data", err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [radius, userLoc]);

  const requestLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            name: "Live Location",
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => alert("Error getting location: " + error.message)
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  if (!cityStats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
      Loading live availability...
    </div>
  );

  return (
    <>
      <div className="section-header">
        <h1>OPD & Bed Availability Portal</h1>
        <p>Real-time tracking across Delhi Government Hospitals</p>
      </div>

        <div className="primary-actions">
          <Link to="/opd" className="action-btn saffron">
            <Stethoscope size={20} />
            Book OPD
          </Link>
          <Link to="/beds" className="action-btn green">
            <Bed size={20} />
            Book Bed
          </Link>
        </div>

        {/* Hospital Availability Section */}
        <div className="stats-container">
          <div className="stats-header">
            <div className="stats-title">City-Wide Availability</div>
            <div className="stats-subtitle">Select your location and search radius</div>
            
            <div style={{ display: 'flex', gap: '8px', margin: '16px 0', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={requestLiveLocation}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'var(--primary-theme)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <Navigation size={16} /> Use Live Location
              </button>
              
              <select 
                value={userLoc.name}
                onChange={(e) => {
                  const loc = MOCK_LOCATIONS.find(m => m.name === e.target.value);
                  if (loc) setUserLoc(loc);
                }}
                style={{ padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
              >
                <option value="Live Location" disabled hidden>Live Location</option>
                {MOCK_LOCATIONS.map(loc => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{fontSize: '0.75rem', color: 'var(--success-green)', marginTop: 4, fontWeight: 600}}>Live Updates Active • Showing results for {userLoc.name}</div>
          </div>

          {/* Radius Selector */}
          <div className="radius-selector">
            {RADII.map(r => (
              <button 
                key={r} 
                className={`radius-pill ${radius === r ? 'active' : ''}`}
                onClick={() => setRadius(r)}
              >
                {r === 100 ? "All Delhi" : (r < 1 ? r * 1000 + 'm' : r + ' KM')}
              </button>
            ))}
          </div>

          {/* Aggregate Stats Grid */}
          <div className="stats-card">
            <div className="stats-grid">
              <div className="stat-item">
                <Building2 size={28} className="stat-icon" />
                <span className="stat-value">{cityStats.totalHospitals.toLocaleString()}</span>
                <span className="stat-label">Hospitals</span>
              </div>
              <div className="stat-item">
                <Bed size={28} className="stat-icon" />
                <span className="stat-value positive">{cityStats.totalAvailableBeds.toLocaleString()}</span>
                <span className="stat-label">Beds Left</span>
              </div>
              <div className="stat-item">
                <Clock size={28} className="stat-icon" />
                <span className="stat-value warning">{cityStats.avgWaitTime}m</span>
                <span className="stat-label">Avg Wait</span>
              </div>
            </div>

            {/* Hospitals List */}
            <div className="hospital-list">
              {cityStats.hospitals.map(h => (
                <div key={h.id} className="hospital-card" style={{ display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="hospital-info">
                      <h4>{h.name}</h4>
                      <p>{h.distance} km away</p>
                    </div>
                    <div className="hospital-metrics">
                      <span className="metric green">{h.bedsAvailable} Beds</span>
                      <span className="metric red">{h.opdWaitTime}m Wait</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="hospital-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`} target="_blank" rel="noreferrer" className="action-btn navy" style={{ flex: 1, padding: '8px', fontSize: '0.75rem', textAlign: 'center', textDecoration: 'none' }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> Directions
                    </a>
                    <Link to={`/opd?hospitalId=${h.id}`} className="action-btn saffron" style={{ flex: 1, padding: '8px', fontSize: '0.75rem', textAlign: 'center', textDecoration: 'none' }}>
                      <Stethoscope size={14} style={{ display: 'inline', marginRight: 4 }} /> Book OPD
                    </Link>
                    <Link to={`/beds?hospitalId=${h.id}`} className="action-btn green" style={{ flex: 1, padding: '8px', fontSize: '0.75rem', textAlign: 'center', textDecoration: 'none' }}>
                      <Bed size={14} style={{ display: 'inline', marginRight: 4 }} /> Book Bed
                    </Link>
                  </div>
                </div>
              ))}
              {cityStats.hospitals.length === 0 && (
                <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0'}}>
                  No hospitals found within {radius < 1 ? radius * 1000 + 'm' : radius + ' KM'}. Try expanding the radius.
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  );
}
