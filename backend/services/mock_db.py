from typing import List, Dict, Optional
from pydantic import BaseModel

class PriorityRule(BaseModel):
    department_id: str
    triage_level: str
    weight: int

class Department(BaseModel):
    id: str
    hospital_id: str
    name: str
    base_service_rate_mu: float
    active_counters_c: int

class Hospital(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    total_beds: int
    available_beds: int
    departments: List[Department]
    ambulances_total: int = 4
    ambulances_available: int = 4

# Mock Database Store
db: Dict[str, List] = {
    "hospitals": [],
    "priority_rules": []
}

# Token store for OPD cancellation/reallocation
token_store: Dict[str, dict] = {}

def get_hospitals() -> List[Hospital]:
    return db["hospitals"]

def get_hospital(hospital_id: str) -> Optional[Hospital]:
    return next((h for h in db["hospitals"] if h.id == hospital_id), None)

def update_department_counters(hospital_id: str, department_id: str, active_counters: int) -> bool:
    h = get_hospital(hospital_id)
    if not h:
        return False
    dept = next((d for d in h.departments if d.id == department_id), None)
    if not dept:
        return False
    dept.active_counters_c = active_counters
    return True
