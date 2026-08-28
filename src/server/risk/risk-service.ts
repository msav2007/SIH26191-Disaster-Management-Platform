import type { Habitation } from '@/types/domain';
import { getHabitations, getHabitationById } from '@/server/repositories/habitations';
import { calculateHabitationRisk, type HabitationRiskResult } from './risk-engine';

export interface HabitationWithRisk {
  habitation: Habitation;
  assessment: HabitationRiskResult;
}

export async function getHabitationRiskAssessment(
  habitationId: string,
): Promise<HabitationWithRisk | null> {
  const habitation = await getHabitationById(habitationId);
  if (!habitation) return null;

  const assessment = calculateHabitationRisk(habitation);
  return { habitation, assessment };
}

export async function listHabitationRiskAssessments(filter?: {
  district?: string | undefined;
  hazard?: string | undefined;
  priority?: string | undefined;
  timeline?: string | undefined;
}): Promise<HabitationWithRisk[]> {
  const habitations = await getHabitations(filter);

  const results: HabitationWithRisk[] = habitations.map((h) => ({
    habitation: h,
    assessment: calculateHabitationRisk(h),
  }));

  // Sort descending by composite risk score
  return results.sort((a, b) => b.assessment.compositeScore - a.assessment.compositeScore);
}

export async function getRegionalRiskRollup(district?: string) {
  const assessments = await listHabitationRiskAssessments({ district });

  const total = assessments.length;
  const critical = assessments.filter((a) => a.assessment.priority === 'CRITICAL').length;
  const high = assessments.filter((a) => a.assessment.priority === 'HIGH').length;
  const medium = assessments.filter((a) => a.assessment.priority === 'MEDIUM').length;
  const monitor = assessments.filter((a) => a.assessment.priority === 'LOW').length;

  const immediate = assessments.filter((a) => a.assessment.timeline === 'immediate').length;
  const criticalScoreCount = assessments.filter((a) => a.assessment.compositeScore >= 80).length;

  const avgCompositeScore =
    total > 0
      ? Math.round(
          (assessments.reduce((sum, a) => sum + a.assessment.compositeScore, 0) / total) * 10,
        ) / 10
      : 0;

  const totalPopulationAtRisk = assessments.reduce(
    (sum, a) => sum + a.habitation.population,
    0,
  );

  return {
    district: district ?? 'All Districts',
    totalHabitations: total,
    priorityBreakdown: {
      critical,
      high,
      medium,
      monitor,
      immediate,
      criticalScoreCount,
      shortTerm: high,
      mediumTerm: medium,
    },
    avgCompositeScore,
    totalPopulationAtRisk,
    topPriorityHabitations: assessments.slice(0, 5),
  };
}
