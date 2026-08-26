export const defaultCapacityModel = {
  status: 'planned',
  note: 'Carrying-capacity calculations begin in Phase 7. This file exists to reserve a stable configuration surface.',
  occupancyBuffer: 0.8,
  dimensions: ['land', 'water', 'sanitation', 'shelter', 'services'],
} as const;

