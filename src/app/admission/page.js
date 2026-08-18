'use client';

import { useState, useEffect } from 'react';
import { generateDashboardState } from '../../lib/simulation';
import { TRIAGE_LEVELS } from '../../lib/triage';

const STAGES = [
  { key: 'opd-visit', label: 'OPD Visit', icon: '🏥', color: '#3b82f6' },
  { key: 'decision-to-admit', label: 'Decision to Admit', icon: '📝', color: '#f97316' },
  { key: 'bed-assigned', label: 'Bed Assigned', icon: '🛏️', color: '#eab308' },
  { key: 'in-ward', label: 'In Ward', icon: '🏨', color: '#14b8a6' },
  { key: 'discharged', label: 'Discharged', icon: '✅', color: '#22c55e' },
];

export default function AdmissionPage() {
  const [state, setState] = useState(null);
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => {
    setState(generateDashboardState());
  }, []);

  if (!state) return <div className="page-body"><div className="empty-state"><div className="empty-state-icon">⏳</div></div></div>;

  const { admissions, admissionsByStage } = state;

  // Get unique departments
  const departments = [...new Set(admissions.map(a => a.department))];
  const filtered = filterDept === 'all' ? admissions : admissions.filter(a => a.department === filterDept);
  const filteredByStage = {};
  STAGES.forEach(s => {
    filteredByStage[s.key] = filtered.filter(a => a.stage === s.key);
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Admission Workflow</h1>
            <p className="page-subtitle">Patient journey from OPD visit to discharge — Kanban pipeline</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot"></span>
            {admissions.length} active cases
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* KPIs */}
        <div className="kpi-grid">
          {STAGES.map(stage => (
            <div key={stage.key} className="kpi-card animate-in" style={{ borderTop: `3px solid ${stage.color}` }}>
              <div className="kpi-label">{stage.icon} {stage.label}</div>
              <div className="kpi-value" style={{ color: stage.color }}>
                {filteredByStage[stage.key]?.length || 0}
              </div>
            </div>
          ))}
        </div>

        {/* Department filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            className={`btn btn-sm ${filterDept === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterDept('all')}
          >All Departments</button>
          {departments.map(dept => (
            <button
              key={dept}
              className={`btn btn-sm ${filterDept === dept ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterDept(filterDept === dept ? 'all' : dept)}
            >{dept}</button>
          ))}
        </div>

        {/* Kanban Pipeline */}
        <div className="pipeline">
          {STAGES.map(stage => (
            <div key={stage.key} className="pipeline-column">
              <div className="pipeline-header" style={{ borderBottom: `2px solid ${stage.color}` }}>
                <span className="pipeline-title" style={{ color: stage.color }}>
                  {stage.icon} {stage.label}
                </span>
                <span className="pipeline-count">{filteredByStage[stage.key]?.length || 0}</span>
              </div>
              <div className="pipeline-body">
                {(filteredByStage[stage.key] || []).map(patient => {
                  const triageInfo = TRIAGE_LEVELS.find(t => t.level === patient.triageLevel);
                  return (
                    <div key={patient.id} className="pipeline-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span className="pipeline-card-name">{patient.patientName}</span>
                        <span className={`triage-badge triage-${patient.triageLevel}`} style={{ width: 20, height: 20, fontSize: '0.6rem' }}>
                          {patient.triageLevel}
                        </span>
                      </div>
                      <div className="pipeline-card-meta">
                        {patient.age}y · {patient.gender} · {patient.department}
                      </div>
                      {patient.assignedWard && (
                        <div className="pipeline-card-meta" style={{ marginTop: 4, color: 'var(--accent-light)' }}>
                          🛏️ {patient.assignedWard} · {patient.assignedBed}
                        </div>
                      )}
                      {patient.estimatedDischarge && (
                        <div className="pipeline-card-meta" style={{ marginTop: 4, color: 'var(--success)' }}>
                          📅 Est. discharge: {new Date(patient.estimatedDischarge).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{patient.id}</span>
                        {stage.key !== 'discharged' && (
                          <button className="btn btn-sm btn-outline" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>
                            Move →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(!filteredByStage[stage.key] || filteredByStage[stage.key].length === 0) && (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    No patients
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Table */}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <div className="card-title">📋 All Admissions</div>
            <span className="badge info">{filtered.length} records</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Age/Gender</th>
                  <th>Department</th>
                  <th>Triage</th>
                  <th>Stage</th>
                  <th>Ward/Bed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{p.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.patientName}</td>
                    <td>{p.age}y · {p.gender}</td>
                    <td>{p.department}</td>
                    <td><span className={`triage-badge triage-${p.triageLevel}`} style={{ width: 22, height: 22, fontSize: '0.6rem' }}>{p.triageLevel}</span></td>
                    <td>
                      <span className={`badge ${
                        p.stage === 'discharged' ? 'success' :
                        p.stage === 'in-ward' ? 'info' :
                        p.stage === 'bed-assigned' ? 'warning' : 'neutral'
                      }`}>
                        {p.stageLabel}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {p.assignedWard ? `${p.assignedWard} · ${p.assignedBed}` : '—'}
                    </td>
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
