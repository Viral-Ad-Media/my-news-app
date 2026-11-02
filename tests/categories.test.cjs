const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const result = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/categories.js', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, { exports: result });

test('public category links use saved names and stable IDs, including custom and legacy topics', () => {
  assert.equal(result.categoryLinks([]).length, 0);
  const links = result.categoryLinks([{ id: 4, name: 'Gaming' }, { id: 9, name: 'Housing' }]);
  assert.equal(links.length, 2);
  assert.equal(links[0].name, 'Gaming');
  assert.equal(links[0].href, '/categories/4');
  assert.equal(links[1].name, 'Housing');
  assert.equal(links[1].href, '/categories/9');
});
