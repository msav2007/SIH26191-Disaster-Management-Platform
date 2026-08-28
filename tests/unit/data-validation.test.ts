import { describe, expect, it } from 'vitest';
import {
  CalculationValidationError,
  validateHabitations,
  validateRelocationSites,
  validateRiskWeights,
  validateScenarioModifiers,
} from '@/server/validation/data-validation';
import type { FactorWeights } from '@/server/risk/risk-config';
import type { Habitation, RelocationSite } from '@/types/domain';
import type { ScenarioModifiers } from '@/server/scenarios/scenario-types';

describe('Data Validation Layer', () => {
  describe('Risk Weights Validation', () => {
    it('passes when factor weights sum to exactly 1.0', () => {
      const validWeights: FactorWeights = {
        hazard: 0.35,
        vulnerability: 0.25,
        history: 0.2,
        exposure: 0.1,
        infrastructure: 0.1,
      };
      expect(() => validateRiskWeights(validWeights)).not.toThrow();
    });

    it('throws CalculationValidationError if weights sum to less than 1.0', () => {
      const invalidWeights: FactorWeights = {
        hazard: 0.3,
        vulnerability: 0.2,
        history: 0.2,
        exposure: 0.1,
        infrastructure: 0.1, // sum = 0.9
      };
      expect(() => validateRiskWeights(invalidWeights)).toThrow(CalculationValidationError);
      expect(() => validateRiskWeights(invalidWeights)).toThrow(/must equal 100% exactly/);
    });

    it('throws CalculationValidationError if weights sum to greater than 1.0', () => {
      const invalidWeights: FactorWeights = {
        hazard: 0.4,
        vulnerability: 0.3,
        history: 0.2,
        exposure: 0.1,
        infrastructure: 0.1, // sum = 1.1
      };
      expect(() => validateRiskWeights(invalidWeights)).toThrow(CalculationValidationError);
    });
  });

  describe('Scenario Modifiers Validation', () => {
    it('passes valid scenario modifiers within bounds', () => {
      const validModifiers: ScenarioModifiers = {
        rainfallMultiplier: 1.2,
        cloudburstSurge: 15,
        slopeSaturationFactor: 1.3,
        floodIntensityMultiplier: 1.1,
        infrastructureStrainMultiplier: 1.25,
      };
      expect(() => validateScenarioModifiers(validModifiers)).not.toThrow();
    });

    it('throws when rainfall multiplier is below 1.0', () => {
      const invalid: ScenarioModifiers = {
        rainfallMultiplier: 0.8,
        cloudburstSurge: 0,
        slopeSaturationFactor: 1.0,
        floodIntensityMultiplier: 1.0,
        infrastructureStrainMultiplier: 1.0,
      };
      expect(() => validateScenarioModifiers(invalid)).toThrow(CalculationValidationError);
    });

    it('throws when cloudburst surge exceeds maximum (50)', () => {
      const invalid: ScenarioModifiers = {
        rainfallMultiplier: 1.0,
        cloudburstSurge: 60,
        slopeSaturationFactor: 1.0,
        floodIntensityMultiplier: 1.0,
        infrastructureStrainMultiplier: 1.0,
      };
      expect(() => validateScenarioModifiers(invalid)).toThrow(CalculationValidationError);
    });
  });

  describe('Habitations Collection Validation', () => {
    const validHabitation: Habitation = {
      id: 'HAB-TEST-001',
      name: 'Test Settlement',
      district: 'Wayanad',
      block: 'Meppadi',
      state: 'Kerala',
      population: 500,
      households: 120,
      slopeDeg: 32,
      elevationM: 850,
      distanceToRiverKm: 0.1,
      primaryHazard: 'landslide',
      redZoneId: null,
      vulnerability: 'critical',
      priority: 'CRITICAL',
      timeline: 'immediate',
      status: 'survey_complete',
      factors: {
        hazardIntensity: 85,
        populationVulnerability: 75,
        disasterHistory: 60,
        exposure: 80,
        infrastructureRisk: 65,
        relocationFeasibility: 50,
      },
      demographics: {
        children: 80,
        elderly: 60,
        pwd: 10,
        belowPovertyLine: 250,
      },
      infrastructure: {
        school: false,
        allWeatherRoad: false,
        healthSubCentre: false,
        pipedWater: false,
        mobileCoverage: true,
        electrified: true,
      },
      history: [],
      coordinates: { latitude: 11.5, longitude: 76.1 },
      candidateSiteIds: ['SITE-001'],
      notes: [],
      lastSurvey: '2026-08-01',
      isDemoData: true,
      provenance: 'DEMO DATA',
    };

    it('passes valid habitations array', () => {
      expect(() => validateHabitations([validHabitation])).not.toThrow();
    });

    it('throws when duplicate habitation IDs exist', () => {
      const duplicate = { ...validHabitation };
      expect(() => validateHabitations([validHabitation, duplicate])).toThrow(
        /Duplicate habitation ID detected/,
      );
    });

    it('throws when BPL population exceeds total population', () => {
      const invalid = {
        ...validHabitation,
        id: 'HAB-TEST-002',
        population: 200,
        demographics: {
          ...validHabitation.demographics,
          belowPovertyLine: 250,
        },
      };
      expect(() => validateHabitations([invalid])).toThrow(/exceeds total population/);
    });
  });

  describe('Relocation Sites Validation', () => {
    const validSite: RelocationSite = {
      id: 'SITE-TEST-001',
      name: 'Safe Sector A',
      district: 'Wayanad',
      block: 'Kalpetta',
      state: 'Kerala',
      areaHectares: 12.5,
      carryingCapacity: 2500,
      currentOccupancy: 400,
      shelterCapacity: 200,
      projectedRequirement: 0,
      distanceToNearestHabitationKm: 4.5,
      hazardExposure: 'low',
      landClass: 'government_revenue',
      status: 'commissioned',
      lastUpdated: '2026-08-01',
      notes: [],
      isDemoData: true,
      services: {
        water: 'adequate',
        healthcare: 'adequate',
        school: 'adequate',
        roadAccess: 'adequate',
        power: 'adequate',
        livelihood: 'adequate',
      },
      coordinates: { latitude: 11.6, longitude: 76.05 },
      suitability: 'suitable',
      provenance: 'DEMO DATA',
    };

    it('passes valid relocation sites', () => {
      expect(() => validateRelocationSites([validSite])).not.toThrow();
    });

    it('throws when duplicate site IDs exist', () => {
      const dup = { ...validSite };
      expect(() => validateRelocationSites([validSite, dup])).toThrow(
        /Duplicate relocation site ID detected/,
      );
    });
  });
});
