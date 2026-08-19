# AGENTS.md — SIH1620 OPD Queuing/Bed/Admission Platform

## Stack
- Backend: Python (FastAPI) for the queueing/forecasting service; Node or
  same FastAPI for the app/city-integration API — team's call, keep it one
  language if possible to reduce context-switching under time pressure.
- Frontend: React/Next.js + Tailwind.
- DB: PostgreSQL (source of truth) + Redis (live queue state, pub/sub for
  real-time updates via WebSocket/SSE).
- Realtime: WebSocket for live token/queue/bed updates to the dashboard.

## Conventions
- Queueing/forecasting logic lives in its own package, framework-agnostic,
  fully unit tested. No web framework imports inside it.
- Every queueing calculation that claims a wait-time estimate must have a
  test asserting Little's Law holds (L = λW) within tolerance.
- Synthetic data generation lives in /seed, clearly separated from
  production data paths.
- Frontend: GIGW-style header/footer components are shared layout
  components, not duplicated per page.
- Commit messages: conventional commits (feat/fix/docs/chore).

## Don't
- Don't propose replacing eHospital/ORS/ABDM — integrate with that framing.
- Don't hardcode triage priority weights — config-driven.
- Don't add auth/payment complexity not needed for the demo.
