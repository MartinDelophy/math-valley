export const LANGUAGES=[
 {id:'zh-CN',label:'简体中文',family:'cjk'},
 {id:'zh-TW',label:'繁體中文',family:'cjk'},
 {id:'en',label:'English',family:'latin'},
 {id:'ja',label:'日本語',family:'cjk'},
 {id:'ko',label:'한국어',family:'cjk'},
 {id:'fr',label:'Français',family:'latin'},
 {id:'de',label:'Deutsch',family:'latin'},
 {id:'es',label:'Español',family:'latin'},
 {id:'pt-BR',label:'Português',family:'latin'}
];
export const isLocale=value=>LANGUAGES.some(language=>language.id===value);
