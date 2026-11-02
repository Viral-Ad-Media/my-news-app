import { test, expect } from '@playwright/test';

test('publishing settings persist multiple source rules, interval boundaries and orange switches', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('admin-e2e');
  await page.getByLabel('Password', { exact: true }).fill('test-admin-e2e-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  const headers = { Origin: 'http://127.0.0.1:3216' };
  const category = await page.request.post('/api/admin/categories', { headers, data: { name: 'Settings Sports', slug: 'settings-sports', description: '' } });
  expect(category.status()).toBe(201);
  const { id: categoryId } = await category.json();
  const sourceIds: number[] = [];
  for (const name of ['Nairametrics configuration test', 'Second source configuration test']) {
    const response = await page.request.post('/api/admin/sources', { headers, data: { name, url: 'https://example.org', enabled: false, location: 'ng' } });
    expect(response.status()).toBe(201);
    sourceIds.push((await response.json()).id);
  }
  await page.goto('/admin/settings');
  const toggle = page.getByRole('switch', { name: 'Scheduled automation enabled' });
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(toggle).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await expect(toggle).toHaveCSS('background-color', 'rgb(217, 71, 24)');
  const interval = page.getByLabel('Interval minutes', { exact: true });
  await expect(interval).toHaveAttribute('min', '1');
  await expect(interval).toHaveAttribute('max', '1000');
  await interval.fill('1');
  await page.getByRole('button', { name: '100', exact: true }).click();
  await expect(page.getByLabel('Default publish limit per source')).toHaveValue('100');
  await page.getByRole('button', { name: 'Add rule' }).click();
  await page.getByLabel('Source 1', { exact: true }).selectOption(String(sourceIds[0]));
  await page.getByLabel('Category 1', { exact: true }).selectOption(String(categoryId));
  await page.getByLabel('Publish limit 1', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Add rule' }).click();
  await page.getByLabel('Source 2', { exact: true }).selectOption(String(sourceIds[1]));
  await page.getByLabel('Publish limit 2', { exact: true }).fill('100');
  await expect(page.getByText('Paused — enable this feed in Sources', { exact: true })).toHaveCount(2);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/publishing-settings-${width}.png`, fullPage: true });
  }
  async function save() {
    const completed = page.waitForResponse(response => response.url().includes('/api/admin/settings') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    expect((await completed).status()).toBe(200);
    await expect(page.getByRole('status').filter({ hasText: 'Changes saved.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toBeEnabled();
  }
  await save();
  await page.reload();
  await expect(interval).toHaveValue('1');
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByLabel('Publish limit 1', { exact: true })).toHaveValue('1');
  await expect(page.getByLabel('Publish limit 2', { exact: true })).toHaveValue('100');
  await expect(page.getByLabel('Source 1', { exact: true })).toHaveValue(String(sourceIds[0]));
  await expect(page.getByLabel('Category 1', { exact: true })).toHaveValue(String(categoryId));
  await interval.fill('1000');
  await save();
  await page.reload();
  await expect(interval).toHaveValue('1000');
  await interval.fill('1001');
  expect(await interval.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
  await interval.fill('1000');
  await toggle.click();
  await save();
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(toggle).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
