'use client';

import { useState, useEffect, useRef } from 'react';
import { generateDashboardState } from '../../lib/simulation';

export default function BedsPage() {
  const [state, setState] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | table
  const deptChartRef = useRef(null);
  const deptChartInstance = useRef(null);

  useEffect(() => {
    setState(generateDashboardState());
  }, []);

  // Department occupancy chart
  useEffect(() => {
    if (!state || !deptChartRef.current || typeof Chart === 'undefined') return;
    if (deptChartInstance.current) deptChartInstance.current.destroy();

    const wards = state.bedSummary.wardSummary.sort((a, b) => b.occupancyRate - a.occupancyRate);
    const ctx = deptChartRef.current.getContext('2d');
    deptChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: wards.map(w => w.name.length > 15 ? w.name.substring(0, 14) + '…' : w.name),
        datasets: [{
          label: 'Occupancy %',
          data: wards.map(w => w.occupancyRate),
          backgroundColor: wards.map(w =>
            w.occupancyRate >= 90 ? 'rgba(239,68,68,0.7)' :
            w.occupancyRate >= 75 ? 'rgba(234,179,8,0.6)' :
            'rgba(34,197,94,0.6)'
          ),
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1f35',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: '#2a3150',
            borderWidth: 1,
            callbacks: {
              label: ctx => {
                const w = wards[ctx.dataIndex];
                return `${w.occupancyRate}% · ${w.available} available / ${w.totalBeds} total`;
              },
            },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(42,49,80,0.5)' }, ticks: { color: '#64748b', callback: v => v + '%' }, max: 100 },
          y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        },
      },
    });

    return () => { if (deptChartInstance.current) deptChartInstance.current.destroy(); };
  }, [state]);

  if (!state) return <div className="page-body"><div className="empty-state"><div className="empty-state-icon">⏳</div></div></div>;

  const { bedSummary, beds } = state;
  const displayWards = selectedWard
    ? bedSummary.wardSummary.filter(w => w.id === selectedWard)
    : bedSummary.wardSummary;

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Bed Availability Dashboard</h1>
            <p className="page-subtitle">Real-time bed tracking across all wards</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot"></span>
            LIVE — {bedSummary.total} total beds
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card success animate-in">
            <div className="kpi-label">Available</div>
            <div className="kpi-value success">{bedSummary.available}<span className="kpi-unit">beds</span></div>
          </div>
          <div className="kpi-card danger animate-in">
            <div className="kpi-label">Occupied</div>
            <div className="kpi-value danger">{bedSummary.occupied}<span className="kpi-unit">beds</span></div>
          </div>
          <div className="kpi-card warning animate-in">
            <div className="kpi-label">Being Cleaned</div>
            <div className="kpi-value warning">{bedSummary.cleaning}<span className="kpi-unit">beds</span></div>
          </div>
          <div className="kpi-card info animate-in">
            <div className="kpi-label">Overall Occupancy</div>
            <div className={`kpi-value ${bedSummary.occupancyRate >= 90 ? 'danger' : 'info'}`}>{bedSummary.occupancyRate}<span className="kpi-unit">%</span></div>
          </div>
        </div>

        {/* Legend */}
        <div className="legend" style={{ marginBottom: 20 }}>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--bed-available)' }}></div> Available</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--bed-occupied)' }}></div> Occupied</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--bed-cleaning)' }}></div> Cleaning</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--bed-maintenance)' }}></div> Maintenance</div>
        </div>

        {/* View Toggle + Ward Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="tab-nav">
            <button className={`tab-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>🏠 Grid View</button>
            <button className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>📊 Table View</button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${!selectedWard ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedWard(null)}
            >All Wards</button>
            {bedSummary.wardSummary.slice(0, 6).map(w => (
              <button
                key={w.id}
                className={`btn btn-sm ${selectedWard === w.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedWard(selectedWard === w.id ? null : w.id)}
              >{w.name.split(' ').slice(0, 2).join(' ')}</button>
            ))}
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid-auto" style={{ marginBottom: 24 }}>
            {displayWards.map(ward => {
              const wardBeds = beds.filter(b => b.wardId === ward.id);
              return (
                <div key={ward.id} className="ward-card animate-in">
                  <div className="ward-card-header">
                    <div>
                      <div className="ward-name">{ward.name}</div>
                      <div className="ward-dept">{ward.department} · Floor {ward.floor}</div>
                    </div>
                    <div className="ward-occupancy" style={{
                      color: ward.occupancyRate >= 90 ? 'var(--danger)' :
                             ward.occupancyRate >= 75 ? 'var(--warning)' : 'var(--success)'
                    }}>{ward.occupancyRate}%</div>
                  </div>

                  {/* Mini bed grid */}
                  <div className="bed-grid">
                    {wardBeds.slice(0, 60).map(bed => (
                      <div
                        key={bed.id}
                        className={`bed-cell ${bed.status}`}
                        title={`Bed ${bed.bedNumber} — ${bed.status}${bed.patientId ? ` (${bed.patientId})` : ''}`}
                      ></div>
                    ))}
                  </div>

                  <div className="ward-stats-row">
                    <div className="ward-stat-mini">
                      <div className="dot" style={{ background: 'var(--bed-available)' }}></div>
                      {ward.available}
                    </div>
                    <div className="ward-stat-mini">
                      <div className="dot" style={{ background: 'var(--bed-occupied)' }}></div>
                      {ward.occupied}
                    </div>
                    <div className="ward-stat-mini">
                      <div className="dot" style={{ background: 'var(--bed-cleaning)' }}></div>
                      {ward.cleaning}
                    </div>
                    <div className="ward-stat-mini">
                      <div className="dot" style={{ background: 'var(--bed-maintenance)' }}></div>
                      {ward.maintenance}
                    </div>
                  </div>

                  <div className="utilization-bar" style={{ marginTop: 10 }}>
                    <div
                      className={`utilization-fill ${ward.occupancyRate >= 90 ? 'high' : ward.occupancyRate >= 70 ? 'medium' : 'low'}`}
                      style={{ width: `${ward.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ward</th>
                    <th>Department</th>
                    <th>Floor</th>
                    <th>Total</th>
                    <th>Available</th>
                    <th>Occupied</th>
                    <th>Cleaning</th>
                    <th>Occupancy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayWards.map(ward => (
                    <tr key={ward.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ward.name}</td>
                      <td>{ward.department}</td>
                      <td>{ward.floor}</td>
                      <td>{ward.totalBeds}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>{ward.available}</td>
                      <td style={{ color: 'var(--danger)' }}>{ward.occupied}</td>
                      <td style={{ color: 'var(--warning)' }}>{ward.cleaning}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: ward.occupancyRate >= 90 ? 'var(--danger)' : ward.occupancyRate >= 75 ? 'var(--warning)' : 'var(--success)' }}>
                          {ward.occupancyRate}%
                        </span>
                        <div className="stock-bar" style={{ width: 50 }}>
                          <div className="stock-fill" style={{
                            width: `${ward.occupancyRate}%`,
                            background: ward.occupancyRate >= 90 ? 'var(--danger)' : ward.occupancyRate >= 75 ? 'var(--warning)' : 'var(--success)',
                          }}></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${ward.occupancyRate >= 95 ? 'danger' : ward.occupancyRate >= 85 ? 'warning' : 'success'}`}>
                          {ward.occupancyRate >= 95 ? 'FULL' : ward.occupancyRate >= 85 ? 'HIGH' : 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Occupancy Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Ward Occupancy Comparison</div>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: Math.max(300, bedSummary.wardSummary.length * 30) }}>
              <canvas ref={deptChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
