import { NextResponse } from 'next/server';
import { OPD_DEPARTMENTS, HOSPITAL } from '../../../lib/mock-data';
import { calculateMetrics, priorityWaitTimes } from '../../../lib/queue-engine';
import { buildPrioritySplit } from '../../../lib/triage';

/**
 * City-Wide Integration API — Queue Status
 * 
 * GET /api/queue
 * Returns real-time OPD queue metrics for this hospital.
 */
export async function GET() {
  const now = new Date();
  const isPeak = now.getHours() >= 9 && now.getHours() <= 11;
  const prioritySplit = buildPrioritySplit();

  const departments = OPD_DEPARTMENTS.map(dept => {
    const lambda = isPeak ? dept.peakArrivalRate : dept.normalArrivalRate;
    const mu = 60 / dept.avgServiceTime;
    const metrics = calculateMetrics(lambda, mu, dept.doctors);
    const priorityWaits = priorityWaitTimes(lambda, mu, dept.doctors, prioritySplit);

    return {
      departmentId: dept.id,
      name: dept.name,
      activeDoctors: dept.doctors,
      arrivalRate: lambda,
      serviceRate: Math.round(mu * 100) / 100,
      utilization: metrics.utilizationPercent,
      avgWaitMinutes: metrics.waitTimeMinutes,
      queueLength: metrics.Lq,
      probabilityOfWaiting: metrics.pWait,
      stable: metrics.stable,
      waitByPriority: priorityWaits.map(pw => ({
        level: pw.level,
        label: pw.label,
        waitMinutes: pw.waitMinutes,
      })),
    };
  });

  return NextResponse.json({
    hospitalId: HOSPITAL.id,
    hospitalName: HOSPITAL.name,
    timestamp: now.toISOString(),
    isPeakHours: isPeak,
    departments,
  });
}
