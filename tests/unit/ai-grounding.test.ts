import { habitationsFixture } from '@/server/db/fixtures/disaster-data';
import {
  buildGroundedContextForHabitation,
  buildGroundedContextForRelocation,
  buildGroundedContextForScenario,
} from '@/server/ai/grounded-context';
import { generateRuleBasedGroundedExplanation } from '@/server/ai/grounded-explanation';
import { generateGroundedExplanation } from '@/server/ai/ai-service';
import { getScenarioPresetById } from '@/server/scenarios/scenario-config';
import { simulateHabitationScenario } from '@/server/scenarios/scenario-engine';

describe('AI Grounded Explanation Layer (Phase 8)', () => {
  const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;

  it('builds grounded context for habitation risk containing only deterministic numbers', async () => {
    const context = await buildGroundedContextForHabitation('HAB-WY-01');

    expect(context).not.toBeNull();
    expect(context!.targetName).toBe('Chooralmala Town Settlement');
    expect(context!.riskScore).toBeCloseTo(85.8, 1);
    expect(context!.verifiedFacts.length).toBeGreaterThan(5);
    expect(context!.provenance).toBe('DEMO DATA');
  });

  it('builds grounded context for relocation containing candidate site metrics', async () => {
    const context = await buildGroundedContextForRelocation('HAB-WY-01');

    expect(context).not.toBeNull();
    expect(context!.relocationContext).toBeDefined();
    expect(context!.relocationContext?.recommendedSiteId).toBe('SITE-WY-01');
    expect(context!.relocationContext?.availableHeadroom).toBe(959);
    expect(context!.relocationContext?.limitingFactor).toBe('Emergency Shelter Structures');
  });

  it('generates rule-based grounded explanation for scenario simulation without hallucinated numbers', () => {
    const preset = getScenarioPresetById('monsoon_rainfall_20');
    const sim = simulateHabitationScenario(chooralmala, preset.modifiers);
    const context = buildGroundedContextForScenario(sim, preset.name);

    const explanation = generateRuleBasedGroundedExplanation(context);

    expect(explanation.mode).toBe('scenario_briefing');
    expect(explanation.generatedBy).toBe('deterministic_rule_engine');
    expect(explanation.disclaimer).toContain('DEMO / SEEDED DATA');
    expect(explanation.evidenceBulletPoints.length).toBeGreaterThan(0);
    expect(explanation.executiveSummary).toContain('Chooralmala Town Settlement');
  });

  it('generates AI explanation via ai-service with guaranteed offline fallback', async () => {
    const briefing = await generateGroundedExplanation('risk_justification', 'HAB-WY-01');

    expect(briefing).not.toBeNull();
    expect(briefing!.generatedBy).toBe('deterministic_rule_engine');
    expect(briefing!.headline).toContain('Chooralmala Town Settlement');
    expect(briefing!.operationalConsequence).toContain('SDMA operational directive');
  });

  it('returns null for non-existent habitation ID in ai-service', async () => {
    const briefing = await generateGroundedExplanation('risk_justification', 'NON-EXISTENT');
    expect(briefing).toBeNull();
  });
});
