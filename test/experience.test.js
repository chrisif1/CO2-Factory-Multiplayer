'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine'),F=require('../feasibility');
const field=s=>E.FIELDS.find(f=>f.sourceNumber===s);
function start(config={},n=3){const r=E.createRoom('TEST23','Professor',{hostOnly:true,...config});for(let i=0;i<n;i++)E.joinRoom(r,'Unternehmen '+(i+1));E.action(r,r.hostToken,{type:'start'});return r;}
function land(r,source){const p=r.players[r.turn];p.pos=(field(source).number+38)%40;E.action(r,p.token,{type:'roll'},{forcedDie:1});}
function global(r,id){r.deck[r.cursor]=id;land(r,3);}
function buy(r,source){land(r,source);E.action(r,r.players[r.turn].token,{type:'invest',choice:'buy'});r.phase='roll';}

test('Neun globale und vierzehn lokale Ereignisse bilden den vollständigen Stapel',()=>{
 const r=start();assert.equal(E.CARDS.length,23);assert.equal(E.CARDS.filter(c=>c.global).length,9);assert.equal(new Set(r.deck).size,23);assert.equal(r.deck.length,23);
});
test('Strompreiserhöhung trifft alle; vorherige PV schützt vollständig, LED teilweise',()=>{
 const r=start(),[a,b,c]=r.players;b.owned.push(field(6).number);c.owned.push(field(2).number);
 const baseline=E.eventEffect(r,2,a).cash;global(r,2);
 assert.equal(a.cash,300000+baseline);assert.equal(b.cash,300000);assert.equal(c.cash,300000+baseline*.9);
 assert.equal(r.globalEvents.length,1);assert.equal(r.globalEvents[0].results.length,3);
 assert.equal(b.eventExperience[0].protections[0],'Photovoltaik');assert.equal(b.eventExperience[0].baselineCash,baseline);
 assert.equal(r.history.length,3);assert.throws(()=>E.action(r,a.token,{type:'event',choice:'ignore'}));assert.equal(r.history.length,3);
});
test('Globale Ereignisse verändern weder Kapital noch Emissionen Ausgestiegener',()=>{
 const r=start();E.action(r,r.players[2].token,{type:'leave'});const before=JSON.stringify([r.players[2].cash,r.players[2].base,r.players[2].temp]);global(r,10);
 assert.equal(JSON.stringify([r.players[2].cash,r.players[2].base,r.players[2].temp]),before);assert.deepEqual(r.globalEvents[0].results.map(x=>x.playerId),[0,1]);
});
test('Kältewelle: kombinierte Dämmung, Wärmerückgewinnung und Wärmepumpe wirken multiplikativ',()=>{
 const r=start(),p=r.players[0],plain=E.eventEffect(r,10,p);p.owned=[39,8,33];const protectedEffect=E.eventEffect(r,10,p);
 assert.equal(protectedEffect.factor,.13);assert.equal(protectedEffect.cash,-2340);assert.ok(protectedEffect.scope[0]<plain.scope[0]);assert.equal(protectedEffect.protections.length,3);
});
test('Hitzewelle: PV, Dämmung und Antriebe schützen unterschiedlich',()=>{
 const r=start(),p=r.players[0];const plain=E.eventEffect(r,11,p);p.owned=[6,39,22];const e=E.eventEffect(r,11,p);assert.equal(e.factor,.255);assert.equal(e.cash,-4080);assert.ok(e.scope[1]<plain.scope[1]);
});
test('Bahnstreik zeigt auch einen Zielkonflikt: Schiene erhöht Exposition, Planung hilft',()=>{
 const r=start(),p=r.players[0];p.owned=[field(26).number];assert.equal(E.eventEffect(r,15,p).cash,-18000);p.owned.push(field(32).number);assert.equal(E.eventEffect(r,15,p).cash,-7200);
});
test('Neue globale Ereignisse reagieren auf Wartung, Kreislauf und digitale Logistik',()=>{
 const r=start(),p=r.players[0];assert.equal(E.eventEffect(r,21,p).cash,-30000);p.owned=[field(24).number];assert.equal(E.eventEffect(r,21,p).cash,-15000);
 p.owned=[field(19).number,field(38).number,field(28).number];assert.equal(E.eventEffect(r,22,p).cash,-7680);
 p.owned=[field(32).number,field(14).number];assert.equal(E.eventEffect(r,23,p).cash,-7500);assert.equal(E.eventEffect(r,23,p).scope[2],3.6);
});
test('Sonnenreiches Jahr ist global, begünstigt aber ausschließlich bereits gekaufte PV',()=>{
 const r=start();r.players[1].owned=[field(6).number];global(r,17);assert.equal(r.players[0].cash,300000);assert.equal(r.players[1].cash,312000);assert.ok(r.players[1].temp[1]<0);assert.equal(r.players[0].temp[1],0);
});
test('Lokale Ereignisse betreffen weiterhin nur das ziehende Unternehmen',()=>{
 const r=start();global(r,6);assert.deepEqual(r.players.map(p=>p.cash),[340000,300000,300000]);assert.equal(r.history.length,1);assert.equal(r.globalEvents.length,0);
});
test('Zeitweilige globale Emissionen enden am eigenen Jahresabschluss; Geld bleibt verbucht',()=>{
 const r=start();global(r,10);const cash=r.players[1].cash;assert.ok(r.players[1].temp[0]>0);E.yearClose(r,r.players[0]);assert.ok(r.players[1].temp[0]>0);E.yearClose(r,r.players[1]);assert.deepEqual(r.players[1].temp,[0,0,0]);assert.equal(r.players[1].cash,cash+100000);
});
test('Globale Zielerreichung eines anderen Spielers startet die korrekte Nachziehrunde',()=>{
 const r=start();r.players[0].owned=[6];r.players[0].base=[100,100,201];r.turn=1;global(r,17);
 assert.ok(E.footprint(r.players[0])<=400);assert.equal(r.finalRound.triggerPlayerId,0);assert.deepEqual(r.finalRound.pendingIds,[2]);
});
test('Globale Meldungen sind für alle authentifizierten Teilnehmer und die Spielleitung sichtbar',()=>{
 const r=start();global(r,11);for(const token of [r.hostToken,...r.players.map(p=>p.token)]){const out=E.publicRoom(r,token);assert.equal(out.globalEvents[0].theme,'heat');assert.equal(out.globalEvents[0].results.length,3);assert.ok(!JSON.stringify(out.globalEvents).includes(r.players[0].token));}
 r.phase='roll';global(r,22);assert.deepEqual(r.globalEvents.map(e=>e.id),[1,2]);assert.equal(r.players[0].eventExperience.length,2);
});
test('Reflexion bilanziert eigene Käufe, tatsächlich gebuchte Minderung und Ereignisschutz',()=>{
 const r=start({initialCash:1000000});buy(r,6);buy(r,2);global(r,2);const p=r.players[0],report=E.reflection(r,p);
 assert.equal(report.investments.length,2);assert.equal(report.cost,180000);assert.equal(report.annual,43000);assert.equal(report.actualReduction,110);assert.equal(report.avoidedCosts,96000);
 assert.ok(report.insights.some(t=>t.includes('Photovoltaik')||t.includes('LED')));assert.equal(report.questions.length,3);assert.equal(report.events[0].cash,0);assert.equal(E.publicRoom(r,p.token).reflections.length,0);
 r.gameOver=true;const output=E.publicRoom(r,p.token);assert.equal(output.reflections.length,3);assert.equal(output.reflections[1].investments.length,0);assert.ok(output.reflections[1].insights.some(t=>t.includes('keine Investition')));
});
test('Investitionsreflexion unterscheidet nominale von an der Nullgrenze verbuchter Wirkung',()=>{
 const r=start({initialCash:1000000}),p=r.players[0];p.base=[250,5,450];p.temp=[0,-5,0];buy(r,2);const report=E.reflection(r,p);assert.equal(report.nominalReduction,10);assert.equal(report.actualReduction,5);
});
test('Zielprüfung reduziert zu hohe Startwerte und lässt passende Werte unverändert',()=>{
 const normal=start();assert.deepEqual(normal.config.starting,[250,300,450]);assert.equal(normal.config.feasibility.adjusted,false);
 for(const goal of [0,1,100,350,400])for(const values of [[1000,1000,1000],[1e7,0,0],[0,1e7,0],[0,0,1e7]]){
  const r=E.createRoom('TEST23','Professor',{hostOnly:true,s1:values[0],s2:values[1],s3:values[2],goal});assert.ok(r.config.feasibility.worstCaseMinimum<=goal+1e-7);assert.ok(r.config.starting.every((v,i)=>v<=values[i]));
 }
});
test('Späte schädliche Entscheidung kann das Ziel nicht unerreichbar machen; Vertagen bleibt frei',()=>{
 const r=start({goal:10}),p=r.players[0];p.base=[0,0,5];p.owned=E.FIELDS.filter(f=>f.type==='Investition').map(f=>f.number);land(r,33);
 const out=E.publicRoom(r,p.token);assert.equal(out.pending.blockedOptions[2],true);assert.throws(()=>E.action(r,p.token,{type:'choose',option:2}),/unerreichbar/);assert.equal(r.phase,'decision');
 E.action(r,p.token,{type:'choose',option:-1});assert.equal(r.phase,'end');assert.ok(!p.decisions.includes(field(33).number));assert.deepEqual(p.base,[0,0,5]);
});
test('Jede zulässige Kauf- und Entscheidungsfolge erhält die rechnerische Zielerreichbarkeit',()=>{
 for(const goal of [0,20,350]){const r=start({initialCash:1e9,s1:100000,s2:100000,s3:100000,goal}),p=r.players[0];r.gameOver=false;p.finished=false;
  for(const f of E.FIELDS.filter(f=>['Investition','Entscheidung'].includes(f.type)).reverse()){
   r.phase='roll';p.pos=(f.number+38)%40;E.action(r,p.token,{type:'roll'},{forcedDie:1});
   if(f.type==='Investition')E.action(r,p.token,{type:'invest',choice:'buy'});
   else{const blocked=E.publicRoom(r,p.token).pending.blockedOptions;let option=blocked.findLastIndex(b=>!b);E.action(r,p.token,{type:'choose',option});}
   assert.ok(F.minimumAfterInvestments(p.base,p.owned,E.FIELDS)<=goal+1e-7);
  }
 }
});
