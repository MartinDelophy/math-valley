import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync} from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url),args=process.argv.slice(2),index=args.indexOf('--executable');
const packaged=index!==-1,executable=packaged?path.resolve(args[index+1]):require('../desktop/node_modules/electron');
const output=path.resolve(`release/smoke-${process.platform}-${process.arch}`);mkdirSync(output,{recursive:true});
const profile=mkdtempSync(path.join(output,'profile-'));
for(const phase of ['create','verify']){
 const env={...process.env,MATH_VALLEY_DESKTOP_SMOKE:'1',MATH_VALLEY_SMOKE_PROFILE:profile,MATH_VALLEY_SMOKE_OUTPUT:output,MATH_VALLEY_SMOKE_PHASE:phase};delete env.ELECTRON_RUN_AS_NODE;
 const result=spawnSync(executable,packaged?[]:[path.resolve('desktop')],{env,encoding:'utf8',timeout:70000});
 process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
 if(/GL_INVALID_(VALUE|OPERATION)|Scene initialization failed|Opening scene unavailable/.test(result.stderr||''))throw Error('Native renderer reported a GPU or scene initialization error');
}
console.log(`Desktop smoke passed. Evidence: ${output}`);
