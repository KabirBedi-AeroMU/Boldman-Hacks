import { NextResponse } from 'next/server';
import { generateBedData, getBedSummary, HOSPITAL } from '../../../lib/mock-data';

/**
 * City-Wide Integration API — Bed Status
 * 
 * GET /api/beds
 * Returns real-time bed availability for this hospital.
 * Designed to plug into NIC's city-wide aggregation dashboard.
 */
export async function GET() {
  const beds = generateBedData();
  const summary = getBedSummary(beds);

  return NextResponse.json({
    hospitalId: HOSPITAL.id,
    hospitalName: HOSPITAL.name,
    city: HOSPITAL.city,
    timestamp: new Date().toISOString(),
    totalBeds: summary.total,
    available: summary.available,
    occupied: summary.occupied,
    cleaning: summary.cleaning,
    maintenance: summary.maintenance,
    occupancyRate: summary.occupancyRate,
    departments: summary.wardSummary.map(w => ({
      wardId: w.id,
      name: w.name,
      department: w.department,
      floor: w.floor,
      totalBeds: w.totalBeds,
      available: w.available,
      occupied: w.occupied,
      occupancyRate: w.occupancyRate,
    })),
  });
}
