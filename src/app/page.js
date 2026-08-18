'use client';

import { useState, useEffect, useRef } from 'react';
import { generateDashboardState } from '../lib/simulation';

export default function DashboardPage() {
  const [state, setState] = useState(null);
  const arrivalChartRef = useRef(null);
  const arrivalChartInstance = useRef(null);

  useEffect(() => {
    setState(generateDashboardState());
  }, []);

  // Arrival pattern chart
  useEffect(() => {
    if (!state || !arrivalChartRef.current || typeof Chart === 'undefined') return;

    if (arrivalChartInstance.current) arrivalChartInstance.current.destroy();

    const ctx = arrivalChartRef.current.getContext('2d');
    arrivalChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: state.hourlyArrivals.map(h => h.label),
        datasets: [{
          label: 'Arrival Rate Multiplier',
          data: state.hourlyArrivals.map(h => h.multiplier * 100),
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#14b8a6',
          pointRadius: 4,
          pointHoverRadius: 7,
          borderWidth: 2,
        }],
      },
      options: {
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
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y}% of peak capacity`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(42, 49, 80, 0.5)' },
            ticks: { color: '#64748b', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(42, 49, 80, 0.5)' },
            ticks: { color: '#64748b', font: { size: 11 }, callback: v => v + '%' },
            min: 0, max: 110,
          },
        },
      },
    });

    return () => { if (arrivalChartInstance.current) arrivalChartInstance.current.destroy(); };
  }, [state]);

  if (!state) return <div className="page-body" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh'}}><div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">Loading simulation...</div></div></div>;

  const { hospital, totalOPDToday, avgWaitTime, bedSummary, criticalStockItems, lowStockItems, opdState, inventoryState } = state;

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Command Center</h1>
            <p className="page-subtitle">{hospital.name} — Real-time Overview</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot"></span>
            LIVE — Simulation Active
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card accent animate-in">
            <div className="kpi-label">Total OPD Today</div>
            <div className="kpi-value accent">{totalOPDToday.toLocaleString()}<span className="kpi-unit">patients</span></div>
            <div className="kpi-change positive">↑ Based on {state.isPeak ? 'peak' : 'normal'} hours</div>
          </div>
          <div className="kpi-card warning animate-in">
            <div className="kpi-label">Avg Wait Time</div>
            <div className="kpi-value warning">{avgWaitTime}<span className="kpi-unit">min</span></div>
            <div className="kpi-change negative">Across all departments</div>
          </div>
          <div className="kpi-card info animate-in">
            <div className="kpi-label">Bed Occupancy</div>
            <div className="kpi-value info">{bedSummary.occupancyRate}<span className="kpi-unit">%</span></div>
            <div className="kpi-change">{bedSummary.available} beds available of {bedSummary.total}</div>
          </div>
          <div className={`kpi-card ${criticalStockItems > 0 ? 'danger' : 'success'} animate-in`}>
            <div className="kpi-label">Inventory Alerts</div>
            <div className={`kpi-value ${criticalStockItems > 0 ? 'danger' : 'success'}`}>{criticalStockItems + lowStockItems}</div>
            <div className="kpi-change negative">{criticalStockItems} critical · {lowStockItems} low stock</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Department Heatmap */}
          <div className="card animate-in">
            <div className="card-header">
              <div className="card-title">🌡️ Department Load Heatmap</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Utilization %</span>
            </div>
            <div className="card-body">
              <div className="heatmap-grid">
                {opdState.map(dept => {
                  const u = dept.metrics.utilizationPercent;
                  const bg = u >= 90 ? 'rgba(239,68,68,0.25)' : u >= 70 ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.15)';
                  const color = u >= 90 ? '#ef4444' : u >= 70 ? '#eab308' : '#22c55e';
                  return (
                    <div key={dept.id} className="heatmap-cell" style={{ background: bg }}>
                      <div className="heatmap-cell-name">{dept.icon} {dept.shortName}</div>
                      <div className="heatmap-cell-value" style={{ color }}>{u}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Arrival Pattern Chart */}
          <div className="card animate-in">
            <div className="card-header">
              <div className="card-title">📈 Hourly Arrival Pattern</div>
              <span className={`badge ${state.isPeak ? 'danger' : 'success'}`}>
                <span className="badge-dot"></span>
                {state.isPeak ? 'Peak Hours' : 'Off-Peak'}
              </span>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: 220 }}>
                <canvas ref={arrivalChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Bed Summary by Ward */}
          <div className="card animate-in">
            <div className="card-header">
              <div className="card-title">🛏️ Ward Occupancy</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Top wards by occupancy</span>
            </div>
            <div className="card-body" style={{ maxHeight: 300, overflowY: 'auto' }}>
              {bedSummary.wardSummary
                .sort((a, b) => b.occupancyRate - a.occupancyRate)
                .slice(0, 8)
                .map(ward => (
                  <div key={ward.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{ward.name}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: ward.occupancyRate >= 90 ? 'var(--danger)' : ward.occupancyRate >= 75 ? 'var(--warning)' : 'var(--success)' }}>
                        {ward.occupancyRate}%
                      </span>
                    </div>
                    <div className="utilization-bar">
                      <div
                        className={`utilization-fill ${ward.occupancyRate >= 90 ? 'high' : ward.occupancyRate >= 70 ? 'medium' : 'low'}`}
                        style={{ width: `${ward.occupancyRate}%` }}
                      ></div>
                    </div>
                    <div className="utilization-label">
                      <span>{ward.available} available</span>
                      <span>{ward.occupied}/{ward.totalBeds} occupied</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="card animate-in">
            <div className="card-header">
              <div className="card-title">⚠️ Active Alerts</div>
              <span className="badge danger">
                <span className="badge-dot"></span>
                {state.criticalAlerts} critical
              </span>
            </div>
            <div className="card-body" style={{ maxHeight: 300, overflowY: 'auto' }}>
              {inventoryState
                .flatMap(m => m.alerts.map(a => ({ ...a, medName: m.name })))
                .sort((a, b) => (a.type === 'critical' ? -1 : 1))
                .slice(0, 10)
                .map((alert, i) => (
                  <div key={i} className={`alert-item ${alert.type}`}>
                    <span className="alert-icon">{alert.type === 'critical' ? '🔴' : '🟡'}</span>
                    <span>{alert.message}</span>
                  </div>
                ))}
              {state.criticalAlerts === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-text">All systems operational</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
