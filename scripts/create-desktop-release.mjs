import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const {version}=JSON.parse(await readFile(new URL('../desktop/package.json',import.meta.url)));
const tag=process.env.RELEASE_TAG || `v${version}`;
const source=process.env.SOURCE_SHA,repo=process.env.GITHUB_REPOSITORY;
if(!/^[a-f0-9]{40}$/.test(source||'')||!repo)throw Error('Release source SHA and repository are required');
if(tag!==`v${version}`)throw Error('Release tag does not match desktop version');
const files=(await readdir('release')).filter(name=>/\.(dmg|zip|exe)$/.test(name)).sort();
for(const expected of ['mac-arm64.dmg','mac-x64.dmg','windows-x64-setup.exe','windows-x64-portable.exe'])if(!files.some(file=>file.endsWith(expected)))throw Error(`Missing artifact: ${expected}`);
const sums=await Promise.all(files.map(async name=>`${createHash('sha256').update(await readFile(`release/${name}`)).digest('hex')}  ${name}`));
await writeFile('release/SHA256SUMS.txt',sums.join('\n')+'\n');
const notes=await readFile('docs/desktop-release-notes.md','utf8');
await writeFile('release/notes.md',notes);
let reference;
try{reference=JSON.parse(execFileSync('gh',['api',`repos/${repo}/git/ref/tags/${tag}`],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));}catch{
 reference=JSON.parse(execFileSync('gh',['api',`repos/${repo}/git/refs`,'-f',`ref=refs/tags/${tag}`,'-f',`sha=${source}`],{encoding:'utf8'}));
}
let object=reference.object;
while(object.type==='tag')object=JSON.parse(execFileSync('gh',['api',`repos/${repo}/git/tags/${object.sha}`],{encoding:'utf8'})).object;
if(object.sha!==source)throw Error('Existing tag points at another commit; tags are never overwritten');
let release;
try{release=JSON.parse(execFileSync('gh',['release','view',tag,'--json','isDraft'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));}catch{
 execFileSync('gh',['release','create',tag,'--verify-tag','--draft','--prerelease','--title',`Math Valley ${version} · Desktop beta`,'--notes-file','release/notes.md'],{stdio:'inherit'});
 release={isDraft:true};
}
if(!release.isDraft)throw Error('Refusing to replace assets of a published release');
execFileSync('gh',['release','upload',tag,...files.map(file=>`release/${file}`),'release/SHA256SUMS.txt','--clobber'],{stdio:'inherit'});
