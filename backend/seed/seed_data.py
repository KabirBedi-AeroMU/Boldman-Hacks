import random
import math
from backend.services.mock_db import db, Hospital, Department, PriorityRule

DELHI_HOSPITALS = [
    "Lok Nayak Hospital (LNJP)", "Guru Teg Bahadur Hospital (GTB)", "Safdarjung Hospital",
    "Dr. RML Hospital", "AIIMS New Delhi", "Deen Dayal Upadhyay Hospital", "Sanjay Gandhi Memorial Hospital",
    "Baba Saheb Ambedkar Hospital", "Chacha Nehru Bal Chikitsalaya", "G.B. Pant Hospital",
    "Sushruta Trauma Centre", "Aruna Asaf Ali Government Hospital", "Rao Tula Ram Memorial Hospital",
    "Lal Bahadur Shastri Hospital", "Jag Pravesh Chandra Hospital", "Maharishi Valmiki Hospital",
    "Acharya Shree Bhikshu Hospital", "Sardar Vallabh Bhai Patel Hospital", "Pt. Madan Mohan Malaviya Hospital",
    "Babu Jagjivan Ram Memorial Hospital", "Satyawadi Raja Harish Chandra Hospital", "Guru Gobind Singh Government Hospital",
    "Attar Sain Jain Eye & General Hospital", "Bhagwan Mahavir Hospital", "Deep Chand Bandhu Hospital",
    "Kasturba Hospital", "Hindu Rao Hospital", "Rajan Babu Institute of Pulmonary Medicine and Tuberculosis",
    "Girdhari Lal Maternity Hospital", "Balak Ram Hospital", "Infectious Diseases Hospital",
    "Mata Chanan Devi Hospital", "Batra Hospital", "Holy Family Hospital", "Max Super Speciality Hospital, Saket",
    "Fortis Escorts Heart Institute", "Sir Ganga Ram Hospital", "Apollo Hospital, Sarita Vihar"
]

def seed_database():
    """Seed the database with synthetic but realistic data for 38 Delhi hospitals."""
    # Seed Priority Rules
    db["priority_rules"] = [
        PriorityRule(department_id="*", triage_level="Emergency", weight=100),
        PriorityRule(department_id="*", triage_level="Senior/Pregnant/Disabled", weight=50),
        PriorityRule(department_id="*", triage_level="General", weight=10),
    ]

    departments_template = [
        {"id": "GEN", "name": "General Medicine", "mu": 8.0, "c": 4},
        {"id": "PED", "name": "Pediatrics", "mu": 6.0, "c": 3},
        {"id": "ORTH", "name": "Orthopedics", "mu": 5.0, "c": 2},
        {"id": "CARD", "name": "Cardiology", "mu": 4.0, "c": 2},
        {"id": "MAT", "name": "Maternity", "mu": 3.0, "c": 2},
    ]

    db["hospitals"] = []
    
    # Delhi center approx: 28.6139, 77.2090
    center_lat = 28.6139
    center_lon = 77.2090
    
    for i, name in enumerate(DELHI_HOSPITALS):
        hospital_id = f"H-{i:03d}"
        
        # Scatter them around Delhi within approx ~15-20km radius
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(0, 0.2) # ~22km max distance
        lat = center_lat + (distance * math.cos(angle))
        lon = center_lon + (distance * math.sin(angle))
        
        depts = []
        for dt in departments_template:
            c_variance = random.randint(0, 2)
            mu_variance = random.uniform(-1.0, 1.0)
            depts.append(Department(
                id=f"{hospital_id}-D-{dt['id']}",
                hospital_id=hospital_id,
                name=dt['name'],
                base_service_rate_mu=dt['mu'] + mu_variance,
                active_counters_c=max(1, dt['c'] + c_variance)
            ))
            
        total_beds = random.choice([200, 500, 1000, 1500, 2500, 3000])
        avail_beds = int(total_beds * random.uniform(0.02, 0.40)) # 60-98% occupancy
        
        amb_total = random.choice([2, 3, 4, 5, 6, 8])
        amb_avail = random.randint(0, amb_total)
        
        hospital = Hospital(
            id=hospital_id,
            name=name,
            latitude=round(lat, 5),
            longitude=round(lon, 5),
            total_beds=total_beds,
            available_beds=avail_beds,
            departments=depts,
            ambulances_total=amb_total,
            ambulances_available=amb_avail
        )
        db["hospitals"].append(hospital)
        
    print(f"Seeded {len(db['hospitals'])} hospitals and their departments.")
