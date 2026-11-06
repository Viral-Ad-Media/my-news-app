const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(fetch) {
  const exports={};const events={};
  const code=ts.transpileModule(fs.readFileSync('src/lib/shared-json.js','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,fetch,AbortSignal,window:{addEventListener:(name,handler)=>events[name]=handler}});
  return {...exports,events};
}
test('concurrent readers share one request, variants remain separate, and session changes clear data',async()=>{
  let calls=0;
  const api=load(async()=>{calls++;return {ok:true,json:async()=>({id:calls})};});
  const a=api.sharedJSON('/news?location=ng');const b=api.sharedJSON('/news?location=ng');
  assert.equal(a,b);await Promise.all([a,b]);assert.equal(calls,1);
  await api.sharedJSON('/news?location=ng');assert.equal(calls,1);
  await api.sharedJSON('/news?location=us');assert.equal(calls,2);
  api.events['news-session']();await api.sharedJSON('/news?location=ng');assert.equal(calls,3);
});
test('private responses do not persist and failed requests can recover',async()=>{
  let calls=0;
  const api=load(async()=>({ok:++calls!==1,status:503,json:async()=>({id:calls})}));
  await assert.rejects(api.sharedJSON('/feed',{privateFeed:true}));
  await api.sharedJSON('/feed',{privateFeed:true});await api.sharedJSON('/feed',{privateFeed:true});
  assert.equal(calls,3);
});
test('docs-only builds skip documentation and always build code or mixed changes',()=>{
 const {documentationOnly}=require('../scripts/ignore-docs-build.cjs');
 assert.equal(documentationOnly(['README.md','docs/usage.md']),true);
 for(const files of [[],['src/app/page.js'],['README.md','package-lock.json'],['scripts/release.md']]) assert.equal(documentationOnly(files),false);
});
