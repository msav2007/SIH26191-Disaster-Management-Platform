import { expect, test } from '@playwright/test';

test('users can open the dashboard shell and switch to the GIS route', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Open Command Center/i }).click();
  await expect(page.getByRole('heading', { name: /Multi-Hazard Disaster Relocation Command Center/i })).toBeVisible();

  await page.getByRole('link', { name: /GIS Risk Map/i }).click();
  await expect(page.getByRole('heading', { name: /GIS Risk & Relocation Workspace/i })).toBeVisible();
});
