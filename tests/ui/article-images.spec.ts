import { test, expect } from '@playwright/test';

const stories = [
  {id:8801,title:'Football fixture report one',categories:[{id:1,name:'Sports'}]},
  {id:8802,title:'Football fixture report two',categories:[{id:1,name:'Sports'}],image_url:'/images/editorial/sport.webp'},
  {id:8803,title:'Film festival fixture report',categories:[{id:2,name:'Entertainment'}]},
  {id:8804,title:'Hospital fixture report',categories:[{id:3,name:'Health'}],remote_image_url:'https://images.test/broken.jpg'},
  {id:8805,title:'Source photo fixture report',categories:[{id:1,name:'Sports'}],remote_image_url:'https://images.test/report.jpg'},
].map(story=>({...story,description:'Image fallback browser fixture.',location:'ng',published_at:'2026-11-03T12:00:00Z',source:{name:'Test publisher'}}));

test('missing, failed and legacy shared photos become distinct topic illustrations while source photos remain',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('news-location','ng'));
  await page.route('**/api/edition',route=>route.fulfill({json:{country:'ng'}}));
  await page.route('http://news-api.test/api/**',route=>route.fulfill({json:{results:route.request().url().includes('categories')?[]:stories,count:stories.length}}));
  await page.route('**/api/session',route=>route.fulfill({json:{authenticated:false}}));
  await page.route('**/api/reader/**',route=>route.fulfill({json:{saved_ids:[]}}));
  await page.route('https://images.test/broken.jpg',route=>route.abort());
  await page.route('https://images.test/report.jpg',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')}));
  await page.goto('/search?q=fixture');
  const list=page.locator('.news-list');
  const illustrations=list.locator('img[src*="/api/news-illustration?"]');
  await expect(illustrations).toHaveCount(4);
  const urls=await illustrations.evaluateAll(images=>images.map(image=>(image as HTMLImageElement).src));
  expect(new Set(urls).size).toBe(4);
  expect(urls.filter(url=>new URL(url).searchParams.get('topic')==='sport')).toHaveLength(2);
  expect(urls.some(url=>new URL(url).searchParams.get('topic')==='entertainment')).toBe(true);
  expect(urls.some(url=>new URL(url).searchParams.get('topic')==='health')).toBe(true);
  await expect(list.locator('img[src="https://images.test/report.jpg"]')).toHaveCount(1);
  await expect(list.locator('img[src*="/images/editorial/"]')).toHaveCount(0);
  for(let i=0;i<4;i++) {
    await illustrations.nth(i).scrollIntoViewIfNeeded();
    await expect(illustrations.nth(i)).toHaveJSProperty('naturalWidth',640);
    const response=await page.request.get(urls[i]);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg+xml');
    expect(response.headers()['content-security-policy']).toContain('sandbox');
  }
  await page.setViewportSize({width:390,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/distinct-topic-illustrations.png',fullPage:true});
});
