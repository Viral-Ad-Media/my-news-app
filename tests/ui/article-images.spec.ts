import { photoFixture } from './photo-fixture';
import { test, expect } from '@playwright/test';

const stories = [
  {id:8801,title:'Football fixture report one',categories:[{id:1,name:'Sports'}]},
  {id:8802,title:'Football fixture report two',categories:[{id:1,name:'Sports'}],image_url:'/images/editorial/sport.webp'},
  {id:8803,title:'Film festival fixture report',categories:[{id:2,name:'Entertainment'}]},
  {id:8804,title:'Hospital fixture report',categories:[{id:3,name:'Health'}],remote_image_url:'https://images.test/broken.jpg'},
  {id:8805,title:'Source photo fixture report',categories:[{id:1,name:'Sports'}],remote_image_url:'https://images.test/report.jpg'},
].map(story=>({...story,description:'Image fallback browser fixture.',location:'ng',published_at:'2026-11-03T12:00:00Z',source:{name:'Test publisher'}}));

test('missing, failed and legacy shared photos become distinct topic photographs while source photos remain',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('news-location','ng'));
  await page.route('**/api/edition',route=>route.fulfill({json:{country:'ng'}}));
  await page.route('http://news-api.test/api/**',route=>route.fulfill({json:{results:route.request().url().includes('categories')?[]:stories,count:stories.length}}));
  await page.route('**/api/session',route=>route.fulfill({json:{authenticated:false}}));
  await page.route('**/api/reader/**',route=>route.fulfill({json:{saved_ids:[]}}));
  await page.route('https://images.test/broken.jpg',route=>route.abort());
  await page.route('https://images.test/report.jpg',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')}));
  await photoFixture(page);
  await page.goto('/search?q=fixture');
  const list=page.locator('.news-list');
  const photos=list.locator('img[src*="/test-photos/"]');
  await expect(photos).toHaveCount(4);
  const urls=await photos.evaluateAll(images=>images.map(image=>(image as HTMLImageElement).src));
  expect(new Set(urls).size).toBe(4);
  await expect(list.getByText('Illustrative photo',{exact:true})).toHaveCount(4);
  await expect(list.locator('img[src="https://images.test/report.jpg"]')).toHaveCount(1);
  await expect(list.locator('img[src*="/images/editorial/"], img[src*="/api/news-illustration"]')).toHaveCount(0);
  for(let i=0;i<4;i++) {
    await photos.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(()=>photos.nth(i).evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.setViewportSize({width:390,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/distinct-topic-photos.png',fullPage:true});
});
