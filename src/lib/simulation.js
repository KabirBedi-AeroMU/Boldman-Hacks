/**
 * SwasthQueue — Simulation Runner
 * 
 * Orchestrates the queue simulation: connects mock data with the 
 * math engine to produce live dashboard state.
 */

import { calculateMetrics, priorityWaitTimes, whatIfAnalysis } from './queue-engine';
import { buildPrioritySplit, TRIAGE_LEVELS } from './triage';
import { OPD_DEPARTMENTS, generatePatientQueue, generateBedData, getBedSummary, generateHourlyArrivals, generateAdmissionPipeline, MEDICINES, HOSPITAL } from './mock-data';
import { getMatrixCategory, getStockAlerts, daysUntilStockout } from './inventory-engine';

/**
 * Generate complete dashboard state for all modules
 */
export function generateDashboardState() {
  const prioritySplit = buildPrioritySplit();
  const now = new Date();
  const currentHour = now.getHours();
  const isPeak = currentHour >= 9 && currentHour <= 11;

  // ── OPD Queue State ──────────────────────────────────
  const opdState = OPD_DEPARTMENTS.map(dept => {
    const lambda = isPeak ? dept.peakArrivalRate : dept.normalArrivalRate;
    const mu = 60 / dept.avgServiceTime; // convert min/patient → patients/hour
    const c = dept.doctors;

    const metrics = calculateMetrics(lambda, mu, c);
    const priorityWaits = priorityWaitTimes(lambda, mu, c, prioritySplit);
    const whatIf = whatIfAnalysis(lambda, mu, Math.max(1, c - 2), c + 4);

    // Generate patient queue
    const queueSize = Math.round(metrics.Lq) + Math.round(Math.random() * 5);
    const patients = generatePatientQueue(dept.id, Math.max(5, queueSize));

    // Assign estimated wait times to patients based on their triage level
    patients.forEach(p => {
      const pw = priorityWaits.find(pw => pw.level === p.triageLevel);
      p.estimatedWaitMinutes = pw ? pw.waitMinutes + Math.round((Math.random() - 0.5) * 5) : metrics.waitTimeMinutes;
      p.estimatedWaitMinutes = Math.max(0, p.estimatedWaitMinutes);
    });

    return {
      ...dept,
      lambda,
      mu: Math.round(mu * 100) / 100,
      metrics,
      priorityWaits,
      whatIf,
      patients,
      queueLength: patients.filter(p => p.status === 'waiting').length,
      inConsultation: patients.filter(p => p.status === 'in-consultation').length,
    };
  });

  // ── Bed State ────────────────────────────────────────
  const beds = generateBedData();
  const bedSummary = getBedSummary(beds);

  // ── Inventory State ──────────────────────────────────
  const inventoryState = MEDICINES.map(med => {
    const matrixCat = getMatrixCategory(med.abc, med.ved);
    const alerts = getStockAlerts(med);
    const daysLeft = daysUntilStockout(med.currentStock, med.avgDailyConsumption);

    return {
      ...med,
      matrixCategory: matrixCat,
      alerts,
      daysUntilStockout: daysLeft,
      stockStatus: med.currentStock <= med.safetyStock ? 'critical' :
                   med.currentStock <= med.reorderPoint ? 'low' : 'ok',
    };
  });

  // ── Admission Pipeline ───────────────────────────────
  const admissions = generateAdmissionPipeline();

  // ── KPI Summary ──────────────────────────────────────
  const totalOPDToday = opdState.reduce((sum, d) => sum + Math.round(d.lambda * 8), 0); // 8hr day
  const avgWaitTime = Math.round(opdState.reduce((sum, d) => sum + d.metrics.waitTimeMinutes, 0) / opdState.length);
  const criticalStockItems = inventoryState.filter(m => m.stockStatus === 'critical').length;
  const lowStockItems = inventoryState.filter(m => m.stockStatus === 'low').length;
  const criticalAlerts = inventoryState.reduce((sum, m) => sum + m.alerts.filter(a => a.type === 'critical').length, 0);

  return {
    hospital: HOSPITAL,
    timestamp: now.toISOString(),
    isPeak,

    // OPD
    opdState,
    totalOPDToday,
    avgWaitTime,

    // Beds
    beds,
    bedSummary,

    // Inventory
    inventoryState,
    criticalStockItems,
    lowStockItems,
    criticalAlerts,

    // Admissions
    admissions,
    admissionsByStage: {
      'opd-visit': admissions.filter(a => a.stage === 'opd-visit'),
      'decision-to-admit': admissions.filter(a => a.stage === 'decision-to-admit'),
      'bed-assigned': admissions.filter(a => a.stage === 'bed-assigned'),
      'in-ward': admissions.filter(a => a.stage === 'in-ward'),
      'discharged': admissions.filter(a => a.stage === 'discharged'),
    },

    // Hourly pattern
    hourlyArrivals: generateHourlyArrivals(),

    // Triage reference
    triageLevels: TRIAGE_LEVELS,
  };
}
