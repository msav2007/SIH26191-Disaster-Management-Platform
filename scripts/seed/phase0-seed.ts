import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function main() {
  const [{ db, sqlClient }, schema] = await Promise.all([
    import('../../src/server/db/client'),
    import('../../src/server/db/schema'),
  ]);

  await db
    .insert(schema.dataSources)
    .values({
      id: 'foundation-demo-source',
      name: 'Phase 0 demo source registry',
      kind: 'simulation',
      description:
        'Deterministic placeholder source proving the seed pipeline exists. This is not official government data.',
      isDemoData: true,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.regions)
    .values({
      id: 'foundation-planning-region',
      name: 'Foundation Planning Region',
      type: 'planning_region',
      isDemoData: true,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.auditEvents)
    .values({
      id: 'phase0-seed-run',
      actorType: 'system',
      eventName: 'phase0.seed.executed',
      resourceType: 'seed_process',
      metadata: {
        note: 'Phase 0 seed completed successfully.',
      },
    })
    .onConflictDoNothing();

  await sqlClient.end({ timeout: 5 });
}

main().catch((error) => {
  console.error('Phase 0 seed failed.', error);
  process.exitCode = 1;
});
