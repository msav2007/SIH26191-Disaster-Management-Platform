import type {
  PriorityLevel,
  RelocationTimeline,
  SemanticTone,
  Severity,
} from '@/types/domain';
import { getActiveRiskConfig, type RiskEngineConfig } from '@/server/risk/risk-config';
import { getActiveCapacityConfig, type CapacityConfig, type SuitabilityBand } from '@/server/capacity/capacity-config';

/**
 * Single authoritative severity level classifier.
 * Bounded to standardized bands: Critical (>=80), High (>=60), Moderate (>=40), Low (<40).
 */
export function getSeverityLevel(score: number, customConfig?: RiskEngineConfig): Severity {
  const bands = customConfig?.bands ?? getActiveRiskConfig().bands;
  if (score >= bands.critical) return 'critical';
  if (score >= bands.high) return 'high';
  if (score >= bands.moderate) return 'moderate';
  return 'low';
}

/**
 * Single authoritative statutory relocation priority & timeline classifier.
 * Implements deterministic SDMA priority rules without hidden heuristics.
 */
export function getRelocationPriority(
  compositeScore: number,
  hazardScore: number,
  vulnerabilityScore: number,
  hasRedZone: boolean,
  customConfig?: RiskEngineConfig,
): { priority: PriorityLevel; urgencyWindow: string; timeline: RelocationTimeline } {
  const cfg = customConfig?.priorityThresholds ?? getActiveRiskConfig().priorityThresholds;

  // 1. Immediate Relocation:
  // - Composite score >= 85
  // - OR inside Red Zone with Composite score >= 80
  // - OR inside Red Zone with Critical Hazard >= 90 AND Vulnerability >= 80
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

  // 2. Short-Term Relocation:
  // - Composite score >= 68
  // - OR inside Red Zone with Composite score >= 60
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

  // 3. Medium-Term Relocation:
  // - Composite score >= 45
  if (compositeScore >= cfg.mediumTerm.minCompositeScore) {
    return {
      priority: 'MEDIUM',
      urgencyWindow: cfg.mediumTerm.window,
      timeline: 'medium_term',
    };
  }

  // 4. Monitoring / Surveillance:
  return {
    priority: 'LOW',
    urgencyWindow: cfg.monitor.window,
    timeline: 'monitoring',
  };
}

/**
 * Single authoritative timeline window mapping for UI and reporting.
 */
export function getTimelineWindow(
  timeline: RelocationTimeline,
  customConfig?: RiskEngineConfig,
): string {
  const cfg = customConfig?.priorityThresholds ?? getActiveRiskConfig().priorityThresholds;
  switch (timeline) {
    case 'immediate':
      return cfg.immediate.window;
    case 'short_term':
      return cfg.shortTerm.window;
    case 'medium_term':
      return cfg.mediumTerm.window;
    case 'monitoring':
      return cfg.monitor.window;
    default:
      return 'Continuous Surveillance';
  }
}

/**
 * Single authoritative suitability band classifier for relocation sites.
 */
export function getSuitabilityBand(score: number, customConfig?: CapacityConfig): SuitabilityBand {
  const bands = customConfig?.suitabilityBands ?? getActiveCapacityConfig().suitabilityBands;
  if (score >= bands.excellent) return 'EXCELLENT';
  if (score >= bands.good) return 'GOOD';
  if (score >= bands.conditional) return 'CONDITIONAL';
  if (score >= bands.poor) return 'POOR';
  return 'UNSUITABLE';
}

/**
 * Single authoritative semantic token tone mapping for UI pills and badges.
 */
export function getPriorityTone(priority: PriorityLevel): SemanticTone {
  switch (priority) {
    case 'CRITICAL':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'MEDIUM':
      return 'moderate';
    case 'LOW':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function getSeverityTone(severity: Severity): SemanticTone {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'moderate':
      return 'moderate';
    case 'low':
      return 'safe';
    default:
      return 'neutral';
  }
}

export function getSuitabilityTone(band: SuitabilityBand): SemanticTone {
  switch (band) {
    case 'EXCELLENT':
      return 'safe';
    case 'GOOD':
      return 'safe';
    case 'CONDITIONAL':
      return 'moderate';
    case 'POOR':
      return 'high';
    case 'UNSUITABLE':
      return 'critical';
    default:
      return 'neutral';
  }
}
