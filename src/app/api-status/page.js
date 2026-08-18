'use client';

import { useState, useEffect } from 'react';
import { CITY_HOSPITALS, HOSPITAL } from '../../lib/mock-data';

const API_ENDPOINTS = [
  { path: '/api/beds', label: 'Bed Availability', method: 'GET', description: 'Real-time bed status across all wards' },
  { path: '/api/queue', label: 'Queue Status', method: 'GET', description: 'OPD queue metrics with Erlang C model' },
  { path: '/api/inventory', label: 'Inventory Status', method: 'GET', description: 'Pharmacy stock levels with ABC-VED classification' },
];

export default function ApiStatusPage() {
  const [apiResponses, setApiResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [expandedApi, setExpandedApi] = useState(null);

  const testEndpoint = async (path) => {
    setLoading(prev => ({ ...prev, [path]: true }));
    try {
      const res = await fetch(path);
      const data = await res.json();
      setApiResponses(prev => ({
        ...prev,
        [path]: { status: res.status, data, timestamp: new Date().toISOString(), ok: res.ok },
      }));
    } catch (err) {
      setApiResponses(prev => ({
        ...prev,
        [path]: { status: 500, error: err.message, timestamp: new Date().toISOString(), ok: false },
      }));
    }
    setLoading(prev => ({ ...prev, [path]: false }));
  };

  const testAll = () => API_ENDPOINTS.forEach(ep => testEndpoint(ep.path));

  useEffect(() => { testAll(); }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">City-Wide Integration API</h1>
            <p className="page-subtitle">REST endpoints for NIC aggregation layer · Standard JSON format</p>
          </div>
          <button className="btn btn-primary" onClick={testAll}>🔄 Test All Endpoints</button>
        </div>
      </div>

      <div className="page-body">
        {/* Architecture Info */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">🏗️ Integration Architecture</div>
          </div>
          <div className="card-body">
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p>SwasthQueue exposes standardized REST APIs that enable <strong style={{ color: 'var(--accent-light)' }}>city-wide integration</strong> with NIC&apos;s centralized healthcare dashboard. Each hospital instance runs independently and publishes its data through these endpoints.</p>
              <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
{`┌─────────────────────────────────────────────────┐
│          NIC City-Wide Aggregation Layer          │
│  (Polls each hospital's API every N minutes)     │
└──────────┬──────────┬──────────┬─────────────────┘
           │          │          │
     ┌─────▼───┐ ┌────▼────┐ ┌──▼──────┐
     │ LNJP    │ │ GTB     │ │ DDU     │  ... more hospitals
     │ /api/*  │ │ /api/*  │ │ /api/*  │
     └─────────┘ └─────────┘ └─────────┘`}
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {API_ENDPOINTS.map(ep => {
            const response = apiResponses[ep.path];
            const isLoading = loading[ep.path];
            const isExpanded = expandedApi === ep.path;

            return (
              <div key={ep.path} className="card">
                <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setExpandedApi(isExpanded ? null : ep.path)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="badge info" style={{ fontFamily: 'monospace' }}>{ep.method}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-light)' }}>{ep.path}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— {ep.description}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {response && (
                      <span className={`badge ${response.ok ? 'success' : 'danger'}`}>
                        {response.status} {response.ok ? 'OK' : 'ERROR'}
                      </span>
                    )}
                    {isLoading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Testing...</span>}
                    <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); testEndpoint(ep.path); }}>
                      Test
                    </button>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </div>
                </div>

                {isExpanded && response && (
                  <div className="card-body" style={{ borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Response at {new Date(response.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}
                      >📋 Copy JSON</button>
                    </div>
                    <pre style={{
                      background: 'var(--bg-primary)',
                      padding: 16,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      color: 'var(--accent-light)',
                      overflow: 'auto',
                      maxHeight: 400,
                      lineHeight: 1.5,
                      fontFamily: '"Fira Code", "Cascadia Code", monospace',
                    }}>
                      {JSON.stringify(response.data || { error: response.error }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* City-Wide Hospital Network */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏙️ Delhi Hospital Network</div>
            <span className="badge info">{CITY_HOSPITALS.length} hospitals</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>ID</th>
                  <th>Total Beds</th>
                  <th>API Status</th>
                  <th>Integration</th>
                </tr>
              </thead>
              <tbody>
                {CITY_HOSPITALS.map(h => {
                  const isCurrent = h.id === HOSPITAL.id;
                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600, color: isCurrent ? 'var(--accent-light)' : 'var(--text-primary)' }}>
                        {h.name}
                        {isCurrent && <span className="badge success" style={{ marginLeft: 8 }}>CURRENT</span>}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.id}</td>
                      <td>{h.beds.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${isCurrent ? 'success' : 'neutral'}`}>
                          <span className="badge-dot"></span>
                          {isCurrent ? 'ONLINE' : 'PENDING'}
                        </span>
                      </td>
                      <td>
                        {isCurrent ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>✅ Integrated</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏳ Awaiting deployment</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
