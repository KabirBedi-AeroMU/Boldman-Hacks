/**
 * SwasthQueue — Inventory Management Engine
 * 
 * Implements ABC-VED matrix classification for hospital pharmacy
 * with FEFO (First Expiry First Out) dispatch logic and reorder alerts.
 */

// ── ABC-VED Matrix ───────────────────────────────────────────

/**
 * ABC classification based on annual consumption value
 * A = top 70% spend, B = next 20%, C = bottom 10%
 */
export function classifyABC(annualValue, thresholds = { A: 0.7, B: 0.9 }) {
  // annualValue is the item's % of total spend
  if (annualValue >= thresholds.A) return 'A';
  if (annualValue >= thresholds.B - thresholds.A) return 'B';
  return 'C';
}

/**
 * VED classification based on clinical criticality
 * V = vital (life-saving), E = essential, D = desirable
 */
export function classifyVED(criticality) {
  if (criticality === 'vital') return 'V';
  if (criticality === 'essential') return 'E';
  return 'D';
}

/**
 * ABC-VED Matrix → Category I, II, or III
 * 
 * Category I (highest priority): AV, AE, AD, BV, CV
 * Category II: BE, CE, BD
 * Category III: CD, BD (sometimes), rest
 */
export function getMatrixCategory(abc, ved) {
  const combo = abc + ved;
  const catI = ['AV', 'AE', 'AD', 'BV', 'CV'];
  const catII = ['BE', 'CE', 'BD'];
  
  if (catI.includes(combo)) return { category: 'I', label: 'Critical Control', color: '#ef4444' };
  if (catII.includes(combo)) return { category: 'II', label: 'Moderate Control', color: '#eab308' };
  return { category: 'III', label: 'Routine Control', color: '#22c55e' };
}

// ── Stock Management ─────────────────────────────────────────

/**
 * Calculate reorder point and safety stock
 * 
 * @param {number} avgDailyConsumption - average units consumed per day
 * @param {number} leadTimeDays - supplier delivery time in days
 * @param {number} safetyDays - extra buffer days
 * @returns {object} reorder metrics
 */
export function calculateReorderPoint(avgDailyConsumption, leadTimeDays, safetyDays = 7) {
  const safetyStock = avgDailyConsumption * safetyDays;
  const reorderPoint = (avgDailyConsumption * leadTimeDays) + safetyStock;
  const economicOrderQty = Math.ceil(avgDailyConsumption * 30); // ~1 month
  
  return {
    safetyStock: Math.ceil(safetyStock),
    reorderPoint: Math.ceil(reorderPoint),
    economicOrderQty,
    daysUntilStockout: null, // calculated with current stock
  };
}

/**
 * Calculate days until stockout given current inventory
 */
export function daysUntilStockout(currentStock, avgDailyConsumption) {
  if (avgDailyConsumption <= 0) return Infinity;
  return Math.floor(currentStock / avgDailyConsumption);
}

/**
 * FEFO logic — sort batches by expiry date
 */
export function sortByExpiry(batches) {
  return [...batches].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
}

/**
 * Get stock alerts for a medicine item
 */
export function getStockAlerts(item) {
  const alerts = [];
  const today = new Date();
  
  // Low stock alert
  if (item.currentStock <= item.reorderPoint) {
    alerts.push({
      type: item.currentStock <= item.safetyStock ? 'critical' : 'warning',
      message: item.currentStock <= item.safetyStock
        ? `CRITICAL: ${item.name} below safety stock (${item.currentStock}/${item.safetyStock})`
        : `LOW STOCK: ${item.name} at reorder point (${item.currentStock}/${item.reorderPoint})`,
    });
  }

  // Expiry alert (within 90 days)
  if (item.nearestExpiry) {
    const expiryDate = new Date(item.nearestExpiry);
    const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysToExpiry <= 0) {
      alerts.push({ type: 'critical', message: `EXPIRED: ${item.name} batch expired ${Math.abs(daysToExpiry)} days ago` });
    } else if (daysToExpiry <= 30) {
      alerts.push({ type: 'critical', message: `EXPIRING: ${item.name} expires in ${daysToExpiry} days` });
    } else if (daysToExpiry <= 90) {
      alerts.push({ type: 'warning', message: `NEAR EXPIRY: ${item.name} expires in ${daysToExpiry} days` });
    }
  }

  return alerts;
}

/**
 * Simple moving average forecast for consumption
 * @param {number[]} historicalDaily - array of daily consumption values (recent first)
 * @param {number} windowDays - moving average window
 * @param {number} forecastDays - how many days to forecast
 */
export function consumptionForecast(historicalDaily, windowDays = 7, forecastDays = 30) {
  if (historicalDaily.length === 0) return [];

  const window = historicalDaily.slice(0, windowDays);
  const avg = window.reduce((s, v) => s + v, 0) / window.length;
  
  const forecast = [];
  let cumulative = 0;
  for (let d = 1; d <= forecastDays; d++) {
    cumulative += avg;
    forecast.push({
      day: d,
      dailyForecast: Math.round(avg * 10) / 10,
      cumulativeForecast: Math.round(cumulative),
    });
  }
  
  return { avgDaily: Math.round(avg * 10) / 10, forecast };
}
