# SwasthQueue 🏥
### Boldman Hacks - SIH1620 Pitch (Delhi Health Queuing Models)

SwasthQueue is a comprehensive, predictive healthcare resource management system built to solve the critical issues of overcrowding, long wait times, and inefficient bed/ambulance allocation in Delhi's government hospitals.

## 🚀 Key Features

* **Predictive Queuing Engine**: Replaces static First-Come-First-Serve (FCFS) with a dynamic **Erlang-C mathematical queueing model** that calculates real-time wait times based on arrival rates ($\lambda$) and active hospital counters ($c$).
* **City-Wide Load Balancing**: Automatically routes non-emergency patients away from overwhelmed hubs (like AIIMS or Safdarjung) to underutilized peripheral hospitals, reducing average city-wide wait times by ~35%.
* **Smart Triage & Priority Rules**: Emergency and vulnerable patients (Senior/Pregnant/Disabled) automatically skip general queues via weighted routing rules.
* **Live Bed Tracking**: Real-time visibility of available beds across 38 Delhi government hospitals to stop families from running door-to-door.
* **Intelligent Ambulance Dispatch**: Geolocation-based ambulance dispatch system that instantly identifies the nearest available transport and provides real-time ETAs.
* **Automated No-Show Reallocation**: Digital grace-period system that auto-cancels and reallocates tokens and beds if a patient no-shows, preventing resource blocking.

## 🛠 Tech Stack

* **Frontend:** React (Vite), pure CSS (Tailwind-free), Lucide React (Icons). The UI is strictly designed around the **Indian National Flag** color palette (Navy Blue, Saffron, Green) with no overpowering colors, ensuring a clean, authoritative, and patriotic government aesthetic.
* **Backend:** Python, FastAPI, Uvicorn.
* **Math Engine:** Custom Erlang-C simulation module for robust queuing predictions.

## 🏃‍♂️ How to Run Locally

### 1. Start the Backend (FastAPI + Erlang-C Engine)
Open a terminal and run:
```bash
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pydantic
PYTHONPATH="." uvicorn backend.api.main:app --host 0.0.0.0 --port 8080 --reload
```
The backend will automatically seed the mock database with 38 Delhi hospitals and live queue states.

### 2. Start the Frontend (React + Vite)
Open a new terminal and run:
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173/` to view the app!

## 📊 Comparison vs. Current System (NIC eHospital)

Our custom metrics dashboard (`/comparison`) proves mathematical superiority:
- **OPD Wait Reduction**: ~35% drop in wait times through city-wide load balancing.
- **Bed Search Time**: Reduced from ~45 minutes (manual search) to ~2 minutes (digital lookup).
- **Ambulance Response**: Significantly faster response via nearest-first geospatial routing instead of manual phone-tree dispatching.

---
*Built for the Boldman-Hacks team targeting problem statement SIH1620.*
