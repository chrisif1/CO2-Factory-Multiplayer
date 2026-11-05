'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const crypto=require('node:crypto');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
test('HTTP: Browserassets, 2 Clients, Spielstart, Autorisierung, persistierter Raum',async()=>{
 const port=30000+crypto.randomInt(20000),dir=fs.mkdtempSync(path.join(os.tmpdir(),'co2-multi-test-'));
 const proc=spawn(process.execPath,[path.join(__dirname,'..','server.js')],{env:{...process.env,PORT:String(port),CO2_DATA_DIR:dir},stdio:'ignore'});
 try{
  let alive=false;for(let i=0;i<70;i++){try{const v=await fetch(`http://127.0.0.1:${port}/api/health`);if(v.ok){alive=true;break}}catch{}await wait(80)}
  assert.ok(alive,'Server muss starten');
  const url=`http://127.0.0.1:${port}`;
  const html=await fetch(url+'/');assert.equal(html.status,200);assert.match(await html.text(),/CO₂ FACTORY/);
  const svg=await fetch(url+'/img/06.svg');assert.equal(svg.status,200);
  const resp=await fetch(url+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Host AG',config:{maxYears:2,maxPlayers:8}})});
  assert.equal(resp.status,201);const created=await resp.json();assert.match(created.code,/^[A-HJ-NP-Z2-9]{6}$/);
  const code=created.code,token=created.token;
  let bad=await fetch(url+`/api/rooms/${code}`);assert.equal(bad.status,401);
  let guest=await fetch(url+`/api/rooms/${code}/join`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Gast GmbH'})});assert.equal(guest.status,201);guest=await guest.json();
  bad=await fetch(url+`/api/rooms/${code}/action`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+guest.token},body:JSON.stringify({type:'start'})});assert.equal(bad.status,400);
  const started=await fetch(url+`/api/rooms/${code}/action`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({type:'start'})});assert.equal(started.status,200);
  const gamestate=await started.json();assert.equal(gamestate.players.length,2);assert.equal(gamestate.phase,'roll');assert.ok(!JSON.stringify(gamestate).includes(token));
  const roll=await fetch(url+`/api/rooms/${code}/action`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({type:'roll'})});assert.equal(roll.status,200);const rolled=await roll.json();assert.ok(rolled.dice>=1&&rolled.dice<=6);
  const watcher=await fetch(url+`/api/rooms/${code}`,{headers:{Authorization:'Bearer '+guest.token}});assert.equal(watcher.status,200);assert.equal((await watcher.json()).revision,rolled.revision);
  assert.ok(fs.existsSync(path.join(dir,code+'.json')));
 }finally{proc.kill();fs.rmSync(dir,{recursive:true,force:true});}
});
