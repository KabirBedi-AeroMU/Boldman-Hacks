/**
 * SwasthQueue — Triage Priority Classification
 * 
 * Implements India's 3-tier color system (Red/Yellow/Green)
 * mapped to ESI 5-level framework for finer granularity.
 */

export const TRIAGE_LEVELS = [
  {
    level: 1,
    label: 'Immediate',
    color: '#ef4444',     // red
    colorName: 'Red',
    esiLevel: 1,
    maxWaitMinutes: 0,
    description: 'Life-threatening — resuscitation needed',
    examples: 'Cardiac arrest, respiratory failure, massive hemorrhage',
    proportion: 0.03,     // ~3% of OPD
  },
  {
    level: 2,
    label: 'Emergent',
    color: '#f97316',     // orange-red
    colorName: 'Red',
    esiLevel: 2,
    maxWaitMinutes: 10,
    description: 'High-risk, severe pain, altered mental state',
    examples: 'Chest pain, stroke signs, severe trauma, high fever in infants',
    proportion: 0.07,     // ~7% of OPD
  },
  {
    level: 3,
    label: 'Urgent',
    color: '#eab308',     // yellow
    colorName: 'Yellow',
    esiLevel: 3,
    maxWaitMinutes: 30,
    description: 'Stable but needs multiple resources',
    examples: 'Abdominal pain, moderate injuries, high BP, diabetic issues',
    proportion: 0.25,     // ~25% of OPD
  },
  {
    level: 4,
    label: 'Less Urgent',
    color: '#22c55e',     // green
    colorName: 'Green',
    esiLevel: 4,
    maxWaitMinutes: 60,
    description: 'Single resource needed',
    examples: 'Simple laceration, sprain, ear infection, mild rash',
    proportion: 0.35,     // ~35% of OPD
  },
  {
    level: 5,
    label: 'Non-Urgent',
    color: '#06b6d4',     // cyan
    colorName: 'Green',
    esiLevel: 5,
    maxWaitMinutes: 120,
    description: 'No resources needed — prescription refill, follow-up',
    examples: 'Medication refill, cold symptoms, routine follow-up, certificate',
    proportion: 0.30,     // ~30% of OPD
  },
];

/**
 * Get triage level by ESI number
 */
export function getTriageLevel(esiLevel) {
  return TRIAGE_LEVELS.find(t => t.esiLevel === esiLevel) || TRIAGE_LEVELS[4];
}

/**
 * Get the color code for a triage level
 */
export function getTriageColor(level) {
  const t = TRIAGE_LEVELS.find(t => t.level === level);
  return t ? t.color : '#94a3b8';
}

/**
 * Build priority split array for queue-engine's priorityWaitTimes()
 */
export function buildPrioritySplit() {
  return TRIAGE_LEVELS.map(t => ({
    level: t.level,
    label: t.label,
    color: t.color,
    proportion: t.proportion,
  }));
}

/**
 * Classify a symptom description into triage level (simplified rule-based)
 * In production this would use ML or a clinical decision tree.
 */
export function classifyPatient(symptoms) {
  const s = (symptoms || '').toLowerCase();
  
  // Level 1 — Immediate
  if (/cardiac arrest|not breathing|unresponsive|massive bleed|choking/.test(s)) return 1;
  
  // Level 2 — Emergent  
  if (/chest pain|stroke|seizure|severe trauma|unconscious|difficulty breathing|anaphylax/.test(s)) return 2;
  
  // Level 3 — Urgent
  if (/abdominal pain|fracture|high fever|vomiting blood|severe headache|diabetic|hypertension/.test(s)) return 3;
  
  // Level 4 — Less Urgent
  if (/cut|laceration|sprain|ear pain|rash|mild fever|urinary|back pain/.test(s)) return 4;
  
  // Level 5 — Non-Urgent (default)
  return 5;
}
