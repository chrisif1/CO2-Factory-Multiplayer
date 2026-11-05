'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine');
function room(config={}){const r=E.createRoom('TEST23','Testwerk',{maxYears:1,...config});E.joinRoom(r,'Zweites Werk');E.action(r,r.hostToken,{type:'start'});return r;}
test('CO₂-Kosten skalieren exakt bei 0, kleinem und sehr hohem Startkapital',()=>{
 for(const cash of [0,10000,500000,1000000,2000000,20000000]){
  const r=room({initialCash:cash}),p=r.players[0];
  assert.equal(E.co2Charge(r,100,1000),cash/10);
  assert.equal(E.auditReleaseFee(r),cash*.04);
  assert.equal(E.eventEffect(r,1,p).cash,-cash*.05);
 }
});
test('Alle 20 Ereignisse werden genau einmal ausgeführt; fremde Spieler bleiben gesperrt',()=>{
 for(let id=1;id<=20;id++){
  const r=room(),p=r.players[0];p.pos=1;p.owned.push(6);r.deck[0]=id;
  const expected=E.eventEffect(r,id,p),before=p.cash;
  E.action(r,p.token,{type:'roll'},{forcedDie:1});
  assert.equal(r.phase,'end');assert.equal(r.pending,null);assert.equal(r.history.length,1);
  assert.equal(p.cash,before+(expected.valid?expected.cash:0));
  assert.equal(r.landing.fieldNumber,3);assert.equal(r.landing.eventId,id);
  assert.throws(()=>E.action(r,p.token,{type:'roll'}));
  assert.throws(()=>E.action(r,p.token,{type:'event',choice:'ignore'}),/automatisch/);
  assert.throws(()=>E.action(r,r.players[1].token,{type:'end'}),/am Zug/);
  assert.equal(r.history.length,1);
 }
});
test('Feldbezug bleibt bei gesperrten Parametern und nach Auswahl erhalten',()=>{
 const r=room(),p=r.players[0];E.action(r,p.token,{type:'roll'},{forcedDie:4});
 assert.throws(()=>E.action(r,r.hostToken,{type:'setParam',key:'5',value:1234}),/gesperrt/);
 assert.equal(r.landing.fieldNumber,5);
 E.action(r,p.token,{type:'choose',option:2});
 assert.match(r.landing.resolution,/Testwerk/);assert.equal(r.landing.fieldNumber,5);
 E.action(r,p.token,{type:'end'});assert.equal(r.landing,null);
});
test('Audit-Versetzung behält Landefeld 31 und separate tatsächliche Position',()=>{
 const r=room(),p=r.players[0];p.pos=29;
 E.action(r,p.token,{type:'roll'},{forcedDie:1});
 assert.equal(r.landing.fieldNumber,31);assert.equal(p.pos,10);assert.equal(p.detained,true);
});
test('Kostenlose Investitionen funktionieren auch mit negativem Kapital',()=>{
 const r=room(),p=r.players[0];p.cash=-10000;p.pos=13;
 E.action(r,p.token,{type:'roll'},{forcedDie:1});
 E.action(r,p.token,{type:'invest',choice:'buy'});
 assert.ok(p.owned.includes(15));assert.equal(p.cash,-10000);assert.equal(r.phase,'end');
});
test('8 Spieler mit Schulden spielen bis zur regulären Endwertung',()=>{
 const r=E.createRoom('TEST23','Testwerk',{maxYears:2,initialCash:10000,annualIncome:-200000});
 for(let i=1;i<8;i++)E.joinRoom(r,'Werk '+(i+1));
 E.action(r,r.hostToken,{type:'start'});let steps=0,sawDebt=false;
 while(!r.gameOver&&steps++<3000){
  const p=r.players[r.turn],token=p.token;
  if(p.cash<0)sawDebt=true;
  switch(r.phase){
   case 'roll':E.action(r,token,{type:'roll'},{forcedDie:1+(steps%6)});break;
   case 'decision':
    if(r.pending.kind==='invest')E.action(r,token,{type:'invest',choice:'pass'});
    else{const f=E.FIELDS[r.pending.index],option=f.options.findIndex(o=>o.cash>=0||p.cash>=-o.cash);assert.ok(option>=0);E.action(r,token,{type:'choose',option});}break;
   case 'detention':E.action(r,token,{type:'detention',choice:'skip'});break;
   case 'end':E.action(r,token,{type:'end'});break;
   default:assert.fail(r.phase);
  }
 }
 assert.equal(sawDebt,true);assert.equal(r.gameOver,true);assert.ok(steps<3000);
 assert.ok(r.players.every(p=>p.years===2&&!p.bankrupt));
});

test('Navigation bietet nur Spielbrett und CO₂/Budget an',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
 const nav=html.match(/<nav class="nav-tabs"[\s\S]*?<\/nav>/)[0];
 assert.match(nav,/data-view="board"/);assert.match(nav,/data-view="stats"/);
 assert.doesNotMatch(nav,/data-view="(?:cards|settings)"/);
});
