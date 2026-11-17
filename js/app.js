import { GROUPS, PAGES, getPage, getPageIdFromHash } from "./navigation.js";
import { esc, icon, navLink } from "./components.js";
import { renderOverview, renderSection } from "./views.js";
import { createGameState, resolveAction } from "./simulation-core.js";
import { createExport, deleteSave, listSaveSlots, loadGame, parseImport, saveGame } from "./persistence.js";
import { renderGamePanel } from "./game-ui.js";

const root=document.querySelector("#app");
let currentGame=null,saveSlots=[],storageError="",feedbackMessage="",busy=false;
function sidebar(active){
 return '<aside class="sidebar"><a class="brand" href="#/overview" data-route="overview"><span class="brand-mark">N</span><span><b>NETWORTH</b><small>CAPITAL & CONSEQUENCE</small></span></a><div class="side-rule"></div><div class="nav-groups">'+GROUPS.map(group=>'<section class="nav-group"><label>'+esc(group.label)+'</label><nav>'+group.pages.map(page=>navLink(page,active)).join("")+'</nav></section>').join("")+'</div><div class="side-bottom"><b>EARLY ACCESS SHELL</b><small>BUILD 0.2.0 / PHASE 02</small><p>A world of decisions.<br>A future of your making.</p></div></aside>';
}
function topbar(page){
 const saveLabel=currentGame?`TURN ${currentGame.calendar.turn} · ${currentGame.calendar.currentDate}`:"NO SAVE LOADED";
 return '<header class="topbar"><div class="crumb">NETWORTH '+icon("right")+' <b>'+esc(page.label.toUpperCase())+'</b></div><div class="top-actions"><div class="search" id="searchWrap">'+icon("search")+'<input id="globalSearch" type="search" placeholder="Find a workspace" aria-label="Find a workspace" aria-controls="searchResults" aria-expanded="false" autocomplete="off"><kbd>⌘ K</kbd><div id="searchResults" class="results" role="listbox" hidden></div></div><div class="save"><i></i><span><small>SAVE STATUS</small><b>'+esc(saveLabel)+'</b></span></div><span class="avatar" aria-label="Player profile not created">—</span></div></header>';
}
function heading(page){
 return '<div class="page-heading"><div><label>'+(page.id==="overview"?"YOUR FINANCIAL COMMAND CENTER":"NETWORTH WORKSPACE / "+page.id.toUpperCase())+'</label><h1>'+esc(page.title)+'</h1><p>'+esc(page.description)+'</p></div><span class="phase">◇ PHASE 02 <small>SIMULATION CORE / 09 SECTIONS</small></span></div>';
}
function render(){
 let id=getPageIdFromHash(location.hash);
 if(!location.hash||!PAGES.some(page=>"#/"+page.id===location.hash)){history.replaceState(null,"","#/overview");id="overview";}
 const page=getPage(id);
 root.innerHTML=sidebar(id)+'<div class="main-column">'+topbar(page)+'<main class="main"><a class="skip" href="#content">Skip to content</a><div id="content">'+heading(page)+'<div class="content">'+(id==="overview"?renderOverview()+renderGamePanel(currentGame,saveSlots,storageError,feedbackMessage):renderSection(id))+'</div></div><footer class="page-footer"><span>NETWORTH · CAPITAL & CONSEQUENCE</span><span>PHASE 02 / SIMULATION CORE · LOCAL GAME STATE</span></footer></main></div>';
 document.title=page.label+" — Networth";setupSearch();setupGameControls();root.classList.add("ready");
}
function closeSearch(){const input=document.querySelector("#globalSearch"),results=document.querySelector("#searchResults");if(results)results.hidden=true;if(input)input.setAttribute("aria-expanded","false");}
function setupSearch(){
 const input=document.querySelector("#globalSearch"),results=document.querySelector("#searchResults");if(!input||!results)return;
 function update(){const q=input.value.trim().toLowerCase(),matches=PAGES.filter(page=>(page.label+" "+page.title+" "+page.description).toLowerCase().includes(q));results.innerHTML=matches.length?matches.map(page=>'<a class="result" role="option" href="#/'+page.id+'" data-route="'+page.id+'">'+icon(page.icon)+'<span><b>'+esc(page.label)+'</b><small>'+esc(page.title)+'</small></span></a>').join(""):'<p class="no-results">No matching workspace found.</p>';results.hidden=false;input.setAttribute("aria-expanded","true");}
 input.addEventListener("focus",update);input.addEventListener("input",update);
 input.addEventListener("keydown",event=>{if(event.key==="Escape"){closeSearch();input.blur();}if(event.key==="Enter"){const first=results.querySelector("a");if(first)location.hash=first.getAttribute("href");}if(event.key==="ArrowDown"){const first=results.querySelector("a");if(first){event.preventDefault();first.focus();}}});
 results.addEventListener("keydown",event=>{if(event.key==="Escape"){closeSearch();input.focus();}});
}
async function refreshSlots(){try{saveSlots=await listSaveSlots();storageError="";}catch(error){storageError=error.message;}}
function setFeedback(message){feedbackMessage=message;}
function downloadExport(){
 const blob=new Blob([createExport(currentGame)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=`networth-${currentGame.meta.gameId}-turn-${currentGame.calendar.turn}.json`;link.click();URL.revokeObjectURL(url);
}
async function handleGameAction(action,slot){
 if(busy)return;busy=true;
 try{
  if(action==="advance"){const result=resolveAction(currentGame,{type:"ADVANCE_TURN"});if(!result.ok)throw new Error(result.reason);currentGame=result.state;setFeedback(`Advanced to turn ${currentGame.calendar.turn} (${currentGame.calendar.currentDate}). Save to keep this progress.`);}
  else if(action==="save"){await saveGame(slot,currentGame);await refreshSlots();setFeedback(`Game successfully saved to slot ${slot}.`);}
  else if(action==="load"){currentGame=await loadGame(slot);setFeedback(`Loaded slot ${slot} at turn ${currentGame.calendar.turn}.`);}
  else if(action==="delete"){await deleteSave(slot);await refreshSlots();setFeedback(`Save slot ${slot} deleted.`);}
  else if(action==="export"){downloadExport();setFeedback("JSON backup exported.");}
  storageError="";
 }catch(error){setFeedback(error.message);if(/IndexedDB|storage|save slot|integrity/i.test(error.message))storageError=error.message;}
 finally{busy=false;render();}
}
function setupGameControls(){
 const form=document.querySelector("#newGameForm");
 form?.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(form);try{currentGame=createGameState({seed:String(data.get("seed")),startDate:String(data.get("startDate"))});setFeedback("New simulation created. Advance turns and save your progress locally.");render();}catch(error){setFeedback(error.message);render();}});
 document.querySelectorAll("[data-game-action]").forEach(button=>button.addEventListener("click",()=>handleGameAction(button.dataset.gameAction,Number(button.dataset.slot))));
 document.querySelector("#saveImport")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(!file)return;try{currentGame=parseImport(await file.text());setFeedback("Backup validated and restored into the active session. Save it to a local slot to persist it.");storageError="";}catch(error){setFeedback(error.message);}render();});
}
root.addEventListener("click",event=>{if(event.target.closest("a[data-route]"))closeSearch();else if(!event.target.closest("#searchWrap"))closeSearch();});
window.addEventListener("hashchange",render);
window.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();document.querySelector("#globalSearch")?.focus();}});
render();refreshSlots().then(render);
