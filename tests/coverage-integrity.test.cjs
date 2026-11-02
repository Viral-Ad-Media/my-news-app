const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
const code = ts.transpileModule(fs.readFileSync('src/lib/lopsided.js', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, { exports: exportsObject });
test('a single source never produces invented publishers or a three-source comparison', () => {
  const result = exportsObject.normalizeArticleCoverage({ id: 1, title: 'One source report', source: { name: 'An attributed publisher' }, total_sources: 30 });
  assert.equal(result.perspectives.length, 0);
  assert.equal(result.totalSources, 1);
});
test('explicit historical perspectives remain available without adding missing sides', () => {
  const result = exportsObject.normalizeArticleCoverage({ perspectives: [{ source: 'Publisher A', bucket: 'left', url: 'https://a.test/report' }] });
  assert.equal(result.perspectives.length, 1);
  assert.equal(result.perspectives[0].source, 'Publisher A');
  assert.equal(result.totalSources, 1);
});
