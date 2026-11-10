import {CONGRUENCE_LEVELS,CONGRUENCE_ACTS} from './number-theory/levels.js';
import {SYMMETRY_LEVELS,CODING_LEVELS,SYMMETRY_ACTS,CODING_ACTS} from './expansion/levels.js';
import { LEVELS as FIRST,ACTS as FIRST_ACTS } from './chapter/levels.js';
import { TOPOLOGY_LEVELS,TOPOLOGY_ACTS } from './topology/levels.js';
export const LEVELS=[...FIRST,...TOPOLOGY_LEVELS,...SYMMETRY_LEVELS,...CODING_LEVELS,...CONGRUENCE_LEVELS];
export const CHAPTERS=[{id:1,title:'第一章 · 桥与连通',start:0,count:16,perPage:4,acts:FIRST_ACTS},{id:2,title:'第二章 · 回环之塔',start:16,count:12,perPage:3,acts:TOPOLOGY_ACTS},{id:3,title:'第三章 · 对称之庭',start:28,count:8,perPage:2,acts:SYMMETRY_ACTS},{id:4,title:'第四章 · 回声信标',start:36,count:8,perPage:2,acts:CODING_ACTS},{id:5,title:'第五章 · 余数钟楼',start:LEVELS.length-CONGRUENCE_LEVELS.length,count:CONGRUENCE_LEVELS.length,perPage:1,acts:CONGRUENCE_ACTS}];
export const chapterFor=index=>CHAPTERS.find(c=>index>=c.start&&index<c.start+c.count)||CHAPTERS[0];
export const chapterTitle=level=>CHAPTERS.find(c=>c.id===level?.chapter)?.title||'第一章 · 桥与连通';
