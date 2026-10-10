'use client';
import { useEffect, useRef, useState } from 'react';
import { Snowflake, Wind, Pause, Play, RotateCcw, Move, Orbit } from 'lucide-react';
import type { WinterScene } from './winter-scene';
export default function Home() {
 const mount=useRef<HTMLDivElement>(null),engine=useRef<WinterScene|null>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[wind,setWind]=useState(55),[snow,setSnow]=useState(65),[paused,setPaused]=useState(false),[orbit,setOrbit]=useState(false);
 useEffect(()=>{let cancelled=false;import('./winter-scene').then(({createWinterScene})=>{if(cancelled||!mount.current)return;try{engine.current=createWinterScene(mount.current);setReady(true);}catch{setError('This 3D scene needs WebGL. Try enabling hardware acceleration or opening this page in another browser.');}}).catch(()=>setError('The scene could not load. Please refresh to try again.'));return()=>{cancelled=true;engine.current?.dispose();engine.current=null;};},[]);
 useEffect(()=>{engine.current?.configure({wind:wind/100,snow:snow/100,paused,orbit});},[wind,snow,paused,orbit,ready]);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)setPaused(true);
  const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>void|Promise<void>}}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  try{void Promise.resolve(context.registerTool({name:'configure_winter_scene',description:'Adjust wind and snowfall percentages or pause the Winter Grove animation.',inputSchema:{type:'object',properties:{wind:{type:'number',minimum:0,maximum:100},snow:{type:'number',minimum:0,maximum:100},paused:{type:'boolean'}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:unknown)=>{
   if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a settings object.');
   const data=input as Record<string,unknown>;
   for(const [key,value] of Object.entries(data)){if(!['wind','snow','paused'].includes(key))throw new Error('Unknown setting.');if(key==='paused'?typeof value!=='boolean':typeof value!=='number'||!Number.isFinite(value)||value<0||value>100)throw new Error('Use percentages from 0 to 100 and a boolean pause value.');}
   if(data.wind!==undefined)setWind(data.wind as number);if(data.snow!==undefined)setSnow(data.snow as number);if(data.paused!==undefined)setPaused(data.paused as boolean);
   return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve({applied:data}))));
  }},{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser API. */}
  return()=>lifecycle.abort();
 },[]);
 return <main><div className="world" ref={mount} aria-label="Interactive 3D winter forest with a snowman, walking cat, swaying trees and snowfall"/>
 <header className="masthead"><div className="brand-mark"><Snowflake size={25}/></div><div><p className="eyebrow">A LITTLE WINTER WORLD</p><h1>Winter Grove<span>.</span></h1></div></header>
 <div className="scene-label"><span className="live-dot"/>{paused?'A moment of stillness':'Snowfall in the pines'}</div>
 {!ready&&!error&&<div className="loading" role="status"><Snowflake className="spin"/><p>Finding our clearing…</p></div>}
 {error&&<div className="error" role="alert"><h2>A little help is needed</h2><p>{error}</p><button onClick={()=>location.reload()}>Try again</button></div>}
 <footer><div className="instructions"><Move size={16}/><span>Drag to explore <i>·</i> Scroll or pinch to zoom</span></div><div className="controls" aria-label="Scene controls">
 <label className="slider"><span><Wind size={17}/>Wind<output>{wind}%</output></span><input aria-label="Wind strength" type="range" min="0" max="100" value={wind} onChange={e=>setWind(+e.target.value)}/></label>
 <label className="slider"><span><Snowflake size={17}/>Snow<output>{snow}%</output></span><input aria-label="Snowfall amount" type="range" min="0" max="100" value={snow} onChange={e=>setSnow(+e.target.value)}/></label><div className="divider"/>
 <button aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={18}/>:<Pause size={18}/>}<span>{paused?'Play':'Pause'}</span></button>
 <button className={orbit?'selected':''} aria-pressed={orbit} onClick={()=>setOrbit(!orbit)}><Orbit size={18}/><span>Orbit</span></button>
 <button aria-label="Reset camera view" title="Reset camera view" onClick={()=>{setOrbit(false);engine.current?.reset();}}><RotateCcw size={18}/></button></div><p className="footnote">Take the scenic route.</p></footer></main>;
}
