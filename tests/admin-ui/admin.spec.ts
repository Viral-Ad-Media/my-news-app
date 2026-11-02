import { readFileSync } from 'node:fs';
const fullArticle = readFileSync('tests/fixtures/full-article.txt', 'utf8');
import { test, expect } from '@playwright/test';

test('anonymous protected pages redirect and admin API rejects access', async ({ page, request }) => {
  for (const path of ['/admin', '/admin/articles', '/admin/categories', '/admin/sources', '/admin/rss', '/rss', '/admin/logs', '/admin/settings', '/superadmin']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
  expect((await request.get('/api/admin/dashboard')).status()).toBe(401);
  for (const path of ['/rss.xml', '/admin/rss.xml', '/api/admin/source-coverage']) {
    const response = await request.get(path);
    expect(response.status()).toBe(401);
    expect(response.headers()['cache-control']).toContain('no-store');
  }
  expect((await request.put('/api/admin/settings', { data: { enabled: true } })).status()).toBe(403);
  await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toHaveCount(0);
});

test('reader account is denied administration', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('reader-e2e');
  await page.getByLabel('Password', { exact: true }).fill('test-reader-e2e-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('This account is not authorized for administration.')).toBeVisible();
});

test('real backend category, article, source, settings and durable job operations', async ({ page }) => {
  test.setTimeout(60000);
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('admin-e2e');
  await page.getByLabel('Password', { exact: true }).fill('test-admin-e2e-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/superadmin');
  await expect(page.getByRole('heading', { name: 'Editorial desk', exact: true })).toBeVisible();
  await page.goto('/admin');
  const cookies = await page.context().cookies();
  expect(cookies.find(c => c.name === 'news_access')?.httpOnly).toBe(true);
  await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible();
  await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
  await page.getByRole('link', { name: 'Categories', exact: true }).click();
  await page.getByRole('button', { name: 'Create category', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill('Browser Science');
  await page.getByLabel('Slug', { exact: true }).fill('browser-science');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'browser-science', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'RSS', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'RSS and source coverage' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browser Science RSS XML', exact: true })).toHaveAttribute('href', '/admin/rss.xml?category=Browser+Science&location=ng');
  await page.getByLabel('Edition', { exact: true }).selectOption('ca');
  await expect(page.getByRole('link', { name: 'Browser Science RSS XML', exact: true })).toHaveAttribute('href', '/admin/rss.xml?category=Browser+Science&location=ca');
  const xml = await page.request.get('/admin/rss.xml?category=Browser%20Science&location=ca');
  expect(xml.status()).toBe(200);
  expect(xml.headers()['content-type']).toContain('application/rss+xml');
  expect(xml.headers()['cache-control']).toContain('no-store');
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/categories');
  await expect(page.getByRole('navigation', { name: 'News categories' }).getByRole('link', { name: 'Browser Science', exact: true })).toBeVisible();
  await expect(page.locator('a[href="/rss"],a[href="/rss.xml"]')).toHaveCount(0);
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveCount(0);
  await page.goto('/admin');
  await page.getByRole('link', { name: 'Sources', exact: true }).click();
  await page.getByRole('button', { name: 'Create source', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill('Browser Publisher');
  await page.getByLabel('Url', { exact: true }).fill('https://example.org');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('cell', { name: /Browser Publisher/ })).toBeVisible();
  await page.getByRole('link', { name: 'Articles', exact: true }).click();
  await page.getByRole('button', { name: 'Create article', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Browser test article');
  await page.getByLabel('Description', { exact: true }).fill('Test summary persisted in a disposable database.');
  await page.getByLabel('Content', { exact: true }).fill(fullArticle);
  await page.getByLabel('Source', { exact: true }).selectOption({ label: 'Browser Publisher (#1)' });
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('cell', { name: /Browser test article/ })).toBeVisible();
  await page.getByRole('button', { name: 'View / edit', exact: true }).click();
  await page.getByRole('button', { name: 'Prepare full article', exact: true }).click();
  await expect(page.getByText(/Article #1 · Preparation #1 · queued/)).toBeVisible();
  await page.getByRole('button', { name: 'Close editor', exact: true }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByRole('cell', { name: /^Archived/ })).toBeVisible();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('Interval minutes', { exact: true })).toHaveValue('60');
  await page.getByText('Advanced feed controls', { exact: true }).click();
  await page.getByLabel('Feed scan limit', { exact: true }).fill('7');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Changes saved.' })).toBeVisible();
  await page.reload();
  await page.getByText('Advanced feed controls', { exact: true }).click();
  await expect(page.getByLabel('Feed scan limit', { exact: true })).toHaveValue('7');
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.getByRole('button', { name: 'Test without publishing', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Run queued' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run now', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Test without publishing', exact: true })).toBeEnabled();
  await expect(page.getByText(/No recent worker heartbeat/)).toBeVisible();
  await page.getByRole('button', { name: 'Run now', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'already queued or executing' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel pending run', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Pending run cancelled.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel pending run', exact: true })).toHaveCount(0);
  const queuedPublishing = page.waitForResponse(response => response.url().endsWith('/api/admin/runs') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Run now', exact: true }).click();
  const publishingResponse = await queuedPublishing;
  expect(publishingResponse.status()).toBe(202);
  expect((await publishingResponse.json()).dry_run).toBe(false);
  await expect(page.getByRole('status').filter({ hasText: 'Run queued' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel pending run', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Pending run cancelled.' })).toBeVisible();
  const queuedTest = page.waitForResponse(response => response.url().endsWith('/api/admin/runs') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Test without publishing', exact: true }).click();
  expect((await (await queuedTest).json()).dry_run).toBe(true);
  await expect(page.getByRole('status').filter({ hasText: 'Test only — no publishing' })).toBeVisible();
  await page.getByRole('link', { name: 'Logs', exact: true }).click();
  await expect(page.getByText(/Run #1 · manual/)).toBeVisible();
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await page.context().cookies()).some(c => c.name === 'news_access')).toBe(false);
});
