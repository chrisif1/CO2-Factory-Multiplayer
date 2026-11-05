'use strict';
const crypto = require('node:crypto');
const DATA = require('./public/game-data.json');
const FIELDS = DATA.fields;
const CARDS = DATA.cards;
const DEFAULT_PARAMS = Object.fromEntries(Object.entries(DATA.parameters).map(([k,v])=>[k,Number(v.value)]));
const money = v=>Math.round(v*100)/100;
const number = (v,def,min,max) => {const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):def;};
const sum = a=>a.reduce((t,n)=>t+n,0);
const scopes = p=>p.base.map((v,i)=>Math.max(0,v+p.temp[i]));
const footprint = p=>sum(scopes(p));
// Die CO₂-bezogenen Kosten werden an das Startkapital angepasst.
// Referenz: 1.000.000 € = 100 % der bisherigen Sätze.
// Der Faktor folgt dem gewählten Startkapital, auch bei 0 € und über 10 Mio. €.
const co2Factor = room=>room.config.initialCash/1000000;
const co2Charge = (room,baseRate,tons)=>money(Math.max(0,tons)*baseRate*co2Factor(room));
const auditReleaseFee = room=>money(40000*co2Factor(room));
const shuffle = a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=crypto.randomInt(i+1);[b[j],b[i]]=[b[i],b[j]];}return b;};
const token = ()=>crypto.randomBytes(24).toString('hex');
const safeName = (s,fallback) => String(s||'').trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,36)||fallback;
function createRoom(code, name, input={}){
 const cfg={maxPlayers: Math.trunc(number(input.maxPlayers,8,2,8)), maxYears: Math.trunc(number(input.maxYears,8,1,20)), initialCash:number(input.initialCash,1000000,0,1e11), annualIncome:number(input.annualIncome,200000,-1e10,1e10), starting:[number(input.s1,250,0,1e7),number(input.s2,300,0,1e7),number(input.s3,450,0,1e7)],goal:number(input.goal,400,0,1e8)};
 const hostToken=token();const room={code,createdAt:Date.now(),updatedAt:Date.now(),revision:1,started:false,gameOver:false,config:cfg,hostToken,players:[],turn:0,turnNumber:1,dice:0,phase:'lobby',pending:null,deck:shuffle(Array.from({length:20},(_,i)=>i+1)),cursor:0,params:{...DEFAULT_PARAMS},logs:[],trends:[],history:[],lastEvent:null,landing:null};
 const player=joinRoom(room,name);player.token=hostToken;return room;
}
function joinRoom(room,name){
 if(room.started)throw Error('Das Spiel hat bereits begonnen.');
 if(room.players.length>=room.config.maxPlayers)throw Error('Der Spielraum ist voll.');
 const id=room.players.length, cfg=room.config;
 const p={id,token:token(),name:safeName(name,`Unternehmen ${id+1}`),pos:0,cash:cfg.initialCash,annual:cfg.annualIncome,base:cfg.starting.slice(),temp:[0,0,0],years:0,cumulative:0,owned:[],decisions:[],detained:false,bankrupt:false,finished:false};
 room.players.push(p);room.trends[id]=[];record(room,p,'Spielbeginn');change(room,'join',`${p.name} ist dem Spiel beigetreten.`,{playerId:id});return p;
}
function change(room,kind,message,details={}){
 room.revision++;room.updatedAt=Date.now();room.lastEvent={id:room.revision,kind,message,...details};
 room.logs.unshift(message);room.logs.length=Math.min(150,room.logs.length);
}
function record(room,p,reason){
 const entries=room.trends[p.id]||(room.trends[p.id]=[]);
 const point={turn:room.turnNumber,year:p.years,cash:money(p.cash),co2:money(footprint(p)),cumulative:money(p.cumulative),reason};
 const last=entries[entries.length-1];
 if(last&&last.turn===point.turn&&last.cash===point.cash&&last.co2===point.co2&&last.year===point.year)return;
 entries.push(point);if(entries.length>600)entries.splice(1,entries.length-600);
}
function changeScope(p,deltas,permanent){
 if(permanent)p.base=p.base.map((v,i)=>Math.max(0,v+Number(deltas[i]||0)));
 else p.temp=p.temp.map((v,i)=>Math.max(-p.base[i],v+Number(deltas[i]||0)));
}
function checkBankrupt(p){p.bankrupt=false;} // Schulden sind zulässig; keine Insolvenz-Ausscheidung.
function yearClose(room,p){
 const emitted=footprint(p);p.cumulative+=emitted;p.cash+=p.annual;p.years++;p.temp=[0,0,0];
 if(p.years>=room.config.maxYears)p.finished=true;
 checkBankrupt(p);record(room,p,`Jahresabschluss ${p.years}`);
 return {emitted,year:p.years,annual:p.annual};
}
function audit(room,p){
 const c=room.config,initial=sum(c.starting);
 const boundary=Math.round(Math.max(c.goal,initial-Math.max(0,(initial-c.goal)/c.maxYears)*(p.years+1)));
 const penalty=co2Charge(room,100,footprint(p)-boundary);p.cash-=penalty;
 checkBankrupt(p);record(room,p,'CO₂-Audit');return {boundary,penalty};
}
function eventEffect(room,id,p){
 const x=k=>number(room.params[String(k)],DEFAULT_PARAMS[String(k)]||0,-1e10,1e10);
 const e={cash:0,scope:[0,0,0],term:'cash',note:'',valid:true};
 switch(id){
  case 1:e.cash=-co2Charge(room,50,footprint(p));e.note='50 €/t × Startkapitalfaktor × aktueller jährlicher Footprint. Keine physische CO₂-Änderung.';break;
  case 2:e.cash=-(x(5)*x(24)+x(6)*x(25));e.note='Stromverbrauch × Strompreisaufschlag + Erdgasverbrauch × Gaspreisaufschlag.';break;
  case 3:if(footprint(p)<=600){e.cash=100000;e.note='Footprint ≤ 600 t: Kundenprämie.'}else e.note='Footprint über 600 t: kein Bonus.';break;
  case 4:e.scope[2]=-x(11)*x(26)*x(19)*x(27)/1000;e.term='permanent';break;
  case 5:if(p.owned.includes(24)){e.note='Predictive Maintenance vorhanden: keine Ausfallkosten.';e.valid=false;break;}e.cash=-x(45);e.scope[1]=x(28)*x(15)/1000;e.scope[2]=(x(29)*x(19)+x(28)*x(16))/1000;e.term='temporary';break;
  case 6:e.cash=40000;break;
  case 7:e.scope[2]=x(30)*x(31)/1000;e.term='temporary';break;
  case 8:e.scope[1]=-x(5)*x(32)*x(15)/1000;e.scope[2]=-x(5)*x(32)*x(16)/1000;e.term='permanent';e.note='Nur bislang nicht eingesparte kWh anrechnen.';break;
  case 9:if(x(8)<=0){e.valid=false;e.note='Kein Druckluftverbrauch hinterlegt.';break;}e.scope[1]=x(8)*x(33)*x(15)/1000;e.scope[2]=x(8)*x(33)*x(16)/1000;e.term='temporary';break;
  case 10:e.scope[0]=x(6)*x(7)*x(34)*x(17)/1000;e.scope[2]=x(6)*x(7)*x(34)*x(18)/1000;e.term='temporary';break;
  case 11:e.scope[1]=x(9)*x(35)*x(15)/1000;e.scope[2]=x(9)*x(35)*x(16)/1000;e.term='temporary';break;
  case 12:e.scope[1]=-x(10)*x(36)*x(15)/1000;e.scope[2]=-x(10)*x(36)*x(16)/1000;e.term='permanent';e.note='Bereits eingesparte Maschinen-kWh nicht doppelt zählen.';break;
  case 13:e.scope[2]=-x(11)*x(37)*x(19)/1000;e.term='permanent';e.note='Nur soweit tatsächlich weniger Primärmaterial zugekauft wird.';break;
  case 14:e.scope[2]=x(11)*x(38)*x(19)/1000;e.term='temporary';break;
  case 15:e.scope[2]=x(39)*(x(20)-x(21))/1000;e.term='temporary';break;
  case 16:e.scope[2]=-x(13)*x(40)*x(20)/1000;e.term='permanent';e.note='Bereits verlagerte t·km nicht doppelt zählen.';break;
  case 17:case 18:if(!p.owned.includes(6)){e.valid=false;e.note='Keine PV-Anlage gekauft: Karte ohne Wirkung.';break;}if(x(12)<=0){e.valid=false;e.note='PV-Jahresertrag 0: keine Wirkung.';break;}const s=id===17?-1:1;e.scope[1]=s*x(12)*x(41)*x(15)/1000;e.scope[2]=s*x(12)*x(41)*x(16)/1000;e.term='temporary';break;
  case 19:if(x(42)<=0||x(43)<=0){e.valid=false;e.note='Keine wirksame Kältemittelleckage hinterlegt.';break;}e.scope[0]=x(42)*x(43)/1000;e.term='temporary';break;
  case 20:e.scope[2]=-x(14)*x(44)*(x(22)-x(23))/1000;e.term='permanent';break;
 }
 return e;
}
function action(room,actorToken,input={},options={}){
 const actor=room.players.find(p=>p.token===actorToken);
 if(!actor)throw Error('Ungültiger Spielerzugang.');
 const host=actorToken===room.hostToken;
 const type=String(input.type||'');
 if(type==='start'){
  if(!host)throw Error('Nur die Spielleitung darf starten.');
  if(room.started)throw Error('Das Spiel läuft bereits.');
  if(room.players.length<2)throw Error('Mindestens zwei Spieler müssen beitreten.');
  room.started=true;room.phase='roll';change(room,'start','Das Spiel wurde gestartet.');return;
 }
 if(type==='setParam')throw Error('Parameter sind in dieser Spielversion gesperrt.');
 if(!room.started||room.gameOver)throw Error('Es läuft kein Spiel.');
 const p=room.players[room.turn];
 if(actor.id!==p.id)throw Error('Du bist noch nicht am Zug.');
 if(type==='detention'){
  if(room.phase!=='detention')throw Error('Kein Audit-Aufenthalt aktiv.');
  if(input.choice==='pay'){
   const fee=auditReleaseFee(room);
   if(fee>0&&p.cash<fee)throw Error('Kapital für Sofortberatung reicht nicht aus.');
   p.cash-=fee;p.detained=false;room.phase='roll';record(room,p,'Sofortberatung');change(room,'auditPay',`${p.name} zahlt ${money(fee)} € für die Sofortberatung.`);return;
  }
  if(input.choice==='skip'){
   p.detained=false;room.phase='end';change(room,'auditSkip',`${p.name} setzt den Spielzug im Audit aus.`);return;
  }
  throw Error('Ungültige Auditentscheidung.');
 }
 if(type==='roll'){
  if(room.phase!=='roll'||p.detained||p.finished)throw Error('Würfeln ist derzeit nicht möglich.');
  const die=Number.isInteger(options.forcedDie)&&options.forcedDie>=1&&options.forcedDie<=6?options.forcedDie:crypto.randomInt(1,7);
  room.dice=die;let pos=p.pos+die,closing=null;
  if(pos>=40){closing=yearClose(room,p);pos-=40;}
  p.pos=pos;room.phase='end';room.pending=null;
  const landedField=FIELDS[pos].number;
  let eventId=null,eventResult=null,details='';
  if(!p.finished){
   const field=FIELDS[pos];
   switch(field.type){
    case 'Investition':room.phase='decision';room.pending={kind:'invest',index:pos};break;
    case 'Entscheidung':if(!p.decisions.includes(field.number)){room.phase='decision';room.pending={kind:'choose',index:pos};}break;
    case 'Ereigniskarte':{
      eventId=room.deck[room.cursor];room.cursor=(room.cursor+1)%20;
      // Pflicht-Ereignis: die Wirkung wird sofort beim Betreten angewendet.
      const e=eventEffect(room,eventId,p);eventResult={cash:0,scope:[0,0,0],term:e.term,valid:e.valid,note:e.note};
      if(e.valid){p.cash+=e.cash;changeScope(p,e.scope,e.term==='permanent');eventResult.cash=e.cash;eventResult.scope=e.scope;}
      checkBankrupt(p);
      room.history.push({player:p.name,card:eventId,year:p.years+1,ignored:!e.valid,cash:eventResult.cash,scope:eventResult.scope,term:e.term});
      record(room,p,`Ereignis ${eventId}`);
      details=`${CARDS[eventId-1].title}: ${e.valid?'Wirkung automatisch angewendet':'ohne Wirkung (Voraussetzung nicht erfüllt)'}.`;
      break;
    }
    case 'Audit':{const a=audit(room,p);details=`Auditgebühr ${money(a.penalty)} € bei Grenze ${a.boundary} t.`;break;}
    case 'Versetzung zum Audit':{p.pos=10;const a=audit(room,p);p.detained=true;details=`Zum Audit versetzt: ${money(a.penalty)} € Gebühr.`;break;}
    case 'CO₂-Preis':{const cost=co2Charge(room,100,footprint(p));p.cash-=cost;checkBankrupt(p);record(room,p,'CO₂-Preis');details=`CO₂-Abgabe ${money(cost)} € (Satz: ${money(100*co2Factor(room))}/t).`;break;}
    case 'Förderung':p.cash+=60000;record(room,p,'Innovationsförderung');details='+60.000 € Förderung.';break;
    case 'Wissenstransfer':p.cash+=20000;record(room,p,'Wissenstransfer');details='+20.000 € Wissenstransfer.';break;
   }
  }
  const msg=`${p.name} würfelt ${die} auf Feld ${p.pos+1}${closing?` · Jahr ${closing.year}: ${money(closing.emitted)} t CO₂e`:''}${details?` · ${details}`:''}.`;
  room.landing={fieldNumber:landedField,playerId:p.id,turnNumber:room.turnNumber,eventId,eventResult,closing,message:msg,resolution:null};
  change(room,'roll',msg,{die,playerId:p.id,eventId,eventResult,closing,landedField});return;
 }
 if(type==='invest'){
  if(room.phase!=='decision'||room.pending?.kind!=='invest')throw Error('Keine offene Investition.');
  const field=FIELDS[room.pending.index],cost=Math.max(0,-Number(field.capital));
  if(input.choice==='buy'){
   if(p.owned.includes(field.number))throw Error('Investition bereits gekauft.');
   if(cost>0&&p.cash<cost)throw Error('Nicht genügend Kapital.');
   p.cash+=Number(field.capital)||0;p.annual+=Number(field.annual)||0;changeScope(p,field.scope,true);p.owned.push(field.number);
   record(room,p,`Investition ${field.number}`);
   change(room,'invest',`${p.name} kauft ${field.name} für ${money(cost)} €.`);
  }else if(input.choice==='pass')change(room,'invest',`${p.name} verzichtet auf ${field.name}.`);
  else throw Error('Ungültige Investitionsoption.');
  room.phase='end';room.pending=null;if(room.landing)room.landing.resolution=room.lastEvent.message;return;
 }
 if(type==='choose'){
  if(room.phase!=='decision'||room.pending?.kind!=='choose')throw Error('Keine offene Unternehmensentscheidung.');
  const field=FIELDS[room.pending.index],ix=Number(input.option);
  if(!Number.isInteger(ix)||ix<0||ix>=field.options.length)throw Error('Ungültige Auswahl.');
  if(p.decisions.includes(field.number))throw Error('Entscheidung bereits getroffen.');
  const o=field.options[ix];if(o.cash<0&&p.cash< -o.cash)throw Error('Für diese Entscheidung reicht das Kapital nicht aus.');
  p.cash+=o.cash;p.annual+=o.annual;changeScope(p,o.scope,true);p.decisions.push(field.number);record(room,p,`Entscheidung ${field.number}`);
  room.phase='end';room.pending=null;change(room,'choose',`${p.name}: ${field.name} – ${o.name}.`);if(room.landing)room.landing.resolution=room.lastEvent.message;return;
 }
 if(type==='event')throw Error('Ereigniskarten werden automatisch angewendet und können nicht abgelehnt werden.');
 if(type==='end'){
  if(room.phase!=='end')throw Error('Der Zug ist noch nicht abgeschlossen.');
  const n=room.players.length;let next=-1;
  for(let k=1;k<=n;k++){const i=(room.turn+k)%n,v=room.players[i];if(!v.finished){next=i;break;}}
  if(next<0){room.gameOver=true;room.phase='over';change(room,'over','Spiel beendet – alle Unternehmen haben ihre Geschäftsjahre abgeschlossen.');return;}
  room.turn=next;room.turnNumber++;room.dice=0;room.landing=null;room.phase=room.players[next].detained?'detention':'roll';room.pending=null;
  change(room,'next',`Jetzt ist ${room.players[next].name} am Zug.`,{playerId:next});return;
 }
 throw Error('Aktion nicht bekannt.');
}
function publicRoom(room,who){
 const players=room.players.map(p=>{const {token,...publicP}=p;return {...publicP,bankrupt:false,scope:scopes(p),co2:footprint(p)};});
 let pending=null;const actor=room.players.find(p=>p.token===who);const current=room.players[room.turn];
 if(room.pending){pending={...room.pending};if(pending.kind==='event')pending.effect=eventEffect(room,pending.card,current);}
 return {code:room.code,revision:room.revision,started:room.started,gameOver:room.gameOver,config:room.config,players,turn:room.turn,turnNumber:room.turnNumber,dice:room.dice,phase:room.phase,pending,params:room.params,co2Factor:co2Factor(room),auditReleaseFee:auditReleaseFee(room),logs:room.logs,trends:room.trends,history:room.history,lastEvent:room.lastEvent,landing:room.landing||null,actorId:actor?.id??null,host:who===room.hostToken};
}
module.exports={DATA,FIELDS,CARDS,DEFAULT_PARAMS,createRoom,joinRoom,action,publicRoom,eventEffect,scopes,footprint,yearClose,co2Factor,co2Charge,auditReleaseFee};

