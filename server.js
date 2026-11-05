'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const E=require('./engine');
const PORT=Number(process.env.PORT)||3000;
const HOST=process.env.HOST||'0.0.0.0';
const BASE=path.join(__dirname,'public');
const STORE=process.env.CO2_DATA_DIR?path.resolve(process.env.CO2_DATA_DIR):path.join(__dirname,'storage');
fs.mkdirSync(STORE,{recursive:true});
const rooms=new Map();
for(const name of fs.readdirSync(STORE)){
 if(!/^[A-HJ-NP-Z2-9]{6}\.json$/.test(name))continue;
 try{const data=JSON.parse(fs.readFileSync(path.join(STORE,name),'utf8'));
 if(data?.code===name.slice(0,6)&&Array.isArray(data.players)&&data.players.length<=8&&data.hostToken)rooms.set(data.code,data);
 }catch(err){console.error('Spielstand konnte nicht geladen werden:',name,err.message)}
}
function persist(room){
 const target=path.join(STORE,room.code+'.json');const tmp=target+'.tmp';
 fs.writeFileSync(tmp,JSON.stringify(room),'utf8');fs.renameSync(tmp,target);
}
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));}
function fault(res,status,message){send(res,status,{error:message});}
function bearer(req){const m=/^Bearer ([a-f0-9]{48})$/.exec(req.headers.authorization||'');return m?.[1]||'';}
function generateCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out;do{out=Array.from({length:6},()=>chars[crypto.randomInt(chars.length)]).join('')}while(rooms.has(out));return out;}
function body(req){return new Promise((resolve,reject)=>{
 let size=0,items=[];req.on('data',b=>{size+=b.length;if(size>16000){reject(Error('Anfrage zu groß.'));req.destroy();return;}items.push(b)});
 req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(items).toString('utf8')||'{}'));}catch{reject(Error('Ungültige JSON-Anfrage.'));}});
 req.on('error',reject);
 })}
const limiter=new Map();
function limited(req){
 const ip=req.socket.remoteAddress||'unknown',now=Date.now();
 const x=limiter.get(ip)||{time:now,count:0};if(now-x.time>60000){x.time=now;x.count=0}x.count++;limiter.set(ip,x);return x.count>30;
}
function staticFile(req,res,url){
 let file=url.pathname==='/'?'/index.html':url.pathname;
 if(!/^\/(?:index\.html|style\.css|client\.js|game-data\.json|logo-fh-ooe\.png|img\/\d{2}\.svg)$/.test(file))return fault(res,404,'Datei nicht gefunden.');
 const fullname=path.resolve(BASE,'.'+file);if(!fullname.startsWith(BASE+path.sep))return fault(res,404,'Datei nicht gefunden.');
 const mime=file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.json')?'application/json; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'image/png';
 fs.readFile(fullname,(err,data)=>{
  if(err)return fault(res,404,'Datei nicht gefunden.');
  res.writeHead(200,{'Content-Type':mime,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cache-Control':file==='/index.html'?'no-store':'public, max-age=600',
    'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"});
  res.end(data);
 });
}
const server=http.createServer(async(req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost');}catch{return fault(res,400,'Ungültige Adresse.');}
 const pathname=url.pathname;
 try{
  if(req.method==='GET'&&pathname==='/api/health')return send(res,200,{ok:true,rooms:rooms.size});
  if(req.method==='POST'&&pathname==='/api/rooms'){
   if(limited(req))return fault(res,429,'Zu viele neue Spielräume. Später erneut versuchen.');
   if(rooms.size>=100)return fault(res,503,'Maximale Anzahl aktiver Räume erreicht.');
   const input=await body(req),code=generateCode();const room=E.createRoom(code,input.name,input.config);
   rooms.set(code,room);persist(room);
   return send(res,201,{code,token:room.hostToken,playerId:0,room:E.publicRoom(room,room.hostToken)});
  }
  const m=/^\/api\/rooms\/([A-HJ-NP-Z2-9]{6})(?:\/(join|action))?$/.exec(pathname);
  if(m){
   const room=rooms.get(m[1]);if(!room)return fault(res,404,'Spielraum nicht gefunden.');
   const operation=m[2];
   if(req.method==='POST'&&operation==='join'){
    if(limited(req))return fault(res,429,'Zu viele Beitrittsversuche.');
    const input=await body(req);const p=E.joinRoom(room,input.name);persist(room);
    return send(res,201,{code:room.code,token:p.token,playerId:p.id,room:E.publicRoom(room,p.token)});
   }
   const token=bearer(req);
   if(!token||!room.players.some(p=>p.token===token))return fault(res,401,'Kein gültiger Zugang für diesen Spielraum.');
   if(req.method==='GET'&&!operation)return send(res,200,E.publicRoom(room,token));
   if(req.method==='POST'&&operation==='action'){
    const input=await body(req);
    if(input.type==='kick'){
     if(token!==room.hostToken||room.started)return fault(res,403,'Nur die Spielleitung kann vor Spielbeginn Plätze freigeben.');
     const id=Number(input.playerId);
     if(!Number.isInteger(id)||id<=0||id>=room.players.length)return fault(res,400,'Ungültiger Platz.');
     room.players.splice(id,1);room.players.forEach((p,i)=>p.id=i);
     room.trends=room.trends.filter((_,i)=>i!==id);
     room.revision++;room.updatedAt=Date.now();room.lastEvent={id:room.revision,kind:'kick',message:'Ein Platz wurde freigegeben.'};
    }else E.action(room,token,input);
    persist(room);return send(res,200,E.publicRoom(room,token));
   }
   return fault(res,405,'Methode nicht erlaubt.');
  }
  if(req.method!=='GET')return fault(res,405,'Methode nicht erlaubt.');
  return staticFile(req,res,url);
 }catch(err){
  if(err.code==='ECONNRESET')return;
  const business=/^(Ungültig|Mindestens|Das Spiel|Der Spielraum|Nur |Du bist|Kein |Würfeln|Kapital|Nicht |Für |Diese |Aktion |Parameter |Ereignis|Bereits)/.test(err.message);
  if(!business)console.error('Fehler:',err);
  return fault(res,business?400:400,err.message||'Verarbeitung fehlgeschlagen.');
 }
});
server.listen(PORT,HOST,()=>{
 console.log('\nCO₂ Factory Multiplayer gestartet!');
 console.log(`Am Host öffnen: http://localhost:${PORT}`);
 const urls=new Set();for(const iface of Object.values(os.networkInterfaces()))for(const a of iface||[]){if(a.family==='IPv4'&&!a.internal)urls.add(`http://${a.address}:${PORT}`);}
 if(urls.size)console.log('Im selben WLAN / LAN: '+[...urls].join(' oder '));
 console.log('Für Internetzugriff benötigt der Server eine öffentlich erreichbare HTTPS-Adresse.');
 console.log('Zum Beenden: Strg+C\n');
});
