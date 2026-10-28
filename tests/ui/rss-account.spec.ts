import {test,expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.addInitScript(()=>localStorage.setItem('news-location','ng'));
  await page.route('http://news-api.test/api/**',route=>route.fulfill({json:{results:route.request().url().includes('categories')?[{id:1,name:'Science'},{id:2,name:'Housing'},{id:3,name:'Markets'}]:[],count:0}}));
  await page.route('**/api/reader/**',route=>route.fulfill({json:{results:[],count:0,categories:[],saved_ids:[]}}));
});

test('all topic RSS links include standard and additional saved categories',async({page,request})=>{
  await page.route('**/api/session',route=>route.fulfill({json:{authenticated:false}}));
  await page.goto('/rss');
  for(const name of ['Sports','Culture','Arts','Finance','Games','Entertainment','Business','Politics','Technology','Science','Health','Education','Environment','Travel','Food','Lifestyle','World','Housing','Markets']) {
    await expect(page.getByRole('link',{name:`${name} RSS XML`,exact:true})).toHaveAttribute('href',`/rss.xml?category=${encodeURIComponent(name)}`);
  }
  const xml=await request.get('/rss.xml?category=Entertainment');
  expect(xml.status()).toBe(200);
  expect(xml.headers()['content-type']).toContain('application/rss+xml');
  expect(await xml.text()).toContain('Entertainment RSS Feed');
});

test('signed-in staff see a prominent person-and-dashboard link, with no reader-facing admin controls',async({page})=>{
  await page.route('**/api/session',route=>route.fulfill({json:{username:'Developer',is_staff:true,is_superuser:true}}));
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:900}); await page.goto('/');
    const dashboard=page.getByRole('banner').getByRole('link',{name:'Dashboard',exact:true});
    await expect(dashboard).toBeVisible();
    await expect(dashboard.locator('svg')).toBeVisible();
    await expect(dashboard).toHaveCSS('background-color','rgb(217, 71, 24)');
    await expect(page.locator('a[href="/superadmin"],a[href="/admin"]')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole('banner').getByRole('link',{name:'Dashboard',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Welcome back, Developer'})).toBeVisible();
  await expect(page.locator('a[href="/superadmin"],a[href="/admin"]')).toHaveCount(0);
});

test('normal email/password sign-in sends a staff account to its reader dashboard',async({page})=>{
  await page.route('**/api/session',route=>route.fulfill({json:route.request().method()==='POST'?{authenticated:true,username:'Developer',is_staff:true,is_superuser:true}:{username:'Developer',is_staff:true,is_superuser:true}}));
  await page.goto('/login');
  await page.locator('#username').fill('developer'); await page.locator('#current-password').fill('test-only-password');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('private developer editor requires server authorization',async({page})=>{
  await page.goto('/superadmin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});
