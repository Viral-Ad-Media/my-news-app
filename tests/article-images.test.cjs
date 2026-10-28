const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
const code = ts.transpileModule(fs.readFileSync('src/lib/api.js', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
vm.runInNewContext(code, { exports: exportsObject, process: { env: { NEXT_PUBLIC_API_URL: 'https://api.test' } } });
const { getArticleImageCandidates, getArticleImageUrl, getArticleFallbackImage, isPlaceholderImage } = exportsObject;

test('source images precede photographic fallbacks and placeholder URLs are excluded', () => {
  const article = { title: 'Solar power', image_url: '/images/Placeholder.webp', remote_image_url: 'https://publisher.test/photo.jpg', image: '/media/upload.jpg' };
  assert.equal(getArticleImageUrl(article), article.remote_image_url);
  assert.deepEqual(Array.from(getArticleImageCandidates(article)), [article.remote_image_url, 'https://api.test/media/upload.jpg']);
  assert.equal(getArticleImageUrl({ title: 'Latest health news' }), '/images/editorial/health.webp');
});

test('every topic fallback is a real, bundled WebP photograph', () => {
  for (const title of ['Solar energy', 'Health services', 'Football', 'Education', 'Software technology', 'Banking markets', 'Urban housing', 'Other reporting']) {
    const filename = getArticleFallbackImage({ title });
    const data = fs.readFileSync(`public${filename}`);
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    assert.ok(data.length > 10000);
  }
});


test('generated title cards are rejected while genuine source photographs remain eligible', () => {
  const base = 'https://res.cloudinary.com/dz58pgz41/image/upload/v1792483615/abokinews/starter/';
  for (const id of [2, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
    assert.equal(isPlaceholderImage(`${base}story-${id}.webp`), true);
    assert.equal(isPlaceholderImage(`${base}story-${id}`), true);
  }
  assert.equal(isPlaceholderImage(`${base}story-4.webp`), false);
  const article = { title: 'Dangote Refinery begins direct aviation jet-fuel supply', remote_image_url: `${base}story-13.webp`, image: 'abokinews/starter/story-13' };
  assert.equal(getArticleImageUrl(article), '/images/editorial/refinery.webp');
});
