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
const { getArticleImageCandidates, getArticleImageUrl, getArticleFallbackImage, getArticleImageTopic, isPlaceholderImage } = load('src/lib/api.js');
const { renderNewsIllustration } = load('src/lib/news-illustration.js');

test('source photographs precede unique illustrations and shared stock placeholders are rejected', () => {
  const article = { id:1, title:'Solar power', image_url:'/images/Placeholder.webp', remote_image_url:'https://publisher.test/photo.jpg', image:'/media/upload.jpg' };
  assert.equal(getArticleImageUrl(article), article.remote_image_url);
  assert.deepEqual(Array.from(getArticleImageCandidates(article)), [article.remote_image_url,'https://api.test/media/upload.jpg']);
  for(const value of ['/images/editorial/health.webp','https://site.test/images/editorial/world.webp','/images/feature1.webp']) assert.equal(isPlaceholderImage(value),true);
});

test('different stories never share a fallback URL, even with identical headlines and topics', () => {
  const urls = new Set();
  for(let id=1;id<=2000;id++) urls.add(getArticleFallbackImage({id,title:'Health services',categories:[{name:'Health'}]}));
  assert.equal(urls.size,2000);
  assert.equal(getArticleFallbackImage({id:7,title:'Football'}),getArticleFallbackImage({id:7,title:'Football'}));
  assert.notEqual(getArticleFallbackImage({title:'Same headline',article_url:'https://publisher.test/first'}),getArticleFallbackImage({title:'Same headline',article_url:'https://publisher.test/second'}));
});

test('saved categories determine the illustration topic before incidental headline words', () => {
  for(const topic of ['Sports','Entertainment','Culture','Health','Science','Technology','Finance','Business','Education','Environment','Politics','Travel','Lifestyle','World','Local']) {
    const expected=topic==='Sports' ? 'sport' : topic.toLowerCase();
    assert.equal(getArticleImageTopic({title:'Global market stories',categories:[{name:topic}]}),expected);
  }
  assert.equal(getArticleImageTopic({title:'Football transfer announced'}),'sport');
  assert.equal(getArticleImageTopic({title:'Unclassified report'}),'news');
});

test('topic illustrations are distinct and escape all supplied story text', () => {
  const original = {story:'article-1',topic:'sport',title:'Football <script>alert("bad")</script>'};
  const first=renderNewsIllustration(original);
  assert.notEqual(first,renderNewsIllustration({...original,story:'article-2'}));
  assert.match(first,/sport topic illustration/i);
  assert.match(first,/Illustration, not an event photograph/);
  assert.ok(!first.includes('<script>'));
  assert.ok(!first.includes('<foreignObject'));
  assert.ok(!first.includes('<image'));
  assert.match(first,/&lt;script&gt;/);
  assert.match(renderNewsIllustration({...original,topic:'<script>'}),/NEWS · TOPIC ILLUSTRATION/);
});

test('legacy generated stock/title cards are replaced while genuine source photographs remain eligible', () => {
  const base='https://res.cloudinary.com/dz58pgz41/image/upload/v1792483615/abokinews/starter/';
  for(const id of [2,11,12,13,14,15,16,17,18,19,20]) assert.equal(isPlaceholderImage(`${base}story-${id}.webp`),true);
  assert.equal(isPlaceholderImage(`${base}story-4.webp`),false);
  const image=getArticleImageUrl({id:13,title:'Refinery begins jet-fuel supply',remote_image_url:`${base}story-13.webp`});
  assert.match(image,/^\/api\/news-illustration\?story=article-13&topic=business&/);
});
