import { expect, test } from '@playwright/test';

test('users can open the dashboard shell and switch to the GIS route', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /Production-grade foundation for an authority-facing disaster relocation decision platform/i,
    }),
  ).toBeVisible();

  await page.getByRole('link', { name: /Open Command Center/i }).click();
  await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();

  await page.getByRole('link', { name: /GIS Risk Map/i }).click();
  await expect(page.getByRole('heading', { name: 'GIS Risk Map' })).toBeVisible();
});

