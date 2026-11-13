'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const E=require('../engine');
const field=source=>E.FIELDS.find(f=>f.sourceNumber===source);
function lobby(config={},n=3){const r=E.createRoom('TEST23','Professor',{hostOnly:true,...config});for(let i=0;i<n;i++)E.joinRoom(r,'Team '+(i+1));return r;}
function start(config={},n=3){const r=lobby(config,n);E.action(r,r.hostToken,{type:'start'});return r;}
function land(r,source){const f=field(source),p=r.players[r.turn];p.pos=(f.number+38)%40;E.action(r,p.token,{type:'roll'},{forcedDie:1});return p;}
function end(r){E.action(r,r.players[r.turn].token,{type:'end'});}
function pass(r){const p=r.players[r.turn];if(r.phase==='decision'){if(r.pending.kind==='invest')E.action(r,p.token,{type:'invest',choice:'pass'});else{const f=E.FIELDS[r.pending.index],i=f.options.findIndex(o=>o.cash>=0||p.cash>=-o.cash);E.action(r,p.token,{type:'choose',option:i});}}if(r.phase==='detention')E.action(r,p.token,{type:'detention',choice:'skip'});if(r.phase==='end')end(r);}

test('Standardwerte 300.000 € Kapital, 100.000 € Ergebnis, keine Geschäftsjahresgrenze',()=>{
 const r=lobby({maxYears:1});assert.equal(r.config.initialCash,300000);assert.equal(r.config.annualIncome,100000);assert.equal(r.config.maxYears,undefined);
 assert.equal(r.players[0].cash,300000);assert.equal(r.players[0].annual,100000);
 const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');assert.doesNotMatch(html,/homeYears|name="maxYears"/);assert.match(html,/value="300000"/);assert.match(html,/value="100000"/);
});
test('Spielleitung ohne Figur und acht Teilnehmer, nur der Host darf starten',()=>{
 const r=E.createRoom('TEST23','Professor',{hostOnly:true});assert.equal(r.players.length,0);assert.equal(E.publicRoom(r,r.hostToken).actorId,null);
 assert.throws(()=>E.action(r,r.hostToken,{type:'start'}),/Mindestens/);
 for(let i=0;i<8;i++)E.joinRoom(r,'Werk '+i);assert.throws(()=>E.joinRoom(r,'Neuntes'),/voll/);
 assert.throws(()=>E.action(r,r.players[0].token,{type:'start'}),/Spielleitung/);E.action(r,r.hostToken,{type:'start'});
 assert.throws(()=>E.action(r,r.hostToken,{type:'roll'}),/nimmt nicht/);assert.equal(r.players.length,8);
});
test('Mitspielender Host bleibt als wählbare Alternative erhalten',()=>{
 const r=E.createRoom('TEST23','Host',{hostOnly:false});E.joinRoom(r,'Gast');E.action(r,r.hostToken,{type:'start'});assert.equal(E.publicRoom(r,r.hostToken).actorId,0);
 E.action(r,r.hostToken,{type:'roll'},{forcedDie:1});assert.equal(r.players[0].pos,1);
});
test('Neue Feldanordnung: 40 Felder, Audit in gegenüberliegenden Ecken, Ereignisse gleichmäßig',()=>{
 assert.equal(E.FIELDS.length,40);assert.deepEqual(E.FIELDS.map(f=>f.number),Array.from({length:40},(_,i)=>i+1));assert.equal(new Set(E.FIELDS.map(f=>f.sourceNumber)).size,40);
 assert.equal(E.FIELDS[14].type,'Audit');assert.equal(E.FIELDS[34].type,'Versetzung zum Audit');
 const events=E.FIELDS.filter(f=>f.type==='Ereigniskarte').map(f=>f.number);assert.deepEqual(events,[4,10,17,24,30,37]);
 const gaps=events.map((n,i)=>(events[(i+1)%events.length]-n+40)%40);assert.ok(gaps.every(g=>g===6||g===7));
});
test('LED-Investition bucht Kosten, Jahresergebnis und CO₂ exakt einmal',()=>{
 const r=start();const p=land(r,2);E.action(r,p.token,{type:'invest',choice:'buy'});assert.equal(p.cash,270000);assert.equal(p.annual,108000);assert.equal(p.base[1],290);
 assert.deepEqual(p.owned,[field(2).number]);assert.throws(()=>E.action(r,p.token,{type:'invest',choice:'buy'}));
});
test('Unbezahlbare Investition wird abgewiesen, Verzicht funktioniert',()=>{
 const r=start(),p=r.players[0];p.cash=1;land(r,26);assert.throws(()=>E.action(r,p.token,{type:'invest',choice:'buy'}),/Kapital/);assert.equal(p.cash,1);E.action(r,p.token,{type:'invest',choice:'pass'});end(r);assert.equal(r.turn,1);
});
test('Kostenloser Grünstromvertrag ist auch bei Schulden zulässig',()=>{
 const r=start(),p=r.players[0];p.cash=-20000;land(r,15);E.action(r,p.token,{type:'invest',choice:'buy'});assert.equal(p.cash,-20000);assert.ok(p.owned.includes(field(15).number));
});
test('Zugrechte und feste Parameter bleiben serverseitig geschützt',()=>{
 const r=start();assert.throws(()=>E.action(r,r.players[1].token,{type:'roll'}),/am Zug/);
 for(const token of [r.hostToken,r.players[0].token])assert.throws(()=>E.action(r,token,{type:'setParam',key:'5',value:100}),/gesperrt/);
 assert.ok(!JSON.stringify(E.publicRoom(r,r.hostToken)).includes(r.hostToken));
});
test('Alle 28 Pflicht-Ereignisse wirken genau einmal und sind nicht ablehnbar',()=>{
 for(let id=1;id<=E.CARDS.length;id++){const r=start(),p=r.players[0];p.owned.push(field(6).number);r.deck[0]=id;const effect=E.eventEffect(r,id,p),cash=p.cash;land(r,3);
  assert.equal(r.history.length,E.CARDS[id-1].global?r.players.length:1);assert.equal(r.pending,null);assert.equal(r.phase,'end');assert.equal(p.cash,cash+(effect.valid?effect.cash:0));
  assert.throws(()=>E.action(r,p.token,{type:'event',choice:'ignore'}),/automatisch/);assert.throws(()=>E.action(r,p.token,{type:'roll'}));assert.equal(r.history.length,E.CARDS[id-1].global?r.players.length:1);
 }
});
test('PV und Predictive-Maintenance-Bedingungen folgen den Maßnahmen statt alten Feldnummern',()=>{
 const r=start(),p=r.players[0];assert.equal(E.eventEffect(r,17,p).cash,0);p.owned.push(field(6).number);assert.equal(E.eventEffect(r,17,p).cash,12000);
 assert.equal(E.eventEffect(r,5,p).valid,true);p.owned.push(field(24).number);assert.equal(E.eventEffect(r,5,p).valid,false);
});
test('CO₂-Strafen skalieren auch bei 0 und hohen Startwerten exakt',()=>{
 for(const cash of [0,10000,300000,1000000,20000000]){const r=start({initialCash:cash});assert.equal(E.co2Charge(r,100,1000),cash/10);assert.equal(E.auditReleaseFee(r),cash*.04);}
});
test('Audit prüft das CO₂-Ziel, Versetzung geht korrekt auf Feld 15',()=>{
 const r=start(),p=land(r,31);assert.equal(p.pos,14);assert.equal(r.landing.fieldNumber,35);assert.equal(p.detained,true);assert.equal(p.cash,282000);assert.equal(p.years,0);
});
test('Normales Überqueren von Start zahlt ein Jahresergebnis und zählt Emissionen einmal',()=>{
 const r=start(),p=r.players[0];p.pos=38;E.action(r,p.token,{type:'roll'},{forcedDie:3});assert.equal(p.pos,1);assert.equal(p.years,1);assert.equal(p.cash,400000);assert.equal(p.cumulative,1000);assert.equal(r.landing.closing.multiplier,1);assert.equal(p.finished,false);
});
test('Exakte Landung auf Feld 1 zahlt das 1,2-Fache, aber kumuliert CO₂ nur einmal',()=>{
 const r=start(),p=r.players[0];p.pos=37;E.action(r,p.token,{type:'roll'},{forcedDie:3});assert.equal(p.pos,0);assert.equal(p.years,1);assert.equal(p.cash,420000);assert.equal(p.cumulative,1000);assert.equal(r.landing.closing.payout,120000);assert.equal(r.landing.closing.multiplier,1.2);
});
test('Exakte Landung verwendet das 1,2-fache aktuelle Ergebnis inklusive Investitionswirkung',()=>{
 const r=start(),p=r.players[0];p.annual=108000;p.pos=39;E.action(r,p.token,{type:'roll'},{forcedDie:1});assert.equal(p.cash,429600);assert.equal(r.landing.closing.payout,129600);
});
test('Auch ein negatives Jahresergebnis wird auf Feld 1 mit 1,2 multipliziert',()=>{
 const r=start(),p=r.players[0];p.annual=-5000;p.pos=39;E.action(r,p.token,{type:'roll'},{forcedDie:1});assert.equal(p.cash,294000);assert.equal(p.cumulative,1000);
});
test('Es gibt nach acht oder zwanzig Jahren kein automatisches Ausscheiden',()=>{
 const r=start({maxYears:1}),p=r.players[0];for(let i=0;i<21;i++)E.yearClose(r,p);assert.equal(p.years,21);assert.equal(p.finished,false);assert.equal(r.gameOver,false);
});
test('Erster Spieler erreicht Ziel: alle späteren Spieler dürfen genau einmal nachziehen',()=>{
 const r=start(),p=r.players[0];p.base=[100,100,250];land(r,6);E.action(r,p.token,{type:'invest',choice:'buy'});assert.equal(E.footprint(p),350);assert.deepEqual(r.finalRound.pendingIds,[1,2]);assert.equal(r.gameOver,false);end(r);
 assert.equal(r.turn,1);land(r,2);E.action(r,r.players[1].token,{type:'invest',choice:'pass'});end(r);assert.equal(r.turn,2);land(r,2);E.action(r,r.players[2].token,{type:'invest',choice:'pass'});end(r);
 assert.equal(r.gameOver,true);assert.deepEqual(r.players.map(p=>p.turns),[1,1,1]);assert.equal(r.finishReason,'goal');
});
test('Ziel in der Mitte der Reihenfolge gibt früheren Spielern keinen Extrazug',()=>{
 const r=start({},4);land(r,2);E.action(r,r.players[0].token,{type:'invest',choice:'pass'});end(r);assert.equal(r.turn,1);
 r.players[1].base=[100,100,200];land(r,20);assert.deepEqual(r.finalRound.pendingIds,[2,3]);end(r);
 for(let i=2;i<=3;i++){assert.equal(r.turn,i);land(r,2);E.action(r,r.players[i].token,{type:'invest',choice:'pass'});end(r);}
 assert.equal(r.gameOver,true);assert.deepEqual(r.players.map(p=>p.turns),[1,1,1,1]);
});
test('Erreicht der letzte Spieler das Ziel, endet die Partie nach dessen Zug',()=>{
 const r=start();for(let i=0;i<2;i++){land(r,2);E.action(r,r.players[i].token,{type:'invest',choice:'pass'});end(r);}
 r.players[2].base=[100,100,200];land(r,20);assert.deepEqual(r.finalRound.pendingIds,[]);assert.equal(r.gameOver,false);end(r);assert.equal(r.gameOver,true);
});
test('Ein späterer Nachzieher darf ebenfalls das Ziel erreichen und besser abschneiden',()=>{
 const r=start(),p=r.players[0];p.base=[100,100,200];land(r,20);end(r);
 const q=r.players[1];q.base=[80,70,150];land(r,20);end(r);land(r,2);E.action(r,r.players[2].token,{type:'invest',choice:'pass'});end(r);
 assert.equal(r.finalRound.triggerPlayerId,0);assert.equal(E.ranking(r)[0].id,1);assert.equal(r.gameOver,true);
});
test('Gleichstand beim Jahres-CO₂ wird nach verbleibendem Kapital entschieden',()=>{
 const r=start();r.players[0].base=[100,100,200];r.players[1].base=[100,100,200];r.players[0].cash=5;r.players[1].cash=10;assert.equal(E.ranking(r)[0].id,1);
});
test('Sind bereits beim Start alle am Ziel, endet die Partie bei gleicher Zugzahl null',()=>{
 const r=start({goal:1000});assert.equal(r.gameOver,true);assert.deepEqual(r.players.map(p=>p.turns),[0,0,0]);
});
test('Negatives Kapital scheidet niemanden aus, positive Entscheidungen bleiben möglich',()=>{
 const r=start(),p=r.players[0];p.cash=-20000;land(r,5);E.action(r,p.token,{type:'choose',option:0});assert.equal(p.cash,90000);assert.equal(p.withdrawn,undefined);end(r);assert.equal(r.turn,1);
});
test('Aktiver Ausstieg verwirft die Entscheidung und gibt den nächsten Würfelzug frei',()=>{
 const r=start(),p=land(r,5);assert.equal(r.phase,'decision');E.action(r,p.token,{type:'leave'});assert.equal(p.withdrawn,true);assert.equal(r.turn,1);assert.equal(r.pending,null);assert.equal(r.phase,'roll');assert.throws(()=>E.action(r,p.token,{type:'roll'}),/ausgestiegen/);
});
test('Ausgestiegene Nachzieher werden übersprungen, ohne die letzte Runde zu verlängern',()=>{
 const r=start();r.players[0].base=[100,100,200];land(r,20);E.action(r,r.players[2].token,{type:'leave'});end(r);assert.equal(r.turn,1);land(r,2);E.action(r,r.players[1].token,{type:'invest',choice:'pass'});end(r);assert.equal(r.gameOver,true);assert.ok(!E.ranking(r).some(p=>p.id===2));
});
test('Wenn der Zielauslöser aussteigt, bleiben Nachziehrechte der anderen bestehen',()=>{
 const r=start();r.players[0].base=[100,100,200];land(r,20);E.action(r,r.players[0].token,{type:'leave'});assert.equal(r.turn,1);assert.deepEqual(r.finalRound.pendingIds,[1,2]);assert.equal(r.gameOver,false);
});
test('Alle aussteigen beendet das Spiel; Ausstieg des reinen Professors ändert keine Züge',()=>{
 const r=start();E.action(r,r.hostToken,{type:'leave'});assert.equal(r.turn,0);for(const p of r.players)E.action(r,p.token,{type:'leave'});assert.equal(r.gameOver,true);assert.equal(r.finishReason,'withdrawal');
});
test('Ausstieg in der Lobby gibt Platz und Nummer frei',()=>{
 const r=lobby();E.action(r,r.players[0].token,{type:'leave'});assert.equal(r.players.length,2);assert.equal(r.players[0].id,0);assert.equal(E.joinRoom(r,'Neu').id,2);
});
test('QR-Code bleibt lokal und skaliert für HTTPS sowie LAN-Adressen',()=>{
 const factory=require('../public/qrcode');for(const url of ['https://co2-factory-multiplayer.onrender.com/?room=TEST23','http://192.168.1.10:3000/?room=TEST23']){const qr=factory(0,'M');qr.addData(url);qr.make();assert.ok(qr.getModuleCount()>20);assert.match(qr.createSvgTag({cellSize:6,margin:24,scalable:true}),/viewBox/);}
});
test('Acht Unternehmen können mit den Standardwerten bis zum CO₂-Ziel spielen',()=>{
 const r=start({},8);let steps=0;
 while(!r.gameOver&&steps++<8000){const p=r.players[r.turn];if(r.phase==='roll')E.action(r,p.token,{type:'roll'},{forcedDie:1+steps%6});
 else if(r.phase==='decision'&&r.pending.kind==='invest'){const f=E.FIELDS[r.pending.index],cost=Math.max(0,-f.capital);E.action(r,p.token,{type:'invest',choice:!p.owned.includes(f.number)&&(cost===0||p.cash>=cost)?'buy':'pass'});}
 else if(r.phase==='decision'){const f=E.FIELDS[r.pending.index],candidates=f.options.map((o,i)=>({o,i})).filter(x=>(x.o.cash>=0||p.cash>=-x.o.cash)&&!E.publicRoom(r,p.token).pending.blockedOptions[x.i]).sort((a,b)=>a.o.scope.reduce((x,y)=>x+y,0)-b.o.scope.reduce((x,y)=>x+y,0));E.action(r,p.token,{type:'choose',option:candidates[0]?.i??-1});}
 else pass(r);}
 assert.ok(steps<8000);assert.equal(r.finishReason,'goal');assert.ok(E.ranking(r)[0]&&E.footprint(E.ranking(r)[0])<=r.config.goal);
 const turns=r.players.map(p=>p.turns);assert.equal(Math.max(...turns),Math.min(...turns));
});
