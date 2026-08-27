import type { ScenarioModifiers, ScenarioPreset } from './scenario-types';

export const defaultScenarioModifiers: ScenarioModifiers = {
  rainfallMultiplier: 1.0,
  cloudburstSurge: 0,
  floodIntensityMultiplier: 1.0,
  slopeSaturationFactor: 1.0,
  infrastructureStrainMultiplier: 1.0,
};

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: 'monsoon_rainfall_20',
    name: '+20% Monsoon Extreme Rainfall Escalation',
    shortLabel: '+20% Extreme Rainfall',
    description:
      'Simulates anomalous Indian monsoon precipitation escalation, increasing slope hydraulic pore pressure and saturated runoff volume across Western Ghats and Himalayan river basins.',
    primaryHazard: 'landslide',
    modifiers: {
      rainfallMultiplier: 1.2,
      cloudburstSurge: 5,
      floodIntensityMultiplier: 1.15,
      slopeSaturationFactor: 1.25,
      infrastructureStrainMultiplier: 1.1,
    },
    scientificContext:
      'Modeled on IMD/IPCC regional climate projections for extreme precipitation episodes (RCP 4.5/8.5 mid-century anomalies).',
    provenance: 'DEMO DATA',
  },
  {
    id: 'cloudburst_extreme',
    name: 'High-Altitude Cloudburst & Flash Flood Surge',
    shortLabel: 'Cloudburst Surge',
    description:
      'Simulates intense micro-burst precipitation exceeding 100mm/hr over upper catchment headwaters, inducing torrential debris torrents and riverbank toe-cutting.',
    primaryHazard: 'cloudburst',
    modifiers: {
      rainfallMultiplier: 1.4,
      cloudburstSurge: 25,
      floodIntensityMultiplier: 1.35,
      slopeSaturationFactor: 1.3,
      infrastructureStrainMultiplier: 1.3,
    },
    scientificContext:
      'Based on Kedarnath 2013 and Mandakini Valley debris-flow hydrologic discharge characteristics.',
    provenance: 'DEMO DATA',
  },
  {
    id: 'flood_embankment_breach',
    name: 'Major Riverbank Embankment Overtopping & Inundation',
    shortLabel: 'Embankment Overtopping',
    description:
      'Simulates riverbank embankment breach and extended sand-silt deposition during high-discharge flood stages in Brahmaputra and Mahanadi deltas.',
    primaryHazard: 'flood',
    modifiers: {
      rainfallMultiplier: 1.15,
      cloudburstSurge: 0,
      floodIntensityMultiplier: 1.4,
      slopeSaturationFactor: 1.05,
      infrastructureStrainMultiplier: 1.25,
    },
    scientificContext:
      'Aligned with Majuli Island and Kendrapara coastal delta flood-stage hydrographs.',
    provenance: 'DEMO DATA',
  },
  {
    id: 'landslide_micro_shearing',
    name: 'Continuous Slope Saturation & Landslide Reactivation',
    shortLabel: 'Landslide Reactivation',
    description:
      'Simulates prolonged multi-week subsurface pore pressure accumulation, triggering crown scarp progression and structural toe-shear reactivation in hill settlements.',
    primaryHazard: 'landslide',
    modifiers: {
      rainfallMultiplier: 1.25,
      cloudburstSurge: 10,
      floodIntensityMultiplier: 1.1,
      slopeSaturationFactor: 1.4,
      infrastructureStrainMultiplier: 1.2,
    },
    scientificContext:
      'Modeled after Wayanad 2024 (Chooralmala/Mundakkai) and Joshimath subsidence reactivation geotechnical records.',
    provenance: 'DEMO DATA',
  },
  {
    id: 'combined_multi_hazard',
    name: 'Combined Extreme Multi-Hazard Stress Test',
    shortLabel: 'Multi-Hazard Stress Test',
    description:
      'Stress-tests all simultaneous environmental vulnerabilities: concurrent extreme rainfall, slope saturation, flood surge, and infrastructure degradation.',
    primaryHazard: 'multi_hazard',
    modifiers: {
      rainfallMultiplier: 1.3,
      cloudburstSurge: 20,
      floodIntensityMultiplier: 1.3,
      slopeSaturationFactor: 1.35,
      infrastructureStrainMultiplier: 1.35,
    },
    scientificContext:
      'Compound disaster scenario testing SDMA capacity resilience under synchronous catastrophic shocks.',
    provenance: 'DEMO DATA',
  },
];

export function findScenarioPresetById(id: string): ScenarioPreset | null {
  return scenarioPresets.find((p) => p.id === id) ?? null;
}

export function getScenarioPresetById(id: string): ScenarioPreset {
  const found = scenarioPresets.find((p) => p.id === id);
  return found ?? scenarioPresets[0]!;
}
