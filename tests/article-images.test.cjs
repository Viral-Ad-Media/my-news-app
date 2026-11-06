const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, process: { env: { NEXT_PUBLIC_API_URL: 'https://api.test' } } });
  return exports;
}
const { getArticleImageCandidates, getArticleImageUrl, isPlaceholderImage } = load('src/lib/api.js');
test('publisher photos take priority and legacy generated cards are rejected', () => {
  const article = {id:1,title:'Solar power',image_url:'/images/Placeholder.webp',remote_image_url:'https://publisher.test/photo.jpg',image:'/media/upload.jpg'};
  assert.equal(getArticleImageUrl(article),article.remote_image_url);
  assert.deepEqual(Array.from(getArticleImageCandidates(article)),[article.remote_image_url,'https://api.test/media/upload.jpg']);
  for(const value of ['/images/editorial/health.webp','/api/news-illustration?story=1','/images/feature1.webp']) assert.equal(isPlaceholderImage(value),true);
});
test('missing photos are resolved by the photo service without invented image URLs', () => {
  assert.equal(getArticleImageUrl({id:5,title:'Hospital update'}),'');
  assert.equal(getArticleImageUrl({id:6,title:'Hospital update',remote_image_url:'https://publisher.test/report.jpg'}),'https://publisher.test/report.jpg');
});
test('title matching cannot substitute an unverified image', () => {
  assert.equal(getArticleImageUrl({id:12,title:'Oyedele calls for public listings of NNPC and NLNG'}),'');
});
