const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function originCheck(env) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/server-api.js', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, process: { env }, URL,
    require: name => name === 'server-only' ? {} : name === 'next/headers' ? {} : { buildApiUrl: () => '' },
  });
  return (url, headers) => exports.sameOrigin(new Request(url, { headers }));
}
test('Vercel accepts the actual HTTPS destination host when its request URL is internal', () => {
  const check = originCheck({ NODE_ENV: 'production', VERCEL: '1' });
  assert.equal(check('http://localhost:3000/api/admin/settings', { host: 'reader.vercel.app', origin: 'https://reader.vercel.app' }), true);
  assert.equal(check('http://localhost:3000/api/admin/settings', { host: 'reader.vercel.app', origin: 'https://evil.test', 'x-forwarded-host': 'evil.test' }), false);
  assert.equal(check('https://reader.vercel.app/api/admin/settings', { host: 'reader.vercel.app' }), false);
  assert.equal(check('http://localhost:3000/api/admin/settings', { host: 'reader.vercel.app', origin: 'http://reader.vercel.app' }), false);
});
test('production outside Vercel keeps strict request origin comparison', () => {
  const check = originCheck({ NODE_ENV: 'production' });
  assert.equal(check('https://reader.test/api/session', { origin: 'https://reader.test' }), true);
  assert.equal(check('http://localhost:3000/api/session', { host: 'reader.test', origin: 'https://reader.test' }), false);
});
