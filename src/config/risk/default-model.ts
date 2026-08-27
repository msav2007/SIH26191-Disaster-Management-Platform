export const defaultRiskModel = {
  status: 'active',
  version: '1.0.0',
  note: 'Deterministic multi-criteria risk model for SIH26191 SDMA decision support.',
  factors: {
    hazard: 0.35,
    vulnerability: 0.25,
    history: 0.20,
    exposure: 0.10,
    infrastructure: 0.10,
  },
  multiHazard: {
    secondaryDampeningCoefficient: 0.35,
  },
  bands: {
    critical: 80,
    high: 60,
    moderate: 40,
    low: 0,
  },
  priorityThresholds: {
    immediate: {
      minCompositeScore: 85,
      minCriticalHazardScore: 90,
      minVulnerabilityScore: 80,
      requiresRedZone: true,
      window: '0–6 months',
    },
    shortTerm: {
      minCompositeScore: 68,
      minDisasterHistoryScore: 70,
      window: '6–18 months',
    },
    mediumTerm: {
      minCompositeScore: 45,
      window: '18–36 months',
    },
    monitor: {
      window: 'Continuous Surveillance',
    },
  },
} as const;

export type RiskModelConfig = typeof defaultRiskModel;
