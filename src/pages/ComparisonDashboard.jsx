import { useState, useEffect } from 'react';
import { BarChart3, Clock, Bed, Ambulance, TrendingDown, ArrowRight } from 'lucide-react';

export default function ComparisonDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/metrics/comparison')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <p style={{ textAlign: 'center', padding: 48 }}>Loading metrics...</p>;
  }

  const { swasthqueue, nic_ehospital_baseline, improvement } = data;

  const MetricBar = ({ label, nicValue, swValue, unit, nicColor = '#cc3333', swColor = 'var(--green)' }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <span style={{ width: 120, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NIC eHospital</span>
        <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 8, height: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, (nicValue / Math.max(nicValue, swValue)) * 100)}%`, background: nicColor, height: '100%', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{nicValue}{unit}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 120, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SwasthQueue</span>
        <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 8, height: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, Math.max(5, (swValue / Math.max(nicValue, swValue)) * 100))}%`, background: swColor, height: '100%', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{swValue}{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BarChart3 size={28} />
          <h1>SwasthQueue vs NIC eHospital</h1>
        </div>
        <p style={{ opacity: 0.9 }}>Quantitative comparison with published baselines</p>
      </div>

      <div style={{ padding: 24 }}>
        
        {/* Hero Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--saffron), #e68a2e)', padding: 20, borderRadius: 'var(--radius)', color: 'white', textAlign: 'center' }}>
            <TrendingDown size={24} />
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 4 }}>{improvement.opd_wait_reduction_percent}%</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>OPD Wait Reduced</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, var(--green), #0f6a06)', padding: 20, borderRadius: 'var(--radius)', color: 'white', textAlign: 'center' }}>
            <Bed size={24} />
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 4 }}>{improvement.bed_search_time_saved_minutes}m</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Bed Search Saved</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, var(--navy), #000055)', padding: 20, borderRadius: 'var(--radius)', color: 'white', textAlign: 'center' }}>
            <Ambulance size={24} />
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 4 }}>{improvement.ambulance_response_saved_minutes}m</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Faster Ambulance</div>
          </div>
        </div>

        {/* Metric Bars */}
        <div className="stats-card" style={{ marginBottom: 24 }}>
          <div className="stats-header">
            <div className="stats-title">Head-to-Head Comparison</div>
          </div>
          
          <MetricBar 
            label="Average OPD Wait Time" 
            nicValue={nic_ehospital_baseline.avg_opd_wait_minutes} 
            swValue={swasthqueue.avg_opd_wait_minutes} 
            unit=" min" 
          />
          <MetricBar 
            label="Bed Search Time" 
            nicValue={nic_ehospital_baseline.bed_search_time_minutes} 
            swValue={swasthqueue.bed_search_time_minutes} 
            unit=" min" 
          />
          <MetricBar 
            label="Ambulance Dispatch Time" 
            nicValue={nic_ehospital_baseline.ambulance_dispatch_avg_minutes} 
            swValue={swasthqueue.ambulance_dispatch_avg_minutes} 
            unit=" min" 
          />
        </div>

        {/* Total Savings */}
        <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 'var(--radius)', border: '2px solid var(--green)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Total Time Saved Per Patient</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--green)' }}>
            {improvement.total_time_saved_per_patient_minutes} minutes
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            From OPD queue entry to bed allocation
          </div>
        </div>

        {/* Live System Stats */}
        <div className="stats-card" style={{ marginTop: 24 }}>
          <div className="stats-header">
            <div className="stats-title">Live System Stats</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><strong>{swasthqueue.hospitals_tracked}</strong> Hospitals Tracked</div>
            <div><strong>{swasthqueue.available_beds_live}</strong> Beds Available (Live)</div>
            <div><strong>{swasthqueue.ambulances_available_live}</strong> Ambulances Available</div>
            <div><strong>{swasthqueue.active_tokens}</strong> Active OPD Tokens</div>
            <div><strong>{swasthqueue.cancelled_reallocated}</strong> Cancelled &amp; Reallocated</div>
            <div><strong>{swasthqueue.city_wide_visibility}</strong> City-Wide Visibility</div>
          </div>
        </div>

      </div>
    </>
  );
}
