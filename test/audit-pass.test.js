'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine');
function start(){const r=E.createRoom('TEST23','Professor',{hostOnly:true});for(let i=0;i<3;i++)E.joinRoom(r,'Werk '+(i+1));E.action(r,r.hostToken,{type:'start'});return r;}
function land(r,index){r.players[r.turn].pos=index-1;E.action(r,r.players[r.turn].token,{type:'roll'},{forcedDie:1});}
function drawPass(r){assert.ok(r.deck.includes(24));r.cursor=r.deck.indexOf(24);r.phase='roll';land(r,3);}
function end(r){E.action(r,r.players[r.turn].token,{type:'end'});}

test('Managementsystem ist persönlich, ohne sofortige Kosten oder CO₂-Wirkung und nur einmal im Stapel',()=>{
 const r=start(),p=r.players[0],before=[p.cash,p.annual,E.footprint(p)];drawPass(r);
 assert.equal(p.auditPass,true);assert.deepEqual([p.cash,p.annual,E.footprint(p)],before);assert.equal(r.deck.includes(24),false);
 assert.equal(r.deck.length,E.CARDS.length-1);assert.ok(r.cursor<r.deck.length);assert.ok(r.players.slice(1).every(p=>!p.auditPass));assert.equal(r.history.length,1);assert.equal(r.history[0].global,false);assert.equal(r.landing.eventResult.term,'held');
});
test('Gespeicherte Karte bleibt über eigene Jahresabschlüsse und andere Spielerzüge erhalten',()=>{
 const r=start();drawPass(r);const p=r.players[0];E.yearClose(r,p);assert.equal(p.auditPass,true);end(r);
 for(let i=0;i<2;i++){land(r,19);end(r);}assert.equal(r.turn,0);assert.equal(p.auditPass,true);assert.equal(r.deck.includes(24),false);
});
test('Zum Audit mit Karte: keine Gebühr, keine Sofortberatung, kein Aussetzen, Karte zurückgelegt',()=>{
 const r=start(),p=r.players[0];drawPass(r);r.phase='roll';const cash=p.cash;land(r,34);
 assert.equal(p.pos,14);assert.equal(p.cash,cash);assert.equal(p.detained,false);assert.equal(p.auditPass,false);assert.equal(p.auditPassUses,1);assert.equal(p.auditPassSavings,18000);assert.match(r.landing.message,/kein Aussetzen/);assert.equal(r.phase,'end');assert.equal(r.deck.filter(n=>n===24).length,1);
 end(r);for(let i=0;i<2;i++){land(r,19);end(r);}assert.equal(r.phase,'roll');assert.equal(r.turn,0);
});
test('Auch ein direkt betretenes Audit verbraucht den Schutz und erlässt die Gebühr',()=>{
 const r=start(),p=r.players[0];drawPass(r);r.phase='roll';land(r,14);assert.equal(p.cash,300000);assert.equal(p.auditPass,false);assert.equal(p.auditPassUses,1);assert.equal(p.detained,false);assert.ok(r.deck.includes(24));
});
test('Ohne gespeicherte Karte bleibt die normale Audit-Regel einschließlich Bezahlen/Aussetzen erhalten',()=>{
 const r=start(),p=r.players[0];land(r,34);assert.equal(p.cash,282000);assert.equal(p.detained,true);end(r);for(let i=0;i<2;i++){land(r,19);end(r);}assert.equal(r.phase,'detention');E.action(r,p.token,{type:'detention',choice:'pay'});assert.equal(p.cash,270000);assert.equal(r.phase,'roll');assert.equal(p.auditPassUses,0);
});
test('Ein Verbrauch schützt nicht vor dem nächsten Audit; später ist die Karte erneut ziehbar',()=>{
 const r=start(),p=r.players[0];drawPass(r);r.phase='roll';land(r,34);r.phase='roll';land(r,34);assert.equal(p.detained,true);assert.equal(p.cash,282000);p.detained=false;
 drawPass(r);assert.equal(p.auditPass,true);assert.equal(r.deck.includes(24),false);r.phase='roll';land(r,34);assert.equal(p.auditPassUses,2);assert.equal(p.auditPassSavings,36000);assert.equal(p.cash,282000);
});
test('Zurückgelegte Karte liegt hinter allen anderen noch ziehbaren Karten',()=>{
 const r=start();r.deck=Array.from({length:E.CARDS.length},(_,i)=>i+1);r.cursor=23;drawPass(r);r.phase='roll';land(r,34);
 const order=r.deck.slice(r.cursor).concat(r.deck.slice(0,r.cursor));assert.equal(order.at(-1),24);assert.equal(order.length,E.CARDS.length);assert.equal(new Set(order).size,E.CARDS.length);
});
test('Ausstieg gibt eine aufbewahrte Karte frei und ein anderes Unternehmen kann sie erhalten',()=>{
 const r=start();drawPass(r);const p=r.players[0];E.action(r,p.token,{type:'leave'});assert.equal(p.auditPass,false);assert.equal(r.turn,1);assert.ok(r.deck.includes(24));drawPass(r);assert.equal(r.players[1].auditPass,true);assert.equal(r.players[0].auditPassUses,0);
});
test('Speicherung erhält Kartenbesitz, Stapel und Audit-Zähler ohne Zugangstoken zu veröffentlichen',()=>{
 let r=start();drawPass(r);r=JSON.parse(JSON.stringify(r));const publicState=E.publicRoom(r,r.players[1].token);assert.equal(publicState.players[0].auditPass,true);assert.ok(!JSON.stringify(publicState).includes(r.players[0].token));assert.equal(r.deck.includes(24),false);
 r.phase='roll';land(r,34);r=JSON.parse(JSON.stringify(r));assert.equal(r.players[0].auditPassUses,1);assert.equal(r.players[0].auditPassSavings,18000);assert.equal(r.deck.filter(n=>n===24).length,1);
});
test('Audit-Schutz funktioniert bei Schulden und auch ohne anfallende Auditgebühr',()=>{
 const r=start(),p=r.players[0];drawPass(r);p.cash=-100;p.base=[50,50,50];r.phase='roll';land(r,34);assert.equal(p.cash,-100);assert.equal(p.detained,false);assert.equal(p.auditPassSavings,0);assert.equal(p.auditPassUses,1);
});
