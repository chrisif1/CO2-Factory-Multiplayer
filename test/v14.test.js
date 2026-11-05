'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine');
test('Professor leitet ohne Figur und ohne Spielerplatz, bis zu acht Unternehmen',()=>{
 const r=E.createRoom('HOST23','Professor',{hostOnly:true,maxPlayers:8,maxYears:1});
 assert.equal(r.players.length,0);assert.equal(r.hostName,'Professor');
 let p=E.publicRoom(r,r.hostToken);assert.equal(p.actorId,null);assert.equal(p.host,true);
 assert.throws(()=>E.action(r,r.hostToken,{type:'start'}),/Mindestens/);
 for(let i=0;i<8;i++)E.joinRoom(r,'Werk '+(i+1));
 assert.throws(()=>E.joinRoom(r,'Neuntes Werk'),/voll/);
 assert.throws(()=>E.action(r,r.players[0].token,{type:'start'}),/Spielleitung/);
 E.action(r,r.hostToken,{type:'start'});assert.equal(r.turn,0);
 for(const type of ['roll','end','invest','choose','detention'])assert.throws(()=>E.action(r,r.hostToken,{type}),/nimmt nicht/);
 E.action(r,r.players[0].token,{type:'roll'},{forcedDie:1});
 assert.equal(r.players[0].pos,1);assert.equal(r.players.length,8);
 p=E.publicRoom(r,r.hostToken);assert.equal(p.actorId,null);assert.equal(p.players.length,8);
 assert.ok(!JSON.stringify(p).includes(r.hostToken));assert.ok(!p.players.some(v=>v.name==='Professor'));
});
test('Spielleitung kann alternativ weiterhin selbst mitspielen',()=>{
 const r=E.createRoom('HOST23','Mitspielender Host',{hostOnly:false});
 E.joinRoom(r,'Gast');E.action(r,r.hostToken,{type:'start'});
 assert.equal(E.publicRoom(r,r.hostToken).actorId,0);
 E.action(r,r.hostToken,{type:'roll'},{forcedDie:1});assert.equal(r.players[0].pos,1);
});
test('Acht Unternehmen beenden das Spiel regulär, Professor bleibt außerhalb der Zugfolge',()=>{
 const r=E.createRoom('HOST23','Professor',{hostOnly:true,maxPlayers:8,maxYears:1});
 for(let i=0;i<8;i++)E.joinRoom(r,'Team '+(i+1));E.action(r,r.hostToken,{type:'start'});
 let moves=0;
 while(!r.gameOver&&moves++<2000){const p=r.players[r.turn];assert.ok(p);assert.notEqual(p.token,r.hostToken);
  if(r.phase==='roll')E.action(r,p.token,{type:'roll'},{forcedDie:6});
  else if(r.phase==='end')E.action(r,p.token,{type:'end'});
  else if(r.phase==='detention')E.action(r,p.token,{type:'detention',choice:'skip'});
  else if(r.pending.kind==='invest')E.action(r,p.token,{type:'invest',choice:'pass'});
  else{const opts=E.FIELDS[r.pending.index].options,i=opts.findIndex(o=>o.cash>=0||p.cash>=-o.cash);E.action(r,p.token,{type:'choose',option:i});}
 }
 assert.ok(moves<2000);assert.equal(r.gameOver,true);assert.ok(r.players.every(p=>p.years===1));assert.equal(E.publicRoom(r,r.hostToken).actorId,null);
});
test('QR-Code wird lokal mit Fehlerkorrektur und ausreichendem Rand erzeugt',()=>{
 const qrFactory=require('../public/qrcode');
 for(const url of ['https://co2-factory-multiplayer.onrender.com/?room=HOST23','http://192.168.1.100:3000/?room=HOST23']){
  const qr=qrFactory(0,'M');qr.addData(url);qr.make();assert.ok(qr.getModuleCount()>20);
  const svg=qr.createSvgTag({cellSize:6,margin:24,scalable:true});assert.match(svg,/<svg/);
  assert.match(svg,/viewBox/);assert.doesNotMatch(svg,/(?:href|src)=/);
 }
});
