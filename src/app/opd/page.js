'use client';

import { useState, useEffect, useRef } from 'react';
import { generateDashboardState } from '../../lib/simulation';
import { calculateMetrics, priorityWaitTimes } from '../../lib/queue-engine';
import { buildPrioritySplit, TRIAGE_LEVELS } from '../../lib/triage';

export default function OPDPage() {
  const [state, setState] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [whatIfDoctors, setWhatIfDoctors] = useState(null);
  const waitChartRef = useRef(null);
  const waitChartInstance = useRef(null);

  useEffect(() => {
    const s = generateDashboardState();
    setState(s);
    setSelectedDept(s.opdState[0]);
    setWhatIfDoctors(s.opdState[0].doctors);
  }, []);

  // What-if chart
  useEffect(() => {
    if (!selectedDept || !waitChartRef.current || typeof Chart === 'undefined') return;
    if (waitChartInstance.current) waitChartInstance.current.destroy();

    const whatIfData = selectedDept.whatIf;
    const ctx = waitChartRef.current.getContext('2d');
    waitChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: whatIfData.map(w => `${w.c} doctors`),
        datasets: [{
          label: 'Wait Time (min)',
          data: whatIfData.map(w => Math.min(w.waitTimeMinutes, 120)),
          backgroundColor: whatIfData.map(w =>
            w.c === whatIfDoctors ? 'rgba(20, 184, 166, 0.8)' :
            w.c === selectedDept.doctors ? 'rgba(59, 130, 246, 0.5)' :
            'rgba(100, 116, 139, 0.3)'
          ),
          borderColor: whatIfData.map(w =>
            w.c === whatIfDoctors ? '#14b8a6' :
            w.c === selectedDept.doctors ? '#3b82f6' :
            'transparent'
          ),
          borderWidth: 2,
          borderRadius: 6,
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
            callbacks: {
              label: ctx => {
                const w = whatIfData[ctx.dataIndex];
                return w.stable ? `${w.waitTimeMinutes} min wait` : 'UNSTABLE — queue grows forever';
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
          y: {
            grid: { color: 'rgba(42, 49, 80, 0.5)' },
            ticks: { color: '#64748b', callback: v => v + ' min' },
            beginAtZero: true,
          },
        },
      },
    });

    return () => { if (waitChartInstance.current) waitChartInstance.current.destroy(); };
  }, [selectedDept, whatIfDoctors]);

  if (!state || !selectedDept) return <div className="page-body"><div className="empty-state"><div className="empty-state-icon">⏳</div></div></div>;

  // Recalculate what-if metrics
  const whatIfMetrics = calculateMetrics(
    selectedDept.lambda,
    selectedDept.mu,
    whatIfDoctors
  );
  const whatIfPriority = priorityWaitTimes(
    selectedDept.lambda,
    selectedDept.mu,
    whatIfDoctors,
    buildPrioritySplit()
  );

  const selectDepartment = (dept) => {
    setSelectedDept(dept);
    setWhatIfDoctors(dept.doctors);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">OPD Queue Management</h1>
            <p className="page-subtitle">M/M/c queuing model with priority-based triage</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot"></span>
            {state.isPeak ? 'PEAK HOURS' : 'NORMAL HOURS'}
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Department Selector */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">📋 Select Department</div>
          </div>
          <div className="card-body" style={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {state.opdState.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => selectDepartment(dept)}
                  className={`btn ${selectedDept.id === dept.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {dept.icon} {dept.shortName}
                  {dept.metrics.utilizationPercent >= 90 && <span style={{ marginLeft: 4 }}>🔴</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs for selected department */}
        <div className="kpi-grid">
          <div className="kpi-card accent animate-in">
            <div className="kpi-label">Queue Length</div>
            <div className="kpi-value accent">{selectedDept.queueLength}<span className="kpi-unit">waiting</span></div>
          </div>
          <div className="kpi-card warning animate-in">
            <div className="kpi-label">Avg Wait Time</div>
            <div className={`kpi-value ${selectedDept.metrics.waitTimeMinutes > 30 ? 'danger' : 'warning'}`}>
              {selectedDept.metrics.waitTimeMinutes}<span className="kpi-unit">min</span>
            </div>
          </div>
          <div className="kpi-card info animate-in">
            <div className="kpi-label">Active Doctors</div>
            <div className="kpi-value info">{selectedDept.doctors}<span className="kpi-unit">/ {selectedDept.roomsAvailable} rooms</span></div>
          </div>
          <div className={`kpi-card ${selectedDept.metrics.utilizationPercent >= 90 ? 'danger' : selectedDept.metrics.utilizationPercent >= 70 ? 'warning' : 'success'} animate-in`}>
            <div className="kpi-label">Utilization (ρ)</div>
            <div className={`kpi-value ${selectedDept.metrics.utilizationPercent >= 90 ? 'danger' : selectedDept.metrics.utilizationPercent >= 70 ? 'warning' : 'success'}`}>
              {selectedDept.metrics.utilizationPercent}<span className="kpi-unit">%</span>
            </div>
          </div>
        </div>

        <div className="grid-sidebar" style={{ marginBottom: 24 }}>
          {/* Patient Queue */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">👥 Patient Queue — {selectedDept.name}</div>
              <span className="badge info">{selectedDept.patients.length} patients</span>
            </div>
            <div className="card-body" style={{ padding: 8, maxHeight: 500, overflowY: 'auto' }}>
              <div className="queue-list">
                {selectedDept.patients.map((patient, idx) => (
                  <div key={patient.id} className={`queue-item ${patient.status}`}>
                    <span className="queue-position">#{idx + 1}</span>
                    <span className={`triage-badge triage-${patient.triageLevel}`}>{patient.triageLevel}</span>
                    <div>
                      <div className="queue-name">{patient.name}</div>
                      <div className="queue-age">{patient.age}y · {patient.gender} · Arr: {patient.arrivalTime}</div>
                    </div>
                    <div className="queue-wait" style={{
                      color: patient.estimatedWaitMinutes > 45 ? 'var(--danger)' :
                             patient.estimatedWaitMinutes > 20 ? 'var(--warning)' : 'var(--success)'
                    }}>
                      {patient.status === 'in-consultation' ? '—' : `${patient.estimatedWaitMinutes}m`}
                    </div>
                    <span className={`badge ${patient.status === 'in-consultation' ? 'success' : patient.status === 'called' ? 'warning' : 'neutral'}`}>
                      <span className="badge-dot"></span>
                      {patient.status === 'in-consultation' ? 'In Consult' : patient.status === 'called' ? 'Called' : 'Waiting'}
                    </span>
                    <span className="queue-status" style={{ color: 'var(--text-muted)' }}>
                      {patient.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Priority + What-If */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Priority Wait Times */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">🚨 Wait by Triage Level</div>
              </div>
              <div className="card-body">
                {selectedDept.priorityWaits.map(pw => (
                  <div key={pw.level} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span className={`triage-badge triage-${pw.level}`}>{pw.level}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{pw.label}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{pw.proportion * 100}% of patients</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: pw.color }}>{pw.waitMinutes}<span style={{ fontSize: '0.7rem', fontWeight: 500 }}> min</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Erlang C Metrics */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">📐 Erlang C Model</div>
              </div>
              <div className="card-body" style={{ fontSize: '0.78rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['λ (arrival)', `${selectedDept.lambda}/hr`],
                    ['μ (service)', `${selectedDept.mu}/hr`],
                    ['c (servers)', selectedDept.doctors],
                    ['ρ (util.)', selectedDept.metrics.rho],
                    ['P(wait)', selectedDept.metrics.pWait],
                    ['Lq (queue)', selectedDept.metrics.Lq],
                    ['Wq (wait)', `${selectedDept.metrics.waitTimeMinutes}m`],
                    ['Ws (total)', `${selectedDept.metrics.systemTimeMinutes}m`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What-If Simulator */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">🔮 What-If Simulator — Resource Optimization</div>
            <span className="badge info">Operations Research</span>
          </div>
          <div className="card-body">
            <div className="grid-2">
              <div className="whatif-panel">
                <div className="slider-container">
                  <div className="slider-label">
                    <span>Number of Doctors</span>
                    <span className="slider-value">{whatIfDoctors}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(1, selectedDept.doctors - 3)}
                    max={selectedDept.doctors + 5}
                    value={whatIfDoctors}
                    onChange={(e) => setWhatIfDoctors(parseInt(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>{Math.max(1, selectedDept.doctors - 3)}</span>
                    <span>Current: {selectedDept.doctors}</span>
                    <span>{selectedDept.doctors + 5}</span>
                  </div>
                </div>

                <div className="whatif-result">
                  <span className="whatif-before">{selectedDept.metrics.waitTimeMinutes}m</span>
                  <span className="whatif-arrow">→</span>
                  <span className="whatif-after">
                    {whatIfMetrics.stable ? whatIfMetrics.waitTimeMinutes : '∞'}
                    <span className="whatif-after-unit">
                      {whatIfMetrics.stable ? ' min' : ' (unstable!)'}
                    </span>
                  </span>
                </div>

                {whatIfDoctors !== selectedDept.doctors && whatIfMetrics.stable && (
                  <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {whatIfDoctors > selectedDept.doctors
                      ? `Adding ${whatIfDoctors - selectedDept.doctors} doctor${whatIfDoctors - selectedDept.doctors > 1 ? 's' : ''} reduces wait by ${Math.max(0, selectedDept.metrics.waitTimeMinutes - whatIfMetrics.waitTimeMinutes).toFixed(1)} min`
                      : `Removing ${selectedDept.doctors - whatIfDoctors} doctor${selectedDept.doctors - whatIfDoctors > 1 ? 's' : ''} increases wait by ${Math.max(0, whatIfMetrics.waitTimeMinutes - selectedDept.metrics.waitTimeMinutes).toFixed(1)} min`
                    }
                  </div>
                )}
                {!whatIfMetrics.stable && (
                  <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--danger)' }}>
                    ⚠️ System unstable: arrival rate ({selectedDept.lambda}/hr) exceeds service capacity ({whatIfDoctors} × {selectedDept.mu}/hr = {(whatIfDoctors * selectedDept.mu).toFixed(1)}/hr). Queue grows without bound.
                  </div>
                )}
              </div>

              <div>
                <div className="chart-container" style={{ height: 200 }}>
                  <canvas ref={waitChartRef}></canvas>
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                  Blue = current | Teal = selected | Gray = other scenarios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Triage Reference */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Triage Classification Reference</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>India 3-tier color + ESI 5-level</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>ESI</th>
                  <th>Priority</th>
                  <th>Description</th>
                  <th>Max Wait</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                {TRIAGE_LEVELS.map(t => (
                  <tr key={t.level}>
                    <td>
                      <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: t.color, verticalAlign: 'middle', marginRight: 6 }}></span>
                      {t.colorName}
                    </td>
                    <td><span className={`triage-badge triage-${t.level}`}>{t.level}</span></td>
                    <td style={{ fontWeight: 600 }}>{t.label}</td>
                    <td>{t.description}</td>
                    <td style={{ fontWeight: 700 }}>{t.maxWaitMinutes === 0 ? 'Immediate' : `${t.maxWaitMinutes} min`}</td>
                    <td style={{ fontSize: '0.72rem' }}>{t.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
