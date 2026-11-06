import {test,expect} from '@playwright/test';

test('trends selection persists and hidden admin tabs stop polling',async({page})=>{
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill('admin-e2e');
  await page.getByLabel('Password',{exact:true}).fill('test-admin-e2e-only');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();
  await page.goto('/admin/settings');
  const toggle=page.getByRole('switch',{name:'Prioritize Google Trends'});
  await expect(toggle).toHaveAttribute('aria-checked','true');
  await toggle.click();
  await page.getByRole('button',{name:'Save changes'}).click();
  await expect(toggle).toHaveAttribute('aria-checked','false');
  await page.reload();await expect(toggle).toHaveAttribute('aria-checked','false');
  await toggle.click();await page.getByRole('button',{name:'Save changes'}).click();
  await page.goto('/admin');
  await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();
  await expect.poll(async()=> (await (await page.request.get('/api/admin/settings')).json()).trends_enabled).toBe(true);
  await expect(page.getByText(/Google Trends:.*regions synced/)).toBeVisible();
  await page.clock.install();
  let requests=0;
  page.on('request',request=>{if(request.url().includes('/api/admin/dashboard'))requests++;});
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.fastForward(91000);
  expect(requests).toBe(0);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect.poll(()=>requests).toBe(1);
});
