import { test, expect } from '@playwright/test';

test('bulk enabling applies beyond visible search results and preserves schedule', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('admin-e2e');
  await page.getByLabel('Password', { exact: true }).fill('test-admin-e2e-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  const headers = { Origin: 'http://127.0.0.1:3216' };
  const create = async (name: string, feed = '') => {
    const res = await page.request.post('/api/admin/sources', { headers, data: { name, url: 'https://1.1.1.1', feed_url: feed || null, enabled: false } });
    expect(res.status()).toBe(201); return res.json();
  };
  const first = await create('Bulk publisher first', 'https://1.1.1.1/bulk-first');
  const second = await create('Bulk publisher second', 'https://1.1.1.1/bulk-second');
  const attribution = await create('Bulk attribution only');
  const before = await (await page.request.get('/api/admin/settings')).json();
  await page.goto('/admin/sources');
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('Bulk publisher first');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByRole('cell', { name: /Bulk publisher first/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: /Bulk publisher second/ })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Source action' }).selectOption('enable-all');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'sources enabled.' })).toBeVisible();
  for (const source of [first, second]) expect((await (await page.request.get(`/api/admin/sources/${source.id}`)).json()).enabled).toBe(true);
  expect((await (await page.request.get(`/api/admin/sources/${attribution.id}`)).json()).enabled).toBe(false);
  await page.getByRole('combobox', { name: 'Source action' }).selectOption('disable-all');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'sources disabled.' })).toBeVisible();
  for (const source of [first, second]) expect((await (await page.request.get(`/api/admin/sources/${source.id}`)).json()).enabled).toBe(false);
  const after = await (await page.request.get('/api/admin/settings')).json();
  expect(after.enabled).toBe(before.enabled);
  expect(after.publishing_rules).toEqual(before.publishing_rules);
});
