import { test, expect } from '@playwright/test';

test('article and category editors open visibly, reopen and persist category edits', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('admin-e2e');
  await page.getByLabel('Password', { exact: true }).fill('test-admin-e2e-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  // Enough rows to put the old bottom-of-page form offscreen on both viewports.
  for (let i = 0; i < 21; i++) {
    const result = await page.request.post('/api/admin/categories', {
      headers: { Origin: 'http://127.0.0.1:3216' },
      data: { name: `Editor category ${i}`, slug: `editor-category-${i}`, description: '' },
    });
    expect(result.status()).toBe(201);
  }
  await page.goto('/admin/categories');
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('Editor category');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(20);
    for (let i = 0; i < await rows.count(); i++) {
      const row = rows.nth(i);
      const name = (await row.locator('td').first().innerText()).split('\n')[0];
      await row.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name);
      await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
      await expect(page.getByLabel('Name', { exact: true })).toBeInViewport();
    }
    // Reopening the same record must still focus/scroll, even with an editor open.
    await rows.last().getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByLabel('Name', { exact: true })).toBeInViewport();
    await page.getByRole('button', { name: 'Create category', exact: true }).click();
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('Name', { exact: true })).toBeInViewport();
    await page.getByRole('button', { name: 'Close editor', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.locator('tbody tr').getByRole('button', { name: 'Edit', exact: true }).click();
  const editedName = 'Category edit persisted';
  await page.getByLabel('Name', { exact: true }).fill(editedName);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Changes saved.' })).toBeVisible();
  await page.reload();
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(editedName);
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByRole('cell', { name: editedName, exact: true })).toBeVisible();
  await page.goto('/admin/articles');
  await page.getByRole('button', { name: 'Create article', exact: true }).click();
  await expect(page.getByLabel('Title', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Title', { exact: true })).toBeInViewport();
  await page.getByLabel('Title', { exact: true }).fill('Discard this draft');
  await page.getByRole('button', { name: 'Create article', exact: true }).click();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Title', { exact: true })).toBeInViewport();
});
