import { test, expect } from '@playwright/test';
import { photoFixture } from './photo-fixture';

for (const route of ['/', '/timelines']) {
  test(`new publications appear automatically on ${route}`, async ({page}) => {
    await page.clock.install();
    await page.addInitScript(() => localStorage.setItem('news-location','ng'));
    await page.route('**/api/session', handler => handler.fulfill({json:{authenticated:false}}));
    await page.route('**/api/reader/**', handler => handler.fulfill({json:{saved_ids:[]}}));
    await photoFixture(page);
    let published = false;
    const story = {id:901,title:'Solar report already published',description:'Source-grounded reporting.',location:'ng',published_at:new Date().toISOString(),categories:[{id:1,name:'Energy'}],source:{name:'Publisher'}};
    await page.route('http://news-api.test/api/**', handler => {
      const url = handler.request().url();
      if(url.includes('categories')) return handler.fulfill({json:{results:[{id:1,name:'Energy'}],count:1}});
      const results = published ? [{...story,id:902,title:'Solar report just published'},story] : [story];
      return handler.fulfill({json:{results,count:results.length}});
    });
    await page.goto(route);
    await expect(page.getByRole('heading',{name:story.title}).first()).toBeVisible();
    await expect(page.getByRole('heading',{name:'Solar report just published'})).toHaveCount(0);
    published = true;
    await page.clock.fastForward(61000);
    await expect(page.getByRole('heading',{name:'Solar report just published'}).first()).toBeVisible();
  });
}

test('World worker report is visible in Live with its date and real photo', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('news-location','ng'));
  await page.route('**/api/session', handler => handler.fulfill({json:{authenticated:true,username:'Reader'}}));
  await photoFixture(page);
  const published = '2026-11-06T09:15:00Z';
  const story = {id:903,title:'World solar report from the worker',description:'Source grounded reporting.',location:'world',published_at:published,categories:[{id:1,name:'Energy'}],source:{name:'Publisher'}};
  await page.route('http://news-api.test/api/**', handler => handler.fulfill({json:{results:[],count:0}}));
  await page.route('**/api/reader/live/**', handler => {
    const location = new URL(handler.request().url()).searchParams.get('location');
    return handler.fulfill({json:{results:location === 'world' ? [story] : [],count:location === 'world' ? 1 : 0}});
  });
  await page.goto('/live');
  const card = page.locator('article').filter({has:page.getByRole('heading',{name:story.title})});
  await expect(card).toBeVisible();
  await expect(card.locator('time')).toHaveAttribute('datetime',published);
  await expect(card.locator('time')).not.toBeEmpty();
  await expect(card.locator('img')).toBeVisible();
  await page.getByLabel('Edition',{exact:true}).selectOption('local');
  await expect(page.getByRole('heading',{name:story.title})).toHaveCount(0);
  await page.getByLabel('Edition',{exact:true}).selectOption('all');
  await expect(page.getByRole('heading',{name:story.title})).toBeVisible();
});
