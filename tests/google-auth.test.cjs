const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextResponse } = require('next/server');

function fixture(env = {}) {
  const cookies = new Map();
  const calls = [];
  let responses = [];
  const processMock = { env: { NODE_ENV: 'production', GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_REDIRECT_URI: 'https://reader.test/api/auth/google/callback', ...env } };
  const load = (path, overrides = {}) => {
    const module = { exports: {} };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
      exports: module.exports, process: processMock, Buffer, URL, URLSearchParams, AbortSignal,
      fetch: async (url, options) => { calls.push({ url, options }); return responses.shift(); },
      require: name => {
        if (Object.hasOwn(overrides, name)) return overrides[name];
        if (name === 'server-only') return {};
        if (name === 'next/server') return { NextResponse };
        if (name === 'next/headers') return { cookies: async () => ({ get: key => cookies.has(key) ? { value: cookies.get(key) } : undefined }) };
        return require(name);
      },
    }, { filename: path });
    return module.exports;
  };
  const helper = load('src/lib/google-auth.js');
  const server = load('src/lib/server-api.js', { './api': { buildApiUrl: path => `https://api.test/api${path}` } });
  const start = load('src/app/api/auth/google/route.js', { '../../../../lib/google-auth': helper });
  const callback = load('src/app/api/auth/google/callback/route.js', { '../../../../../lib/google-auth': helper, '../../../../../lib/server-api': server });
  const begin = async () => {
    const result = await start.GET(new Request('https://reader.test/api/auth/google?mode=signup&remember=1'));
    for (const cookie of result.cookies.getAll()) cookies.set(cookie.name, cookie.value);
    return result;
  };
  return { helper, start, callback, begin, cookies, calls, respond: items => { responses = items; } };
}

test('Google authorization uses state, PKCE, limited scopes, and private cookies', async () => {
  const f = fixture();
  const result = await f.begin();
  const destination = new URL(result.headers.get('location'));
  assert.equal(destination.origin, 'https://accounts.google.com');
  assert.equal(destination.searchParams.get('scope'), 'openid email profile');
  assert.equal(destination.searchParams.get('code_challenge_method'), 'S256');
  assert.ok(destination.searchParams.get('state'));
  assert.equal(destination.searchParams.get('client_secret'), null);
  for (const cookie of result.cookies.getAll()) {
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, 'lax');
    assert.equal(cookie.maxAge, 600);
  }
});

test('missing credentials return to the originating account page', async () => {
  const f = fixture({ GOOGLE_CLIENT_SECRET: '' });
  const result = await f.begin();
  assert.match(result.headers.get('location'), /\/signup\?google_error=unavailable$/);
});

test('invalid state never exchanges a code or creates a reader session', async () => {
  const f = fixture();
  await f.begin();
  const result = await f.callback.GET(new Request('https://reader.test/api/auth/google/callback?state=invalid&code=code'));
  assert.match(result.headers.get('location'), /google_error=expired/);
  assert.equal(f.calls.length, 0);
  assert.equal(result.cookies.get('news_access'), undefined);
});

test('Google cancellation clears temporary cookies', async () => {
  const f = fixture(); await f.begin();
  const state = f.cookies.get(f.helper.GOOGLE_STATE_COOKIE);
  const result = await f.callback.GET(new Request(`https://reader.test/api/auth/google/callback?state=${state}&error=access_denied`));
  assert.match(result.headers.get('location'), /google_error=cancelled/);
  assert.equal(result.cookies.get(f.helper.GOOGLE_STATE_COOKIE).maxAge, 0);
  assert.equal(f.calls.length, 0);
});

test('successful callback exchanges tokens server-side and establishes HttpOnly JWT cookies', async () => {
  const f = fixture(); await f.begin();
  f.respond([
    { ok: true, json: async () => ({ access_token: 'google-access', id_token: 'google-identity' }) },
    { ok: true, json: async () => ({ access: 'reader-access', refresh: 'reader-refresh', user: { username: 'reader' } }) },
  ]);
  const state = f.cookies.get(f.helper.GOOGLE_STATE_COOKIE);
  const result = await f.callback.GET(new Request(`https://reader.test/api/auth/google/callback?state=${state}&code=code`));
  assert.equal(result.headers.get('location'), 'https://reader.test/dashboard');
  assert.equal(f.calls.length, 2);
  assert.ok(f.calls[0].options.body.get('code_verifier'));
  assert.deepEqual(JSON.parse(f.calls[1].options.body), { access_token: 'google-access', id_token: 'google-identity' });
  assert.equal(result.cookies.get('news_access').value, 'reader-access');
  assert.equal(result.cookies.get('news_access').httpOnly, true);
  assert.equal(result.cookies.get('news_refresh').maxAge, 30 * 86400);
  assert.equal(result.cookies.get(f.helper.GOOGLE_STATE_COOKIE).maxAge, 0);
  assert.equal(result.headers.get('Cache-Control'), 'private, no-store');
});

test('rejected backend identity never sets reader cookies', async () => {
  const f = fixture(); await f.begin();
  f.respond([
    { ok: true, json: async () => ({ access_token: 'google-access', id_token: 'google-identity' }) },
    { ok: false, status: 400 },
  ]);
  const state = f.cookies.get(f.helper.GOOGLE_STATE_COOKIE);
  const result = await f.callback.GET(new Request(`https://reader.test/api/auth/google/callback?state=${state}&code=code`));
  assert.match(result.headers.get('location'), /google_error=failed/);
  assert.equal(result.cookies.get('news_access'), undefined);
});
