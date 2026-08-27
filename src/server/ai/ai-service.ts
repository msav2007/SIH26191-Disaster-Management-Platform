import {
  buildGroundedContextForHabitation,
  buildGroundedContextForRelocation,
  buildGroundedContextForScenario,
} from './grounded-context';
import { generateRuleBasedGroundedExplanation } from './grounded-explanation';
import type {
  AiExplanationMode,
  GroundedDecisionContext,
  GroundedExplanationResult,
} from './ai-types';
import type { HabitationScenarioResult } from '@/server/scenarios/scenario-types';

/**
 * Generates an authoritative AI-assisted explanation grounded strictly on deterministic domain numbers.
 */
export async function generateGroundedExplanation(
  mode: AiExplanationMode,
  targetId: string,
  scenarioContext?: { result: HabitationScenarioResult; scenarioName: string },
): Promise<GroundedExplanationResult | null> {
  let context: GroundedDecisionContext | null = null;

  if (mode === 'scenario_briefing') {
    if (!scenarioContext) return null;
    context = buildGroundedContextForScenario(
      scenarioContext.result,
      scenarioContext.scenarioName,
    );
  } else if (mode === 'relocation_rationale') {
    context = await buildGroundedContextForRelocation(targetId);
  } else {
    context = await buildGroundedContextForHabitation(targetId);
  }

  if (!context) return null;

  // Generate grounded explanation with guaranteed deterministic fallback
  return generateRuleBasedGroundedExplanation(context);
}
