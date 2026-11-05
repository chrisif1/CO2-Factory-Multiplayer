'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),E=require('../engine');
function start(){const r=E.createRoom('QUIT23','Professor',{hostOnly:true,maxPlayers:8,maxYears:1});for(let i=0;i<3;i++)E.joinRoom(r,'Team '+(i+1));E.action(r,r.hostToken,{type:'start'});return r;}
test('Aktiver Spieler steigt in offener Entscheidung aus: nächster Spieler sofort würfelbereit',()=>{
 const r=start(),p=r.players[0];E.action(r,p.token,{type:'roll'},{forcedDie:4});assert.equal(r.phase,'decision');
 E.action(r,p.token,{type:'leave'});assert.equal(p.withdrawn,true);assert.equal(p.finished,true);
 assert.equal(r.turn,1);assert.equal(r.phase,'roll');assert.equal(r.pending,null);assert.equal(r.landing,null);assert.equal(r.dice,0);
 assert.throws(()=>E.action(r,p.token,{type:'roll'}),/ausgestiegen/);
 E.action(r,r.players[1].token,{type:'roll'},{forcedDie:1});assert.equal(r.players[1].pos,1);
});
test('Nicht aktiver Ausstieg verändert offene Auswahl nicht und wird später übersprungen',()=>{
 const r=start();E.action(r,r.players[0].token,{type:'roll'},{forcedDie:4});const pending={...r.pending};
 E.action(r,r.players[1].token,{type:'leave'});assert.equal(r.turn,0);assert.equal(r.phase,'decision');assert.deepEqual(r.pending,pending);
 E.action(r,r.players[0].token,{type:'choose',option:2});E.action(r,r.players[0].token,{type:'end'});
 assert.equal(r.turn,2);assert.equal(r.phase,'roll');
});
test('Wenn alle aussteigen, endet das Spiel ohne blockierten Zug; Host bleibt Zuschauer',()=>{
 const r=start();E.action(r,r.hostToken,{type:'leave'});assert.equal(r.turn,0);assert.equal(r.gameOver,false);
 for(const p of r.players)E.action(r,p.token,{type:'leave'});
 assert.equal(r.gameOver,true);assert.equal(r.phase,'over');assert.equal(r.pending,null);assert.ok(r.players.every(p=>p.withdrawn));
 assert.equal(E.publicRoom(r,r.hostToken).actorId,null);
});
test('Ausstieg vor Start gibt den Spielerplatz und seine Nummer wieder frei',()=>{
 const r=E.createRoom('QUIT23','Professor',{hostOnly:true});const a=E.joinRoom(r,'A'),b=E.joinRoom(r,'B');E.action(r,a.token,{type:'leave'});
 assert.equal(r.players.length,1);assert.equal(r.players[0].name,'B');assert.equal(b.id,0);assert.equal(r.trends.length,1);
 const c=E.joinRoom(r,'C');assert.equal(c.id,1);E.action(r,r.hostToken,{type:'start'});assert.equal(r.turn,0);
});
