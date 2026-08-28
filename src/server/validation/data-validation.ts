import { z } from 'zod';
import type {
  Habitation,
  HazardType,
  RelocationSite,
} from '@/types/domain';
import type { FactorWeights } from '@/server/risk/risk-config';
import type { ScenarioModifiers } from '@/server/scenarios/scenario-types';

export class CalculationValidationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'CalculationValidationError';
  }
}

const hazardTypes: [HazardType, ...HazardType[]] = [
  'landslide',
  'flood',
  'coastal_erosion',
  'cloudburst',
  'multi_hazard',
];

export const riskWeightsSchema = z
  .object({
    hazard: z.number().min(0).max(1),
    vulnerability: z.number().min(0).max(1),
    history: z.number().min(0).max(1),
    exposure: z.number().min(0).max(1),
    infrastructure: z.number().min(0).max(1),
  })
  .refine(
    (w) => {
      const sum = w.hazard + w.vulnerability + w.history + w.exposure + w.infrastructure;
      return Math.abs(sum - 1.0) < 1e-6;
    },
    {
      message: 'Risk factor weights must sum to exactly 1.0 (100%).',
    },
  );

export function validateRiskWeights(weights: FactorWeights): void {
  const result = riskWeightsSchema.safeParse(weights);
  if (!result.success) {
    const sum =
      weights.hazard +
      weights.vulnerability +
      weights.history +
      weights.exposure +
      weights.infrastructure;
    throw new CalculationValidationError(
      `Invalid risk weights: sum is ${(sum * 100).toFixed(2)}%, but must equal 100% exactly.`,
      result.error.format(),
    );
  }
}

export const scenarioModifierBounds = {
  rainfallMultiplier: { min: 1.0, max: 2.0, default: 1.0, step: 0.05, unit: 'x' },
  cloudburstSurge: { min: 0, max: 50, default: 0, step: 5, unit: 'pts' },
  slopeSaturationFactor: { min: 1.0, max: 2.0, default: 1.0, step: 0.05, unit: 'x' },
  floodIntensityMultiplier: { min: 1.0, max: 2.0, default: 1.0, step: 0.05, unit: 'x' },
  infrastructureStrainMultiplier: { min: 1.0, max: 2.0, default: 1.0, step: 0.05, unit: 'x' },
} as const;

export const scenarioModifiersSchema = z.object({
  rainfallMultiplier: z
    .number()
    .min(scenarioModifierBounds.rainfallMultiplier.min)
    .max(scenarioModifierBounds.rainfallMultiplier.max),
  cloudburstSurge: z
    .number()
    .min(scenarioModifierBounds.cloudburstSurge.min)
    .max(scenarioModifierBounds.cloudburstSurge.max),
  slopeSaturationFactor: z
    .number()
    .min(scenarioModifierBounds.slopeSaturationFactor.min)
    .max(scenarioModifierBounds.slopeSaturationFactor.max),
  floodIntensityMultiplier: z
    .number()
    .min(scenarioModifierBounds.floodIntensityMultiplier.min)
    .max(scenarioModifierBounds.floodIntensityMultiplier.max),
  infrastructureStrainMultiplier: z
    .number()
    .min(scenarioModifierBounds.infrastructureStrainMultiplier.min)
    .max(scenarioModifierBounds.infrastructureStrainMultiplier.max),
});

export function validateScenarioModifiers(modifiers: ScenarioModifiers): void {
  const result = scenarioModifiersSchema.safeParse(modifiers);
  if (!result.success) {
    throw new CalculationValidationError(
      'Invalid scenario modifiers: parameters out of permitted range.',
      result.error.format(),
    );
  }
}

export const habitationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  district: z.string().min(1),
  population: z.number().int().positive('Population must be a positive integer.'),
  households: z.number().int().nonnegative('Households must be non-negative.'),
  primaryHazard: z.enum(hazardTypes),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  factors: z.object({
    hazardIntensity: z.number().min(0).max(100),
    populationVulnerability: z.number().min(0).max(100),
    disasterHistory: z.number().min(0).max(100),
    exposure: z.number().min(0).max(100),
    infrastructureRisk: z.number().min(0).max(100),
  }),
  demographics: z.object({
    children: z.number().nonnegative(),
    elderly: z.number().nonnegative(),
    pwd: z.number().nonnegative(),
    belowPovertyLine: z.number().nonnegative(),
  }),
});

export function validateHabitations(habitations: Habitation[]): void {
  if (!Array.isArray(habitations) || habitations.length === 0) {
    throw new CalculationValidationError('Habitations collection cannot be empty.');
  }

  const seenIds = new Set<string>();
  for (const h of habitations) {
    if (seenIds.has(h.id)) {
      throw new CalculationValidationError(`Duplicate habitation ID detected: '${h.id}'`);
    }
    seenIds.add(h.id);

    const parsed = habitationSchema.safeParse(h);
    if (!parsed.success) {
      throw new CalculationValidationError(
        `Invalid habitation data for '${h.id}': ${parsed.error.message}`,
        parsed.error.format(),
      );
    }

    if (h.demographics.belowPovertyLine > h.population) {
      throw new CalculationValidationError(
        `Habitation '${h.id}' BPL population (${h.demographics.belowPovertyLine}) exceeds total population (${h.population}).`,
      );
    }
  }
}

export const relocationSiteSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  district: z.string().min(1),
  areaHectares: z.number().positive('Site area must be positive.'),
  carryingCapacity: z.number().int().nonnegative('Carrying capacity cannot be negative.'),
  currentOccupancy: z.number().int().nonnegative('Current occupancy cannot be negative.'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export function validateRelocationSites(sites: RelocationSite[]): void {
  if (!Array.isArray(sites) || sites.length === 0) {
    throw new CalculationValidationError('Relocation sites collection cannot be empty.');
  }

  const seenIds = new Set<string>();
  for (const s of sites) {
    if (seenIds.has(s.id)) {
      throw new CalculationValidationError(`Duplicate relocation site ID detected: '${s.id}'`);
    }
    seenIds.add(s.id);

    const parsed = relocationSiteSchema.safeParse(s);
    if (!parsed.success) {
      throw new CalculationValidationError(
        `Invalid relocation site data for '${s.id}': ${parsed.error.message}`,
        parsed.error.format(),
      );
    }
  }
}
