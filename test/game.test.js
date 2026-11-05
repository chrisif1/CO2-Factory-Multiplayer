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
test('20 Ereignisse, Voraussetzungen und temporäre Emissionen',()=>{
 const r=lobby();start(r);r.players[0].pos=1;r.deck[0]=17;
 E.action(r,actor(r),{type:'roll'},{forcedDie:1});assert.equal(r.pending.card,17);
 assert.equal(E.eventEffect(r,17,r.players[0]).valid,false);
 E.action(r,actor(r),{type:'event',choice:'apply'});assert.equal(r.players[0].temp.reduce((a,b)=>a+b,0),0);
 r.players[0].owned.push(6);const effect=E.eventEffect(r,17,r.players[0]);assert.equal(effect.valid,true);assert.equal(effect.term,'temporary');
 r.players[0].temp=[0,12,23];r.players[0].pos=39;
 E.yearClose(r,r.players[0]);assert.deepEqual(r.players[0].temp,[0,0,0]);assert.equal(r.players[0].years,1);
 for(let i=1;i<=20;i++){const e=E.eventEffect(r,i,r.players[0]);assert.equal(e.scope.length,3);assert.ok(Number.isFinite(e.cash));assert.ok(e.scope.every(Number.isFinite));}
});
test('Überqueren von Start bucht genau ein Jahr, Ende nach vereinbarter Dauer',()=>{
 const r=lobby({maxYears:1});start(r);r.players[0].pos=38;
 E.action(r,actor(r),{type:'roll'},{forcedDie:3});assert.equal(r.players[0].pos,1);assert.equal(r.players[0].years,1);assert.equal(r.players[0].cumulative,1000);assert.equal(r.players[0].cash,1200000);assert.equal(r.players[0].finished,true);
 E.action(r,actor(r),{type:'end'});assert.equal(r.turn,1);
 r.players[1].pos=39;E.action(r,actor(r),{type:'roll'},{forcedDie:2});E.action(r,actor(r),{type:'end'});
 assert.equal(r.gameOver,true);assert.equal(r.phase,'over');
});
test('Audit und Karte: negative Finanzen führen zur Insolvenz',()=>{
 const r=lobby();start(r);const p=r.players[0];p.cash=10;p.pos=9;E.action(r,actor(r),{type:'roll'},{forcedDie:1});assert.equal(p.bankrupt,true);assert.ok(p.cash<0);
});
test('Parameteränderungen sind Host-gebunden',()=>{
 const r=lobby();start(r);assert.throws(()=>E.action(r,r.players[1].token,{type:'setParam',key:'5',value:1000}),/Spielleitung/);
 E.action(r,r.players[0].token,{type:'setParam',key:'5',value:1000});assert.equal(r.params['5'],1000);
 assert.throws(()=>E.action(r,r.players[0].token,{type:'setParam',key:'5',value:-10}),/außerhalb/);
});
