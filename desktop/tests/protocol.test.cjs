const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs/promises'),os=require('node:os');
const {ORIGIN,isAppURL,assetPath,assetResponse}=require('../protocol.cjs');
test('only the stable bundled origin is eligible for app navigation',()=>{
 assert(isAppURL(ORIGIN+'/'));assert(isAppURL(ORIGIN+'/#chapter'));
 for(const value of ['https://app/','file:///etc/passwd','math-valley://evil/','math-valley://app:80/','math-valley://user@app/','bad'])assert(!isAppURL(value),value);
});
test('encoded traversal and platform-specific paths cannot escape the web root',()=>{
 const root=path.resolve('/bundle/web');assert.equal(assetPath(root,ORIGIN+'/'),path.join(root,'index.html'));assert.equal(assetPath(root,ORIGIN+'/assets/a.png'),path.join(root,'assets/a.png'));
 for(const value of ['/..%2f..%2fsecret','/%5c..%5csecret','/assets/%00.js','/%XX','//evil/etc']){
  const result=assetPath(root,ORIGIN+value);assert(result===null||path.relative(root,result).startsWith('..')===false,value);
 }
 assert.equal(assetPath(root,ORIGIN+'/..%2f..%2fsecret'),null);assert.equal(assetPath(root,ORIGIN+'/%5c..%5csecret'),null);
});
test('local content has correct MIME and CSP, with explicit missing-file and method handling',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'math-valley-protocol-'));
 try{await fs.writeFile(path.join(root,'index.html'),'<main>Math Valley</main>');await fs.writeFile(path.join(root,'app.js'),'export {};');
 const response=await assetResponse(root,{url:ORIGIN+'/',method:'GET'});assert.equal(response.status,200);assert.match(await response.text(),/Math Valley/);assert.match(response.headers.get('Content-Security-Policy'),/script-src 'self'/);
 assert.match((await assetResponse(root,{url:ORIGIN+'/app.js',method:'GET'})).headers.get('Content-Type'),/javascript/);
 assert.equal((await assetResponse(root,{url:ORIGIN+'/',method:'HEAD'})).body,null);
 assert.equal((await assetResponse(root,{url:ORIGIN+'/missing.png',method:'GET'})).status,404);
 assert.equal((await assetResponse(root,{url:ORIGIN+'/',method:'POST'})).status,405);
 assert.equal((await assetResponse(root,{url:'file:///etc/passwd',method:'GET'})).status,403);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
