const path = require('node:path');
const fs = require('node:fs/promises');
const ORIGIN = 'math-valley://app';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'";
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ogg':'audio/ogg','.mp3':'audio/mpeg','.wav':'audio/wav'};
function isAppURL(value) {
  try { const url = new URL(value); return url.protocol === 'math-valley:' && url.hostname === 'app' && !url.port && !url.username && !url.password; } catch { return false; }
}
function assetPath(root, value) {
  if (!isAppURL(value)) return null;
  try {
    const pathname = decodeURIComponent(new URL(value).pathname);
    if (pathname.includes('\\') || pathname.includes('\0')) return null;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root, file);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative) ? file : null;
  } catch { return null; }
}
async function assetResponse(root, request) {
  const headers = {'Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'};
  if (!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{...headers,Allow:'GET, HEAD'}});
  const file = assetPath(root, request.url);
  if (!file) return new Response(null,{status:403,headers});
  try {
    const body = await fs.readFile(file);
    return new Response(request.method === 'HEAD' ? null : body,{headers:{...headers,'Content-Type':MIME[path.extname(file).toLowerCase()] || 'application/octet-stream','Content-Length':String(body.length)}});
  } catch { return new Response(null,{status:404,headers}); }
}
module.exports = {ORIGIN,CSP,isAppURL,assetPath,assetResponse};
