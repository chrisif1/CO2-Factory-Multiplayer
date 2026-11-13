'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {estimateDuration}=require('../duration-estimate'),E=require('../engine');
test('Schätzung berücksichtigt Spielerzahl und gibt gerundete, begründete Zeitspannen zurück',()=>{
 const two=estimateDuration({maxPlayers:2}),four=estimateDuration({maxPlayers:4}),eight=estimateDuration({maxPlayers:8});
 for(const result of [two,four,eight]){assert.ok(result.minMinutes>=5);assert.ok(result.maxMinutes>=result.minMinutes);assert.equal(result.minMinutes%5,0);assert.equal(result.maxMinutes%5,0);assert.equal(result.samples,10);assert.deepEqual(result.secondsPerTurn,[20,40]);}
 assert.ok(four.maxMinutes>two.maxMinutes);assert.ok(eight.maxMinutes>four.maxMinutes);assert.equal(eight.players,8);
});
test('Ein nahe am Startwert liegendes Ziel ergibt eine kürzere Dauer',()=>{
 const close=estimateDuration({maxPlayers:4,goal:950}),far=estimateDuration({maxPlayers:4,goal:400});assert.ok(close.maxMinutes<far.maxMinutes);assert.equal(close.goal,950);
 const lowStart=estimateDuration({maxPlayers:4,s1:100,s2:100,s3:250,goal:400});assert.ok(lowStart.maxMinutes<far.maxMinutes);
});
test('Die Dauerrechnung verwendet dieselben angepassten Anfangsemissionen wie der echte Spielraum',()=>{
 const config={s1:10000,s2:10000,s3:10000,goal:350,maxPlayers:4},estimate=estimateDuration(config),room=E.createRoom('TEST23','Professor',config);
 assert.deepEqual(estimate.starting,room.config.starting);assert.equal(estimate.adjusted,true);assert.deepEqual(estimate.requestedStarting,[10000,10000,10000]);assert.equal(estimate.initial,estimate.starting.reduce((a,b)=>a+b,0));
});
test('Bereits erreichtes CO₂-Ziel benötigt null Spielzüge und null Spielminuten',()=>{
 for(const goal of [1000,2000]){const result=estimateDuration({goal});assert.equal(result.status,'alreadyReached');assert.equal(result.minMinutes,0);assert.equal(result.maxMinutes,0);assert.equal(result.medianTurns,0);}
});
test('Schätzung bleibt reproduzierbar, verändert Eingaben nicht und zählt nur Unternehmen',()=>{
 const config={hostOnly:true,maxPlayers:8,goal:600};const before=JSON.stringify(config),a=estimateDuration(config,3),b=estimateDuration(config,3);assert.deepEqual(a,b);assert.equal(JSON.stringify(config),before);assert.equal(a.players,3);assert.equal(estimateDuration({...config,hostOnly:false},3).maxMinutes,a.maxMinutes);
});
test('Extremwerte bleiben begrenzt und liefern bei geringer Finanzierung keine falsche Zeitgarantie',()=>{
 const result=estimateDuration({maxPlayers:99,initialCash:0,annualIncome:-1e10,goal:1});assert.equal(result.players,8);assert.ok(['uncertain','extended'].includes(result.status));assert.ok(result.maxMinutes>=result.minMinutes);assert.ok(result.samples===10);
});
