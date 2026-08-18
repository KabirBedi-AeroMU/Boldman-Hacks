/**
 * SwasthQueue — Core Queuing Math Engine
 * 
 * Implements M/M/c queuing model with Erlang C formula for
 * hospital OPD wait-time estimation and resource optimization.
 * 
 * Notation:
 *   λ (lambda) = arrival rate (patients/hour)
 *   μ (mu)     = service rate per server (patients/hour per doctor)
 *   c          = number of servers (doctors/counters)
 *   ρ (rho)    = utilization = λ / (c × μ)
 *   a          = offered load = λ / μ
 */

// ── Helpers ──────────────────────────────────────────────────

/** Factorial with memoization (handles up to c ≈ 170) */
const factCache = [1, 1];
export function factorial(n) {
  if (n < 0) return 1;
  if (factCache[n] !== undefined) return factCache[n];
  factCache[n] = n * factorial(n - 1);
  return factCache[n];
}

/** Power with safety */
function pow(base, exp) {
  return Math.pow(base, exp);
}

// ── Erlang C ─────────────────────────────────────────────────

/**
 * Erlang C formula — probability that an arriving patient must wait.
 * 
 * C(c, a) = [a^c / c! × 1/(1 - ρ)] / [Σ_{k=0}^{c-1} (a^k / k!) + a^c / c! × 1/(1 - ρ)]
 * 
 * @param {number} c - number of servers (doctors)
 * @param {number} a - offered load (λ / μ)
 * @returns {number} probability of waiting (0 to 1)
 */
export function erlangC(c, a) {
  const rho = a / c;

  // System is unstable if ρ >= 1
  if (rho >= 1) return 1.0;
  if (c <= 0 || a <= 0) return 0;

  // Numerator: (a^c / c!) × (1 / (1 - ρ))
  const numerator = (pow(a, c) / factorial(c)) * (1 / (1 - rho));

  // Denominator: sum of (a^k / k!) for k = 0..c-1, plus the numerator term
  let sum = 0;
  for (let k = 0; k < c; k++) {
    sum += pow(a, k) / factorial(k);
  }
  const denominator = sum + numerator;

  return numerator / denominator;
}

// ── M/M/c Metrics ────────────────────────────────────────────

/**
 * Calculate all M/M/c performance metrics for a department.
 * 
 * @param {number} lambda - arrival rate (patients/hour)
 * @param {number} mu     - service rate per doctor (patients/hour)
 * @param {number} c      - number of doctors
 * @returns {object} all queue metrics
 */
export function calculateMetrics(lambda, mu, c) {
  if (c <= 0 || mu <= 0 || lambda <= 0) {
    return {
      lambda, mu, c,
      a: 0, rho: 0,
      pWait: 0,
      Lq: 0, Ls: 0,
      Wq: 0, Ws: 0,
      stable: true,
      utilizationPercent: 0,
      waitTimeMinutes: 0,
      systemTimeMinutes: 0,
    };
  }

  const a = lambda / mu;           // offered load
  const rho = a / c;               // utilization per server

  // Stability check
  if (rho >= 1) {
    return {
      lambda, mu, c, a, rho,
      pWait: 1,
      Lq: Infinity, Ls: Infinity,
      Wq: Infinity, Ws: Infinity,
      stable: false,
      utilizationPercent: 100,
      waitTimeMinutes: Infinity,
      systemTimeMinutes: Infinity,
    };
  }

  const pWait = erlangC(c, a);     // P(wait)
  const Lq = pWait * rho / (1 - rho);  // avg queue length
  const Wq = Lq / lambda;              // avg wait time (hours) — Little's Law
  const Ws = Wq + 1 / mu;              // avg system time (hours)
  const Ls = lambda * Ws;              // avg number in system — Little's Law

  return {
    lambda,
    mu,
    c,
    a: Math.round(a * 100) / 100,
    rho: Math.round(rho * 1000) / 1000,
    pWait: Math.round(pWait * 1000) / 1000,
    Lq: Math.round(Lq * 100) / 100,
    Ls: Math.round(Ls * 100) / 100,
    Wq: Math.round(Wq * 10000) / 10000,
    Ws: Math.round(Ws * 10000) / 10000,
    stable: true,
    utilizationPercent: Math.round(rho * 100),
    waitTimeMinutes: Math.round(Wq * 60 * 10) / 10,
    systemTimeMinutes: Math.round(Ws * 60 * 10) / 10,
  };
}

// ── Priority Queue Extension ─────────────────────────────────

/**
 * Priority-weighted wait times using preemptive priority queuing.
 * Higher priority (lower number) gets shorter wait.
 * 
 * Uses the result of M/M/c as baseline and applies priority weights.
 * In a strict priority queue with K priority classes:
 *   Wq_k = Wq_base / (1 - σ_{k-1})(1 - σ_k)
 * where σ_k = Σ_{i=1}^{k} ρ_i (cumulative utilization of higher priorities)
 * 
 * Simplified here: we split arrival rate by priority proportions
 * and compute weighted wait times.
 * 
 * @param {number} lambda - total arrival rate
 * @param {number} mu - service rate
 * @param {number} c - servers
 * @param {Array} prioritySplit - [{level: 1, proportion: 0.05}, ...] sorted by level
 * @returns {Array} wait times per priority level
 */
export function priorityWaitTimes(lambda, mu, c, prioritySplit) {
  const rho = lambda / (c * mu);
  if (rho >= 1) {
    return prioritySplit.map(p => ({
      level: p.level,
      label: p.label,
      waitMinutes: Infinity,
    }));
  }

  const baseMetrics = calculateMetrics(lambda, mu, c);
  const Wq0 = baseMetrics.Wq; // base wait in hours

  // Compute cumulative utilization fractions
  let cumulativeRho = 0;
  const results = [];

  for (const p of prioritySplit) {
    const prevCumRho = cumulativeRho;
    const lambdaK = lambda * p.proportion;
    const rhoK = lambdaK / (c * mu);
    cumulativeRho += rhoK;

    // Priority wait formula (non-preemptive)
    const denom1 = Math.max(1 - prevCumRho, 0.001);
    const denom2 = Math.max(1 - cumulativeRho, 0.001);
    const WqK = (Wq0 * rho) / (denom1 * denom2);

    results.push({
      level: p.level,
      label: p.label,
      color: p.color,
      proportion: p.proportion,
      waitMinutes: Math.max(0, Math.round(WqK * 60 * 10) / 10),
      patientCount: Math.round(lambdaK * 8), // approx per 8hr shift
    });
  }

  return results;
}

// ── What-If Simulator ────────────────────────────────────────

/**
 * Run what-if scenarios: how does changing c affect wait time?
 * 
 * @param {number} lambda - arrival rate
 * @param {number} mu - service rate
 * @param {number} minC - min servers to test
 * @param {number} maxC - max servers to test
 * @returns {Array} metrics for each c value
 */
export function whatIfAnalysis(lambda, mu, minC, maxC) {
  const results = [];
  for (let c = minC; c <= maxC; c++) {
    results.push(calculateMetrics(lambda, mu, c));
  }
  return results;
}

/**
 * Find optimal number of servers to achieve target wait time.
 * 
 * @param {number} lambda - arrival rate
 * @param {number} mu - service rate
 * @param {number} targetWaitMinutes - target max wait in minutes
 * @returns {number} minimum c needed
 */
export function findOptimalServers(lambda, mu, targetWaitMinutes) {
  const targetWaitHours = targetWaitMinutes / 60;
  const minC = Math.ceil(lambda / mu); // must be >= offered load

  for (let c = minC; c <= minC + 50; c++) {
    const metrics = calculateMetrics(lambda, mu, c);
    if (metrics.stable && metrics.Wq <= targetWaitHours) {
      return c;
    }
  }
  return minC + 50; // fallback
}
