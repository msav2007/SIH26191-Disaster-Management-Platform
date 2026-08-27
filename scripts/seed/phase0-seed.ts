import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function main() {
  const [{ db, sqlClient }, schema, fixtures] = await Promise.all([
    import('../../src/server/db/client'),
    import('../../src/server/db/schema'),
    import('../../src/server/db/fixtures/disaster-data'),
  ]);

  console.log('Seeding SIH26191 disaster management platform foundation...');

  // 1. Data Sources & Governance
  await db
    .insert(schema.dataSources)
    .values({
      id: 'foundation-demo-source',
      name: 'Phase 3 Multi-Hazard Demonstration Dataset',
      kind: 'simulation',
      description:
        'Deterministic demonstration dataset covering Wayanad, Joshimath, Kedarnath, Majuli, Kendrapara and Munsiari. This is not official operational government data.',
      isDemoData: true,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.regions)
    .values([
      {
        id: 'reg-kerala-wayanad',
        name: 'Wayanad District Planning Region',
        type: 'district',
        isDemoData: true,
      },
      {
        id: 'reg-uk-chamoli',
        name: 'Chamoli District Planning Region',
        type: 'district',
        isDemoData: true,
      },
      {
        id: 'reg-uk-rudraprayag',
        name: 'Rudraprayag District Planning Region',
        type: 'district',
        isDemoData: true,
      },
      {
        id: 'reg-odisha-kendrapara',
        name: 'Kendrapara District Planning Region',
        type: 'district',
        isDemoData: true,
      },
      {
        id: 'reg-assam-majuli',
        name: 'Majuli District Planning Region',
        type: 'district',
        isDemoData: true,
      },
      {
        id: 'reg-uk-pithoragarh',
        name: 'Pithoragarh District Planning Region',
        type: 'district',
        isDemoData: true,
      },
    ])
    .onConflictDoNothing();

  // 2. Red Zones
  for (const zone of fixtures.redZonesFixture) {
    await db
      .insert(schema.redZones)
      .values({
        id: zone.id,
        name: zone.name,
        district: zone.district,
        state: zone.state,
        primaryHazard: zone.primaryHazard,
        secondaryHazards: zone.secondaryHazards,
        severity: zone.severity,
        areaSqKm: zone.areaSqKm,
        affectedPopulation: zone.affectedPopulation,
        affectedHabitations: zone.affectedHabitations,
        status: zone.status,
        radiusKm: zone.radiusKm,
        latitude: zone.coordinates.latitude,
        longitude: zone.coordinates.longitude,
        isDemoData: true,
      })
      .onConflictDoNothing();
  }

  // 3. Relocation Sites
  for (const site of fixtures.relocationSitesFixture) {
    await db
      .insert(schema.relocationSites)
      .values({
        id: site.id,
        name: site.name,
        block: site.block,
        district: site.district,
        state: site.state,
        landClass: site.landClass,
        areaHectares: site.areaHectares,
        carryingCapacity: site.carryingCapacity,
        currentOccupancy: site.currentOccupancy,
        projectedRequirement: site.projectedRequirement,
        services: site.services,
        shelterCapacity: site.shelterCapacity,
        distanceToNearestHabitationKm: site.distanceToNearestHabitationKm,
        hazardExposure: site.hazardExposure,
        suitability: site.suitability,
        status: site.status,
        latitude: site.coordinates.latitude,
        longitude: site.coordinates.longitude,
        notes: site.notes,
        isDemoData: true,
      })
      .onConflictDoNothing();
  }

  // 4. Habitations & Disaster Events
  for (const h of fixtures.habitationsFixture) {
    await db
      .insert(schema.habitations)
      .values({
        id: h.id,
        name: h.name,
        block: h.block,
        district: h.district,
        state: h.state,
        population: h.population,
        households: h.households,
        primaryHazard: h.primaryHazard,
        redZoneId: h.redZoneId,
        vulnerability: h.vulnerability,
        priority: h.priority,
        timeline: h.timeline,
        status: h.status,
        elevationM: h.elevationM,
        slopeDeg: h.slopeDeg,
        distanceToRiverKm: h.distanceToRiverKm,
        latitude: h.coordinates.latitude,
        longitude: h.coordinates.longitude,
        factors: h.factors,
        demographics: h.demographics,
        infrastructure: h.infrastructure,
        candidateSiteIds: h.candidateSiteIds,
        notes: h.notes,
        lastSurvey: h.lastSurvey,
        isDemoData: true,
      })
      .onConflictDoNothing();

    for (const evt of h.history) {
      await db
        .insert(schema.disasterEvents)
        .values({
          id: evt.id,
          habitationId: h.id,
          year: evt.year,
          type: evt.type,
          description: evt.description,
          casualties: evt.casualties,
          displaced: evt.displaced,
          isDemoData: true,
        })
        .onConflictDoNothing();
    }
  }

  // 5. Audit Event
  await db
    .insert(schema.auditEvents)
    .values({
      id: `seed-run-${Date.now()}`,
      actorType: 'system',
      eventName: 'domain.seed.executed',
      resourceType: 'seed_pipeline',
      metadata: {
        note: 'Domain seed completed with multi-hazard Indian disaster fixtures.',
        redZonesCount: fixtures.redZonesFixture.length,
        habitationsCount: fixtures.habitationsFixture.length,
        sitesCount: fixtures.relocationSitesFixture.length,
      },
    })
    .onConflictDoNothing();

  console.log('Seeding completed successfully.');
  await sqlClient.end({ timeout: 5 });
}

main().catch((error) => {
  console.error('Seed execution failed.', error);
  process.exitCode = 1;
});
