export const defaultRiskModel = {
  status: 'planned',
  note: 'Deterministic risk scoring begins in Phase 4. These weights are placeholders for future configuration.',
  factors: {
    hazard: 0.35,
    vulnerability: 0.25,
    history: 0.2,
    exposure: 0.1,
    infrastructure: 0.1,
  },
} as const;

