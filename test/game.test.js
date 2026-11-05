'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine');
function lobby(opts={}){const r=E.createRoom('ABC234','Team A',{maxYears:2,maxPlayers:8,...opts});E.joinRoom(r,'Team B');return r;}
function start(r){E.action(r,r.players[0].token,{type:'start'});}
function actor(r){return r.players[r.turn].token;}
function endIf(r){if(r.phase==='decision'){const k=r.pending.kind;if(k==='invest')E.action(r,actor(r),{type:'invest',choice:'pass'});else if(k==='choose')E.action(r,actor(r),{type:'choose',option:2});else E.action(r,actor(r),{type:'event',choice:'ignore'});}if(r.phase==='end')E.action(r,actor(r),{type:'end'});}
test('Spielraum 2–8 Spieler und host-only Start',()=>{
 const r=lobby();assert.equal(r.players.length,2);assert.throws(()=>E.action(r,r.players[1].token,{type:'start'}),/Spielleitung/);
 for(let i=3;i<=8;i++)E.joinRoom(r,'Team '+i);assert.equal(r.players.length,8);
 assert.throws(()=>E.joinRoom(r,'zu viel'),/voll/);start(r);assert.equal(r.phase,'roll');assert.throws(()=>E.joinRoom(r,'zu spät'),/begonnen/);
 const pub=E.publicRoom(r,r.players[1].token);assert.equal(pub.players.length,8);assert.ok(!JSON.stringify(pub).includes(r.hostToken));assert.ok(!JSON.stringify(pub).includes(r.players[1].token));
});
test('Aktueller Spieler darf würfeln, andere werden blockiert',()=>{
 const r=lobby();start(r);assert.throws(()=>E.action(r,r.players[1].token,{type:'roll'}),/am Zug/);
 E.action(r,actor(r),{type:'roll'},{forcedDie:4});assert.equal(r.phase,'decision');assert.equal(r.pending.kind,'choose');assert.equal(r.players[0].pos,4);
 assert.throws(()=>E.action(r,r.players[1].token,{type:'choose',option:0}),/am Zug/);
 E.action(r,actor(r),{type:'choose',option:1});assert.equal(r.players[0].decisions[0],5);
 E.action(r,actor(r),{type:'end'});assert.equal(r.turn,1);
});
test('Investition verändert Kapital, Ergebnis und CO₂ und ist exklusiv pro Unternehmen',()=>{
 const r=lobby();start(r);E.action(r,actor(r),{type:'roll'},{forcedDie:1});assert.equal(r.pending.kind,'invest');
 E.action(r,actor(r),{type:'invest',choice:'buy'});
 assert.equal(r.players[0].cash,970000);assert.equal(r.players[0].annual,208000);assert.equal(r.players[0].base[1],290);assert.ok(r.players[0].owned.includes(2));
});
test('20 Pflicht-Ereignisse: Wirkung direkt beim Würfeln und keine Ablehnungsoption',()=>{
 const r=lobby();start(r);r.players[0].pos=1;r.deck[0]=17;
 E.action(r,actor(r),{type:'roll'},{forcedDie:1});
 assert.equal(r.lastEvent.eventId,17);assert.equal(r.phase,'end');assert.equal(r.pending,null);
 assert.equal(r.history.length,1);assert.equal(r.history[0].ignored,true);
 assert.throws(()=>E.action(r,actor(r),{type:'event',choice:'ignore'}),/automatisch/);
 const v=lobby();start(v);v.players[0].pos=1;v.deck[0]=1;
 E.action(v,actor(v),{type:'roll'},{forcedDie:1});
 assert.equal(v.players[0].cash,950000);assert.equal(v.history[0].cash,-50000);
 assert.equal(v.history.length,1);assert.equal(v.phase,'end');
 v.players[0].owned.push(6);
 const e=E.eventEffect(v,17,v.players[0]);assert.equal(e.valid,true);assert.equal(e.term,'temporary');
 v.players[0].temp=[0,12,23];v.players[0].pos=39;
 E.yearClose(v,v.players[0]);assert.deepEqual(v.players[0].temp,[0,0,0]);
 for(let i=1;i<=20;i++){const effect=E.eventEffect(v,i,v.players[0]);assert.equal(effect.scope.length,3);assert.ok(Number.isFinite(effect.cash));assert.ok(effect.scope.every(Number.isFinite));}
});
test('Überqueren von Start bucht genau ein Jahr, Ende nach vereinbarter Dauer',()=>{
 const r=lobby({maxYears:1});start(r);r.players[0].pos=38;
 E.action(r,actor(r),{type:'roll'},{forcedDie:3});assert.equal(r.players[0].pos,1);assert.equal(r.players[0].years,1);assert.equal(r.players[0].cumulative,1000);assert.equal(r.players[0].cash,1200000);assert.equal(r.players[0].finished,true);
 E.action(r,actor(r),{type:'end'});assert.equal(r.turn,1);
 r.players[1].pos=39;E.action(r,actor(r),{type:'roll'},{forcedDie:2});E.action(r,actor(r),{type:'end'});
 assert.equal(r.gameOver,true);assert.equal(r.phase,'over');
});
test('Negatives Kapital beendet keinen Spielzug und erlaubt das Weiterspielen',()=>{
 const r=lobby();start(r);const p=r.players[0];p.cash=10;p.pos=9;
 E.action(r,actor(r),{type:'roll'},{forcedDie:1});
 assert.ok(p.cash<0);assert.equal(p.bankrupt,false);assert.equal(r.phase,'end');
 E.action(r,actor(r),{type:'end'});assert.equal(r.turn,1);
 r.players[1].pos=9;E.action(r,actor(r),{type:'roll'},{forcedDie:1});E.action(r,actor(r),{type:'end'});
 assert.equal(r.turn,0);assert.equal(r.gameOver,false);
 E.action(r,actor(r),{type:'roll'},{forcedDie:1});assert.equal(p.pos,11);
});
test('CO₂-Preis und Audit proportional zum Startkapital, Referenz 1 Mio. €',()=>{
 for(const [cash,factor] of [[500000,.5],[1000000,1],[2000000,2]]){
  const room=lobby({initialCash:cash});start(room);
  assert.equal(E.co2Factor(room),factor);
  const p=room.players[0];p.pos=6;
  E.action(room,actor(room),{type:'roll'},{forcedDie:1}); // Feld 8, kein Preis
  // Separate auditable scenario
  const audit=lobby({initialCash:cash});start(audit);audit.players[0].pos=9;
  E.action(audit,actor(audit),{type:'roll'},{forcedDie:1});
  assert.equal(audit.players[0].cash,cash-30000*factor);
  const tax=lobby({initialCash:cash});start(tax);
  E.action(tax,actor(tax),{type:'roll'},{forcedDie:6});
  assert.equal(tax.players[0].cash,cash-100000*factor);
  assert.equal(E.auditReleaseFee(tax),40000*factor);
 }
});
test('Unternehmensentscheidung mit Schulden: kostenlose oder positive Optionen erlaubt',()=>{
 const r=lobby();start(r);const p=r.players[0];p.cash=-20000;
 E.action(r,actor(r),{type:'roll'},{forcedDie:4});
 assert.equal(r.pending.kind,'choose');
 E.action(r,actor(r),{type:'choose',option:2});
 assert.equal(p.cash,-20000);assert.equal(r.phase,'end');
});
test('Berechnungsparameter sind für Host und Gäste gesperrt',()=>{
 const r=lobby();start(r);const original=r.params['5'];
 for(const p of r.players)assert.throws(()=>E.action(r,p.token,{type:'setParam',key:'5',value:1000}),/gesperrt/);
 assert.equal(r.params['5'],original);
});
