/**
 * SwasthQueue — Mock Data Generator
 * 
 * Realistic data modeled on Delhi govt hospitals (LNJP, GTB Hospital).
 * All numbers are based on published stats + reasonable estimates.
 */

// ── Hospital Profile ─────────────────────────────────────────

export const HOSPITAL = {
  id: 'LNJP-001',
  name: 'Lok Nayak Jai Prakash Narayan Hospital',
  shortName: 'LNJP Hospital',
  city: 'New Delhi',
  district: 'Central Delhi',
  type: 'Super Specialty',
  totalBeds: 2000,
  departments: [
    'General Medicine', 'General Surgery', 'Orthopedics', 'Pediatrics',
    'Gynecology & Obstetrics', 'ENT', 'Ophthalmology', 'Dermatology',
    'Psychiatry', 'Cardiology', 'Neurology', 'Pulmonology',
  ],
};

// ── OPD Departments ──────────────────────────────────────────

export const OPD_DEPARTMENTS = [
  {
    id: 'gen-med',
    name: 'General Medicine',
    shortName: 'Gen Med',
    icon: '🏥',
    doctors: 8,
    avgServiceTime: 12,     // minutes per patient
    peakArrivalRate: 45,     // patients/hour at peak (9-11 AM)
    normalArrivalRate: 25,   // patients/hour off-peak
    roomsAvailable: 8,
  },
  {
    id: 'gen-surg',
    name: 'General Surgery',
    shortName: 'Surgery',
    icon: '🔪',
    doctors: 5,
    avgServiceTime: 15,
    peakArrivalRate: 20,
    normalArrivalRate: 12,
    roomsAvailable: 5,
  },
  {
    id: 'ortho',
    name: 'Orthopedics',
    shortName: 'Ortho',
    icon: '🦴',
    doctors: 4,
    avgServiceTime: 14,
    peakArrivalRate: 18,
    normalArrivalRate: 10,
    roomsAvailable: 4,
  },
  {
    id: 'peds',
    name: 'Pediatrics',
    shortName: 'Peds',
    icon: '👶',
    doctors: 5,
    avgServiceTime: 15,
    peakArrivalRate: 22,
    normalArrivalRate: 14,
    roomsAvailable: 5,
  },
  {
    id: 'gyn-obs',
    name: 'Gynecology & Obstetrics',
    shortName: 'Gyn/Obs',
    icon: '🤰',
    doctors: 6,
    avgServiceTime: 18,
    peakArrivalRate: 20,
    normalArrivalRate: 12,
    roomsAvailable: 6,
  },
  {
    id: 'ent',
    name: 'ENT',
    shortName: 'ENT',
    icon: '👂',
    doctors: 3,
    avgServiceTime: 10,
    peakArrivalRate: 15,
    normalArrivalRate: 8,
    roomsAvailable: 3,
  },
  {
    id: 'ophthal',
    name: 'Ophthalmology',
    shortName: 'Eye',
    icon: '👁️',
    doctors: 3,
    avgServiceTime: 12,
    peakArrivalRate: 14,
    normalArrivalRate: 8,
    roomsAvailable: 3,
  },
  {
    id: 'derma',
    name: 'Dermatology',
    shortName: 'Derma',
    icon: '🧴',
    doctors: 2,
    avgServiceTime: 8,
    peakArrivalRate: 16,
    normalArrivalRate: 10,
    roomsAvailable: 2,
  },
  {
    id: 'cardio',
    name: 'Cardiology',
    shortName: 'Cardio',
    icon: '❤️',
    doctors: 4,
    avgServiceTime: 20,
    peakArrivalRate: 12,
    normalArrivalRate: 7,
    roomsAvailable: 4,
  },
  {
    id: 'neuro',
    name: 'Neurology',
    shortName: 'Neuro',
    icon: '🧠',
    doctors: 3,
    avgServiceTime: 20,
    peakArrivalRate: 10,
    normalArrivalRate: 5,
    roomsAvailable: 3,
  },
];

// ── Ward / Bed Data ──────────────────────────────────────────

export const WARDS = [
  { id: 'gen-male', name: 'General Male Ward', department: 'General Medicine', totalBeds: 120, floor: 2 },
  { id: 'gen-female', name: 'General Female Ward', department: 'General Medicine', totalBeds: 100, floor: 2 },
  { id: 'surg-ward', name: 'Surgical Ward', department: 'General Surgery', totalBeds: 80, floor: 3 },
  { id: 'ortho-ward', name: 'Orthopedic Ward', department: 'Orthopedics', totalBeds: 60, floor: 3 },
  { id: 'peds-ward', name: 'Pediatric Ward', department: 'Pediatrics', totalBeds: 80, floor: 4 },
  { id: 'maternity', name: 'Maternity Ward', department: 'Gynecology & Obstetrics', totalBeds: 100, floor: 4 },
  { id: 'icu', name: 'ICU', department: 'Critical Care', totalBeds: 60, floor: 1 },
  { id: 'nicu', name: 'NICU', department: 'Neonatal', totalBeds: 30, floor: 4 },
  { id: 'burns', name: 'Burns Ward', department: 'Burns & Plastics', totalBeds: 40, floor: 5 },
  { id: 'cardio-ward', name: 'Cardiology Ward', department: 'Cardiology', totalBeds: 50, floor: 5 },
  { id: 'neuro-ward', name: 'Neurology Ward', department: 'Neurology', totalBeds: 40, floor: 6 },
  { id: 'emergency', name: 'Emergency Beds', department: 'Emergency', totalBeds: 50, floor: 1 },
  { id: 'covid', name: 'Isolation Ward', department: 'Infectious Disease', totalBeds: 60, floor: 7 },
  { id: 'pvt-rooms', name: 'Private Rooms', department: 'General', totalBeds: 30, floor: 6 },
];

/**
 * Generate randomized bed status for all wards
 */
export function generateBedData() {
  const statuses = ['occupied', 'available', 'cleaning', 'maintenance'];
  const beds = [];

  for (const ward of WARDS) {
    const wardBeds = [];
    const occupiedRate = 0.75 + Math.random() * 0.15; // 75-90% occupancy

    for (let i = 1; i <= ward.totalBeds; i++) {
      const rand = Math.random();
      let status;
      if (rand < occupiedRate) status = 'occupied';
      else if (rand < occupiedRate + 0.03) status = 'cleaning';
      else if (rand < occupiedRate + 0.05) status = 'maintenance';
      else status = 'available';

      wardBeds.push({
        id: `${ward.id}-${String(i).padStart(3, '0')}`,
        wardId: ward.id,
        wardName: ward.name,
        department: ward.department,
        floor: ward.floor,
        bedNumber: i,
        status,
        patientId: status === 'occupied' ? `PT-${Math.random().toString(36).substr(2, 8).toUpperCase()}` : null,
        admittedAt: status === 'occupied' ? randomPastDate(7) : null,
        estimatedDischarge: status === 'occupied' ? randomFutureDate(5) : null,
      });
    }
    beds.push(...wardBeds);
  }

  return beds;
}

/**
 * Generate bed summary statistics
 */
export function getBedSummary(beds) {
  const total = beds.length;
  const occupied = beds.filter(b => b.status === 'occupied').length;
  const available = beds.filter(b => b.status === 'available').length;
  const cleaning = beds.filter(b => b.status === 'cleaning').length;
  const maintenance = beds.filter(b => b.status === 'maintenance').length;

  // Per-ward summary
  const wardSummary = WARDS.map(ward => {
    const wardBeds = beds.filter(b => b.wardId === ward.id);
    return {
      ...ward,
      occupied: wardBeds.filter(b => b.status === 'occupied').length,
      available: wardBeds.filter(b => b.status === 'available').length,
      cleaning: wardBeds.filter(b => b.status === 'cleaning').length,
      maintenance: wardBeds.filter(b => b.status === 'maintenance').length,
      occupancyRate: Math.round((wardBeds.filter(b => b.status === 'occupied').length / ward.totalBeds) * 100),
    };
  });

  return { total, occupied, available, cleaning, maintenance, occupancyRate: Math.round((occupied / total) * 100), wardSummary };
}


// ── Pharmacy Inventory ───────────────────────────────────────

export const MEDICINES = [
  // Category I (Vital + High-value)
  { id: 'M001', name: 'Adrenaline (Epinephrine) 1mg/ml', category: 'Emergency', abc: 'A', ved: 'V', unit: 'ampoule', currentStock: 45, reorderPoint: 100, safetyStock: 50, avgDailyConsumption: 8, leadTimeDays: 3, price: 35, nearestExpiry: '2026-11-15', schedule: 'H' },
  { id: 'M002', name: 'Insulin Human Regular 40IU/ml', category: 'Endocrine', abc: 'A', ved: 'V', unit: 'vial', currentStock: 120, reorderPoint: 80, safetyStock: 40, avgDailyConsumption: 15, leadTimeDays: 5, price: 85, nearestExpiry: '2027-03-20', schedule: 'H' },
  { id: 'M003', name: 'Heparin Sodium 5000IU/ml', category: 'Blood', abc: 'A', ved: 'V', unit: 'vial', currentStock: 35, reorderPoint: 60, safetyStock: 30, avgDailyConsumption: 6, leadTimeDays: 4, price: 120, nearestExpiry: '2026-09-30', schedule: 'H' },
  { id: 'M004', name: 'Atropine Sulphate 0.6mg/ml', category: 'Emergency', abc: 'B', ved: 'V', unit: 'ampoule', currentStock: 200, reorderPoint: 100, safetyStock: 50, avgDailyConsumption: 5, leadTimeDays: 3, price: 12, nearestExpiry: '2027-06-10', schedule: 'H' },
  
  // Category I (Essential + High-value)
  { id: 'M005', name: 'Ceftriaxone 1g Injection', category: 'Antibiotic', abc: 'A', ved: 'E', unit: 'vial', currentStock: 500, reorderPoint: 300, safetyStock: 150, avgDailyConsumption: 45, leadTimeDays: 5, price: 55, nearestExpiry: '2027-01-15', schedule: 'H1' },
  { id: 'M006', name: 'Metformin 500mg', category: 'Endocrine', abc: 'A', ved: 'E', unit: 'tablet', currentStock: 8000, reorderPoint: 5000, safetyStock: 2500, avgDailyConsumption: 300, leadTimeDays: 7, price: 2.5, nearestExpiry: '2027-08-20', schedule: 'H' },
  { id: 'M007', name: 'Amlodipine 5mg', category: 'Cardiovascular', abc: 'A', ved: 'E', unit: 'tablet', currentStock: 6000, reorderPoint: 4000, safetyStock: 2000, avgDailyConsumption: 250, leadTimeDays: 5, price: 3, nearestExpiry: '2027-04-10', schedule: 'H' },
  
  // Category II
  { id: 'M008', name: 'Paracetamol 500mg', category: 'Analgesic', abc: 'C', ved: 'E', unit: 'tablet', currentStock: 15000, reorderPoint: 8000, safetyStock: 4000, avgDailyConsumption: 500, leadTimeDays: 3, price: 1, nearestExpiry: '2027-12-31', schedule: 'OTC' },
  { id: 'M009', name: 'Omeprazole 20mg', category: 'GI', abc: 'B', ved: 'E', unit: 'capsule', currentStock: 4000, reorderPoint: 2500, safetyStock: 1200, avgDailyConsumption: 150, leadTimeDays: 5, price: 4, nearestExpiry: '2027-05-15', schedule: 'H' },
  { id: 'M010', name: 'Amoxicillin 500mg', category: 'Antibiotic', abc: 'B', ved: 'E', unit: 'capsule', currentStock: 3000, reorderPoint: 2000, safetyStock: 1000, avgDailyConsumption: 120, leadTimeDays: 5, price: 5, nearestExpiry: '2026-12-20', schedule: 'H1' },
  
  // Category II-III
  { id: 'M011', name: 'Diclofenac Sodium 50mg', category: 'Analgesic', abc: 'B', ved: 'D', unit: 'tablet', currentStock: 5000, reorderPoint: 2000, safetyStock: 1000, avgDailyConsumption: 100, leadTimeDays: 3, price: 2, nearestExpiry: '2027-07-30', schedule: 'H' },
  { id: 'M012', name: 'Ranitidine 150mg', category: 'GI', abc: 'C', ved: 'D', unit: 'tablet', currentStock: 6000, reorderPoint: 3000, safetyStock: 1500, avgDailyConsumption: 80, leadTimeDays: 3, price: 1.5, nearestExpiry: '2027-09-15', schedule: 'H' },
  { id: 'M013', name: 'Cetrizine 10mg', category: 'Antihistamine', abc: 'C', ved: 'D', unit: 'tablet', currentStock: 8000, reorderPoint: 3000, safetyStock: 1500, avgDailyConsumption: 100, leadTimeDays: 3, price: 1, nearestExpiry: '2027-11-01', schedule: 'OTC' },
  { id: 'M014', name: 'ORS Powder', category: 'Rehydration', abc: 'C', ved: 'E', unit: 'sachet', currentStock: 10000, reorderPoint: 5000, safetyStock: 2500, avgDailyConsumption: 200, leadTimeDays: 3, price: 5, nearestExpiry: '2028-01-01', schedule: 'OTC' },
  { id: 'M015', name: 'Povidone Iodine 5% Solution', category: 'Antiseptic', abc: 'C', ved: 'E', unit: 'bottle', currentStock: 300, reorderPoint: 150, safetyStock: 80, avgDailyConsumption: 10, leadTimeDays: 5, price: 45, nearestExpiry: '2027-06-30', schedule: 'OTC' },

  // Consumables
  { id: 'C001', name: 'Surgical Gloves (Pair)', category: 'Consumable', abc: 'A', ved: 'V', unit: 'pair', currentStock: 5000, reorderPoint: 3000, safetyStock: 1500, avgDailyConsumption: 200, leadTimeDays: 5, price: 8, nearestExpiry: '2028-06-01', schedule: 'N/A' },
  { id: 'C002', name: 'Disposable Syringe 5ml', category: 'Consumable', abc: 'A', ved: 'V', unit: 'piece', currentStock: 8000, reorderPoint: 5000, safetyStock: 2500, avgDailyConsumption: 350, leadTimeDays: 5, price: 5, nearestExpiry: '2029-01-01', schedule: 'N/A' },
  { id: 'C003', name: 'IV Cannula 20G', category: 'Consumable', abc: 'B', ved: 'V', unit: 'piece', currentStock: 2000, reorderPoint: 1000, safetyStock: 500, avgDailyConsumption: 80, leadTimeDays: 7, price: 15, nearestExpiry: '2028-03-01', schedule: 'N/A' },
  { id: 'C004', name: 'Cotton Roll 500g', category: 'Consumable', abc: 'C', ved: 'E', unit: 'roll', currentStock: 200, reorderPoint: 100, safetyStock: 50, avgDailyConsumption: 5, leadTimeDays: 3, price: 60, nearestExpiry: '2029-12-01', schedule: 'N/A' },
  { id: 'C005', name: 'Face Mask N95', category: 'PPE', abc: 'B', ved: 'E', unit: 'piece', currentStock: 3000, reorderPoint: 1500, safetyStock: 800, avgDailyConsumption: 100, leadTimeDays: 7, price: 25, nearestExpiry: '2028-06-01', schedule: 'N/A' },
];

// ── Patient Queue Data ───────────────────────────────────────

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Ira', 'Aanya', 'Riya', 'Kavya', 'Priya', 'Rahul', 'Amit', 'Sunita', 'Meena', 'Rajesh', 'Neha', 'Suresh', 'Kamla', 'Mohd', 'Fatima'];
const LAST_NAMES = ['Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Patel', 'Jain', 'Mehra', 'Chauhan', 'Yadav', 'Khan', 'Ali', 'Bansal', 'Agarwal', 'Tiwari', 'Dubey', 'Mishra', 'Saxena', 'Srivastava', 'Malhotra'];

function randomName() {
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
}

function randomAge() {
  // Skew towards realistic OPD distribution
  const r = Math.random();
  if (r < 0.15) return Math.floor(Math.random() * 12) + 1;   // children
  if (r < 0.25) return Math.floor(Math.random() * 8) + 13;    // teens
  if (r < 0.65) return Math.floor(Math.random() * 30) + 25;   // adults
  return Math.floor(Math.random() * 25) + 55;                  // elderly
}

function randomPastDate(maxDaysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * maxDaysAgo));
  d.setHours(Math.floor(Math.random() * 12) + 7);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
}

function randomFutureDate(maxDaysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * maxDaysAhead) + 1);
  d.setHours(Math.floor(Math.random() * 12) + 8);
  return d.toISOString();
}

/**
 * Generate a queue of patients for a department
 */
export function generatePatientQueue(departmentId, count = 20) {
  const triageLevels = [
    { level: 1, weight: 0.03 },
    { level: 2, weight: 0.07 },
    { level: 3, weight: 0.25 },
    { level: 4, weight: 0.35 },
    { level: 5, weight: 0.30 },
  ];

  const patients = [];
  for (let i = 0; i < count; i++) {
    // Pick triage level by weight
    const r = Math.random();
    let cumWeight = 0;
    let triage = 5;
    for (const t of triageLevels) {
      cumWeight += t.weight;
      if (r <= cumWeight) { triage = t.level; break; }
    }

    const arrivalHour = 7 + Math.floor(Math.random() * 6); // 7 AM to 1 PM
    const arrivalMin = Math.floor(Math.random() * 60);

    patients.push({
      id: `TKN-${String(i + 1).padStart(4, '0')}`,
      name: randomName(),
      age: randomAge(),
      gender: Math.random() > 0.48 ? 'M' : 'F',
      departmentId,
      triageLevel: triage,
      tokenNumber: i + 1,
      arrivalTime: `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`,
      status: i < 3 ? 'in-consultation' : (i < 6 ? 'called' : 'waiting'),
      estimatedWaitMinutes: null, // filled by simulation
    });
  }

  // Sort by triage priority (lower = higher priority), then arrival time
  patients.sort((a, b) => a.triageLevel - b.triageLevel || a.arrivalTime.localeCompare(b.arrivalTime));

  return patients;
}

// ── Admission Pipeline ───────────────────────────────────────

export function generateAdmissionPipeline() {
  const stages = ['opd-visit', 'decision-to-admit', 'bed-assigned', 'in-ward', 'discharged'];
  const pipeline = [];
  
  for (let i = 0; i < 25; i++) {
    const stageIdx = Math.floor(Math.random() * stages.length);
    pipeline.push({
      id: `ADM-${String(i + 1).padStart(4, '0')}`,
      patientName: randomName(),
      age: randomAge(),
      gender: Math.random() > 0.48 ? 'M' : 'F',
      department: OPD_DEPARTMENTS[Math.floor(Math.random() * OPD_DEPARTMENTS.length)].name,
      stage: stages[stageIdx],
      stageLabel: stages[stageIdx].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      triageLevel: Math.floor(Math.random() * 3) + 2, // mostly 2-4 for admissions
      admitDate: stageIdx >= 2 ? randomPastDate(5) : null,
      assignedWard: stageIdx >= 2 ? WARDS[Math.floor(Math.random() * WARDS.length)].name : null,
      assignedBed: stageIdx >= 2 ? `B-${Math.floor(Math.random() * 100) + 1}` : null,
      estimatedDischarge: stageIdx === 3 ? randomFutureDate(5) : null,
    });
  }

  return pipeline;
}

// ── Hourly Arrival Pattern ───────────────────────────────────

/**
 * Generate realistic hourly arrival data (typical Delhi govt hospital)
 * Peak: 9-11 AM, moderate: 8-9 AM and 11 AM-1 PM, low: afternoon
 */
export function generateHourlyArrivals() {
  const pattern = [
    { hour: '07:00', label: '7 AM', multiplier: 0.3 },
    { hour: '08:00', label: '8 AM', multiplier: 0.6 },
    { hour: '09:00', label: '9 AM', multiplier: 0.95 },
    { hour: '10:00', label: '10 AM', multiplier: 1.0 },
    { hour: '11:00', label: '11 AM', multiplier: 0.85 },
    { hour: '12:00', label: '12 PM', multiplier: 0.6 },
    { hour: '13:00', label: '1 PM', multiplier: 0.4 },
    { hour: '14:00', label: '2 PM', multiplier: 0.35 },
    { hour: '15:00', label: '3 PM', multiplier: 0.25 },
    { hour: '16:00', label: '4 PM', multiplier: 0.15 },
  ];

  return pattern;
}

// ── City-Wide Multi-Hospital Data ────────────────────────────

export const CITY_HOSPITALS = [
  { id: 'LNJP-001', name: 'Lok Nayak Hospital', shortName: 'LNJP', beds: 2000, lat: 28.6358, lng: 77.2373 },
  { id: 'GTB-001', name: 'Guru Teg Bahadur Hospital', shortName: 'GTB', beds: 1800, lat: 28.6867, lng: 77.2819 },
  { id: 'DDU-001', name: 'Deen Dayal Upadhyay Hospital', shortName: 'DDU', beds: 800, lat: 28.5758, lng: 77.1948 },
  { id: 'BSA-001', name: 'Babu Jagjivan Ram Hospital', shortName: 'BJR', beds: 700, lat: 28.5892, lng: 77.0505 },
  { id: 'RML-001', name: 'Ram Manohar Lohia Hospital', shortName: 'RML', beds: 1531, lat: 28.6274, lng: 77.2033 },
  { id: 'SJH-001', name: 'Safdarjung Hospital', shortName: 'SJH', beds: 1531, lat: 28.5685, lng: 77.2078 },
  { id: 'AIIMS-001', name: 'AIIMS New Delhi', shortName: 'AIIMS', beds: 2478, lat: 28.5672, lng: 77.2100 },
  { id: 'LHMC-001', name: 'Lady Hardinge Medical College', shortName: 'LHMC', beds: 850, lat: 28.6350, lng: 77.2103 },
];
