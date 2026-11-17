import { MONEY_SCALE } from "./finance.js";
const clone=value=>typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const roundDiv=(n,d)=>Math.floor((n+d/2)/d);
const unitValue=(priceMinor,quantityUnits)=>roundDiv(priceMinor*quantityUnits,10000);
const feeFor=amount=>Math.ceil(amount*15/10000);
const instruments=[
 {id:"equity-northstar",symbol:"NSTR",name:"Northstar Services",kind:"equity",sector:"Business services",description:"A diversified outsourced operations and customer-support group expanding through automation and enterprise contracts.",priceMinor:18450,volatilityBps:420,yieldBps:180,risk:"Medium",quality:86,trendBps:30},
 {id:"equity-cobalt",symbol:"CBLT",name:"Cobalt Insights",kind:"equity",sector:"Technology",description:"A data analytics and enterprise software company with high reinvestment needs and recurring subscription revenue.",priceMinor:32600,volatilityBps:610,yieldBps:0,risk:"High",quality:78,trendBps:55},
 {id:"equity-meridian",symbol:"MRDN",name:"Meridian Retail Group",kind:"equity",sector:"Consumer",description:"A nationwide value retailer exposed to consumer confidence, wage costs and inventory cycles.",priceMinor:12800,volatilityBps:360,yieldBps:260,risk:"Medium",quality:81,trendBps:15},
 {id:"equity-aster",symbol:"ASTR",name:"Aster Industrial",kind:"equity",sector:"Industrials",description:"An established industrial supplier with stable cash generation and moderate capital expenditure.",priceMinor:24100,volatilityBps:300,yieldBps:320,risk:"Medium",quality:89,trendBps:10},
 {id:"bond-national",symbol:"NGB5",name:"National Government 5Y",kind:"government-bond",sector:"Fixed income",description:"A fictional sovereign note with lower volatility and a fixed quarterly coupon.",priceMinor:10000,volatilityBps:65,yieldBps:480,risk:"Low",quality:94,trendBps:0,maturityTurns:260},
 {id:"bond-infrastructure",symbol:"NGB10",name:"National Infrastructure 10Y",kind:"government-bond",sector:"Fixed income",description:"A longer-duration government bond with greater sensitivity to changing market rates.",priceMinor:10000,volatilityBps:115,yieldBps:530,risk:"Low",quality:91,trendBps:0,maturityTurns:520},
 {id:"bond-cobalt",symbol:"CBT4",name:"Cobalt Corporate 4Y",kind:"corporate-bond",sector:"Fixed income",description:"A corporate note offering a higher coupon in exchange for issuer credit risk.",priceMinor:9800,volatilityBps:190,yieldBps:650,risk:"Medium",quality:77,trendBps:5,maturityTurns:208},
 {id:"bond-meridian",symbol:"MRD3",name:"Meridian Retail 3Y",kind:"corporate-bond",sector:"Fixed income",description:"A shorter corporate bond exposed to retail-sector earnings and refinancing conditions.",priceMinor:9900,volatilityBps:230,yieldBps:710,risk:"Medium",quality:73,trendBps:0,maturityTurns:156},
 {id:"commodity-gold",symbol:"GOLD",name:"Gold Benchmark",kind:"commodity",sector:"Precious metals",description:"A defensive commodity benchmark influenced by inflation expectations and risk appetite.",priceMinor:215000,volatilityBps:280,yieldBps:0,risk:"Medium",quality:82,trendBps:12},
 {id:"commodity-energy",symbol:"ENER",name:"Energy Basket",kind:"commodity",sector:"Energy",description:"A broad energy benchmark sensitive to supply disruption, industrial demand and inventories.",priceMinor:86500,volatilityBps:720,yieldBps:0,risk:"High",quality:76,trendBps:0},
 {id:"commodity-agri",symbol:"AGRI",name:"Agriculture Basket",kind:"commodity",sector:"Agriculture",description:"A diversified agricultural commodity basket exposed to harvest conditions and logistics.",priceMinor:43200,volatilityBps:480,yieldBps:0,risk:"High",quality:72,trendBps:0},
 {id:"crypto-bit",symbol:"BIT",name:"Bitcoin Index",kind:"crypto",sector:"Digital assets",description:"A highly volatile decentralized digital asset index exposed to adoption, regulation and liquidity cycles.",priceMinor:6425000,volatilityBps:1450,yieldBps:0,risk:"Very high",quality:58,trendBps:65},
 {id:"crypto-ether",symbol:"ETHR",name:"Ether Network Token",kind:"crypto",sector:"Digital assets",description:"A smart-contract network token influenced by developer activity, usage, competition and protocol risk.",priceMinor:318000,volatilityBps:1650,yieldBps:0,risk:"Very high",quality:61,trendBps:45},
 {id:"crypto-nova",symbol:"NOVA",name:"Nova Utility Token",kind:"crypto",sector:"Digital assets",description:"A speculative utility token with high liquidity and adoption uncertainty.",priceMinor:4850,volatilityBps:2300,yieldBps:0,risk:"Extreme",quality:35,trendBps:80}
];
const byId=id=>instruments.find(x=>x.id===id);
function draw(rng,max){let x=(rng.state+0x6D2B79F5)>>>0,t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return {value:Math.floor(((t^(t>>>14))>>>0)/4294967296*max),state:x};}
function line(accountId,debitMinor=0,creditMinor=0){return {accountId,debitMinor,creditMinor};}
function ensureAccount(finance,id,name,type,subtype){if(!finance.accounts.some(x=>x.id===id))finance.accounts.push({id,name,type,subtype,balanceMinor:0});}
function post(finance,{id,date,turn,kind,description,amountMinor,lines,category="investment",relatedId=null}){
 const debit=lines.reduce((s,x)=>s+x.debitMinor,0),credit=lines.reduce((s,x)=>s+x.creditMinor,0);
 if(debit!==credit||debit<=0)throw new Error("Investment journal entry is not balanced.");
 const map=new Map(finance.accounts.map(x=>[x.id,x]));
 for(const x of lines){const a=map.get(x.accountId);if(!a)throw new Error("Investment journal account is missing.");a.balanceMinor+=["asset","expense"].includes(a.type)?x.debitMinor-x.creditMinor:x.creditMinor-x.debitMinor;}
 finance.ledger.push({id,date,turn,kind,description,amountMinor,category,relatedId,lines:clone(lines)});
}
export function getMarketInstruments(){return clone(instruments);}
export function createMarketState(seed=1){
 const normalized=Number(seed)>>>0;
 return {rng:{state:normalized||1},turn:0,marketIndex:10000,regime:"Expansion",sentiment:0,securities:instruments.map(x=>({...clone(x),previousPriceMinor:x.priceMinor,history:[x.priceMinor]})),positions:[],watchlist:["equity-northstar","bond-national","commodity-gold","crypto-bit"],transactions:[],researchNotes:[],lastAdvanceTurn:0};
}
export function validateMarkets(markets,finance){
 const errors=[];
 if(!markets||!markets.rng||!Number.isInteger(markets.rng.state)||!Array.isArray(markets.securities)||!Array.isArray(markets.positions)||!Array.isArray(markets.watchlist)||!Array.isArray(markets.transactions))return {valid:false,errors:["Market data is missing or malformed."]};
 const ids=new Set();
 for(const s of markets.securities){if(!byId(s.id)||ids.has(s.id)||!Number.isSafeInteger(s.priceMinor)||s.priceMinor<=0||!Number.isSafeInteger(s.previousPriceMinor)||s.previousPriceMinor<=0||!Array.isArray(s.history)||s.history.some(x=>!Number.isSafeInteger(x)||x<=0))errors.push("A market security is invalid.");ids.add(s.id);}
 const positionIds=new Set();
 for(const p of markets.positions){if(!byId(p.securityId)||positionIds.has(p.securityId)||!Number.isSafeInteger(p.quantityUnits)||p.quantityUnits<=0||!Number.isSafeInteger(p.costBasisMinor)||p.costBasisMinor<0||!Number.isSafeInteger(p.marketValueMinor)||p.marketValueMinor<0||!Number.isSafeInteger(p.unrealizedMinor)||p.marketValueMinor-p.costBasisMinor!==p.unrealizedMinor)errors.push("An investment position is invalid.");positionIds.add(p.securityId);}
 if(markets.positions.reduce((s,p)=>s+p.marketValueMinor,0)>(finance?.accounts?.find(x=>x.id==="investment")?.balanceMinor??0))errors.push("Market positions exceed the general investment asset balance.");
 if(markets.watchlist.some(id=>!byId(id)))errors.push("The market watchlist contains an unknown security.");
 if(!Number.isInteger(markets.turn)||markets.turn<0||!Number.isInteger(markets.marketIndex)||markets.marketIndex<=0||!Number.isInteger(markets.sentiment)||markets.sentiment< -1000||markets.sentiment>1000)errors.push("Market cycle data is invalid.");
 return {valid:errors.length===0,errors};
}
export function validateMarketAction(markets,finance,action){
 if(!markets||!finance)return {valid:false,reason:"Create a character before entering the investment market."};
 const security=markets.securities.find(x=>x.id===action.securityId);
 if(action.type==="MARKET_BUY"){
  if(!security||!Number.isSafeInteger(action.quantityUnits)||action.quantityUnits<=0)return {valid:false,reason:"Select a valid instrument and a positive quantity (up to four decimal places)."};
  const value=unitValue(security.priceMinor,action.quantityUnits),fee=feeFor(value);
  const cash=finance.accounts.find(x=>x.id==="cash")?.balanceMinor??0;
  if(value<=0||!Number.isSafeInteger(value+fee)||value+fee>cash)return {valid:false,reason:"There is not enough available cash to cover this purchase and its trading fee."};
  return {valid:true};
 }
 if(action.type==="MARKET_SELL"){
  const position=markets.positions.find(x=>x.securityId===action.securityId);
  if(!security||!position||!Number.isSafeInteger(action.quantityUnits)||action.quantityUnits<=0||action.quantityUnits>position.quantityUnits)return {valid:false,reason:"Choose a valid holding and a sale quantity within the available position."};
  return {valid:true};
 }
 if(action.type==="MARKET_WATCHLIST"){
  if(!security)return {valid:false,reason:"Select a valid market instrument."};
  return {valid:true};
 }
 return {valid:false,reason:"Unknown market action."};
}
export function applyMarketAction(markets,finance,action,{date,turn,sequence}){
 const m=clone(markets),f=clone(finance),security=m.securities.find(x=>x.id===action.securityId),position=m.positions.find(x=>x.securityId===action.securityId);
 const tx=(kind,amount,description)=>m.transactions.unshift({id:"market-tx-"+sequence,turn,date,kind,securityId:security.id,symbol:security.symbol,quantityUnits:action.quantityUnits??0,priceMinor:security.priceMinor,amountMinor:amount,description});
 if(action.type==="MARKET_WATCHLIST"){m.watchlist=m.watchlist.includes(security.id)?m.watchlist.filter(x=>x!==security.id):[...m.watchlist,security.id];return {markets:m,finance:f};}
 const value=unitValue(security.priceMinor,action.quantityUnits),fee=feeFor(value);
 ensureAccount(f,"investment","Investment holdings","asset","investment");ensureAccount(f,"income","Income","income","income");ensureAccount(f,"expense","Household expenses","expense","expense");
 if(action.type==="MARKET_BUY"){
  const lines=[line("investment",value),line("cash",0,value)];post(f,{id:"journal-market-"+sequence,date,turn,kind:"MARKET_BUY",description:"Buy "+security.symbol+" · "+security.name,amountMinor:value,lines,relatedId:security.id});
  if(fee)post(f,{id:"journal-market-fee-"+sequence,date,turn,kind:"MARKET_FEE",description:"Trading fee · "+security.symbol,amountMinor:fee,lines:[line("expense",fee),line("cash",0,fee)],relatedId:security.id});
  if(position){position.quantityUnits+=action.quantityUnits;position.costBasisMinor+=value;position.marketValueMinor+=value;position.unrealizedMinor=position.marketValueMinor-position.costBasisMinor;}
  else m.positions.push({securityId:security.id,quantityUnits:action.quantityUnits,costBasisMinor:value,marketValueMinor:value,unrealizedMinor:0,openedTurn:turn});
  tx("BUY",value,"Purchased "+security.symbol);tx("FEE",fee,"Trading fee");
 }else{
  const soldValue=unitValue(security.priceMinor,action.quantityUnits),carrying=roundDiv(position.marketValueMinor*action.quantityUnits,position.quantityUnits),cost=roundDiv(position.costBasisMinor*action.quantityUnits,position.quantityUnits),unrealized=carrying-cost,realized=soldValue-cost;
  const lines=[line("cash",soldValue),line("investment",0,carrying)];
  if(realized>0)lines.push(line("cash",0,0),line("income",0,realized));
  else if(realized<0)lines.push(line("expense",-realized));
  if(unrealized>0)lines.push(line("unrealizedGain",unrealized));
  else if(unrealized<0)lines.push(line("unrealizedGain",0,-unrealized));
  post(f,{id:"journal-market-"+sequence,date,turn,kind:"MARKET_SELL",description:"Sell "+security.symbol+" · "+security.name,amountMinor:soldValue,lines,relatedId:security.id});
  if(fee)post(f,{id:"journal-market-fee-"+sequence,date,turn,kind:"MARKET_FEE",description:"Trading fee · "+security.symbol,amountMinor:fee,lines:[line("expense",fee),line("cash",0,fee)],relatedId:security.id});
  position.quantityUnits-=action.quantityUnits;position.costBasisMinor-=cost;position.marketValueMinor-=carrying;position.unrealizedMinor=position.marketValueMinor-position.costBasisMinor;
  if(position.quantityUnits===0)m.positions=m.positions.filter(x=>x.securityId!==security.id);
  tx("SELL",soldValue,"Sold "+security.symbol);tx("FEE",fee,"Trading fee");
 }
 return {markets:m,finance:f};
}
export function advanceMarkets(markets,finance,{date,turn,sequence}){
 const m=clone(markets),f=clone(finance),events=[],rng=m.rng;
 m.turn=turn;
 const regimeRoll=draw(rng,1000);rng.state=regimeRoll.state;
 if(turn%13===0){m.regime=["Expansion","Slowdown","Recovery","Contraction"][draw(rng,4).value];m.sentiment=draw(rng,801).value-400;events.push({type:"MARKET_CYCLE",summary:"Market conditions shifted into "+m.regime.toLowerCase()+".",details:{regime:m.regime,sentiment:m.sentiment}});}
 const common=m.regime==="Expansion"?20:m.regime==="Slowdown"?-15:m.regime==="Recovery"?35:-35;
 for(const s of m.securities){
  s.previousPriceMinor=s.priceMinor;
  const movement=draw(rng,s.volatilityBps*2+1);rng.state=movement.state;
  const shock=movement.value-s.volatilityBps;
  const drift=s.trendBps+common+Math.round(m.sentiment/8);
  const changeBps=clamp(drift+shock,-Math.min(8500,s.volatilityBps*3),Math.min(8500,s.volatilityBps*3));
  s.priceMinor=Math.max(1,roundDiv(s.priceMinor*(10000+changeBps),10000));
  s.history.push(s.priceMinor);if(s.history.length>53)s.history.shift();
 }
 const oldIndex=m.marketIndex,avgChange=m.securities.reduce((sum,s)=>sum+Math.round((s.priceMinor-s.previousPriceMinor)*10000/s.previousPriceMinor),0)/m.securities.length;
 m.marketIndex=Math.max(100,roundDiv(m.marketIndex*(10000+clamp(Math.round(avgChange),-3000,3000)),10000));
 if(Math.abs(m.marketIndex-oldIndex)>=20)events.push({type:"MARKET_INDEX",summary:"The broad market index "+(m.marketIndex>=oldIndex?"rose":"fell")+".",details:{previousIndex:oldIndex,currentIndex:m.marketIndex,changeBps:Math.round(avgChange)}});
 ensureAccount(f,"investment","Investment holdings","asset","investment");ensureAccount(f,"unrealizedGain","Unrealized valuation changes","equity","valuation");ensureAccount(f,"income","Income","income","income");
 for(const p of m.positions){
  const s=m.securities.find(x=>x.id===p.securityId),newValue=unitValue(s.priceMinor,p.quantityUnits),delta=newValue-p.marketValueMinor;
  if(delta>0)post(f,{id:"journal-market-mark-"+turn+"-"+s.id,date,turn,kind:"MARKET_UNREALIZED_GAIN",description:"Market valuation gain · "+s.symbol,amountMinor:delta,lines:[line("investment",delta),line("unrealizedGain",0,delta)],relatedId:s.id});
  else if(delta<0)post(f,{id:"journal-market-mark-"+turn+"-"+s.id,date,turn,kind:"MARKET_UNREALIZED_LOSS",description:"Market valuation loss · "+s.symbol,amountMinor:-delta,lines:[line("unrealizedGain",-delta),line("investment",0,-delta)],relatedId:s.id});
  p.marketValueMinor=newValue;p.unrealizedMinor=newValue-p.costBasisMinor;
  if(s.yieldBps>0&&turn%13===0){const distribution=Math.floor(newValue*s.yieldBps/10000/4);if(distribution>0){post(f,{id:"journal-market-income-"+turn+"-"+s.id,date,turn,kind:"MARKET_DISTRIBUTION",description:(s.kind.includes("bond")?"Bond coupon":"Dividend")+" · "+s.symbol,amountMinor:distribution,lines:[line("cash",distribution),line("income",0,distribution)],category:"investment-income",relatedId:s.id});events.push({type:"MARKET_DISTRIBUTION",summary:securityName(s)+" paid "+(distribution/100).toFixed(2)+" Credits in income.",details:{securityId:s.id,amountMinor:distribution}});}}
 }
 m.rng=rng;m.lastAdvanceTurn=turn;
 for(const event of events){} 
 return {markets:m,finance:f,events};
}
function securityName(s){return s.name;}
export function getMarketPortfolio(markets){const value=markets.positions.reduce((s,p)=>s+p.marketValueMinor,0),cost=markets.positions.reduce((s,p)=>s+p.costBasisMinor,0),unrealized=value-cost;return {value,cost,unrealized,positions:markets.positions.length};}
