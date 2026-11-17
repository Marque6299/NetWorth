import { GROUPS, PAGES, getPage, getPageIdFromHash } from "./navigation.js";
import { esc, icon, navLink } from "./components.js";
import { renderOverview, renderSection, renderPersonalView, renderStartingProfilePreview, renderFinanceView, renderMarketsView, renderAssetsView, renderBusinessesView } from "./views.js";
import { TIME_KEYS } from "./simulation-core.js";
import { createGameState, resolveAction } from "./simulation-core.js";
import { createExport, deleteSave, listSaveSlots, loadGame, parseImport, saveGame } from "./persistence.js";
import { renderGamePanel } from "./game-ui.js";

const root=document.querySelector("#app");
let currentGame=null,saveSlots=[],storageError="",feedbackMessage="",busy=false;
function sidebar(active){
 return '<aside class="sidebar"><a class="brand" href="#/overview" data-route="overview"><span class="brand-mark">N</span><span><b>NETWORTH</b><small>CAPITAL & CONSEQUENCE</small></span></a><div class="side-rule"></div><div class="nav-groups">'+GROUPS.map(group=>'<section class="nav-group"><label>'+esc(group.label)+'</label><nav>'+group.pages.map(page=>navLink(page,active)).join("")+'</nav></section>').join("")+'</div><div class="side-bottom"><b>EARLY ACCESS SHELL</b><small>BUILD 0.10.0 / PHASE 10</small><p>A world of decisions.<br>A future of your making.</p></div></aside>';
}
function topbar(page){
 const saveLabel=currentGame?`TURN ${currentGame.calendar.turn} · ${currentGame.calendar.currentDate}`:"NO SAVE LOADED";
 const avatar=currentGame?.life?.character?.name?.slice(0,1)?.toUpperCase()??"—";
 return '<header class="topbar"><div class="crumb">NETWORTH '+icon("right")+' <b>'+esc(page.label.toUpperCase())+'</b></div><div class="top-actions"><div class="search" id="searchWrap">'+icon("search")+'<input id="globalSearch" type="search" placeholder="Find a workspace" aria-label="Find a workspace" aria-controls="searchResults" aria-expanded="false" autocomplete="off"><kbd>⌘ K</kbd><div id="searchResults" class="results" role="listbox" hidden></div></div><div class="save"><i></i><span><small>SAVE STATUS</small><b>'+esc(saveLabel)+'</b></span></div><span class="avatar" aria-label="Player profile">'+avatar+'</span></div></header>';
}
function heading(page){
 return '<div class="page-heading"><div><label>'+(page.id==="overview"?"YOUR FINANCIAL COMMAND CENTER":"NETWORTH WORKSPACE / "+page.id.toUpperCase())+'</label><h1>'+esc(page.title)+'</h1><p>'+esc(page.description)+'</p></div><span class="phase">◇ PHASE 10 <small>OWNERSHIP & ENTERPRISE / 10 SECTIONS</small></span></div>';
}
function render(){
 let id=getPageIdFromHash(location.hash);
 if(!location.hash||!PAGES.some(page=>"#/"+page.id===location.hash)){history.replaceState(null,"","#/overview");id="overview";}
 const page=getPage(id);
 root.innerHTML=sidebar(id)+'<div class="main-column">'+topbar(page)+'<main class="main"><a class="skip" href="#content">Skip to content</a><div id="content">'+heading(page)+'<div class="content">'+(id==="overview"?renderOverview(currentGame)+renderGamePanel(currentGame,saveSlots,storageError,feedbackMessage):id==="personal"?renderPersonalView(currentGame):id==="finance"?renderFinanceView(currentGame):id==="markets"?renderMarketsView(currentGame):id==="assets"?renderAssetsView(currentGame):id==="businesses"?renderBusinessesView(currentGame):renderSection(id))+'</div></div><footer class="page-footer"><span>NETWORTH · CAPITAL & CONSEQUENCE</span><span>PHASE 10 / OWNERSHIP & ENTERPRISE · LOCAL GAME STATE</span></footer></main></div>';
 document.title=page.label+" — Networth";setupSearch();setupGameControls();setupPersonalControls();setupCareerControls();setupFinanceControls();setupBankingControls();setupMarketControls();setupAssetControls();setupBusinessControls();root.classList.add("ready");
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

function applyLifeAction(action,successMessage){
 const result=resolveAction(currentGame,action);if(!result.ok)throw new Error(result.reason);
 currentGame=result.state;setFeedback(successMessage);render();
}
function setupPersonalControls(){
 const characterForm=document.querySelector("#characterForm");
 characterForm?.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(characterForm);try{applyLifeAction({type:"CREATE_CHARACTER",name:String(data.get("name")),age:Number(data.get("age")),profileId:String(data.get("profileId"))},"Character created. Your starting circumstances and personal development systems are now active.");}catch(error){setFeedback(error.message);render();}});
 const profileSelect=document.querySelector("#profileSelect");
 profileSelect?.addEventListener("change",()=>{const preview=renderStartingProfilePreview(profileSelect.value);const box=document.querySelector("#profilePreview"),tagline=document.querySelector("#profileTagline");if(box)box.innerHTML=preview.html;if(tagline)tagline.textContent=preview.tagline;});
 const timeForm=document.querySelector("#timeAllocationForm");
 const updateTimeTotal=()=>{if(!timeForm)return;const data=new FormData(timeForm),total=TIME_KEYS.reduce((sum,key)=>sum+Number(data.get(key)||0),0),remaining=112-total;const totalNode=document.querySelector("#timeTotal"),note=document.querySelector("#allocationNote");if(totalNode)totalNode.textContent=`${total} / 112 HRS`;if(note)note.textContent=remaining>=0?`${remaining} hours remain unallocated. Going beyond the weekly limit is not allowed.`:`${Math.abs(remaining)} hours over the weekly limit. Reduce your allocation before saving.`;if(totalNode)totalNode.classList.toggle("over-limit",remaining<0);};
 timeForm?.querySelectorAll("[data-time-hour]").forEach(input=>input.addEventListener("input",updateTimeTotal));
 timeForm?.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(timeForm);const allocation=Object.fromEntries(TIME_KEYS.map(key=>[key,Number(data.get(key))]));allocation.studyFocus=String(data.get("studyFocus"));try{applyLifeAction({type:"SET_TIME_ALLOCATION",allocation},"Weekly time allocation saved. Its effects will apply during turn progression.");}catch(error){setFeedback(error.message);render();}});
 const goalForm=document.querySelector("#goalForm");
 const metric=goalForm?.querySelector('[name="metric"]'),target=goalForm?.querySelector('[name="target"]');
 const updateGoalTarget=()=>{if(!metric||!target)return;const isTurn=metric.value==="turns:turn";target.max=isTurn?"500":"100";target.min="1";target.value=isTurn?"10":"50";};
 metric?.addEventListener("change",updateGoalTarget);
 goalForm?.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(goalForm);try{applyLifeAction({type:"ADD_GOAL",goal:{title:String(data.get("title")),metric:String(data.get("metric")),target:Number(data.get("target"))}},"Goal added to your personal milestones.");}catch(error){setFeedback(error.message);render();}});
}

root.addEventListener("click",event=>{if(event.target.closest("a[data-route]"))closeSearch();else if(!event.target.closest("#searchWrap"))closeSearch();});
window.addEventListener("hashchange",render);
window.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();document.querySelector("#globalSearch")?.focus();}});
render();refreshSlots().then(render);

function parseCredits(value){
 const text=String(value??"").trim();
 if(!/^\d+(?:\.\d{1,2})?$/.test(text))throw new Error("Enter a valid positive amount with up to two decimal places.");
 const [whole,decimal=""]=text.split("."),minor=Number(whole)*100+Number((decimal+"00").slice(0,2));
 if(!Number.isSafeInteger(minor)||minor<=0)throw new Error("Amount must be greater than zero and within the supported range.");
 return minor;
}
function setupFinanceControls(){
 document.querySelectorAll("[data-finance-form]").forEach(form=>form.addEventListener("submit",event=>{
  event.preventDefault();if(!currentGame){setFeedback("Start a simulation first.");render();return;}
  const data=new FormData(form),type=form.dataset.financeForm;
  try{
   let action={type};
   if(type==="SET_BUDGET"){const amount=String(data.get("amount")??"").trim();if(!/^\d+(?:\.\d{1,2})?$/.test(amount))throw new Error("Enter a valid monthly budget with up to two decimal places.");const [whole,decimal=""]=amount.split(".");action.category=String(data.get("category"));action.monthlyLimitMinor=Number(whole)*100+Number((decimal+"00").slice(0,2));if(!Number.isSafeInteger(action.monthlyLimitMinor))throw new Error("Budget is outside the supported range.");}
   else{action.amountMinor=parseCredits(data.get("amount"));if(type==="TRANSFER_FUNDS"){action.from=String(data.get("from"));action.to=String(data.get("to"));}if(type==="RECORD_UNREALIZED_CHANGE")action.direction=String(data.get("direction"));if(data.get("description"))action.description=String(data.get("description"));}
   const result=resolveAction(currentGame,action);if(!result.ok)throw new Error(result.reason);currentGame=result.state;setFeedback(type==="SET_BUDGET"?"Monthly budget updated.": "Finance journal entry posted.");render();
  }catch(error){setFeedback(error.message);const target=document.querySelector("#financeFeedback");if(target)target.textContent=error.message;}
 }));
}

function setupCareerControls(){
 document.querySelectorAll("[data-career-action]").forEach(button=>button.addEventListener("click",()=>{
  if(!currentGame)return;
  const type=button.dataset.careerAction,action={type};
  if(type==="APPLY_FOR_JOB")action.jobId=button.dataset.jobId;
  if(type==="ACCEPT_JOB_OFFER")action.applicationId=button.dataset.applicationId;
  if(type==="ENROLL_COURSE")action.courseId=button.dataset.courseId;
  try{
   const result=resolveAction(currentGame,action);if(!result.ok)throw new Error(result.reason);
   currentGame=result.state;setFeedback(result.event?.summary??"Career decision recorded.");render();
   const feedback=document.querySelector("#careerFeedback");if(feedback)feedback.textContent=feedbackMessage;
  }catch(error){setFeedback(error.message);const feedback=document.querySelector("#careerFeedback");if(feedback)feedback.textContent=error.message;}
 }));
}

function setupBankingControls(){
 document.querySelectorAll("[data-banking-form]").forEach(form=>form.addEventListener("submit",event=>{
  event.preventDefault();if(!currentGame){setFeedback("Start a simulation first.");render();return;}
  const data=new FormData(form),type=form.dataset.bankingForm,action={type};
  try{
   if(["OPEN_BANK_ACCOUNT","CREATE_FIXED_DEPOSIT","WITHDRAW_BANK_FUNDS","APPLY_FOR_LOAN","PAY_LOAN_INSTALLMENT","USE_CREDIT_CARD","PAY_CREDIT_CARD"].includes(type))action.amountMinor=parseCredits(data.get("amount"));
   if(type==="OPEN_BANK_ACCOUNT"){action.bankId=String(data.get("bankId"));action.accountType=String(data.get("accountType"));}
   if(type==="CREATE_FIXED_DEPOSIT"){action.accountId=String(data.get("accountId"));action.termWeeks=Number(data.get("termWeeks"));}
   if(type==="WITHDRAW_BANK_FUNDS")action.accountId=String(data.get("accountId"));
   if(type==="APPLY_FOR_LOAN"){action.bankId=String(data.get("bankId"));action.loanType=String(data.get("loanType"));action.termWeeks=Number(data.get("termWeeks"));action.collateral=String(data.get("collateral")||"");}
   if(type==="PAY_LOAN_INSTALLMENT")action.loanId=String(data.get("loanId"));
   if(type==="APPLY_FOR_CREDIT_CARD"){action.bankId=String(data.get("bankId"));action.limitMinor=parseCredits(data.get("limit"));}
   if(type==="USE_CREDIT_CARD"||type==="PAY_CREDIT_CARD")action.cardId=String(data.get("cardId"));
   const result=resolveAction(currentGame,action);if(!result.ok)throw new Error(result.reason);
   currentGame=result.state;setFeedback("Banking decision recorded and posted to the household ledger.");render();
  }catch(error){setFeedback(error.message);const target=document.querySelector("#bankingFeedback");if(target)target.textContent=error.message;}
 }));
}

function parseMarketQuantity(value){
 const text=String(value??"").trim();
 if(!/^\d+(?:\.\d{1,4})?$/.test(text))throw new Error("Enter a positive quantity with up to four decimal places.");
 const [whole,decimal=""]=text.split("."),units=Number(whole)*10000+Number((decimal+"0000").slice(0,4));
 if(!Number.isSafeInteger(units)||units<=0)throw new Error("Quantity must be greater than zero and within the supported range.");
 return units;
}
function setupMarketControls(){
 document.querySelectorAll("[data-market-form]").forEach(form=>form.addEventListener("submit",event=>{
  event.preventDefault();if(!currentGame){setFeedback("Start a simulation and create a character first.");render();return;}
  const data=new FormData(form),type=event.submitter?.value;
  try{
   if(!["MARKET_BUY","MARKET_SELL"].includes(type))throw new Error("Choose Buy or Sell to submit an order.");
   const result=resolveAction(currentGame,{type,securityId:String(data.get("securityId")),quantityUnits:parseMarketQuantity(data.get("quantity"))});
   if(!result.ok)throw new Error(result.reason);
   currentGame=result.state;setFeedback(type==="MARKET_BUY"?"Market purchase completed. Check your holdings and journal.":"Market sale completed. Proceeds and realized return were posted to Finance.");render();
  }catch(error){setFeedback(error.message);const target=document.querySelector("#marketFeedback");if(target)target.textContent=error.message;}
 }));
 document.querySelectorAll("[data-market-watch]").forEach(button=>button.addEventListener("click",()=>{
  if(!currentGame)return;const result=resolveAction(currentGame,{type:"MARKET_WATCHLIST",securityId:button.dataset.marketWatch});if(result.ok){currentGame=result.state;render();}
 }));
 document.querySelectorAll("[data-market-select]").forEach(button=>button.addEventListener("click",()=>{
  const select=document.querySelector('[data-market-form] [name="securityId"]');if(select){select.value=button.dataset.marketSelect;select.scrollIntoView({behavior:"smooth",block:"center"});select.focus();}
 }));
}


function setupAssetControls() {
 document.querySelectorAll("[data-asset-form]").forEach(form => form.addEventListener("submit", event => {
  event.preventDefault();
  if (!currentGame) return;
  const data = new FormData(form), type = form.dataset.assetForm, action = { type };
  try {
   if (type === "ASSET_BUY_PROPERTY") {
    action.listingId = String(data.get("listingId"));
    action.use = String(data.get("use"));
    action.downPaymentBps = Number(data.get("downPaymentBps"));
   } else if (type === "ASSET_BUY_COLLECTIBLE") {
    action.catalogId = String(data.get("catalogId"));
   } else if (type === "ASSET_SET_PROPERTY_USE") {
    action.propertyId = String(data.get("propertyId"));
    action.use = String(data.get("use"));
   } else {
    throw new Error("Unsupported asset form.");
   }
   const result = resolveAction(currentGame, action);
   if (!result.ok) throw new Error(result.reason);
   currentGame = result.state;
   setFeedback(type === "ASSET_SET_PROPERTY_USE" ? "Property use updated." : "Asset acquisition recorded in the Finance ledger.");
   render();
  } catch (error) {
   setFeedback(error.message);
   const target = document.querySelector("#assetFeedback") || document.querySelector("#collectibleFeedback");
   if (target) target.textContent = error.message;
  }
 }));
 document.querySelectorAll("[data-asset-action]").forEach(button => button.addEventListener("click", () => {
  if (!currentGame) return;
  const type = button.dataset.assetAction;
  const action = { type };
  if (button.dataset.propertyId) action.propertyId = button.dataset.propertyId;
  if (button.dataset.collectibleId) action.collectibleId = button.dataset.collectibleId;
  if ((type === "ASSET_SELL_PROPERTY" || type === "ASSET_SELL_COLLECTIBLE") && !window.confirm("Sell this asset? The transaction and any realized gain or loss will be posted to Finance.")) return;
  try {
   const result = resolveAction(currentGame, action);
   if (!result.ok) throw new Error(result.reason);
   currentGame = result.state;
   setFeedback(type.includes("SELL") ? "Asset sale recorded. Review the sale proceeds and ledger entries." : "Maintenance was completed and the updated valuation was posted.");
   render();
  } catch (error) {
   setFeedback(error.message);
   const target = document.querySelector("#assetFeedback") || document.querySelector("#collectibleFeedback");
   if (target) target.textContent = error.message;
  }
 }));
}


function setupBusinessControls() {
 document.querySelectorAll("[data-business-accept]").forEach(button => button.addEventListener("click", () => {
  if (!currentGame) return;
  try {
   const result = resolveAction(currentGame, { type: "BUSINESS_ACCEPT_MANDATE", companyId: button.dataset.businessAccept });
   if (!result.ok) throw new Error(result.reason);
   currentGame = result.state;
   setFeedback(result.event?.summary ?? "Business operating mandate accepted.");
   render();
  } catch (error) {
   setFeedback(error.message);
   const target = document.querySelector("#businessFeedback");
   if (target) target.textContent = error.message;
  }
 }));
 document.querySelectorAll("[data-business-form]").forEach(form => form.addEventListener("submit", event => {
  event.preventDefault();
  if (!currentGame) return;
  const data = new FormData(form), type = form.dataset.businessForm, action = { type };
  try {
   if (type === "BUSINESS_SET_PRICE") {
    action.productId = String(data.get("productId"));
    action.priceMinor = parseCredits(data.get("price"));
   } else if (type === "BUSINESS_SET_STAFFING") {
    action.staffCount = Number(data.get("staffCount"));
   } else if (type === "BUSINESS_ORDER_INVENTORY") {
    action.productId = String(data.get("productId"));
    action.supplierId = String(data.get("supplierId"));
    action.units = Number(data.get("units"));
   } else if (type === "BUSINESS_MARKETING_CAMPAIGN") {
    action.amountMinor = parseCredits(data.get("amount"));
   } else {
    throw new Error("Unsupported business operation form.");
   }
   const result = resolveAction(currentGame, action);
   if (!result.ok) throw new Error(result.reason);
   currentGame = result.state;
   setFeedback(result.event?.summary ?? "Business decision recorded.");
   render();
  } catch (error) {
   setFeedback(error.message);
   const target = document.querySelector("#businessFeedback");
   if (target) target.textContent = error.message;
  }
 }));
 document.querySelectorAll("[data-business-action]").forEach(button => button.addEventListener("click", () => {
  if (!currentGame) return;
  if (button.dataset.businessAction === "BUSINESS_END_MANDATE" && !window.confirm("End this operating mandate? Any remaining branch cash, inventory and payables return to the parent company. No business capital is paid to your personal account.")) return;
  try {
   const result = resolveAction(currentGame, { type: button.dataset.businessAction });
   if (!result.ok) throw new Error(result.reason);
   currentGame = result.state;
   setFeedback(result.event?.summary ?? "Business mandate updated.");
   render();
  } catch (error) {
   setFeedback(error.message);
   const target = document.querySelector("#businessFeedback");
   if (target) target.textContent = error.message;
  }
 }));
 document.querySelectorAll("[data-ownership-form]").forEach(form => form.addEventListener("submit", event => {
  event.preventDefault();
  if (!currentGame) return;
  const data = new FormData(form), type = form.dataset.ownershipForm, action = { type };
  try {
   if (data.has("companyId")) action.companyId = String(data.get("companyId"));
   if (type === "OWNERSHIP_FOUND_COMPANY") {
    action.name = String(data.get("name")); action.sector = String(data.get("sector"));
    action.amountMinor = parseCredits(data.get("amount")); action.shares = Number(data.get("shares"));
    action.description = String(data.get("description") ?? "");
   } else if (type === "OWNERSHIP_ACQUIRE_TARGET") {
    action.targetId = String(data.get("targetId")); action.ownershipBps = Number(data.get("ownershipBps"));
   } else if (["OWNERSHIP_CONTRIBUTE_CAPITAL","OWNERSHIP_TAKE_LOAN","OWNERSHIP_REPAY_LOAN","OWNERSHIP_PROPOSE_DIVIDEND"].includes(type)) {
    action.amountMinor = parseCredits(data.get("amount"));
   } else if (type === "OWNERSHIP_ISSUE_SHARES") {
    action.investorId = String(data.get("investorId")); action.shares = Number(data.get("shares"));
   } else if (type === "OWNERSHIP_BUYBACK_SHARES") {
    action.shares = Number(data.get("shares"));
   } else if (type === "OWNERSHIP_SELL_SHARES") {
    action.buyerId = String(data.get("buyerId")); action.shares = Number(data.get("shares")); action.pricePerShareMinor = parseCredits(data.get("price"));
   } else if (type === "OWNERSHIP_TRANSFER_SHARES") {
     action.sellerId = String(data.get("sellerId")); action.buyerId = String(data.get("buyerId")); action.shares = Number(data.get("shares")); action.pricePerShareMinor = parseCredits(data.get("price"));
    } else if (type === "OWNERSHIP_OPEN_BOARD_ELECTION") {
     action.termTurns = Number(data.get("termTurns"));
    } else if (type === "OWNERSHIP_CREATE_RESOLUTION") {
    action.title = String(data.get("title")); action.resolutionType = String(data.get("resolutionType"));
   } else if (type === "OWNERSHIP_APPOINT_EXECUTIVE") {
    action.role = String(data.get("role")); action.candidateId = String(data.get("candidateId"));
   } else if (type === "OWNERSHIP_APPOINT_DIRECTOR") {
    action.seat = String(data.get("seat")); action.candidateId = String(data.get("candidateId"));
   } else {
    throw new Error("Unsupported ownership form.");
   }
   const result = resolveAction(currentGame, action);
   if (!result.ok) throw new Error(result.reason);
   currentGame = result.state; setFeedback(result.event?.summary ?? "Ownership decision recorded."); render();
  } catch (error) {
   setFeedback(error.message);
   const target = document.querySelector("#ownershipFeedback");
   if (target) target.textContent = error.message;
  }
 }));
 document.querySelectorAll("[data-ownership-action]").forEach(button => button.addEventListener("click", () => {
  if (!currentGame) return;
  const type = button.dataset.ownershipAction, action = { type };
  if (button.dataset.companyId) action.companyId = button.dataset.companyId;
  if (button.dataset.targetId) action.targetId = button.dataset.targetId;
  if (button.dataset.resolutionId) action.resolutionId = button.dataset.resolutionId;
  if (button.dataset.vote) action.vote = button.dataset.vote;
  if (button.dataset.candidateId) action.candidateId = button.dataset.candidateId;
  if (type === "OWNERSHIP_ACQUIRE_TARGET" && !window.confirm("Acquire this company outright using household cash? The purchase will be recorded as a private-equity asset.")) return;
  try {
   const result = resolveAction(currentGame, action);
   if (!result.ok) throw new Error(result.reason);
   currentGame = result.state; setFeedback(result.event?.summary ?? "Ownership action completed."); render();
  } catch (error) {
   setFeedback(error.message);
   const target = document.querySelector("#ownershipFeedback");
   if (target) target.textContent = error.message;
  }
 }));
}
