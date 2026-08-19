import { useState, useEffect } from 'react';
import { UserCog, Save } from 'lucide-react';

export default function ProviderPortal() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [hospitalData, setHospitalData] = useState(null);
  const [bedInput, setBedInput] = useState("");
  
  // Track inputs for each department
  const [deptInputs, setDeptInputs] = useState({});

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/city/dashboard')
      .then(r => r.json())
      .then(d => setHospitals(d.hospitals))
      .catch(e => console.error(e));
  }, []);

  const loadHospital = async (id) => {
    setSelectedHospitalId(id);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/hospitals/${id}`);
      const data = await res.json();
      setHospitalData(data);
      setBedInput(data.hospital.available_beds.toString());
      
      const initials = {};
      data.live_departments.forEach(d => {
        initials[d.id] = d.counters.toString();
      });
      setDeptInputs(initials);
    } catch (e) {
      console.error(e);
    }
  };

  const updateBeds = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/hospitals/${selectedHospitalId}/beds/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_beds: parseInt(bedInput) })
      });
      if (res.ok) alert('Beds updated successfully');
      else alert('Failed to update beds');
    } catch (e) {
      console.error(e);
    }
  };

  const updateCounters = async (deptId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/hospitals/${selectedHospitalId}/departments/${deptId}/counters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_counters: parseInt(deptInputs[deptId]) })
      });
      if (res.ok) alert('Counters updated successfully! Erlang-C engine has recalculated wait times globally.');
      else alert('Failed to update counters');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="section-header" style={{ background: '#e3f2fd', color: 'var(--navy)', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <UserCog size={28} />
          <h1 style={{ color: 'var(--navy)' }}>Provider Portal</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Manage live counters and bed capacity.</p>
      </div>

      <div style={{ padding: 24 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Select Your Hospital</label>
        <select 
          value={selectedHospitalId} 
          onChange={(e) => loadHospital(e.target.value)}
          style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 24 }}
        >
          <option value="" disabled>Select a hospital...</option>
          {hospitals.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        {hospitalData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Bed Management */}
            <div className="stats-card" style={{ marginBottom: 0 }}>
              <div className="stats-header">
                <div className="stats-title">Bed Capacity Override</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input 
                  type="number"
                  value={bedInput}
                  onChange={e => setBedInput(e.target.value)}
                  style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>/ {hospitalData.hospital.total_beds} Total</span>
                <button onClick={updateBeds} className="action-btn navy" style={{ flex: 0, padding: '12px 24px' }}><Save size={16} /> Save</button>
              </div>
            </div>

            {/* OPD Counters */}
            <div className="stats-card">
              <div className="stats-header">
                <div className="stats-title">Active OPD Counters (Doctors)</div>
                <div className="stats-subtitle">Updates trigger real-time Erlang-C wait time recalculations globally.</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {hospitalData.live_departments.map(dept => (
                  <div key={dept.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <strong>{dept.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current wait: {dept.estimated_wait_mins}m</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input 
                        type="number" 
                        min="1"
                        value={deptInputs[dept.id]} 
                        onChange={e => setDeptInputs({...deptInputs, [dept.id]: e.target.value})}
                        style={{ width: 60, padding: 8, textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                      />
                      <button onClick={() => updateCounters(dept.id)} className="action-btn navy" style={{ padding: 8 }}><Save size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
