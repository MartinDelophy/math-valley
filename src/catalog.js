import { LEVELS as FIRST,ACTS as FIRST_ACTS } from './chapter/levels.js';
import { TOPOLOGY_LEVELS,TOPOLOGY_ACTS } from './topology/levels.js';
export const LEVELS=[...FIRST,...TOPOLOGY_LEVELS];
export const CHAPTERS=[{id:1,title:'第一章 · 桥与连通',start:0,count:16,perPage:4,acts:FIRST_ACTS},{id:2,title:'第二章 · 回环之塔',start:16,count:12,perPage:3,acts:TOPOLOGY_ACTS}];
export const chapterFor=index=>CHAPTERS[index>=16?1:0];
