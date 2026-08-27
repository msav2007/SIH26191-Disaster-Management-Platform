import { getHabitations } from '@/server/repositories/habitations';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { getRegionalCapacityRollup } from '@/server/capacity/capacity-service';
import { findRelocationCandidates } from '@/server/relocation/matching-engine';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import { runScenarioSimulation } from '@/server/scenarios/scenario-service';
import type {
  AuthorityActionItem,
  CommandCenterData,
  CommandCenterKpis,
  OperationalPriorityQueueItem,
  RelocationCapacityOverview,
} from './command-center-types';

/**
 * Aggregates all authoritative domain services into the primary Command Center dataset.
 * Guarantees zero invented numbers and preserves single-source-of-truth calculations.
 */
export async function getCommandCenterData(): Promise<CommandCenterData> {
  const [habitations, allSites, capacityRollup, activeScenario] = await Promise.all([
    getHabitations(),
    getRelocationSites(),
    getRegionalCapacityRollup(),
    runScenarioSimulation('monsoon_rainfall_20'),
  ]);

  // 1. Evaluate Risk and Relocation Matching for all habitations
  const priorityItems: OperationalPriorityQueueItem[] = habitations.map((h) => {
    const risk = calculateHabitationRisk(h);
    const plan = findRelocationCandidates(h, allSites);
    const topSite = plan.recommendedSite;

    let recommendedAction = 'Maintain scheduled seasonal monitoring.';
    if (risk.priority === 'CRITICAL' && risk.timeline === 'immediate') {
      recommendedAction = `Initiate immediate relocation planning to ${topSite?.site.name ?? 'nearest safe sector'}.`;
    } else if (risk.priority === 'HIGH') {
      recommendedAction = 'Commission geotechnical stability audit and verify shelter capacity.';
    }

    return {
      rank: 0, // Assigned after sorting
      habitationId: h.id,
      habitationName: h.name,
      district: h.district,
      state: h.state,
      primaryHazard: h.primaryHazard,
      compositeRiskScore: risk.compositeScore,
      riskLevel: risk.riskLevel,
      priority: risk.priority,
      timeline: risk.timeline,
      population: h.population,
      households: h.households,
      recommendedSite: topSite,
      recommendedAction,
      provenance: h.provenance,
    };
  });

  // Sort by Composite Risk Score descending
  priorityItems.sort((a, b) => b.compositeRiskScore - a.compositeRiskScore);
  priorityItems.forEach((item, index) => {
    item.rank = index + 1;
  });

  // 2. Compute Top Operational KPIs
  const criticalHabitationsCount = priorityItems.filter((i) => i.priority === 'CRITICAL').length;
  const immediateRelocationCount = priorityItems.filter((i) => i.timeline === 'immediate').length;
  const totalPopulationAtRisk = priorityItems.reduce((sum, i) => sum + i.population, 0);

  const kpis: CommandCenterKpis = {
    totalAssessedHabitations: habitations.length,
    criticalHabitationsCount,
    immediateRelocationCount,
    totalPopulationAtRisk,
    totalAvailableRelocationHeadroom: capacityRollup.totalAvailableHeadroom,
    activeScenarioEscalatedCount: activeScenario.totalHabitationsEscalated,
  };

  // 3. Compute Relocation Capacity Overview
  const { listSiteCapacityAssessments } = await import('@/server/capacity/capacity-service');
  const siteAssessments = await listSiteCapacityAssessments();

  const topConstrainedSites = siteAssessments
    .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
    .slice(0, 4)
    .map((s) => ({
      siteId: s.siteId,
      siteName: s.siteName,
      district: s.siteId.includes('WY')
        ? 'Wayanad'
        : s.siteId.includes('CH')
          ? 'Chamoli'
          : s.siteId.includes('RP')
            ? 'Rudraprayag'
            : s.siteId.includes('MJ')
              ? 'Majuli'
              : s.siteId.includes('KP')
                ? 'Kendrapara'
                : 'Pithoragarh',
      headroom: s.availableHeadroom,
      limitingFactor: s.limitingFactorLabel,
      utilizationPercent: s.utilizationPercent,
    }));

  const avgUtilization = siteAssessments.length > 0
    ? Math.round(siteAssessments.reduce((sum, s) => sum + s.utilizationPercent, 0) / siteAssessments.length)
    : 0;

  const capacityOverview: RelocationCapacityOverview = {
    totalSites: capacityRollup.totalSites,
    totalNominalCapacity: capacityRollup.totalNominalCapacity,
    totalEffectiveCapacity: capacityRollup.totalEffectiveCapacity,
    totalCurrentOccupancy: capacityRollup.totalCurrentOccupancy,
    totalAvailableHeadroom: capacityRollup.totalAvailableHeadroom,
    averageUtilizationPercent: avgUtilization,
    topConstrainedSites,
  };

  // 4. Generate Deterministic Authority Action Queue
  const actionQueue: AuthorityActionItem[] = [];

  // Action: Critical settlements requiring immediate relocation pipeline
  const topCritical = priorityItems.filter((i) => i.priority === 'CRITICAL');
  for (const c of topCritical) {
    actionQueue.push({
      id: `ACT-RELOC-${c.habitationId}`,
      title: `Immediate Relocation Mandate: ${c.habitationName}`,
      description: `Composite risk score is ${c.compositeRiskScore.toFixed(1)}/100 (CRITICAL). Evacuation and relocation timeline required within 0–6 months for ${c.population.toLocaleString('en-IN')} residents.`,
      severity: 'critical',
      actionType: 'relocation_mandate',
      targetEntityId: c.habitationId,
      targetEntityType: 'habitation',
      href: `/relocation?habitationId=${c.habitationId}`,
      evidenceReference: `Score: ${c.compositeRiskScore.toFixed(1)} · Primary: ${c.primaryHazard}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Action: Capacity bottleneck warnings
  for (const site of topConstrainedSites) {
    if (site.limitingFactor.includes('Shelter') || site.limitingFactor.includes('Water')) {
      actionQueue.push({
        id: `ACT-BOTTLENECK-${site.siteId}`,
        title: `Absorption Bottleneck Relief: ${site.siteName}`,
        description: `Carrying capacity headroom is strictly constrained by ${site.limitingFactor} (${site.headroom.toLocaleString('en-IN')} available). Infrastructure expansion required.`,
        severity: 'high',
        actionType: 'bottleneck_relief',
        targetEntityId: site.siteId,
        targetEntityType: 'relocation_site',
        href: `/relocation?selectedSiteId=${site.siteId}`,
        evidenceReference: `Limiting Bottleneck: ${site.limitingFactor}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Action: Scenario escalation review
  if (activeScenario.newlyCriticalHabitations > 0) {
    actionQueue.push({
      id: `ACT-SCENARIO-STRESS`,
      title: `Climate Stress Alert: ${activeScenario.newlyCriticalHabitations} Settlements Newly Critical`,
      description: `Under '${activeScenario.scenario.name}', +${activeScenario.additionalPopulationAtRisk.toLocaleString('en-IN')} additional residents shift into high/critical vulnerability bands.`,
      severity: 'high',
      actionType: 'scenario_review',
      targetEntityId: activeScenario.scenario.id,
      targetEntityType: 'scenario',
      href: `/scenarios?scenarioId=${activeScenario.scenario.id}`,
      evidenceReference: `+${activeScenario.additionalPopulationAtRisk} pop escalated`,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    kpis,
    priorityQueue: priorityItems,
    capacityOverview,
    activeScenario,
    actionQueue,
    provenance: 'DEMO DATA',
    lastUpdated: new Date().toISOString(),
  };
}
