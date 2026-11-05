'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
test('HTTP: separater Host, erster Platz entfernbar, Startrechte und Neuladen',async()=>{
 const port=30000+crypto.randomInt(20000),dir=fs.mkdtempSync(path.join(os.tmpdir(),'co2-host-test-'));
 const proc=spawn(process.execPath,[path.join(__dirname,'../server.js')],{env:{...process.env,PORT:String(port),CO2_DATA_DIR:dir},stdio:'ignore'});
 const url=`http://127.0.0.1:${port}`;
 const request=async(route,body,token)=>{const res=await fetch(url+route,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return {status:res.status,data:await res.json()};};
 try{
  let alive=false;for(let i=0;i<70;i++){try{if((await fetch(url+'/api/health')).ok){alive=true;break;}}catch{}await new Promise(r=>setTimeout(r,80));}assert.ok(alive);
  const h=await request('/api/rooms',{name:'Professor',config:{hostOnly:true,maxPlayers:8}});assert.equal(h.status,201);assert.equal(h.data.playerId,null);assert.equal(h.data.room.players.length,0);
  const base='/api/rooms/'+h.data.code,token=h.data.token;
  const a=await request(base+'/join',{name:'Erster Platz'});assert.equal(a.data.playerId,0);
  const kick=await request(base+'/action',{type:'kick',playerId:0},token);assert.equal(kick.status,200);assert.equal(kick.data.players.length,0);
  assert.equal((await request(base,null,a.data.token)).status,401);
  const p=await request(base+'/join',{name:'Team 1'});await request(base+'/join',{name:'Team 2'});
  assert.equal((await request(base+'/action',{type:'start'},p.data.token)).status,400);
  assert.equal((await request(base+'/action',{type:'start'},token)).status,200);
  assert.equal((await request(base+'/action',{type:'roll'},token)).status,400);
  assert.equal((await request(base+'/action',{type:'roll'},p.data.token)).status,200);
  const state=await request(base,null,token);assert.equal(state.status,200);assert.equal(state.data.actorId,null);assert.equal(state.data.host,true);
  const out=await request(base+'/action',{type:'leave'},p.data.token);assert.equal(out.status,200);assert.equal(out.data.players[0].withdrawn,true);assert.equal(out.data.turn,1);assert.equal(out.data.phase,'roll');
  assert.equal((await request(base+'/action',{type:'roll'},p.data.token)).status,400);
  assert.equal((await fetch(url+'/qrcode.js')).status,200);assert.equal((await fetch(url+'/landscape.css')).status,200);
  assert.equal((await fetch(url+'/logo-fh-ooe.png')).status,404);
  const network=await request('/api/network');assert.ok(Array.isArray(network.data.lanOrigins));
  const saved=JSON.parse(fs.readFileSync(path.join(dir,h.data.code+'.json'),'utf8'));assert.equal(saved.hostToken,token);assert.equal(saved.config.hostOnly,true);
 }finally{proc.kill();fs.rmSync(dir,{recursive:true,force:true});}
});
