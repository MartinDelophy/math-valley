const {app,BrowserWindow,Menu,protocol,session,shell,dialog} = require('electron');
const path = require('node:path');
const {ORIGIN,isAppURL,assetResponse} = require('./protocol.cjs');
const APP_NAME = 'Math Valley';
const LINKS = new Set(['https://math-valley.vercel.app/','https://github.com/MartinDelophy/math-valley/releases','https://github.com/MartinDelophy/math-valley/issues']);
protocol.registerSchemesAsPrivileged([{scheme:'math-valley',privileges:{standard:true,secure:true,supportFetchAPI:true,codeCache:true}}]);
function registerContent() {
  const root = app.isPackaged ? path.join(process.resourcesPath,'web') : path.resolve(__dirname,'../dist/client');
  protocol.handle('math-valley',request=>assetResponse(root,request));
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_contents,_permission,reply)=>reply(false));
  ses.setPermissionCheckHandler(()=>false);
  ses.webRequest.onBeforeRequest((details,reply)=>reply({cancel:!isAppURL(details.url) && !details.url.startsWith('data:') && !details.url.startsWith('blob:')}));
}
function openLink(url) { if (LINKS.has(url)) shell.openExternal(url); }
function createWindow({show=true,backgroundThrottling=true}={}) {
  const win = new BrowserWindow({width:1440,height:900,minWidth:800,minHeight:600,show:false,title:APP_NAME,backgroundColor:'#35264f',autoHideMenuBar:process.platform!=='darwin',webPreferences:{backgroundThrottling,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,webviewTag:false}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{if(!isAppURL(url))event.preventDefault();});
  win.webContents.on('will-redirect',(event,url)=>{if(!isAppURL(url))event.preventDefault();});
  win.webContents.on('will-attach-webview',event=>event.preventDefault());
  if(show)win.once('ready-to-show',()=>win.show());
  win.loadURL(ORIGIN+'/').catch(error=>{console.error('Unable to load Math Valley:',error);if(show)dialog.showErrorBox(APP_NAME,'The bundled game could not be loaded. Please reinstall Math Valley.');});
  return win;
}
function setMenu() {
  const mac = process.platform==='darwin';
  const template = [
    ...(mac?[{label:APP_NAME,submenu:[{role:'about'},{type:'separator'},{role:'services'},{type:'separator'},{role:'hide'},{role:'hideOthers'},{role:'unhide'},{type:'separator'},{role:'quit'}]}]:[]),
    {role:'fileMenu'}, {role:'editMenu'},
    {label:'View',submenu:[{role:'reload'},{type:'separator'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'togglefullscreen'}]},
    {role:'windowMenu'},
    {role:'help',submenu:[{label:'Online game',click:()=>openLink('https://math-valley.vercel.app/')},{label:'Releases',click:()=>openLink('https://github.com/MartinDelophy/math-valley/releases')},{label:'Report an issue',click:()=>openLink('https://github.com/MartinDelophy/math-valley/issues')}]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
function boot() {
  app.setName(APP_NAME);
  app.setPath('userData',path.join(app.getPath('appData'),APP_NAME));
  if(!app.requestSingleInstanceLock()){app.quit();return;}
  app.on('second-instance',()=>{const win=BrowserWindow.getAllWindows()[0];if(win){if(win.isMinimized())win.restore();win.focus();}});
  app.whenReady().then(()=>{registerContent();setMenu();createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});});
  app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}
if(process.env.MATH_VALLEY_DESKTOP_SMOKE==='1')require('./smoke.cjs').run({registerContent,createWindow});else boot();
module.exports={registerContent,createWindow};
