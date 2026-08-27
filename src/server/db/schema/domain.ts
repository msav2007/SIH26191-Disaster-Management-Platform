import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { geometry } from './_spatial';
import { regions } from './core';

export const hazardTypeEnum = pgEnum('hazard_type', [
  'landslide',
  'flood',
  'coastal_erosion',
  'cloudburst',
  'multi_hazard',
]);

export const severityEnum = pgEnum('severity', [
  'critical',
  'high',
  'moderate',
  'low',
]);

export const priorityLevelEnum = pgEnum('priority_level', [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
]);

export const relocationTimelineEnum = pgEnum('relocation_timeline', [
  'immediate',
  'short_term',
  'medium_term',
  'monitoring',
]);

export const habitationStatusEnum = pgEnum('habitation_status', [
  'awaiting_decision',
  'survey_complete',
  'relocation_approved',
  'in_progress',
]);

export const siteSuitabilityEnum = pgEnum('site_suitability', [
  'suitable',
  'conditionally_suitable',
  'requires_assessment',
  'not_suitable',
]);

export const siteStatusEnum = pgEnum('site_status', [
  'commissioned',
  'development',
  'identified',
  'assessment_pending',
]);

export const serviceRatingEnum = pgEnum('service_rating', [
  'adequate',
  'partial',
  'inadequate',
  'unassessed',
]);

export const landClassEnum = pgEnum('land_class', [
  'government_revenue',
  'forest_cleared',
  'acquired_private',
  'panchayat',
]);

export const redZones = pgTable(
  'red_zones',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    district: varchar('district', { length: 120 }).notNull(),
    state: varchar('state', { length: 120 }).notNull(),
    primaryHazard: hazardTypeEnum('primary_hazard').notNull(),
    secondaryHazards: jsonb('secondary_hazards').$type<string[]>().default([]).notNull(),
    severity: severityEnum('severity').notNull(),
    areaSqKm: doublePrecision('area_sq_km').notNull(),
    affectedPopulation: integer('affected_population').notNull(),
    affectedHabitations: integer('affected_habitations').notNull(),
    status: varchar('status', { length: 40 }).default('notified').notNull(),
    radiusKm: doublePrecision('radius_km').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    boundaryGeom: geometry('boundary_geom', {
      geometryType: 'MultiPolygon',
      srid: 4326,
    }),
    isDemoData: boolean('is_demo_data').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('red_zones_boundary_geom_idx').using('gist', table.boundaryGeom)],
);

export const habitations = pgTable(
  'habitations',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    regionId: varchar('region_id', { length: 64 }).references(() => regions.id),
    name: varchar('name', { length: 160 }).notNull(),
    block: varchar('block', { length: 120 }).notNull(),
    district: varchar('district', { length: 120 }).notNull(),
    state: varchar('state', { length: 120 }).notNull(),
    population: integer('population').notNull(),
    households: integer('households').notNull(),
    primaryHazard: hazardTypeEnum('primary_hazard').notNull(),
    redZoneId: varchar('red_zone_id', { length: 64 }).references(() => redZones.id),
    vulnerability: severityEnum('vulnerability').notNull(),
    priority: priorityLevelEnum('priority').notNull(),
    timeline: relocationTimelineEnum('timeline').notNull(),
    status: habitationStatusEnum('status').default('awaiting_decision').notNull(),
    elevationM: doublePrecision('elevation_m').notNull(),
    slopeDeg: doublePrecision('slope_deg').notNull(),
    distanceToRiverKm: doublePrecision('distance_to_river_km').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    pointGeom: geometry('point_geom', {
      geometryType: 'Point',
      srid: 4326,
    }),
    factors: jsonb('factors').$type<{
      hazardIntensity: number;
      populationVulnerability: number;
      disasterHistory: number;
      exposure: number;
      infrastructureRisk: number;
      relocationFeasibility: number;
    }>().notNull(),
    demographics: jsonb('demographics').$type<{
      children: number;
      elderly: number;
      pwd: number;
      belowPovertyLine: number;
    }>().notNull(),
    infrastructure: jsonb('infrastructure').$type<{
      school: boolean;
      healthSubCentre: boolean;
      allWeatherRoad: boolean;
      pipedWater: boolean;
      electrified: boolean;
      mobileCoverage: boolean;
    }>().notNull(),
    candidateSiteIds: jsonb('candidate_site_ids').$type<string[]>().default([]).notNull(),
    notes: jsonb('notes').$type<string[]>().default([]).notNull(),
    lastSurvey: varchar('last_survey', { length: 40 }).notNull(),
    isDemoData: boolean('is_demo_data').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('habitations_point_geom_idx').using('gist', table.pointGeom),
    index('habitations_district_idx').on(table.district),
    index('habitations_priority_idx').on(table.priority),
  ],
);

export const disasterEvents = pgTable('disaster_events', {
  id: varchar('id', { length: 64 }).primaryKey(),
  habitationId: varchar('habitation_id', { length: 64 })
    .notNull()
    .references(() => habitations.id),
  year: integer('year').notNull(),
  type: hazardTypeEnum('type').notNull(),
  description: text('description').notNull(),
  casualties: integer('casualties').default(0).notNull(),
  displaced: integer('displaced').default(0).notNull(),
  isDemoData: boolean('is_demo_data').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const relocationSites = pgTable(
  'relocation_sites',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    block: varchar('block', { length: 120 }).notNull(),
    district: varchar('district', { length: 120 }).notNull(),
    state: varchar('state', { length: 120 }).notNull(),
    landClass: landClassEnum('land_class').notNull(),
    areaHectares: doublePrecision('area_hectares').notNull(),
    carryingCapacity: integer('carrying_capacity').notNull(),
    currentOccupancy: integer('current_occupancy').default(0).notNull(),
    projectedRequirement: integer('projected_requirement').default(0).notNull(),
    services: jsonb('services').$type<{
      water: 'adequate' | 'partial' | 'inadequate' | 'unassessed';
      healthcare: 'adequate' | 'partial' | 'inadequate' | 'unassessed';
      roadAccess: 'adequate' | 'partial' | 'inadequate' | 'unassessed';
      school: 'adequate' | 'partial' | 'inadequate' | 'unassessed';
      power: 'adequate' | 'partial' | 'inadequate' | 'unassessed';
      livelihood: 'adequate' | 'partial' | 'inadequate' | 'unassessed';
    }>().notNull(),
    shelterCapacity: integer('shelter_capacity').default(0).notNull(),
    distanceToNearestHabitationKm: doublePrecision('distance_to_nearest_habitation_km').notNull(),
    hazardExposure: severityEnum('hazard_exposure').notNull(),
    suitability: siteSuitabilityEnum('suitability').notNull(),
    status: siteStatusEnum('status').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    pointGeom: geometry('point_geom', {
      geometryType: 'Point',
      srid: 4326,
    }),
    notes: jsonb('notes').$type<string[]>().default([]).notNull(),
    isDemoData: boolean('is_demo_data').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('relocation_sites_point_geom_idx').using('gist', table.pointGeom),
    index('relocation_sites_district_idx').on(table.district),
  ],
);

export const habitationRiskAssessments = pgTable('habitation_risk_assessments', {
  id: varchar('id', { length: 64 }).primaryKey(),
  habitationId: varchar('habitation_id', { length: 64 })
    .notNull()
    .references(() => habitations.id),
  hazardScore: doublePrecision('hazard_score').notNull(),
  vulnerabilityScore: doublePrecision('vulnerability_score').notNull(),
  historyScore: doublePrecision('history_score').notNull(),
  exposureScore: doublePrecision('exposure_score').notNull(),
  infrastructureScore: doublePrecision('infrastructure_score').notNull(),
  compositeScore: doublePrecision('composite_score').notNull(),
  priorityLevel: priorityLevelEnum('priority_level').notNull(),
  timeline: relocationTimelineEnum('timeline').notNull(),
  confidenceScore: doublePrecision('confidence_score').default(0.85).notNull(),
  factorsBreakdown: jsonb('factors_breakdown').$type<Record<string, number>>().notNull(),
  isDemoData: boolean('is_demo_data').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const relocationRecommendations = pgTable('relocation_recommendations', {
  id: varchar('id', { length: 64 }).primaryKey(),
  habitationId: varchar('habitation_id', { length: 64 })
    .notNull()
    .references(() => habitations.id),
  siteId: varchar('site_id', { length: 64 }).references(() => relocationSites.id),
  priorityIndex: doublePrecision('priority_index').notNull(),
  urgency: varchar('urgency', { length: 40 }).notNull(),
  window: varchar('window', { length: 60 }).notNull(),
  headline: text('headline').notNull(),
  evidence: text('evidence').notNull(),
  recommendation: text('recommendation').notNull(),
  status: varchar('status', { length: 40 }).default('pending_review').notNull(),
  isDemoData: boolean('is_demo_data').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
