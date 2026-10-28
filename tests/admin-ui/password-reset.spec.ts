import { test, expect } from '@playwright/test';

test('a real reset email link opens the frontend and changes the Django password once', async ({ page, request }) => {
  await page.goto('/forgot-password');
  await page.getByLabel('Username or Email address').fill('recovery@example.test');
  await page.getByRole('button', { name: 'Send Recovery Instructions' }).click();
  await expect(page.getByRole('status')).toContainText('Recovery request received');
  const mailbox = await (await request.get('http://127.0.0.1:3215/__test__/mailbox/')).json();
  const body = mailbox.messages.find((message: string) => message.includes('/reset-password/'));
  expect(body).toBeTruthy();
  const link = body.match(/http:\/\/127\.0\.0\.1:3216\/reset-password\/[^\s]+/)[0];
  await page.goto(link);
  await page.getByLabel('New password', { exact: true }).fill('New-test-recovery-password42!');
  await page.getByLabel('Confirm new password', { exact: true }).fill('New-test-recovery-password42!');
  await page.getByRole('button', { name: 'Reset password', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your password has been reset');
  const login = await request.post('http://127.0.0.1:3215/api/token/', { data: { username: 'recovery-e2e', password: 'New-test-recovery-password42!' } });
  expect(login.status()).toBe(200);
  expect((await login.json()).access).toBeTruthy();
  await page.goto(link);
  await page.getByLabel('New password', { exact: true }).fill('Another-test-password42!');
  await page.getByLabel('Confirm new password', { exact: true }).fill('Another-test-password42!');
  await page.getByRole('button', { name: 'Reset password', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'invalid or expired' })).toBeVisible();
});
