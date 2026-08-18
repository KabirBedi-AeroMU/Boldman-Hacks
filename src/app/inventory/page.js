'use client';

import { useState, useEffect } from 'react';
import { generateDashboardState } from '../../lib/simulation';
import { getMatrixCategory } from '../../lib/inventory-engine';

const ABC_LABELS = ['A', 'B', 'C'];
const VED_LABELS = ['V', 'E', 'D'];

export default function InventoryPage() {
  const [state, setState] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setState(generateDashboardState());
  }, []);

  if (!state) return <div className="page-body"><div className="empty-state"><div className="empty-state-icon">⏳</div></div></div>;

  const { inventoryState } = state;

  // Build ABC-VED matrix counts
  const matrixCounts = {};
  ABC_LABELS.forEach(abc => {
    VED_LABELS.forEach(ved => {
      matrixCounts[abc + ved] = inventoryState.filter(m => m.abc === abc && m.ved === ved).length;
    });
  });

  // Filter inventory
  let filtered = inventoryState;
  if (filterCategory !== 'all') {
    filtered = filtered.filter(m => m.matrixCategory.category === filterCategory);
  }
  if (filterStock !== 'all') {
    filtered = filtered.filter(m => m.stockStatus === filterStock);
  }
  if (searchTerm) {
    filtered = filtered.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  // Aggregate alerts
  const allAlerts = inventoryState.flatMap(m => m.alerts.map(a => ({ ...a, medId: m.id, medName: m.name })));
  const criticalAlerts = allAlerts.filter(a => a.type === 'critical');
  const warningAlerts = allAlerts.filter(a => a.type === 'warning');

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Pharmacy & Inventory</h1>
            <p className="page-subtitle">ABC-VED matrix classification · FEFO dispatch · Consumption forecasting</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {criticalAlerts.length > 0 && (
              <span className="badge danger">
                <span className="badge-dot"></span>
                {criticalAlerts.length} critical
              </span>
            )}
            {warningAlerts.length > 0 && (
              <span className="badge warning">
                <span className="badge-dot"></span>
                {warningAlerts.length} warnings
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card accent animate-in">
            <div className="kpi-label">Total Items</div>
            <div className="kpi-value accent">{inventoryState.length}<span className="kpi-unit">SKUs</span></div>
          </div>
          <div className="kpi-card danger animate-in">
            <div className="kpi-label">Critical Stock</div>
            <div className="kpi-value danger">{state.criticalStockItems}</div>
            <div className="kpi-change negative">Below safety stock</div>
          </div>
          <div className="kpi-card warning animate-in">
            <div className="kpi-label">Low Stock</div>
            <div className="kpi-value warning">{state.lowStockItems}</div>
            <div className="kpi-change negative">At reorder point</div>
          </div>
          <div className="kpi-card success animate-in">
            <div className="kpi-label">Adequate</div>
            <div className="kpi-value success">{inventoryState.filter(m => m.stockStatus === 'ok').length}</div>
          </div>
        </div>

        <div className="grid-sidebar" style={{ marginBottom: 24 }}>
          {/* ABC-VED Matrix */}
          <div className="card animate-in">
            <div className="card-header">
              <div className="card-title">📊 ABC-VED Matrix</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click cell to filter</span>
            </div>
            <div className="card-body">
              <div className="matrix-grid">
                {/* Header row */}
                <div className="matrix-header"></div>
                <div className="matrix-header">V (Vital)</div>
                <div className="matrix-header">E (Essential)</div>
                <div className="matrix-header">D (Desirable)</div>

                {/* Data rows */}
                {ABC_LABELS.map(abc => (
                  <>
                    <div key={`label-${abc}`} className="matrix-row-label">
                      {abc} ({abc === 'A' ? '70% spend' : abc === 'B' ? '20% spend' : '10% spend'})
                    </div>
                    {VED_LABELS.map(ved => {
                      const cat = getMatrixCategory(abc, ved);
                      return (
                        <div
                          key={abc + ved}
                          className={`matrix-cell cat-${cat.category.toLowerCase()}`}
                          onClick={() => setFilterCategory(filterCategory === cat.category ? 'all' : cat.category)}
                          title={`Category ${cat.category}: ${cat.label}`}
                        >
                          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{matrixCounts[abc + ved]}</div>
                          <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>Cat {cat.category}</div>
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--danger)' }}></div> Cat I — Critical Control</div>
                <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--warning)' }}></div> Cat II — Moderate</div>
                <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--success)' }}></div> Cat III — Routine</div>
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="card animate-in">
            <div className="card-header">
              <div className="card-title">⚠️ Active Alerts</div>
              <span className="badge danger">{allAlerts.length}</span>
            </div>
            <div className="card-body" style={{ maxHeight: 380, overflowY: 'auto' }}>
              {allAlerts.sort((a, b) => (a.type === 'critical' ? -1 : 1)).map((alert, i) => (
                <div key={i} className={`alert-item ${alert.type}`}>
                  <span className="alert-icon">{alert.type === 'critical' ? '🔴' : '🟡'}</span>
                  <span>{alert.message}</span>
                </div>
              ))}
              {allAlerts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-text">All stock levels adequate</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`btn btn-sm ${filterStock === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterStock('all')}>All</button>
            <button className={`btn btn-sm ${filterStock === 'critical' ? 'btn-danger' : 'btn-outline'}`} onClick={() => setFilterStock(filterStock === 'critical' ? 'all' : 'critical')}>🔴 Critical</button>
            <button className={`btn btn-sm ${filterStock === 'low' ? 'btn-outline' : 'btn-outline'}`} style={filterStock === 'low' ? { borderColor: 'var(--warning)', color: 'var(--warning)' } : {}} onClick={() => setFilterStock(filterStock === 'low' ? 'all' : 'low')}>🟡 Low</button>
            <button className={`btn btn-sm ${filterStock === 'ok' ? 'btn-outline' : 'btn-outline'}`} style={filterStock === 'ok' ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}} onClick={() => setFilterStock(filterStock === 'ok' ? 'all' : 'ok')}>🟢 Adequate</button>
          </div>
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              width: 240,
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Inventory Table */}
        <div className="card">
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine / Consumable</th>
                  <th>Category</th>
                  <th>ABC</th>
                  <th>VED</th>
                  <th>Matrix</th>
                  <th>Stock</th>
                  <th>Reorder Pt</th>
                  <th>Days Left</th>
                  <th>Daily Use</th>
                  <th>Nearest Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(med => {
                  const stockPercent = Math.min(100, (med.currentStock / med.reorderPoint) * 100);
                  const stockColor = med.stockStatus === 'critical' ? 'var(--danger)' : med.stockStatus === 'low' ? 'var(--warning)' : 'var(--success)';
                  return (
                    <tr key={med.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 220 }}>
                        {med.name}
                        {med.schedule !== 'N/A' && med.schedule !== 'OTC' && (
                          <span style={{ fontSize: '0.6rem', marginLeft: 6, padding: '1px 5px', background: 'var(--bg-elevated)', borderRadius: 4, color: 'var(--text-muted)' }}>
                            Sch. {med.schedule}
                          </span>
                        )}
                      </td>
                      <td>{med.category}</td>
                      <td><span style={{ fontWeight: 800, color: med.abc === 'A' ? 'var(--danger)' : med.abc === 'B' ? 'var(--warning)' : 'var(--text-muted)' }}>{med.abc}</span></td>
                      <td><span style={{ fontWeight: 800, color: med.ved === 'V' ? 'var(--danger)' : med.ved === 'E' ? 'var(--warning)' : 'var(--text-muted)' }}>{med.ved}</span></td>
                      <td>
                        <span className={`badge ${med.matrixCategory.category === 'I' ? 'danger' : med.matrixCategory.category === 'II' ? 'warning' : 'success'}`}>
                          Cat {med.matrixCategory.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: stockColor }}>{med.currentStock.toLocaleString()}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}> {med.unit}</span>
                        <div className="stock-bar">
                          <div className="stock-fill" style={{ width: `${stockPercent}%`, background: stockColor }}></div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{med.reorderPoint.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: med.daysUntilStockout <= 7 ? 'var(--danger)' : med.daysUntilStockout <= 21 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                        {med.daysUntilStockout === Infinity ? '∞' : `${med.daysUntilStockout}d`}
                      </td>
                      <td>{med.avgDailyConsumption}</td>
                      <td style={{
                        color: (() => {
                          const d = Math.floor((new Date(med.nearestExpiry) - new Date()) / (1000 * 60 * 60 * 24));
                          return d <= 30 ? 'var(--danger)' : d <= 90 ? 'var(--warning)' : 'var(--text-secondary)';
                        })()
                      }}>
                        {new Date(med.nearestExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td>
                        <span className={`badge ${med.stockStatus === 'critical' ? 'danger' : med.stockStatus === 'low' ? 'warning' : 'success'}`}>
                          <span className="badge-dot"></span>
                          {med.stockStatus === 'critical' ? 'CRITICAL' : med.stockStatus === 'low' ? 'LOW' : 'OK'}
                        </span>
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
