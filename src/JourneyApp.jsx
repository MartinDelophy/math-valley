import {useState} from 'react';
import {App} from './App';
import {StartScreen} from './opening/StartScreen';
import {saves} from './storage/index';
export function JourneyApp(){
 const [playing,setPlaying]=useState(false),[ready,setReady]=useState(false),[,refresh]=useState(0);
 async function enter(){await saves.flush();if(saves.isStale()){refresh(n=>n+1);return false;}setReady(true);return true;}
 async function begin(){if(!await saves.startNewJourney()){refresh(n=>n+1);return false;}setReady(true);return true;}
 async function restore(id){if(!await saves.restoreJourney(id)){refresh(n=>n+1);return false;}setReady(true);return true;}
 async function home(){await saves.flush();setPlaying(false);setReady(false);}
 return <><div className="journey-stage" inert={!playing} aria-hidden={!playing}>{ready&&<App key={saves.profile().journeyId} active={playing} onHome={home}/>}</div>{!playing&&<StartScreen profile={saves.profile()} hasJourney={saves.hasJourney()} archives={saves.archives()} isStale={saves.isStale()} onContinue={enter} onNew={begin} onRestore={restore} onEntered={()=>setPlaying(true)}/>}</>;
}
