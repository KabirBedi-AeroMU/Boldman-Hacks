# Production Simplifications & Assumptions
*(For Judge Q&A Round)*

While this prototype serves as a functional and mathematically rigorous predictive layer for the SIH1620 hackathon, several intentional simplifications were made to optimize for a live 3-minute demo constraint. 

## 1. Queuing Model
- **M/M/c vs M/G/c:** We implemented the mathematically exact Erlang-C model (M/M/c) assuming Poisson arrivals and exponential service times. In a true clinical setting, service times are closer to a log-normal distribution (M/G/c). 
  - *Production Path:* We built the `QueueEngine` with a pluggable `service_distribution` parameter that currently uses Sakasegawa's approximation for general distributions. In production, we would fit empirical service time distributions per department.
- **Stationary vs Non-Stationary:** We treat arrival rate ($\lambda$) as piecewise stationary for the current hour block. 
  - *Production Path:* A true model would use fluid approximations or a discrete-event simulation (DES) to handle the dramatic transient peaks seen at 9 AM in government hospitals.

## 2. Priority & Triage
- **Non-Preemptive:** We assume non-preemptive priority (an emergency patient won't literally pull a doctor out of an ongoing consultation).
- **Rule Hardcoding:** While the rule weights are abstracted to a `PriorityRule` database table rather than hardcoded logic, the live demo bypasses dynamic clinical NLP triage and relies on manual registrar dropdowns to assign the triage level.

## 3. Bed Forecasting
- **Moving Average Simulation:** We use a simple moving-average calculation on recent admission/discharge velocity to project 2-6 hour availability.
  - *Production Path:* We would implement a stochastic Discrete Event Simulation (DES) or a time-series ML model trained on historical seasonal bed occupancy.

## 4. Integration
- **ABDM/eHospital Mocking:** Because we do not have live access to NIC's eHospital APIs, patient IDs and live counters are synthesized in our `/seed` scripts.
  - *Production Path:* We would consume webhooks or stream events from eHospital to update our `active_counters_c` and `queue` tables.
