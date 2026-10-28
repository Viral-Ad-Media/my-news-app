import { readFileSync } from 'node:fs';
const fullArticle = readFileSync('tests/fixtures/full-article.txt', 'utf8');
import { test, expect } from '@playwright/test';

test('anonymous protected pages redirect and admin API rejects access', async ({ page, request }) => {
  for (const path of ['/admin', '/admin/articles', '/admin/categories', '/admin/sources', '/admin/logs', '/admin/settings', '/superadmin']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
  expect((await request.get('/api/admin/dashboard')).status()).toBe(401);
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
  await page.getByLabel('Max per source', { exact: true }).fill('7');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.reload();
  await expect(page.getByLabel('Max per source', { exact: true })).toHaveValue('7');
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.getByRole('button', { name: 'Test without publishing', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Run queued' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run now', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'Logs', exact: true }).click();
  await expect(page.getByText(/Run #1 · manual/)).toBeVisible();
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await page.context().cookies()).some(c => c.name === 'news_access')).toBe(false);
});
