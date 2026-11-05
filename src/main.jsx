import React from "react";
import { createRoot } from "react-dom/client";
import { JourneyApp } from "./JourneyApp.jsx";
import "./styles.css";
import {saves} from './storage/index';
import {hydrateSettings} from './settings/store';
import {setLocale,t} from './i18n/react';

const root=createRoot(document.getElementById('root'));
root.render(<div className="save-loading" role="status">{t('正在读取本机存档…')}</div>);
saves.init().then(profile=>{
 setLocale(profile.locale);
 hydrateSettings();
 root.render(<React.StrictMode><JourneyApp/></React.StrictMode>);
});
