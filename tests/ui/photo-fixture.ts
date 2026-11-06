import type { Page } from '@playwright/test';
import path from 'node:path';

export async function photoFixture(page: Page) {
  const files: Record<string,string> = {'1':'energy','2':'business','3':'health','4':'sport','5':'education','6':'world','205':'refinery','8801':'sport','8802':'sport','8803':'world','8804':'health'};
  await page.route('**/api/reader/article-photos/*', route => {
    const id = new URL(route.request().url()).pathname.split('/').pop()!;
    return route.fulfill({json:{image_url:`http://127.0.0.1:3210/test-photos/${id}.webp`,image_alt:'Relevant topic photograph',image_origin:'topic',image_credit:'Test photographer · test licence',image_reference_url:'https://example.org/photo-licence'}});
  });
  await page.route('**/test-photos/*.webp', route => {
    const id = new URL(route.request().url()).pathname.split('/').pop()!.replace('.webp','');
    return route.fulfill({path:path.join(process.cwd(),'public/images/editorial',`${files[id] || 'energy'}.webp`),contentType:'image/webp'});
  });
}
