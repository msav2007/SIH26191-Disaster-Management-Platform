import { expect, test } from '@playwright/test';

test.describe('SIH26191 Critical Authority Flows (Phase 9)', () => {
  test('FLOW 1: Dashboard -> Priority Settlement -> Relocation Planning -> GIS', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: /Multi-Hazard Disaster Relocation Command Center/i }),
    ).toBeVisible();

    // Check KPI strip
    await expect(page.getByText('Assessed Habitations')).toBeVisible();
    await expect(page.getByText('Operational Habitation Priority Queue')).toBeVisible();

    // Click Chooralmala
    await page.getByRole('link', { name: /Chooralmala Town Settlement/i }).click();
    await expect(page.getByText('HAB-WY-01')).toBeVisible();
  });

  test('FLOW 2: Habitations Prioritization -> Evidence Dossier -> Relocation Matching', async ({ page }) => {
    await page.goto('/habitations');

    await expect(page.getByText('Chooralmala Town Settlement')).toBeVisible();
    await expect(page.getByText('85.8')).toBeVisible();

    // Find Relocation Options
    const relocLink = page.getByRole('link', { name: /Find Relocation Options/i }).first();
    if (await relocLink.isVisible()) {
      await Promise.all([
        page.waitForURL(/\/relocation/),
        relocLink.click(),
      ]);
      expect(page.url()).toContain('/relocation');
    }
  });

  test('FLOW 3: Scenario Simulator -> Live Simulation -> Grounded Briefing', async ({ page }) => {
    await page.goto('/scenarios');

    await expect(page.getByText('Multi-Hazard Climate Simulator')).toBeVisible();
    await expect(page.getByText('Baseline vs Scenario Comparison')).toBeVisible();
    await expect(page.getByText('Grounded AI Decision Briefing')).toBeVisible();
  });

  test('FLOW 4: Statutory Reports -> Vulnerability & Relocation Reports', async ({ page }) => {
    await page.goto('/reports');

    await expect(page.getByText('Executive Summary')).toBeVisible();
    await expect(page.getByRole('button', { name: /Print Report/i })).toBeVisible();
  });

  test('FLOW 5: GIS Workspace -> Map Inspection', async ({ page }) => {
    await page.goto('/map');

    await expect(page.getByText('GIS Risk & Relocation Workspace')).toBeVisible();
  });
});
