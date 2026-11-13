'use strict';
const E=require('./engine'),{allowedOption}=require('./feasibility');
const cache=new Map();
function random(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function simulate(config,players,seed){
 const rng=random(seed),r=E.createRoom('SIM234','Spielleitung',{...config,hostOnly:true,maxPlayers:players});
 for(let i=0;i<players;i++)E.joinRoom(r,'Unternehmen '+i);
 // Start with a seeded order, independent of crypto randomness in a real room.
 r.deck=E.CARDS.map(c=>c.number);for(let i=r.deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[r.deck[i],r.deck[j]]=[r.deck[j],r.deck[i]];}
 E.action(r,r.hostToken,{type:'start'});
 let steps=0;const limit=players*80;
 while(!r.gameOver&&r.turnNumber<=limit&&steps++<limit*4){
  const p=r.players[r.turn],token=p.token;
  if(r.phase==='roll')E.action(r,token,{type:'roll'},{forcedDie:1+Math.floor(rng()*6)});
  else if(r.phase==='detention')E.action(r,token,{type:'detention',choice:p.cash>=E.auditReleaseFee(r)+30000?'pay':'skip'});
  else if(r.phase==='decision'&&r.pending.kind==='invest'){
   const f=E.FIELDS[r.pending.index],cost=Math.max(0,-f.capital);
   const affordable=cost===0||p.cash>=cost,viable=f.annual>=0||p.annual+f.annual>=50000||E.footprint(p)+f.scope.reduce((a,b)=>a+b,0)<=r.config.goal;
   E.action(r,token,{type:'invest',choice:!p.owned.includes(f.number)&&affordable&&viable?'buy':'pass'});
  }else if(r.phase==='decision'){
   const f=E.FIELDS[r.pending.index],choices=f.options.map((o,i)=>({o,i})).filter(({o})=>(o.cash>=0||p.cash>=-o.cash)&&allowedOption(r,p,o,E.FIELDS));
   choices.sort((a,b)=>a.o.scope.reduce((x,y)=>x+y,0)-b.o.scope.reduce((x,y)=>x+y,0)||b.o.annual-a.o.annual);
   E.action(r,token,{type:'choose',option:choices[0]?.i??-1});
  }else if(r.phase==='end')E.action(r,token,{type:'end'});else break;
 }
 return {completed:r.gameOver,turns:r.players.reduce((n,p)=>n+p.turns,0)};
}
function estimateDuration(input={},count){
 const players=Math.max(2,Math.min(8,Math.trunc(Number(count??input.maxPlayers)||8)));
 const cfg=E.createRoom('SIM234','Spielleitung',{...input,hostOnly:true,maxPlayers:players}).config;
 const config={initialCash:cfg.initialCash,annualIncome:cfg.annualIncome,s1:cfg.starting[0],s2:cfg.starting[1],s3:cfg.starting[2],goal:cfg.goal};
 const key=JSON.stringify([players,config]);let model=cache.get(key);
 if(!model){
  const initial=cfg.starting.reduce((a,b)=>a+b,0);
  if(initial<=cfg.goal)model={status:'alreadyReached',minMinutes:0,maxMinutes:0,medianTurns:0,samples:0,completed:0};
  else{
   const samples=Array.from({length:10},(_,i)=>simulate(config,players,16453+i*7919)),finished=samples.filter(s=>s.completed).map(s=>s.turns).sort((a,b)=>a-b);
   if(finished.length<samples.length){
    const observed=samples.map(s=>s.turns).sort((a,b)=>a-b),low=finished.length?finished[Math.floor((finished.length-1)*.2)]:observed[0];
    model={status:finished.length?'extended':'uncertain',minMinutes:Math.max(5,Math.floor((3+low*20/60)/5)*5),maxMinutes:Math.ceil((3+observed.at(-1)*40/60)/5)*5,medianTurns:null,samples:samples.length,completed:finished.length};
   }
   else{
    const low=finished[Math.floor((finished.length-1)*.2)],high=finished[Math.ceil((finished.length-1)*.8)];
    model={status:'estimated',minMinutes:Math.max(5,Math.floor((3+low*20/60)/5)*5),maxMinutes:Math.max(10,Math.ceil((3+high*40/60)/5)*5),medianTurns:finished[Math.floor(finished.length/2)],samples:samples.length,completed:finished.length};
   }
  }
  cache.set(key,model);if(cache.size>100)cache.delete(cache.keys().next().value);
 }
 return {...model,players,secondsPerTurn:[20,40],starting:cfg.starting,requestedStarting:cfg.feasibility.requested,adjusted:cfg.feasibility.adjusted,initial:cfg.starting.reduce((a,b)=>a+b,0),goal:cfg.goal};
}
module.exports={estimateDuration};
