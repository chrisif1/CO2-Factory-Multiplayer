'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine'),field=source=>E.FIELDS.find(f=>f.sourceNumber===source);
function start(){const r=E.createRoom('TEST23','Professor',{hostOnly:true});for(let i=0;i<3;i++)E.joinRoom(r,'Werk '+i);E.action(r,r.hostToken,{type:'start'});return r;}
function draw(r,id){r.deck[r.cursor]=id;r.players[r.turn].pos=2;E.action(r,r.players[r.turn].token,{type:'roll'},{forcedDie:1});}
test('Vier politische Szenarien sind global, eindeutig gekennzeichnet und ohne physische CO₂-Wirkung',()=>{
 for(const id of [25,26,27,28]){const r=start(),c=E.CARDS[id-1],e=E.eventEffect(r,id,r.players[0]);assert.equal(c.global,true);assert.match(c.assumptions,/Fiktives/);assert.deepEqual(e.scope,[0,0,0]);assert.equal(e.term,'cash');}
});
test('Förderpaket honoriert nur bereits getätigte förderfähige Investitionen und deckelt den Zuschuss',()=>{
 const r=start(),p=r.players[0];assert.equal(E.eventEffect(r,25,p).cash,0);p.owned=[field(6).number,field(2).number];let e=E.eventEffect(r,25,p);assert.equal(e.cash,18000);assert.equal(e.baselineCash,0);assert.equal(e.bonusCash,18000);assert.equal(e.protections.length,2);
 p.owned=E.FIELDS.filter(f=>f.type==='Investition').map(f=>f.number);assert.equal(E.eventEffect(r,25,p).cash,40000);
});
test('Grenzausgleich richtet sich nach Scope 3, Startkapital und emissionsarmer Beschaffung',()=>{
 const r=start(),p=r.players[0];assert.equal(E.eventEffect(r,26,p).cash,-6750);p.owned=[field(17).number,field(30).number];assert.equal(E.eventEffect(r,26,p).cash,-2025);r.config.initialCash=1000000;assert.equal(E.eventEffect(r,26,p).cash,-6750);
});
test('Kreislaufvorgaben belasten vorbereitete Unternehmen geringer',()=>{
 const r=start(),p=r.players[0];assert.equal(E.eventEffect(r,27,p).cash,-20000);p.owned=[field(19).number,field(28).number,field(38).number];assert.equal(E.eventEffect(r,27,p).cash,-3360);
});
test('Öffentliche Aufträge verlangen das Klimakriterium und belohnen Lieferantennachweise zusätzlich',()=>{
 const r=start(),p=r.players[0];p.owned=[field(17).number];assert.equal(E.eventEffect(r,28,p).cash,0);p.base=[150,150,300];assert.equal(E.eventEffect(r,28,p).cash,30000);p.owned=[];assert.equal(E.eventEffect(r,28,p).cash,20000);
});
test('Politische Ereignisse treffen alle Aktiven genau einmal und erscheinen im persönlichen Bericht',()=>{
 const r=start();r.players[1].owned=[field(6).number];E.action(r,r.players[2].token,{type:'leave'});draw(r,25);assert.equal(r.players[0].cash,300000);assert.equal(r.players[1].cash,315000);assert.equal(r.players[2].cash,300000);assert.equal(r.globalEvents[0].results.length,2);assert.equal(r.globalEvents[0].theme,'funding');assert.equal(r.players[1].eventExperience[0].bonusCash,15000);const report=E.reflection(r,r.players[1]);assert.equal(report.events[0].title,'Förderpaket für Energieeffizienz');assert.equal(report.avoidedCosts,0);assert.throws(()=>E.action(r,r.players[0].token,{type:'event',choice:'ignore'}));
});
test('Laufende V1.7-Partie erhält politische Karten einmalig am Stapelende und behält gehaltenen Audit-Schutz',()=>{
 const r=start();r.rulesVersion='1.7';r.deck=E.CARDS.filter(c=>c.number<24).map(c=>c.number);r.cursor=8;r.players[1].auditPass=true;const next=r.deck[r.cursor],state=[r.turn,r.phase,r.players[1].token];assert.equal(E.upgradeRoom(r),true);assert.equal(r.rulesVersion,'1.8');assert.equal(r.deck[r.cursor],next);assert.deepEqual(r.deck.slice(r.cursor).concat(r.deck.slice(0,r.cursor)).slice(-4),[25,26,27,28]);assert.equal(r.deck.includes(24),false);assert.equal(r.players[1].auditPass,true);assert.deepEqual([r.turn,r.phase,r.players[1].token],state);assert.equal(E.upgradeRoom(r),false);assert.equal(new Set(r.deck).size,r.deck.length);
});
