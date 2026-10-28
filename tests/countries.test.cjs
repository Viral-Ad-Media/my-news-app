const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const result = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/countries.js', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, { exports: result });
test('country editions support global choices and precise country matches', () => {
  assert.equal(result.COUNTRIES.length, 61);
  assert.equal(result.normalizeCountry('UK'), 'gb');
  assert.equal(result.articleMatchesCountry({ location: 'russia' }, 'us'), false);
  assert.equal(result.articleMatchesCountry({ location: 'world' }, 'gb'), false);
  assert.equal(result.articleMatchesCountry({ location: 'ng, us' }, 'us'), true);
  assert.equal(result.articleMatchesCountry({ location: 'United States' }, 'us'), true);
});
test('browser hints select an edition without assuming Nigeria for unknown visitors', () => {
  assert.equal(result.inferBrowserCountry('America/Chicago', 'en'), 'us');
  assert.equal(result.inferBrowserCountry('Europe/London', 'en-US'), 'gb');
  assert.equal(result.inferBrowserCountry('unknown', 'fr-CA'), 'ca');
  assert.equal(result.inferBrowserCountry('unknown', 'en'), '');
});
