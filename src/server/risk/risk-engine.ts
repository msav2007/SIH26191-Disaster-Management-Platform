import type {
  Habitation,
  HazardType,
  PriorityLevel,
  RelocationTimeline,
  Severity,
} from '@/types/domain';
import { getActiveRiskConfig, type RiskEngineConfig } from './risk-config';

export interface FactorBreakdown {
  raw: number;
  weight: number;
  weightedContribution: number;
}

export interface HabitationRiskResult {
  habitationId: string;
  compositeScore: number;
  riskLevel: Severity;
  priority: PriorityLevel;
  urgencyWindow: string;
  timeline: RelocationTimeline;
  confidenceScore: number;
  factors: {
    hazard: FactorBreakdown;
    vulnerability: FactorBreakdown;
    history: FactorBreakdown;
    exposure: FactorBreakdown;
    infrastructure: FactorBreakdown;
  };
  hazardDrivers: {
    primary: HazardType;
    secondary: HazardType[];
    compoundMultiplier: number;
  };
  explanation: {
    headline: string;
    primaryDriverText: string;
    vulnerabilityText: string;
    infrastructureText: string;
    urgencyJustification: string;
  };
}

/**
 * Calculates compound multi-hazard intensity without unbound double counting.
 * Formula: H_multi = min(100, H_primary + sum(beta * H_sec * (1 - H_primary / 100)))
 */
export function calculateMultiHazardRisk(
  primaryHazard: HazardType,
  secondaryHazards: HazardType[] = [],
  baseIntensity = 80,
  dampeningBeta = 0.35,
): { compoundScore: number; multiplier: number } {
  const primaryScore = Math.max(0, Math.min(100, baseIntensity));
  if (secondaryHazards.length === 0) {
    return { compoundScore: primaryScore, multiplier: 1.0 };
  }

  const remainingHeadroom = (100 - primaryScore) / 100;
  const secondaryContribution = secondaryHazards.reduce((sum) => {
    // Secondary co-hazard intensity assumption
    const secondaryIntensity = primaryScore * 0.85;
    return sum + dampeningBeta * secondaryIntensity * remainingHeadroom;
  }, 0);

  const compoundScore = Math.round(Math.min(100, primaryScore + secondaryContribution) * 10) / 10;
  const multiplier = Math.round((compoundScore / (primaryScore || 1)) * 100) / 100;

  return { compoundScore, multiplier };
}

/**
 * Normalizes demographic vulnerability score from population metrics (0–100).
 */
export function calculateDemographicVulnerabilityScore(habitation: Habitation): number {
  if (habitation.population <= 0) return 0;

  const totalPop = habitation.population;
  const { belowPovertyLine, children, elderly, pwd } = habitation.demographics;

  // Proportional weights
  const bplRatio = Math.min(1, belowPovertyLine / totalPop);
  const elderlyRatio = Math.min(1, elderly / totalPop);
  const childrenRatio = Math.min(1, children / totalPop);
  const pwdRatio = Math.min(1, (pwd * 3) / totalPop); // PWD weighted 3x

  const demographicScore =
    bplRatio * 35 + elderlyRatio * 25 + childrenRatio * 20 + pwdRatio * 20;

  // Blend with existing surveyed vulnerability factor if present
  const baseFactor = habitation.factors?.populationVulnerability ?? 70;
  return Math.round(Math.min(100, demographicScore * 0.4 + baseFactor * 0.6) * 10) / 10;
}

/**
 * Calculates disaster history score based on frequency, casualties and displacement (0–100).
 */
export function calculateDisasterHistoryScore(habitation: Habitation): number {
  const events = habitation.history ?? [];
  if (events.length === 0) {
    return habitation.factors?.disasterHistory ?? 30;
  }

  let totalImpact = 0;
  const currentYear = 2026;

  for (const evt of events) {
    const yearsAgo = Math.max(1, currentYear - evt.year);
    const recencyWeight = 1 / (1 + yearsAgo * 0.1);

    const eventSeverity =
      Math.min(50, evt.casualties * 2.5) + Math.min(30, evt.displaced * 0.05) + 20;

    totalImpact += eventSeverity * recencyWeight;
  }

  const frequencyBonus = Math.min(20, events.length * 8);
  const calculatedScore = Math.min(100, totalImpact + frequencyBonus);

  const baseFactor = habitation.factors?.disasterHistory ?? calculatedScore;
  return Math.round(Math.min(100, calculatedScore * 0.6 + baseFactor * 0.4) * 10) / 10;
}

/**
 * Calculates infrastructure fragility score from access gaps (0–100).
 */
export function calculateInfrastructureRiskScore(habitation: Habitation): number {
  const inf = habitation.infrastructure;
  if (!inf) {
    return habitation.factors?.infrastructureRisk ?? 50;
  }

  let gapScore = 0;
  if (!inf.allWeatherRoad) gapScore += 30;
  if (!inf.healthSubCentre) gapScore += 25;
  if (!inf.pipedWater) gapScore += 20;
  if (!inf.mobileCoverage) gapScore += 15;
  if (!inf.electrified) gapScore += 10;

  const baseFactor = habitation.factors?.infrastructureRisk ?? gapScore;
  return Math.round(Math.min(100, gapScore * 0.5 + baseFactor * 0.5) * 10) / 10;
}

/**
 * Calculates terrain exposure score from slope gradient and river proximity (0–100).
 */
export function calculateExposureScore(habitation: Habitation): number {
  let slopeScore = 30;
  if (habitation.slopeDeg >= 35) slopeScore = 95;
  else if (habitation.slopeDeg >= 28) slopeScore = 80;
  else if (habitation.slopeDeg >= 18) slopeScore = 60;
  else if (habitation.slopeDeg >= 8) slopeScore = 40;

  let riverScore = 20;
  if (habitation.distanceToRiverKm <= 0.05) riverScore = 95;
  else if (habitation.distanceToRiverKm <= 0.2) riverScore = 85;
  else if (habitation.distanceToRiverKm <= 0.5) riverScore = 70;
  else if (habitation.distanceToRiverKm <= 1.5) riverScore = 45;

  const calculated = slopeScore * 0.6 + riverScore * 0.4;
  const baseFactor = habitation.factors?.exposure ?? calculated;
  return Math.round(Math.min(100, calculated * 0.5 + baseFactor * 0.5) * 10) / 10;
}

/**
 * Classifies composite score into standardized severity level.
 */
export function classifyRiskLevel(score: number, config?: RiskEngineConfig): Severity {
  const bands = config?.bands ?? getActiveRiskConfig().bands;
  if (score >= bands.critical) return 'critical';
  if (score >= bands.high) return 'high';
  if (score >= bands.moderate) return 'moderate';
  return 'low';
}

/**
 * Evaluates priority classification and relocation urgency window.
 */
export function calculateRelocationPriority(
  habitation: Habitation,
  compositeScore: number,
  hazardScore: number,
  vulnerabilityScore: number,
  config?: RiskEngineConfig,
): { priority: PriorityLevel; urgencyWindow: string; timeline: RelocationTimeline } {
  const cfg = config?.priorityThresholds ?? getActiveRiskConfig().priorityThresholds;

  const hasRedZone = Boolean(habitation.redZoneId);

  // Immediate Relocation Conditions:
  // 1. Composite score >= 85
  // 2. OR Red Zone + Hazard >= 90 + Vulnerability >= 80
  // 3. OR Composite score >= 80 inside Red Zone
  if (
    compositeScore >= cfg.immediate.minCompositeScore ||
    (hasRedZone && compositeScore >= 80) ||
    (hasRedZone &&
      hazardScore >= cfg.immediate.minCriticalHazardScore &&
      vulnerabilityScore >= cfg.immediate.minVulnerabilityScore)
  ) {
    return {
      priority: 'CRITICAL',
      urgencyWindow: cfg.immediate.window,
      timeline: 'immediate',
    };
  }

  // Short-Term Relocation Conditions:
  if (
    compositeScore >= cfg.shortTerm.minCompositeScore ||
    (hasRedZone && compositeScore >= 60)
  ) {
    return {
      priority: 'HIGH',
      urgencyWindow: cfg.shortTerm.window,
      timeline: 'short_term',
    };
  }

  // Medium-Term Relocation Conditions:
  if (compositeScore >= cfg.mediumTerm.minCompositeScore) {
    return {
      priority: 'MEDIUM',
      urgencyWindow: cfg.mediumTerm.window,
      timeline: 'medium_term',
    };
  }

  // Monitoring
  return {
    priority: 'LOW',
    urgencyWindow: cfg.monitor.window,
    timeline: 'monitoring',
  };
}

/**
 * Generates transparent, deterministic evidence explanation for SDMA authority records.
 */
export function generateRiskExplanation(
  habitation: Habitation,
  compositeScore: number,
  riskLevel: Severity,
  priority: PriorityLevel,
  urgencyWindow: string,
  factors: {
    hazard: FactorBreakdown;
    vulnerability: FactorBreakdown;
    history: FactorBreakdown;
    exposure: FactorBreakdown;
    infrastructure: FactorBreakdown;
  },
  secondaryHazards: HazardType[],
): HabitationRiskResult['explanation'] {
  const primaryHz = habitation.primaryHazard;
  const secText =
    secondaryHazards.length > 0
      ? ` compounded by secondary ${secondaryHazards.join(' and ')} interaction`
      : '';

  const headline = `${priority} Relocation Priority: ${habitation.name} evaluated at ${compositeScore.toFixed(1)} Composite Risk (${riskLevel.toUpperCase()}).`;

  const primaryDriverText = `Primary hazard driver is severe ${primaryHz} intensity (Score: ${factors.hazard.raw}/100, Contributing: ${factors.hazard.weightedContribution.toFixed(1)} pts)${secText}.`;

  const vulnerabilityText = `Demographic assessment indicates ${habitation.demographics.belowPovertyLine} BPL individuals, ${habitation.demographics.elderly} elderly persons, and ${habitation.demographics.pwd} persons with disabilities out of ${habitation.population} total residents (Vulnerability score: ${factors.vulnerability.raw}/100).`;

  const roadStatus = habitation.infrastructure.allWeatherRoad
    ? 'paved road connection present'
    : 'NO all-weather road access (severe isolation hazard during monsoon)';
  const healthStatus = habitation.infrastructure.healthSubCentre
    ? 'local health sub-centre available'
    : 'lack of on-site health emergency infrastructure';

  const infrastructureText = `Critical infrastructure fragility is rated ${factors.infrastructure.raw}/100 due to ${roadStatus} and ${healthStatus}.`;

  const urgencyJustification =
    priority === 'CRITICAL'
      ? `Statutory immediate relocation within ${urgencyWindow} is mandated due to active Red Zone inclusion, high slope instability (${habitation.slopeDeg}°), and catastrophic historical recurrence.`
      : priority === 'HIGH'
        ? `Short-term phased relocation within ${urgencyWindow} is recommended to avoid seasonal cutoff and acute debris flow exposure.`
        : priority === 'MEDIUM'
          ? `Medium-term relocation planning within ${urgencyWindow} recommended alongside structural reinforcement and site surveys.`
          : `Continuous geotechnical and rainfall sensor surveillance scheduled. In-situ mitigation feasible.`;

  return {
    headline,
    primaryDriverText,
    vulnerabilityText,
    infrastructureText,
    urgencyJustification,
  };
}

/**
 * Complete deterministic risk calculation for a habitation.
 */
export function calculateHabitationRisk(
  habitation: Habitation,
  customConfig?: RiskEngineConfig,
): HabitationRiskResult {
  const config = customConfig ?? getActiveRiskConfig();
  const weights = config.factors;

  // 1. Secondary Hazards from Red Zone reference if available
  const secondaryHazards: HazardType[] = [];
  if (habitation.primaryHazard === 'landslide') {
    secondaryHazards.push('cloudburst');
  } else if (habitation.primaryHazard === 'coastal_erosion') {
    secondaryHazards.push('flood');
  }

  // 2. Factor Computations
  const baseIntensity = habitation.factors?.hazardIntensity ?? 85;
  const { compoundScore: hazardScore, multiplier } = calculateMultiHazardRisk(
    habitation.primaryHazard,
    secondaryHazards,
    baseIntensity,
    config.multiHazard.secondaryDampeningCoefficient,
  );

  const vulnScore = calculateDemographicVulnerabilityScore(habitation);
  const histScore = calculateDisasterHistoryScore(habitation);
  const expoScore = calculateExposureScore(habitation);
  const infraScore = calculateInfrastructureRiskScore(habitation);

  // 3. Weighted Composite Score
  const hazardContr = weights.hazard * hazardScore;
  const vulnContr = weights.vulnerability * vulnScore;
  const histContr = weights.history * histScore;
  const expoContr = weights.exposure * expoScore;
  const infraContr = weights.infrastructure * infraScore;

  const rawComposite =
    hazardContr + vulnContr + histContr + expoContr + infraContr;
  const compositeScore = Math.round(Math.min(100, Math.max(0, rawComposite)) * 10) / 10;

  // 4. Classifications
  const riskLevel = classifyRiskLevel(compositeScore, config);
  const { priority, urgencyWindow, timeline } = calculateRelocationPriority(
    habitation,
    compositeScore,
    hazardScore,
    vulnScore,
    config,
  );

  // 5. Data Confidence Calculation
  let confidence = 0.75;
  if (habitation.demographics.belowPovertyLine > 0) confidence += 0.05;
  if (habitation.history && habitation.history.length > 0) confidence += 0.1;
  if (habitation.redZoneId) confidence += 0.05;
  if (habitation.infrastructure) confidence += 0.05;
  confidence = Math.min(0.98, confidence);

  const factors = {
    hazard: {
      raw: hazardScore,
      weight: weights.hazard,
      weightedContribution: Math.round(hazardContr * 10) / 10,
    },
    vulnerability: {
      raw: vulnScore,
      weight: weights.vulnerability,
      weightedContribution: Math.round(vulnContr * 10) / 10,
    },
    history: {
      raw: histScore,
      weight: weights.history,
      weightedContribution: Math.round(histContr * 10) / 10,
    },
    exposure: {
      raw: expoScore,
      weight: weights.exposure,
      weightedContribution: Math.round(expoContr * 10) / 10,
    },
    infrastructure: {
      raw: infraScore,
      weight: weights.infrastructure,
      weightedContribution: Math.round(infraContr * 10) / 10,
    },
  };

  // 6. Explanation
  const explanation = generateRiskExplanation(
    habitation,
    compositeScore,
    riskLevel,
    priority,
    urgencyWindow,
    factors,
    secondaryHazards,
  );

  return {
    habitationId: habitation.id,
    compositeScore,
    riskLevel,
    priority,
    urgencyWindow,
    timeline,
    confidenceScore: Math.round(confidence * 100) / 100,
    factors,
    hazardDrivers: {
      primary: habitation.primaryHazard,
      secondary: secondaryHazards,
      compoundMultiplier: multiplier,
    },
    explanation,
  };
}
