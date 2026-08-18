import { NextResponse } from 'next/server';
import { MEDICINES, HOSPITAL } from '../../../lib/mock-data';
import { getMatrixCategory, getStockAlerts, daysUntilStockout } from '../../../lib/inventory-engine';

/**
 * City-Wide Integration API — Inventory Status
 * 
 * GET /api/inventory
 * Returns pharmacy inventory status for this hospital.
 */
export async function GET() {
  const items = MEDICINES.map(med => {
    const matrixCat = getMatrixCategory(med.abc, med.ved);
    const alerts = getStockAlerts(med);
    const daysLeft = daysUntilStockout(med.currentStock, med.avgDailyConsumption);

    return {
      itemId: med.id,
      name: med.name,
      category: med.category,
      abcClass: med.abc,
      vedClass: med.ved,
      matrixCategory: matrixCat.category,
      currentStock: med.currentStock,
      unit: med.unit,
      reorderPoint: med.reorderPoint,
      safetyStock: med.safetyStock,
      daysUntilStockout: daysLeft === Infinity ? null : daysLeft,
      avgDailyConsumption: med.avgDailyConsumption,
      nearestExpiry: med.nearestExpiry,
      stockStatus: med.currentStock <= med.safetyStock ? 'critical' :
                   med.currentStock <= med.reorderPoint ? 'low' : 'adequate',
      alertCount: alerts.length,
    };
  });

  const criticalCount = items.filter(i => i.stockStatus === 'critical').length;
  const lowCount = items.filter(i => i.stockStatus === 'low').length;

  return NextResponse.json({
    hospitalId: HOSPITAL.id,
    hospitalName: HOSPITAL.name,
    timestamp: new Date().toISOString(),
    totalItems: items.length,
    criticalStockItems: criticalCount,
    lowStockItems: lowCount,
    items,
  });
}
