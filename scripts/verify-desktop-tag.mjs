import {readFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('../desktop/package.json',import.meta.url)));
const ref=process.env.RELEASE_REF||'';
if(ref.startsWith('refs/tags/')&&ref!==`refs/tags/v${version}`)throw Error(`Tag must be v${version}; received ${ref}`);
console.log(`Desktop version ${version} verified.`);
