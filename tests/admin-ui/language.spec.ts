import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test('chosen language translates headlines and full report automatically and handles switching and failures', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('admin-e2e');
  await page.getByLabel('Password', { exact: true }).fill('test-admin-e2e-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  const headers = { Origin: 'http://127.0.0.1:3216' };
  const source = await (await page.request.post('/api/admin/sources', { headers, data: { name: 'Language publisher', url: 'https://1.1.1.1', location: 'ng' } })).json();
  const articleResponse = await page.request.post('/api/admin/articles', { headers, data: { title: 'Language original report', description: 'English summary for translation.', content: readFileSync('tests/fixtures/full-article.txt','utf8'), source: source.id, categories: [], location: 'ng' } });
  expect(articleResponse.status()).toBe(201);
  const article = await articleResponse.json();
  const calls: string[] = [];
  await page.route('**/api/reader/translations/**', async route => {
    const url=new URL(route.request().url()); calls.push(url.search);
    if(url.searchParams.get('language') === 'ha') return route.fulfill({status:503,json:{detail:'Unavailable'}});
    return route.fulfill({ json: {language:'fr',title:'Rapport traduit automatiquement',description:'Résumé français',content:'## Les faits\n\nLe rapport complet est traduit.',why_matters:''} });
  });
  await page.evaluate(() => { localStorage.setItem('news-lang','fr'); localStorage.setItem('news-location','ng'); });
  await page.goto('/search?q=Language');
  await expect(page.getByRole('heading', { name: 'Rapport traduit automatiquement', exact: true })).toBeVisible();
  await page.goto(`/news/${article.id}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rapport traduit automatiquement');
  await expect(page.locator('.article-reading-body')).toContainText('Le rapport complet est traduit.');
  expect(calls.filter(search => search.includes('part=full'))).toHaveLength(1);
  await page.evaluate(() => { localStorage.removeItem('news-lang'); window.dispatchEvent(new Event('news-language')); });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Language original report');
  await page.evaluate(() => { localStorage.setItem('news-lang','ha'); window.dispatchEvent(new Event('news-language')); });
  await expect(page.locator('.article-reading-body')).toContainText('Translation unavailable. Showing the English original.');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Language original report');
});
