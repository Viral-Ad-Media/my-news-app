const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(path) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { fileName: path.replace(/\.js$/, '.jsx'), compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require, URL, process: { env: { NEXT_PUBLIC_SITE_URL: 'https://news.test' } } });
  return exports;
}

test('comparison tables render safely and only registered affiliate links are sponsored', () => {
  const { default: ArticleBody } = load('src/components/ArticleBody.js');
  const html = renderToStaticMarkup(React.createElement(ArticleBody, {
    content: '| Option | Detail |\n| --- | --- |\n| Example | <script>alert(1)</script> |\n\n[Product](https://example.org/product) and [Evidence](https://example.org/evidence)',
    affiliateLinks: ['https://example.org/product'],
  }));
  assert.match(html, /<table/);
  assert.match(html, /scope="col"/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /href="https:\/\/example.org\/product" rel="sponsored nofollow noopener"/);
  assert.match(html, /href="https:\/\/example.org\/evidence" class=/);
});

test('news keeps its original numeric URL and uses source-based metadata', () => {
  const { articleSeo, articleStructuredData } = load('src/lib/seo.js');
  const article = { id: 7, title: 'A short news headline', description: 'Source summary.', content: 'Short source text.', author: 'Publisher byline', published_at: '2026-10-20T00:00:00Z', schema_type: 'NewsArticle', seo_title: 'A short news headline', seo_description: 'Source summary.' };
  assert.equal(articleSeo(article).canonical, 'https://news.test/news/7');
  const schema = articleStructuredData(article);
  assert.equal(schema['@type'], 'NewsArticle');
  assert.equal(schema.headline, article.title);
  assert.equal(schema.datePublished, article.published_at);
  assert.equal(schema.author.name, article.author);
});


test('source-based prepared articles credit the original report without presenting its reporter as the new article author', () => {
  const { articleStructuredData } = load('src/lib/seo.js');
  const schema = articleStructuredData({ id: 8, title: 'Source-based report', description: 'Unchanged summary.', content: 'Body', article_prepared: true, author: 'Original reporter', source: { name: 'Publisher' }, article_url: 'https://example.org/original', published_at: '2026-10-20T00:00:00Z' });
  assert.equal(schema.author.name, 'AbokiNews');
  assert.equal(schema.isBasedOn, 'https://example.org/original');
  assert.match(schema.creditText, /Original reporter/);
});
