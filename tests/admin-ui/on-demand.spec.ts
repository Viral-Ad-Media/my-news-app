import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const content = readFileSync('tests/fixtures/full-article.txt', 'utf8');

test('all publishing controls work without native dialogs, preserve schedule, and report actual worker results', async ({ page }) => {
  test.setTimeout(120000); page.setDefaultTimeout(15000);
  await page.addInitScript(() => { localStorage.setItem('news-location', 'ng'); window.confirm = () => { throw Error('Native confirmation must not gate admin actions'); }; });
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('admin-e2e');
  await page.getByLabel('Password', { exact: true }).fill('test-admin-e2e-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  const headers = { Origin: 'http://127.0.0.1:3216' };
  // Previous tests may have queued a deliberately waiting schedule job.
  let dashboard = await (await page.request.get('/api/admin/dashboard')).json();
  if (dashboard.active_run) expect((await page.request.post(`/api/admin/runs/${dashboard.active_run.id}/cancel`, { headers, data: {} })).status()).toBe(200);
  const categoryRes = await page.request.post('/api/admin/categories', { headers, data: { name: 'One-off Science', slug: 'one-off-science' } }); expect(categoryRes.status()).toBe(201);
  const category = await categoryRes.json();
  const sourceIds = [];
  for (const name of ['On-demand publisher A', 'On-demand publisher B']) {
    const response = await page.request.post('/api/admin/sources', { headers, data: { name, url: 'https://1.1.1.1', feed_url: `https://1.1.1.1/feed-${name.endsWith('A') ? 'a' : 'b'}`, location: 'ng', default_category: category.id, enabled: false } });
    expect(response.status()).toBe(201); sourceIds.push((await response.json()).id);
  }
  const savedSettings = await (await page.request.get('/api/admin/settings')).json();
  await page.goto('/admin/articles');
  await expect(page.getByRole('button', { name: 'Fetch, rewrite and publish', exact: true })).toHaveCount(0);
  const response = await page.request.post('/api/admin/publishing', { headers, data: { rules: [{ source: sourceIds[0], category: category.id, limit: 3 }, { source: sourceIds[1], category: category.id, limit: 2 }], dry_run: false } });
  expect(response.status()).toBe(202);
  const progress = await response.json();
  for (let i = 0; i < 10; i++) {
    const status = await (await page.request.get(`/api/admin/publishing/${progress.root_id}`)).json();
    if (!status.active_run_id) break;
    expect((await page.request.post('http://127.0.0.1:3215/__test__/worker/')).status()).toBe(200);
  }
  const finished = await (await page.request.get(`/api/admin/publishing/${progress.root_id}`)).json();
  expect(finished.published).toBe(5); expect(finished.status).toBe('success');
  const currentSettings = await (await page.request.get('/api/admin/settings')).json();
  expect(currentSettings.publishing_rules).toEqual(savedSettings.publishing_rules);
  expect(currentSettings.enabled).toBe(savedSettings.enabled);
  await page.getByRole('button', { name: 'Create article', exact: true }).click();
  await expect(page.getByLabel('Title', { exact: true })).toBeInViewport();
  await page.getByLabel('Title', { exact: true }).fill('An editor-written one-off report');
  await page.getByLabel('Description', { exact: true }).fill('A disposable manual authoring workflow.');
  await page.getByLabel('Content', { exact: true }).fill(content);
  await page.getByLabel('Source', { exact: true }).selectOption(String(sourceIds[0]));
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: 'An editor-written one-off report' });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(row.getByRole('button', { name: 'Publish', exact: true })).toBeVisible();
  await row.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(row.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Confirm deletion' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep record' }).click();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(row).toHaveCount(0);
  await page.goto('/admin');
  await expect(page.getByRole('button', { name: 'Write it myself', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Run now', exact: true })).toBeEnabled();
  await page.request.put(`/api/admin/sources/${sourceIds[0]}`, { headers, data: { enabled: true } });
  await page.goto('/admin/sources');
  await page.getByRole('row').filter({ hasText: 'On-demand publisher A' }).getByRole('button', { name: 'Fetch now', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Run queued:' })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/sources$/);
});
