export const defaultCapacityModel = {
  status: 'active',
  version: '2.0.0',
  note: 'Deterministic multi-dimensional carrying-capacity and site suitability model for SIH26191.',
  occupancyBuffer: 0.85,
  standards: {
    minAreaPerPersonSqM: 50,
    dailyWaterSupplyLitersPerPerson: 70,
    shelterMultiplier: 1.0,
  },
  suitabilityWeights: {
    safety: 0.25,
    capacity: 0.20,
    distance: 0.15,
    road: 0.10,
    water: 0.08,
    healthcare: 0.07,
    shelter: 0.05,
    power: 0.04,
    livelihood: 0.03,
    schools: 0.03,
  },
  distanceThresholds: {
    nearKm: 10,
    moderateKm: 20,
    farKm: 35,
    extremeKm: 50,
    interDistrictMaxKm: 100,
  },
  serviceRatings: {
    adequate: 100,
    partial: 60,
    inadequate: 20,
    unassessed: 0,
  },
  landClassReadiness: {
    government_revenue: 100,
    panchayat: 85,
    acquired_private: 70,
    forest_cleared: 55,
  },
  suitabilityBands: {
    excellent: 85,
    good: 70,
    conditional: 50,
    poor: 30,
  },
} as const;

export type CapacityModelConfig = typeof defaultCapacityModel;
