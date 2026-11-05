import test from 'node:test';
import assert from 'node:assert/strict';
import {messages} from '../src/i18n/messages.js';
import {translate,LANGUAGES,isLocale} from '../src/i18n/core.js';
import {LEVELS,ACTS} from '../src/chapter/levels.js';
import {TOPOLOGY_LEVELS,TOPOLOGY_ACTS} from '../src/topology/levels.js';
const han=/[\u3400-\u9fff]/;
test('every source message has three complete translations with the same parameters',()=>{
 const keys=new Set();for(const row of messages){assert.equal(row.length,4);assert(!keys.has(row[0]),row[0]);keys.add(row[0]);const params=s=>[...s.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort();for(const cell of row.slice(1)){assert(cell.trim());assert.deepEqual(params(cell),params(row[0]),row[0]);}}
});
test('all authored level and act text is registered, including phases and mathematical principles',()=>{
 const keys=new Set(messages.map(row=>row[0]));function walk(value){if(typeof value==='string'&&han.test(value)){assert(keys.has(value),value);for(const locale of ['en','ko','fr','de','es','pt-BR'])assert(!han.test(translate(value,locale)),value);}else if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')Object.values(value).forEach(walk);}
 walk([LEVELS,ACTS,TOPOLOGY_LEVELS,TOPOLOGY_ACTS]);
});
test('dynamic feedback translates nested messages, parameters and mathematical notation',()=>{
 assert.equal(translate('完成 6 次绕行；行走与同伦证据均已验证。','en'),'Completed 6 loops. Journey and homotopy certificates are verified.');
 assert.equal(translate('已构造 3 条内部点不交路径。','en'),'Constructed 3 internally vertex-disjoint paths.');
 assert.equal(translate('增广 1 单位，包含反向撤回。','en'),'Added 1 to the flow, including reverse cancellation.');
 assert.equal(translate('见证点尚未按序齐备：2 / 3。','ko'),'증거 지점을 아직 순서대로 방문하지 못했습니다: 2 / 3.');
 assert.equal(translate('Ⅰ · 展开的空间','en'),'Ⅰ · Unwound space');
 assert.equal(translate('抵达Ⅱ层。','ja'),'Ⅱ層に到着。');
});
test('translating already localized UI is stable and Chinese remains exact',()=>{for(const row of messages){assert.equal(translate(row[0],'zh-CN'),row[0]);for(const locale of LANGUAGES.filter(l=>l.id!=='zh-CN').map(l=>l.id))assert.equal(translate(translate(row[0],locale),locale),translate(row[0],locale),row[0]);}});
test('localization preserves formulas, numbers, React values and unsupported locales',()=>{
 const element={type:'button',props:{children:'原理手记'}};assert.equal(translate(element,'en'),element);assert.equal(translate(false,'ja'),false);assert.equal(translate(0,'ko'),0);assert.deepEqual(translate(['e','a · b · a⁻¹',3],'en'),['e','a · b · a⁻¹',3]);assert.equal(translate('原理手记','xx'),'原理手记');assert.deepEqual(LANGUAGES.map(l=>l.id),['zh-CN','zh-TW','en','ja','ko','fr','de','es','pt-BR']);assert(isLocale('ja'));assert(!isLocale('en-US'));
});


test('every expanded locale covers the full catalog and preserves template parameters',()=>{
 const parameters=value=>[...value.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort();
 for(const row of messages)for(const locale of ['zh-TW','fr','de','es','pt-BR']){const result=translate(row[0],locale);assert(result.trim(),`${locale}/${row[0]}`);assert.deepEqual(parameters(result),parameters(row[0]),`${locale}/${row[0]}`);if(locale!=='zh-TW')assert(!han.test(result),`${locale}/${row[0]}`);}
});
