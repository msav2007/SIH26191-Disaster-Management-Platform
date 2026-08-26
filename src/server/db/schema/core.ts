import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { geometry } from './_spatial';

export const regionTypeEnum = pgEnum('region_type', [
  'state',
  'district',
  'block',
  'village',
  'planning_region',
]);

export const ingestionStatusEnum = pgEnum('ingestion_status', [
  'pending',
  'running',
  'completed',
  'failed',
]);

export const actorTypeEnum = pgEnum('actor_type', ['system', 'user']);

export const regions = pgTable(
  'regions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    type: regionTypeEnum('type').notNull(),
    parentRegionId: varchar('parent_region_id', { length: 64 }),
    boundaryGeom: geometry('boundary_geom', {
      geometryType: 'MultiPolygon',
      srid: 4326,
    }),
    isDemoData: boolean('is_demo_data').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('regions_boundary_geom_idx').using('gist', table.boundaryGeom)],
);

export const dataSources = pgTable('data_sources', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  kind: varchar('kind', { length: 80 }).notNull(),
  description: text('description').notNull(),
  isDemoData: boolean('is_demo_data').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ingestionRuns = pgTable('ingestion_runs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  dataSourceId: varchar('data_source_id', { length: 64 })
    .notNull()
    .references(() => dataSources.id),
  status: ingestionStatusEnum('status').notNull(),
  summary: jsonb('summary').$type<Record<string, string | number | boolean | null>>(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const auditEvents = pgTable('audit_events', {
  id: varchar('id', { length: 64 }).primaryKey(),
  actorType: actorTypeEnum('actor_type').notNull(),
  actorId: varchar('actor_id', { length: 64 }),
  eventName: varchar('event_name', { length: 160 }).notNull(),
  resourceType: varchar('resource_type', { length: 120 }).notNull(),
  resourceId: varchar('resource_id', { length: 64 }),
  metadata: jsonb('metadata').$type<Record<string, string | number | boolean | null>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
