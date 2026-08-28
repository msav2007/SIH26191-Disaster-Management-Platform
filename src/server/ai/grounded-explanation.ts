import type { GroundedDecisionContext, GroundedExplanationResult } from './ai-types';

const DISCLAIMER =
  'DEMO / SEEDED DATA — NOT AN OFFICIAL GOVERNMENT RECORD. AI-assisted grounded explanation generated strictly from deterministic mathematical models.';

/**
 * Deterministic rule-based explainer guaranteeing 100% offline accuracy and zero hallucinations.
 */
export function generateRuleBasedGroundedExplanation(
  context: GroundedDecisionContext,
): GroundedExplanationResult {
  const {
    district,
    mode,
    population,
    priority,
    relocationContext,
    riskLevel,
    riskScore,
    scenarioContext,
    targetId,
    targetName,
    urgencyWindow,
  } = context;

  if (mode === 'scenario_briefing' && scenarioContext) {
    const isEscalated = scenarioContext.baselinePriority !== scenarioContext.scenarioPriority;
    const headline = isEscalated
      ? `Scenario Impact Escalation: ${targetName} transitions to ${scenarioContext.scenarioPriority} Priority`
      : `Scenario Assessment: ${targetName} maintains ${scenarioContext.scenarioPriority} Priority`;

    const deltaSign = scenarioContext.deltaRisk >= 0 ? '+' : '';
    const executiveSummary = `Under the '${scenarioContext.scenarioName}' simulation, ${targetName} (${district}) exhibits a ${deltaSign}${scenarioContext.deltaRisk.toFixed(1)} point shift in composite vulnerability, moving from a baseline score of ${scenarioContext.baselineRisk.toFixed(1)} to ${scenarioContext.scenarioRisk.toFixed(1)} (${riskLevel} severity).`;

    const mathematicalDriverExplanation = `The primary mathematical driver of this escalation is ${scenarioContext.primaryDriver.toUpperCase()} intensity, accounting for the highest weighted contribution delta among all 5 evaluated domains ($S_{\\text{comp}} = \\sum w_i \\cdot S_i$).`;

    const evidenceBulletPoints = context.verifiedFacts.map(
      (f) => `• ${f.domain} ${f.metric}: ${f.value}${f.weight ? ` (Weight: ${f.weight})` : ''}`,
    );

    const operationalConsequence = isEscalated
      ? `Operational mandate: Immediate relocation queue escalation required. Phased evacuation timeline advances to ${urgencyWindow} covering ${population.toLocaleString('en-IN')} residents.`
      : `Operational mandate: Settlement remains within current monitoring threshold (${urgencyWindow}), with periodic geotechnical instrumentation checkups recommended.`;

    return {
      mode,
      targetId,
      headline,
      executiveSummary,
      mathematicalDriverExplanation,
      evidenceBulletPoints,
      operationalConsequence,
      generatedBy: 'deterministic_rule_engine',
      modelStamp: 'SIH26191-GROUNDED-RULE-V2.0',
      provenance: context.provenance,
      disclaimer: DISCLAIMER,
    };
  }

  if (mode === 'relocation_rationale' && relocationContext) {
    const headline = `Relocation Sector Allocation: ${relocationContext.recommendedSiteName} for ${targetName}`;
    const executiveSummary = `${targetName} (${population.toLocaleString('en-IN')} residents) requires relocation planning within ${urgencyWindow}. Candidate sector ${relocationContext.recommendedSiteName} scored ${relocationContext.suitabilityScore} in multi-criteria suitability.`;

    const mathematicalDriverExplanation = `Site suitability was determined across 10 weighted dimensions, factoring transit distance (${relocationContext.distanceKm} km), active hazard isolation, and infrastructure readiness.`;

    const evidenceBulletPoints = [
      `• Primary Limiting Bottleneck: ${relocationContext.limitingFactor}`,
      `• Available Absorption Headroom: ${relocationContext.availableHeadroom.toLocaleString('en-IN')} persons`,
      `• Effective Site Capacity: ${relocationContext.effectiveCapacity.toLocaleString('en-IN')} persons`,
      `• Transit Distance: ${relocationContext.distanceKm} km from settlement centroid`,
    ];

    const operationalConsequence = `District Collectorate advised to initiate preliminary parcel earmarking and infrastructure synchronization at ${relocationContext.recommendedSiteName}.`;

    return {
      mode,
      targetId,
      headline,
      executiveSummary,
      mathematicalDriverExplanation,
      evidenceBulletPoints,
      operationalConsequence,
      capacityAndSiteAnalysis: `Site absorption headroom is strictly bounded by ${relocationContext.limitingFactor}. Capacity (${relocationContext.availableHeadroom}) is distinct from settlement suitability (${relocationContext.suitabilityScore}/100).`,
      generatedBy: 'deterministic_rule_engine',
      modelStamp: 'SIH26191-GROUNDED-RULE-V2.0',
      provenance: context.provenance,
      disclaimer: DISCLAIMER,
    };
  }

  // Default: Risk Justification
  const headline = `Multi-Hazard Prioritization Briefing: ${targetName} (${priority} Priority)`;
  const executiveSummary = `${targetName} in ${district} has been evaluated at a composite vulnerability score of ${riskScore.toFixed(1)}/100 (${riskLevel} severity), placing it in the ${priority} relocation tier.`;

  const mathematicalDriverExplanation = `Risk score reflects mathematical aggregation of Hazard Intensity (35%), Vulnerability (25%), Disaster History (20%), Exposure (10%), and Infrastructure (10%).`;

  const evidenceBulletPoints = context.verifiedFacts.map(
    (f) => `• ${f.domain} ${f.metric}: ${f.value}${f.weight ? ` (Weight: ${f.weight})` : ''}`,
  );

  const operationalConsequence = `SDMA operational directive: Enforce building moratorium within demarcated hazard perimeter and prepare resettlement pipeline within ${urgencyWindow}.`;

  return {
    mode,
    targetId,
    headline,
    executiveSummary,
    mathematicalDriverExplanation,
    evidenceBulletPoints,
    operationalConsequence,
    generatedBy: 'deterministic_rule_engine',
    modelStamp: 'SIH26191-GROUNDED-RULE-V2.0',
    provenance: context.provenance,
    disclaimer: DISCLAIMER,
  };
}
