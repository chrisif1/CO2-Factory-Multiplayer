(()=>{'use strict';
const $=id=>document.getElementById(id);
const DICE=['⚀','⚁','⚂','⚃','⚄','⚅'];
const COLORS=['#127968','#ba7d37','#4b79b6','#a34874','#7360b0','#bf5145','#368c9c','#657c35'];
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n)||0);
const fmt=(n,d=2)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:d}).format(Number(n)||0);
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeNum=(n,d=0)=>Number.isFinite(Number(n))?Number(n):d;
const STORE='co2_factory_multiplayer_access_v1';
let access=null,room=null,DATA=null,view='board',pollBusy=false,actionBusy=false,lastSeen=-1,chartSelection='all',joinBase=location.origin,lastQrUrl='',alertTimer=null,dieTimer=null,connectionLost=false,lastOpenedPopupKey=null,modalFocusReturn=null,popupMode='action';
function safeLocalSet(key,value){try{localStorage.setItem(key,value)}catch{}}
function safeLocalGet(key){try{return localStorage.getItem(key)}catch{return null}}
function toast(message,error=false){const el=$('notification');el.textContent=message;el.className='notification'+(error?' error-toast':'');el.hidden=false;if(alertTimer)clearTimeout(alertTimer);alertTimer=setTimeout(()=>el.hidden=true,4500);}
function connected(ok){if(connectionLost===!ok)return;connectionLost=!ok;const el=$('connectIndicator');el.classList.toggle('offline',!ok);el.innerHTML=ok?'<i></i> Verbunden':'<i></i> Verbindung unterbrochen';}
async function api(url,method='GET',body=null,tokenOverride=null){
 const headers={};const key=tokenOverride??access?.token;if(key)headers.Authorization='Bearer '+key;
 if(body!==null)headers['Content-Type']='application/json';
 const res=await fetch(url,{method,headers,body:body===null?undefined:JSON.stringify(body),cache:'no-store'});
 let data;try{data=await res.json()}catch{throw Error('Der Server hat keine gültige Antwort gesendet.')}
 if(!res.ok)throw Error(data.error||`HTTP-Fehler ${res.status}`);
 return data;
}
const endpoint=()=>`/api/rooms/${access.code}`;
const estimateRequests=new Map();let estimateTimer=null;
function scheduleDurationEstimate(delay=450){
 if(estimateTimer)clearTimeout(estimateTimer);
 estimateTimer=setTimeout(()=>{
  const values=Object.fromEntries(new FormData($('createForm'))),names=['initialCash','annualIncome','s1','s2','s3','goal'];
  if(names.some(name=>values[name]===''||!$('createForm').elements.namedItem(name).checkValidity())){
   const state=estimateRequests.get('duration');state?.controller.abort();estimateRequests.delete('duration');$('durationValue').textContent='Startwerte vervollständigen';$('durationDetail').textContent='Gib gültige Start- und Zielwerte ein, um die Dauer zu schätzen.';$('durationNote').textContent='';return;
  }
  requestDurationEstimate('duration',Object.fromEntries(names.concat('maxPlayers').map(name=>[name,Number(values[name])])),Number(values.maxPlayers),'voll');
 },delay);
}
async function requestDurationEstimate(prefix,config,players,mode){
 const key=JSON.stringify([config.initialCash,config.annualIncome,config.starting||[config.s1,config.s2,config.s3],config.goal,players,mode]),old=estimateRequests.get(prefix);if(old?.key===key)return;
 old?.controller.abort();const state={key,controller:new AbortController()};estimateRequests.set(prefix,state);
 const value=$(prefix+'Value'),detail=$(prefix+'Detail'),note=$(prefix+'Note');value.textContent='Wird geschätzt …';note.textContent='';
 const normalized=config.starting?{...config,s1:config.starting[0],s2:config.starting[1],s3:config.starting[2]}:config;
 try{
  const response=await fetch('/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({config:normalized,players}),signal:state.controller.signal});if(!response.ok)throw Error('Schätzung nicht verfügbar');const estimate=await response.json();if(estimateRequests.get(prefix)!==state)return;
  value.textContent=estimate.status==='alreadyReached'?'0 Min. · Ziel bereits erreicht':estimate.status==='uncertain'?`über ${fmt(estimate.minMinutes,0)} Min. möglich`:`ca. ${fmt(estimate.minMinutes,0)}–${fmt(estimate.maxMinutes,0)}${estimate.status==='extended'?'+':''} Min.`;
  detail.textContent=`${mode==='aktuell'?'Aktuell':'Bei voller Belegung:'} ${estimate.players} Unternehmen · CO₂ ${fmt(estimate.initial,1)} → ${fmt(estimate.goal,1)} t/Jahr.`;
  note.textContent=estimate.status==='alreadyReached'?'Mit diesen Startwerten wird das Spielziel bereits ohne Spielzüge erreicht.':estimate.status==='uncertain'?'Mit diesen Werten kann die Partie sehr lange dauern; eine obere Grenze ist nicht verlässlich schätzbar. Annahme: 20–40 Sekunden pro Zug. Kapital und Jahresergebnis beeinflussen den Investitionsspielraum.':'Grobe Orientierung bei klimafreundlichen Investitionen: 20–40 Sekunden pro Zug und etwa 3 Minuten Vorbereitung. Würfelglück, Entscheidungen und Diskussionen verändern die Dauer.';
  if(estimate.status==='extended')note.textContent+=' Die Spanne ist nach oben offen: Wenn Geld für Investitionen fehlt, kann die Partie länger dauern.';
  if(estimate.adjusted)note.textContent+=' Die zu hohen CO₂-Startwerte wurden für ein erreichbares Ziel angepasst.';
 }catch(err){if(err.name==='AbortError'||estimateRequests.get(prefix)!==state)return;value.textContent='Schätzung gerade nicht verfügbar';detail.textContent='Die Partie kann trotzdem erstellt werden.';note.textContent='Ändere einen Startwert, um es erneut zu versuchen.';estimateRequests.delete(prefix);}
}
$('createForm').addEventListener('input',()=>scheduleDurationEstimate());$('createForm').addEventListener('change',()=>scheduleDurationEstimate());
function setActiveTab(next){if(!['board','stats'].includes(next))return;view=next;for(const b of document.querySelectorAll('[data-view]'))b.classList.toggle('active',b.dataset.view===next);
 for(const tab of ['board','stats'])$(tab+'View').hidden=tab!==next;
 if(room){if(next==='stats')renderStats();}}
function switchEntry(create){$('createForm').hidden=!create;$('joinForm').hidden=create;$('createTab').classList.toggle('selected',create);$('joinTab').classList.toggle('selected',!create);$('createTab').setAttribute('aria-selected',String(create));$('joinTab').setAttribute('aria-selected',String(!create));$('homeNotice').hidden=true;}
$('createTab').addEventListener('click',()=>switchEntry(true));$('joinTab').addEventListener('click',()=>switchEntry(false));
$('createForm').addEventListener('submit',async ev=>{
 ev.preventDefault();const form=ev.currentTarget,vals=Object.fromEntries(new FormData(form));const name=String(vals.name).trim();
 if(!name)return showHomeError('Bitte gib einen Unternehmensnamen ein.');
 const button=form.querySelector('button[type="submit"]');button.disabled=true;
 try{const result=await api('/api/rooms','POST',{name,config:{hostOnly:vals.mode==='host',maxPlayers:vals.maxPlayers,initialCash:vals.initialCash,annualIncome:vals.annualIncome,s1:vals.s1,s2:vals.s2,s3:vals.s3,goal:vals.goal}});
   attach(result);toast('Spielraum wurde erstellt. Teile jetzt den Einladungslink.');}
 catch(err){showHomeError(err.message)}finally{button.disabled=false}
});
$('joinForm').addEventListener('submit',async ev=>{
 ev.preventDefault();const f=ev.currentTarget,vals=Object.fromEntries(new FormData(f)),code=String(vals.code).trim().toUpperCase().replace(/\s/g,'');
 if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code))return showHomeError('Der Raumcode muss aus sechs Zeichen bestehen.');
 const btn=f.querySelector('button[type="submit"]');btn.disabled=true;
 try{const result=await api(`/api/rooms/${code}/join`,'POST',{name:String(vals.name).trim()});attach(result);toast('Du bist dem Spiel beigetreten.');}
 catch(err){showHomeError(err.message)}finally{btn.disabled=false}
});
function showHomeError(s){$('homeNotice').textContent=s;$('homeNotice').hidden=false;}
function attach(result){window.scrollTo(0,0);closeDetails();endPresented=false;lastOpenedPopupKey=null;access={code:result.code,token:result.token,playerId:result.playerId};safeLocalSet(STORE,JSON.stringify(access));lastSeen=result.room?.lastEvent?.id??-1;room=result.room;history.replaceState(null,'',`/?room=${result.code}`);$('switchRoomBtn').hidden=false;connected(true);render();}
async function leave(){
 if(!access||actionBusy)return;
 const playing=room?.started&&!room.gameOver&&room.actorId!==null;
 if(!confirm(playing?'Wirklich aussteigen? Dein Unternehmen scheidet aus. Ist es gerade am Zug, spielt sofort das nächste aktive Unternehmen weiter.':'Diesen Spielraum auf diesem Gerät verlassen?'))return;
 actionBusy=true;
 try{await api(endpoint()+'/action','POST',{type:'leave'});}
 catch(err){toast('Ausstieg konnte noch nicht bestätigt werden: '+err.message,true);return;}
 finally{actionBusy=false;}
 closeFieldPopup();closeDetails();if($('globalDialog').open)$('globalDialog').close();activeGlobal=null;globalAutomatic=false;endPresented=false;lastOpenedPopupKey=null;access=null;room=null;lastSeen=-1;safeLocalSet(STORE,'');history.replaceState(null,'','/');setActiveTab('board');
 $('home').hidden=false;$('waiting').hidden=true;$('playing').hidden=true;$('switchRoomBtn').hidden=true;document.body.classList.remove('is-playing');
 scheduleDurationEstimate(0);toast(playing?'Du bist ausgestiegen. Die übrigen Unternehmen spielen weiter.':'Spielraum verlassen.');
}
$('switchRoomBtn').addEventListener('click',leave);
async function poll(){if(!access||pollBusy)return;pollBusy=true;try{const session=access;const r=await api(endpoint());if(access!==session||room&&r.revision<room.revision)return;connected(true);if(!room||r.revision!==room.revision){const previous=lastSeen;room=r;lastSeen=r.lastEvent?.id??lastSeen;render();if(previous>=0&&r.lastEvent&&r.lastEvent.id>previous)animateEvent(r.lastEvent);}else room=r;
 }catch(err){connected(false);if(err.message.includes('Kein gültiger Zugang')){toast('Dieser Zugang ist nicht mehr gültig. Bitte erneut beitreten.',true);access=null;room=null;safeLocalSet(STORE,'');render();}}finally{pollBusy=false}}
async function postAction(body){if(actionBusy||!access)return;actionBusy=true;setBusy(true);try{const r=await api(endpoint()+'/action','POST',body);const previous=lastSeen;room=r;lastSeen=r.lastEvent?.id??lastSeen;connected(true);render();if(previous>=0&&r.lastEvent&&r.lastEvent.id>previous)animateEvent(r.lastEvent);}catch(err){toast(err.message,true);if(!$('fieldPopup').hidden){$('fieldPopupError').textContent=err.message;$('fieldPopupError').hidden=false;}}finally{actionBusy=false;setBusy(false)}}
function setBusy(b){$('rollBtn').disabled=b||!myTurn()||room?.phase!=='roll';$('nextBtn').disabled=b||!myTurn()||room?.phase!=='end';for(const button of document.querySelectorAll('#actionButtons button,#fieldPopupButtons button'))button.disabled=b||button.dataset.disabled==='true';if(!b&&!$('fieldPopup').hidden&&!$('fieldPopup').contains(document.activeElement))$('fieldPopupClose').focus({preventScroll:true});}
function myTurn(){return room&&room.started&&!room.gameOver&&room.players[room.turn]?.id===room.actorId;}
function render(){
 document.body.classList.toggle('is-playing',!!access&&!!room?.started);
 if(!access||!room){$('home').hidden=false;$('waiting').hidden=true;$('playing').hidden=true;scheduleDurationEstimate(0);return;}
 $('home').hidden=true;$('switchRoomBtn').hidden=false;
 if(!room.started){$('waiting').hidden=false;$('playing').hidden=true;renderLobby();return;}
 $('waiting').hidden=true;$('playing').hidden=false;renderHeader();renderBoard();renderPlayers();renderAction();renderLog();refreshExperience();maybeShowFieldPopup();
 if(view==='stats')renderStats();
 setBusy(actionBusy);
}
function renderLobby(){const c=room.config;$('roomCode').textContent=room.code;$('shareUrl').value=joinBase+'/?room='+room.code;renderJoinQr();$('hostRoleInfo').textContent=room.config.hostOnly?`Spielleitung: ${room.hostName} · spielt nicht mit`:'Spielleitung spielt selbst mit';$('playerCountTitle').textContent=`Spieler im Raum (${room.players.length}/${c.maxPlayers})`;
 const box=$('lobbyPlayers');box.textContent='';room.players.forEach((p,i)=>{const row=document.createElement('div');row.className='lobby-player';const left=document.createElement('div');left.className='left';const circ=document.createElement('span');circ.className='seat';circ.style.background=COLORS[i];circ.textContent=String(i+1);left.append(circ,document.createTextNode(p.name+(i===0&&!room.config.hostOnly?' · Spielleitung':'')));row.append(left);
 if(room.host&&(room.config.hostOnly||i!==0)){const kick=document.createElement('button');kick.className='subtle';kick.type='button';kick.textContent='Entfernen';kick.addEventListener('click',()=>postAction({type:'kick',playerId:p.id}));row.append(kick)}box.append(row)});
 $('lobbyConfig').innerHTML=`<dl><dt>Spielende</dt><dd>CO₂-Ziel + Runde nachziehen</dd><dt>Maximale Spielerzahl</dt><dd>${c.maxPlayers}</dd><dt>Startkapital</dt><dd>${euro(c.initialCash)}</dd><dt>CO₂-Ziel</dt><dd>${fmt(c.goal)} t</dd></dl>`;
 if(c.feasibility){const f=c.feasibility;const info=document.createElement('p');info.className='feasibility-note';info.textContent=f.adjusted?`Startemissionen angepasst: ${f.requested.map(n=>fmt(n)).join(' / ')} → ${c.starting.map(n=>fmt(n)).join(' / ')} t (Scope 1 / 2 / 3). Das Ziel bleibt mit den verfügbaren Investitionen erreichbar.`:`Ziel geprüft: Mit den verfügbaren Investitionen sind rechnerisch bis zu ${fmt(f.minimum)} t/Jahr möglich. Entscheidungen, die das Ziel unerreichbar machen würden, sind gesperrt.`;$('lobbyConfig').append(info);}
 requestDurationEstimate('lobbyDuration',c,room.players.length>=2?room.players.length:c.maxPlayers,room.players.length>=2?'aktuell':'voll');
 $('beginBtn').hidden=!room.host;$('beginBtn').disabled=room.players.length<2;$('waitHostText').hidden=!!room.host;
}
$('copyInvite').addEventListener('click',async()=>{const val=$('shareUrl').value;try{await navigator.clipboard.writeText(val);toast('Einladungslink kopiert.')}catch{$('shareUrl').focus();$('shareUrl').select();toast('Link markieren und mit Strg+C kopieren.')}});
$('beginBtn').addEventListener('click',()=>postAction({type:'start'}));
function standings(){return room.players.filter(p=>!p.withdrawn).slice().sort((a,b)=>a.co2-b.co2||b.cash-a.cash||a.id-b.id);}
function renderHeader(){
 const leader=standings().find(x=>x.co2<=room.config.goal);
 const p=room.gameOver?(leader||room.players[room.turn]):room.players[room.turn];
 $('mobileTurnName').textContent=`Spieler ${p.id+1} · ${p.name}`;$('mobileTurnField').textContent=`Feld ${currentFieldNumber()}`;
 $('turnNumber').textContent=room.finalRound?`LETZTE RUNDE ${room.finalRound.round}`:`RUNDE ${room.round||1} · ZUG ${room.turnNumber}`;
 $('turnTitle').textContent=room.gameOver?'Endwertung':`Am Zug: Spieler ${p.id+1} · ${p.name}`;
 const catchup=room.finalRound?` · ${room.finalRound.pendingIds.length} nachfolgende Unternehmen` : '';
 $('turnHint').textContent=room.gameOver?'Endwertung nach Jahres-CO₂; bei Gleichstand entscheidet das Kapital.':`Jahr ${p.years+1} · Feld ${p.pos+1}${catchup}`;
 $('inGameCode').textContent=room.code;
 const phaseLabel={roll:'Bereit zum Würfeln',decision:'Entscheidung erforderlich',end:'Zug abgeschlossen',detention:'CO₂-Audit',over:'Spielende'};
 $('turnPill').textContent=room.gameOver?'Spielende':room.finalRound?'Letzte Runde':phaseLabel[room.phase]||'Spiel läuft';
 $('centerPlayer').textContent=room.gameOver?'Spiel beendet':'Würfel';
 $('centerInstruction').hidden=!room.gameOver;
 $('rollBtn').disabled=!myTurn()||room.phase!=='roll';$('nextBtn').disabled=!myTurn()||room.phase!=='end';
 $('dieFace').textContent=room.dice>0?DICE[room.dice-1]:'–';
 $('centerPopupBtn').hidden=!myTurn()||!['decision','detention'].includes(room.phase);$('overviewToggle').textContent=`Unternehmen & Protokoll`;
 $('prominentGoal').innerHTML=`${fmt(room.config.goal,0)} <small>t/Jahr</small>`;$('resultsToggle').hidden=!room.gameOver;
}
function fieldCoords(ix){if(ix<15)return[6,14-ix];if(ix<21)return[20-ix,0];if(ix<35)return[0,ix-20];return[ix-34,14]}
function hideFieldTooltip(){const tip=$('fieldTooltip');if(tip)tip.hidden=true;}
function showFieldTooltip(element,field){
 if(!matchMedia('(min-width:781px) and (hover:hover) and (pointer:fine)').matches||!$('fieldPopup').hidden)return;
 const tip=$('fieldTooltip');tip.textContent=field.description||field.name;tip.hidden=false;
 const r=element.getBoundingClientRect(),h=tip.getBoundingClientRect().height,w=tip.getBoundingClientRect().width;
 const left=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2));
 let top=r.top-h-12;if(top<12)top=r.bottom+12;top=Math.max(12,Math.min(innerHeight-h-12,top));
 tip.style.left=left+'px';tip.style.top=top+'px';
}
document.addEventListener('scroll',hideFieldTooltip,true);window.addEventListener('resize',hideFieldTooltip);
function renderBoard(){
 hideFieldTooltip();
 const b=$('boardGrid');b.querySelectorAll('.cell').forEach(x=>x.remove());const current=room.players[room.turn];
 DATA.fields.forEach((f,idx)=>{const [r,c]=fieldCoords(idx);const el=document.createElement('div');
 const style={'Investition':'invest','Ereigniskarte':'event','Entscheidung':'decision','Audit':'audit','Versetzung zum Audit':'goaudit','CO₂-Preis':'tax','Geschäftsjahr':'start','Förderung':'bonus','Wissenstransfer':'bonus'};
 const desc=(f.description||'').replace(/\s+/g,' ').trim();
 const shortDesc=desc.length>120?desc.slice(0,117)+'…':desc;
 const imgSrc=f.type==='Ereigniskarte'?'/img/event.svg':`/img/${String(f.number).padStart(2,'0')}.svg?v=1.8.0`;
 el.className=`cell ${style[f.type]||''} ${current.pos===idx&&!room.gameOver?'current':''}`;el.style.gridRow=String(r+1);el.style.gridColumn=String(c+1);el.setAttribute('aria-describedby','fieldTooltip');el.addEventListener('pointerenter',()=>showFieldTooltip(el,f));el.addEventListener('pointerleave',hideFieldTooltip);el.addEventListener('focus',()=>showFieldTooltip(el,f));el.addEventListener('blur',hideFieldTooltip);el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',`Feld ${f.number}: ${f.name} öffnen`);el.addEventListener('click',()=>openFieldPopup(true,f.number));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFieldPopup(true,f.number);}});
 let chips='';room.players.forEach((p,i)=>{if(p.pos===idx&&!p.withdrawn)chips+=`<span class="token${p.id===room.turn&&!room.gameOver?' current-token':''}" style="--c:${COLORS[i]}" title="Spieler ${i+1}: ${clean(p.name)}" aria-label="Spieler ${i+1}: ${clean(p.name)}">${i+1}</span>`});
 const occupants=room.players.filter(p=>p.pos===idx&&!p.withdrawn).length;el.classList.toggle('occupied',occupants>0);el.classList.toggle('crowded',occupants>4);el.dataset.occupants=String(occupants);
 el.innerHTML=`<span class="num">${f.number}</span><svg class="field-img" viewBox="${f.type==='Ereigniskarte'?'0 0 320 220':f.number===1?'0 0 192 112':'42 5 110 90'}" role="img" aria-label="${clean(f.name)}" focusable="false"><image href="${imgSrc}" width="${f.type==='Ereigniskarte'?320:192}" height="${f.type==='Ereigniskarte'?220:112}"/></svg><div class="field-name">${clean(f.name)}</div><div class="tokens">${chips}</div>`;b.append(el);
 });
}
function renderPlayers(){renderBoardPlayers();const box=$('playersList');box.textContent='';room.players.forEach((p,i)=>{
 const node=document.createElement('div');node.className='player-card'+(i===room.turn?' active':'')+(p.finished?' done':'');
 const v=p.scope||[0,0,0];const start=room.config.starting.reduce((s,x)=>s+x,0);
 node.innerHTML=`<div class="player-head"><span><span class="indicator" style="--c:${COLORS[i]}">${i+1}</span>${clean(p.name)}</span><span>${p.withdrawn?'Ausgestiegen':room.gameOver?'Abgeschlossen':p.cash<0?'Schulden':'Jahr '+(p.years+1)}</span></div><div class="player-metrics"><span>Kapital</span><strong>${euro(p.cash)}</strong><span>CO₂e/Jahr</span><strong>${fmt(p.co2)} t</strong><span>Scope 1 / 2 / 3</span><strong>${v.map(x=>fmt(x)).join(' / ')}</strong><span>Kumuliert</span><strong>${fmt(p.cumulative)} t</strong><span>Jahresergebnis</span><strong>${euro(p.annual)}</strong></div><div class="player-progress"><span style="width:${start>0?Math.max(0,Math.min(100,(1-p.co2/start)*100)):0}%"></span></div>`;box.append(node)});
 $('playerTotal').textContent=`${room.players.length}/${room.config.maxPlayers}`;
}
function renderLog(){const el=$('gameLog');el.textContent='';room.logs.slice(0,25).forEach(t=>{const p=document.createElement('p');p.textContent=t;el.append(p)})}
function landing(){const p=room?.players[room.turn];if(room?.landing?.playerId===p?.id)return room.landing;const e=room?.lastEvent;return e?.kind==='roll'&&e.playerId===p?.id?{...e,fieldNumber:e.landedField||p.pos+1}:null;}
function currentFieldNumber(){return landing()?.fieldNumber||room.players[room.turn].pos+1;}
function controls(title,html,buttons){$('actionTitle').textContent=title;$('fieldTag').textContent=`Feld ${currentFieldNumber()}`;$('actionDescription').innerHTML=html;
 const buildButton=o=>{const btn=document.createElement('button');btn.type='button';if(o.primary)btn.className='primary';if(o.detail||o.disabledReason){btn.classList.add('button-choice');btn.innerHTML=`<strong>${clean(o.label)}</strong><small>${clean(o.disabledReason||o.detail)}</small>`;}else btn.textContent=o.label;
  btn.disabled=!!o.disabled;btn.setAttribute('aria-disabled',String(!!o.disabled));if(o.disabledReason)btn.title=o.disabledReason;btn.dataset.disabled=String(!!o.disabled);btn.addEventListener('click',o.action);return btn;};
 for(const id of (popupMode==='action'?['actionButtons','fieldPopupButtons']:['actionButtons'])){const wrap=$(id);wrap.textContent='';buttons.forEach(o=>wrap.append(buildButton(o)));}
 if(popupMode==='action'){$('fieldPopupTitle').textContent=title.replace(/ · (Investition|Unternehmensentscheidung)$/,'');$('fieldPopupDescription').innerHTML=html;setPopupField(currentFieldNumber());}
 $('fieldPopupOpen').hidden=!myTurn()||room?.gameOver;
}
function renderAction(){const p=room.players[room.turn],f=DATA.fields[p.pos],active=myTurn();
 if(room.gameOver){
 const viable=standings(),leader=viable.find(v=>v.co2<=room.config.goal);
 $('centerPlayer').textContent=leader?`🏆 ${leader.name}`:'Spiel beendet';
 $('centerInstruction').textContent=leader?`Sieger · ${fmt(leader.co2)} t CO₂e/Jahr · ${euro(leader.cash)}`:'Kein verbleibendes Unternehmen am CO₂-Ziel.';
 const ranking=viable.map((v,i)=>`<p><strong>${i+1}. ${clean(v.name)}</strong> · ${fmt(v.co2)} t/Jahr · ${euro(v.cash)}${v.co2<=room.config.goal?' · Ziel erreicht':''}</p>`).join('');
 controls('Spiel beendet',leader?`<p>🏆 Sieger: <strong>${clean(leader.name)}</strong> mit ${fmt(leader.co2)} t CO₂e/Jahr.</p>${ranking}`:`<p>Kein verbleibendes Unternehmen hat das CO₂-Ziel erreicht.</p>${ranking}`,[]);return;
 }
 if(!active){controls('Gemeinsamer Spielstand',`<p><strong>${clean(p.name)}</strong> ist am Zug. Die Bewegung und Entscheidungen erscheinen hier automatisch.</p>`,[]);return;}
 if(room.phase==='roll'){controls('Würfeln',`<p>Du bist dran. Würfle und lande auf einem von 40 Feldern.</p>`,[{label:'🎲 Würfeln',primary:true,action:()=>postAction({type:'roll'})}]);return;}
 if(room.phase==='detention'){controls('Audit-Aufenthalt',`<p>Nach der Versetzung zum Audit kannst du für <strong>${euro(room.auditReleaseFee)}</strong> eine Sofortberatung bezahlen oder einen Zug aussetzen.</p>`,[
 {label:`${euro(room.auditReleaseFee)} zahlen und würfeln`,primary:true,disabled:room.auditReleaseFee>0&&p.cash<room.auditReleaseFee,action:()=>postAction({type:'detention',choice:'pay'})},
 {label:'Zug aussetzen',action:()=>postAction({type:'detention',choice:'skip'})}]);return;}
 if(room.phase==='end'){
   const ev=landing(),landed=ev?DATA.fields[ev.fieldNumber-1]:f;
   let details=`<p>${clean(landed.description||'')}</p>`;
   if(ev){
      if(ev.eventId){const card=DATA.cards[ev.eventId-1],e=ev.eventResult;
        details+=`<div class="event-result"><span class="event-stamp">EREIGNISKARTE · VERPFLICHTEND</span><h4>${clean(card.title)}</h4><p>${clean(card.action)}</p>${card.global?'<p class=field-result>Globales Ereignis: Alle aktiven Unternehmen sind betroffen. Details unter Unternehmen &amp; Protokoll → Weltereignisse.</p>':''}<p>${clean(e?.note||'')}</p><p><strong>Automatisch angewendet:</strong> ${e?.valid?'Ja':'Voraussetzung nicht erfüllt – ohne Wirkung'} · Kapital ${e?.cash>=0?'+':''}${euro(e?.cash||0)}</p><p>Scope-Wirkung: ${(e?.scope||[0,0,0]).map((x,i)=>`S${i+1} ${x>=0?'+':''}${fmt(x,3)} t`).join(' · ')}</p></div>`;
      }else details+=`<p class="field-result">${clean(ev.message||'')}</p>`;
   }
   if(ev?.closing)details+=`<p class="field-result"><strong>${ev.closing.multiplier===1.2?'Volltreffer auf Feld 1 – 1,2-faches Jahresergebnis':'Jahresabschluss'}:</strong> ${euro(ev.closing.payout)} verbucht (${fmt(ev.closing.multiplier,1)} × ${euro(ev.closing.annual)}). Die Jahresemissionen wurden einmal erfasst.</p>`;
   if(ev?.resolution)details+=`<p class="field-result"><strong>Deine Auswahl:</strong> ${clean(ev.resolution)}</p>`;
   if(p.cash<0)details+=`<p><strong>Hinweis:</strong> Dein Unternehmen hat ${euro(p.cash)} Kapital. Du bleibst im Spiel und kannst weiter würfeln.</p>`;
   controls(landed.name,details,[{label:'Zug beenden →',primary:true,action:()=>postAction({type:'end'})}]);return;
 }
 if(room.phase==='decision'&&room.pending){const q=room.pending;
 if(q.kind==='invest'){
  const v=DATA.fields[q.index],cost=Math.max(0,-safeNum(v.capital)),owned=p.owned.includes(v.number);
  controls(`${v.name} · Investition`,`<p>${clean(v.description)}</p><p><strong>Einmalige Kosten:</strong> ${euro(cost)} · <strong>Jahresergebnis:</strong> ${v.annual>=0?'+':''}${euro(v.annual)}/Jahr</p><p><strong>Scope-Effekt:</strong> ${v.scope.map((x,i)=>`S${i+1} ${x>0?'+':''}${fmt(x)} t`).join(' · ')}</p>`,[
    {label:owned?'Bereits gekauft':cost>0&&p.cash<cost?`Nicht finanzierbar (${euro(cost)})`:`Investieren (${euro(cost)})`,primary:true,disabled:owned||(cost>0&&p.cash<cost),disabledReason:owned?'Diese Maßnahme wurde bereits gekauft.':cost>0&&p.cash<cost?`Verfügbar: ${euro(p.cash)} · Es fehlen ${euro(cost-p.cash)}.`:null,action:()=>postAction({type:'invest',choice:'buy'})},
    {label:'Verzichten',action:()=>postAction({type:'invest',choice:'pass'})}]);return;
 }
 if(q.kind==='choose'){
  const v=DATA.fields[q.index];controls(`${v.name} · Unternehmensentscheidung`,`<p>${clean(v.description)}</p><p class="helper">Du kannst die Entscheidung kostenlos vertagen. Optionen, die dein CO₂-Ziel unerreichbar machen würden, sind gesperrt.</p>`,[...v.options.map((o,i)=>({label:o.name,detail:`Kapital ${o.cash>=0?'+':''}${euro(o.cash)} · Jahresergebnis ${o.annual>=0?'+':''}${euro(o.annual)}/Jahr · ${o.scope.map((x,j)=>`S${j+1} ${x>0?'+':''}${fmt(x)} t`).join(' / ')}`,disabled:!!q.blockedOptions?.[i]||(o.cash<0&&p.cash< -o.cash),disabledReason:q.blockedOptions?.[i]?'Würde das CO₂-Ziel unerreichbar machen.':o.cash<0&&p.cash< -o.cash?'Kapital reicht für diese Option nicht aus.':null,action:()=>postAction({type:'choose',option:i})})),{label:'Entscheidung vertagen',action:()=>postAction({type:'choose',option:-1})}]);return;
 }

 }
 controls('Warten','<p>Der aktuelle Spielschritt wird aktualisiert.</p>',[]);
}
$('rollBtn').addEventListener('click',()=>postAction({type:'roll'}));$('nextBtn').addEventListener('click',()=>postAction({type:'end'}));
function animateEvent(e){
 if(e.kind==='roll'){
   if(dieTimer)clearTimeout(dieTimer);const face=$('dieFace');face.classList.remove('rolling');void face.offsetWidth;
   if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)face.classList.add('rolling');
   face.textContent=DICE[Math.max(0,Math.min(5,(e.die||1)-1))];dieTimer=setTimeout(()=>face.classList.remove('rolling'),950);
   // Die Ereigniskarte erscheint nur dem aktiven Spieler im Feld-Popup.
 }
}
function setPopupField(fieldNumber){
 const f=DATA.fields[fieldNumber-1];if(!f)return;
 $('fieldPopupNumber').textContent=`FELD ${fieldNumber}`;
 $('fieldPopupImg').src=f.type==='Ereigniskarte'?'/img/event.svg':`/img/${String(fieldNumber).padStart(2,'0')}.svg?v=1.8.0`;
 $('fieldPopupImg').alt=f.name;
 $('fieldPopupHint').textContent=popupMode==='action'?`Spieler ${room.turn+1} · ${room.players[room.turn].name}`:'Feld ansehen · Spielstand bleibt unverändert';
}
function openFieldPopup(manual=false,fieldNumber=null){
 hideFieldTooltip();if($('dashboardDialog').open)$('dashboardDialog').close();
 if(!room?.started)return;
 const number=fieldNumber||currentFieldNumber(),f=DATA.fields[number-1];if(!f)return;
 popupMode=myTurn()&&(!fieldNumber||number===currentFieldNumber())&&room.phase!=='roll'?'action':'inspect';
 if(popupMode==='action')renderAction();
 else{
   $('fieldPopupTitle').textContent=f.name;
   let html=`<p>${clean(f.description||'')}</p>`;
   if(f.type==='Investition')html+=`<div class="inspection-facts"><span>Investition<strong>${euro(Math.max(0,-safeNum(f.capital)))}</strong></span><span>Jahresergebnis<strong>${f.annual>=0?'+':''}${euro(f.annual)}</strong></span></div><p>Scope-Effekt: ${f.scope.map((x,i)=>`S${i+1} ${x>0?'+':''}${fmt(x)} t`).join(' · ')}</p>`;
   if(f.type==='Entscheidung')html+=f.options.map(o=>`<div class="inspection-option"><strong>${clean(o.name)}</strong><p>Kapital ${o.cash>=0?'+':''}${euro(o.cash)} · jährlich ${o.annual>=0?'+':''}${euro(o.annual)}<br>${o.scope.map((x,i)=>`S${i+1} ${x>0?'+':''}${fmt(x)} t`).join(' · ')}</p></div>`).join('');
   if(f.type==='Ereigniskarte')html+='<p class="field-result">Beim Betreten wird eine Ereigniskarte gezogen und automatisch angewendet.</p>';
   if(!room.gameOver)html+=`<p class="helper">Auswählen kann nur Spieler ${room.turn+1} (${clean(room.players[room.turn].name)}) auf dem erreichten Feld.</p>`;
   $('fieldPopupDescription').innerHTML=html;
   $('fieldPopupButtons').innerHTML='';
   const button=document.createElement('button');button.type='button';button.className='primary';button.textContent='Zurück zum Spiel';button.addEventListener('click',closeFieldPopup);$('fieldPopupButtons').append(button);
 }
 setPopupField(number);
 const el=$('fieldPopup'),wasOpen=!el.hidden;if(!wasOpen)modalFocusReturn=document.activeElement;
 el.hidden=false;document.body.classList.add('modal-open');$('fieldPopupError').hidden=true;
 for(const id of ['home','waiting','playing'])$(id).inert=true;
 $('fieldPopupCard').classList.remove('revealed');
 if(!wasOpen&&f.type==='Ereigniskarte'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){void $('fieldPopupCard').offsetWidth;$('fieldPopupCard').classList.add('revealed');}
 if(!wasOpen){$('fieldPopupBox').scrollTop=0;$('fieldPopupClose').focus();}
}
function closeFieldPopup(){
 const el=$('fieldPopup');if(el.hidden)return;
 el.hidden=true;document.body.classList.remove('modal-open');for(const id of ['home','waiting','playing'])$(id).inert=false;
 if(modalFocusReturn?.isConnected)modalFocusReturn.focus();else $('fieldPopupOpen').focus();
 modalFocusReturn=null;popupMode='action';
}
function maybeShowFieldPopup(){
 if(['globalDialog','companyDialog','resultsDialog','turnDialog'].some(id=>$(id).open))return;
 if(popupMode==='inspect'&&!$('fieldPopup').hidden)return;
 if(!myTurn()||room.gameOver){closeFieldPopup();return;}
 if(room.phase==='roll'){closeFieldPopup();return;}
 const arrived=landing(),waiting=room.phase==='detention'||room.phase==='decision';
 if(!arrived&&!waiting)return;
 const key=`${room.code}-${room.turnNumber}-${currentFieldNumber()}-${room.phase==='detention'?'audit':'landed'}`;
 if(lastOpenedPopupKey===key)return;
 lastOpenedPopupKey=key;openFieldPopup();
}
$('fieldPopupOpen').addEventListener('click',()=>openFieldPopup(true));
$('fieldPopupClose').addEventListener('click',closeFieldPopup);
$('fieldPopup').addEventListener('click',e=>{if(e.target===$('fieldPopup'))closeFieldPopup()});
document.addEventListener('keydown',e=>{
 if($('fieldPopup').hidden)return;
 if(e.key==='Escape'){e.preventDefault();closeFieldPopup();return;}
 if(e.key==='Tab'){
  const focusable=[...$('fieldPopup').querySelectorAll('button:not(:disabled),[tabindex="0"],a[href]')].filter(x=>!x.hidden);
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }
});
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>setActiveTab(b.dataset.view));
$('chartPlayer').addEventListener('change',()=>{chartSelection=$('chartPlayer').value;renderStats()});
function renderStats(){
 if(!room)return;const sel=$('chartPlayer');if(sel.options.length!==room.players.length+1){sel.innerHTML='<option value="all">Alle Spieler</option>';room.players.forEach(p=>{const op=new Option(p.name,String(p.id));sel.add(op)})}if([...sel.options].some(o=>o.value===chartSelection))sel.value=chartSelection;else{chartSelection='all';sel.value='all'};
 graph('co2Chart','co2');graph('budgetChart','cash');
 $('legend').innerHTML=room.players.map((p,i)=>`<span><i style="background:${COLORS[i]}"></i>${clean(p.name)}</span>`).join('');
 const chosen=room.players.filter(p=>chartSelection==='all'||String(p.id)===chartSelection);
 $('statsTable').innerHTML=`<thead><tr><th>Unternehmen</th><th>Jahre</th><th>CO₂e/Jahr</th><th>Kumuliert</th><th>Budget</th></tr></thead><tbody>${chosen.map(p=>`<tr><td>${clean(p.name)}</td><td>${p.years}</td><td>${fmt(p.co2)} t</td><td>${fmt(p.cumulative)} t</td><td>${euro(p.cash)}</td></tr>`).join('')}</tbody>`;
}
function graph(id,key){const svg=$(id),chosen=room.players.filter(p=>chartSelection==='all'||String(p.id)===chartSelection),series=chosen.map(p=>({p,pts:room.trends[p.id]||[]})),all=series.flatMap(a=>a.pts);
 if(!all.length){svg.innerHTML='<text x="80" y="130">Noch keine Daten</text>';return;}
 const W=700,H=280,L=76,R=24,T=20,B=43,xMax=Math.max(2,...all.map(a=>safeNum(a.turn)));
 let vMin=Math.min(0,...all.map(a=>safeNum(a[key]))),vMax=Math.max(1,...all.map(a=>safeNum(a[key])));if(key==='co2'){vMin=0;vMax*=1.09;}else{const pad=Math.max(20000,(vMax-vMin)*.07);vMin-=pad;vMax+=pad;}
 const x=t=>L+(Math.max(0,t)/xMax)*(W-L-R),y=v=>T+(vMax-v)/(vMax-vMin)*(H-T-B);
 let html=`<rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}" rx="6" fill="#f5f9f7"/>`;
 for(let i=0;i<=4;i++){const yPos=T+(H-T-B)*i/4,v=vMax-(vMax-vMin)*i/4;html+=`<line x1="${L}" x2="${W-R}" y1="${yPos}" y2="${yPos}" stroke="#dae7e1"/><text x="${L-8}" y="${yPos+4}" font-size="12" text-anchor="end" fill="#627772">${key==='cash'?fmt(v/1000,0)+'k':fmt(v,0)}</text>`}
 for(let i=0;i<=5;i++){const t=Math.round(xMax*i/5);html+=`<text x="${x(t)}" y="${H-18}" text-anchor="middle" font-size="12" fill="#627772">${t}</text>`}
 html+=`<text x="${W/2}" y="${H-1}" font-size="12" fill="#627772" text-anchor="middle">Spielzüge</text>`;
 for(const s of series){if(!s.pts.length)continue;const color=COLORS[s.p.id];html+=`<polyline fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${s.pts.map(pt=>`${x(pt.turn).toFixed(1)},${y(pt[key]).toFixed(1)}`).join(' ')}"/>`;
   for(const pt of s.pts.filter((_,i)=>s.pts.length<=24||i===0||i===s.pts.length-1)){const cx=x(pt.turn),cy=y(pt[key]);html+=`<circle cx="${cx}" cy="${cy}" r="4" fill="${color}" stroke="#fff" stroke-width="1.3"><title>${clean(s.p.name)} · Zug ${pt.turn}: ${key==='cash'?euro(pt[key]):fmt(pt[key])+' t CO₂e'}</title></circle>`;}}
 svg.innerHTML=html;
}
function renderBoardPlayers(){
 $('boardPlayers').style.setProperty('--score-rows',String(Math.ceil(room.players.length/2)));
 $('boardPlayerCount').textContent=`${room.players.filter(p=>!p.withdrawn).length}/${room.players.length} aktiv`;
 const winner=room.gameOver?standings().find(p=>p.co2<=room.config.goal):null;
 $('boardPlayers').innerHTML=room.players.map((p,i)=>`<button type="button" data-company="${p.id}" class="board-player${!room.gameOver&&i===room.turn?' active':''}${p.withdrawn?' withdrawn':''}${winner?.id===p.id?' winner':''}" title="${clean(p.name)} · Kapital ${euro(p.cash)} · Jahresergebnis ${euro(p.annual)} · ${fmt(p.co2)} t CO₂e/Jahr"><span class="board-seat" style="--c:${COLORS[i]}">${i+1}</span><div><strong>${clean(p.name)}${p.withdrawn?' · ausgestiegen':''}${p.auditPass?'<span class="ims-badge" title="Managementsystem: Audit-Schutz gespeichert" aria-label="Audit-Schutz gespeichert">IMS</span>':''}</strong><span class="board-player-cash${p.cash<0?' debt':''}">${euro(p.cash)}</span><span class="board-player-annual${p.annual<0?' debt':''}" aria-label="Jahresergebnis ${euro(p.annual)}"><i class="annual-prefix">Jahr: </i>${p.annual>=0?'+':''}${euro(p.annual)}<em class="annual-suffix">/J</em></span><small>${fmt(p.co2,0)} t CO₂e/Jahr${p.withdrawn?' · Ausgestiegen':p.co2<=room.config.goal?' · Ziel erreicht':''}</small></div></button>`).join('');
 $('boardPlayers').querySelectorAll('[data-company]').forEach(b=>b.addEventListener('click',()=>openCompany(Number(b.dataset.company))));
}
function renderJoinQr(){
 const url=$('shareUrl').value;if(url===lastQrUrl)return;lastQrUrl=url;
 try{const qr=qrcode(0,'M');qr.addData(url);qr.make();$('joinQr').innerHTML=qr.createSvgTag({cellSize:6,margin:24,scalable:true});}
 catch{$('joinQr').textContent='Bitte Link oder Raumcode verwenden.';}
 $('qrHint').textContent=/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(url)?'Server über seine WLAN-Adresse öffnen':'Mit der Handykamera öffnen';
}
async function initializeJoinBase(){
 if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))return;
 try{const r=await fetch('/api/network'),v=await r.json();if(v.lanOrigins?.length){joinBase=v.lanOrigins[0];const select=$('joinOrigin');for(const origin of v.lanOrigins)select.add(new Option(origin,origin));$('joinOriginWrap').hidden=false;}}
 catch{}
}
$('joinOrigin').addEventListener('change',()=>{joinBase=$('joinOrigin').value;if(room)renderLobby();});
$('hostMode').addEventListener('change',()=>{const host=$('hostMode').value==='host';$('hostNameLabel').textContent=host?'Name der Spielleitung':'Dein Unternehmensname';$('hostModeHint').textContent=host?'Du leitest das Spiel und verfolgst alle Unternehmen, ohne eine eigene Spielfigur.':'Du leitest das Spiel und nimmst als Unternehmen teil.';if(['Professor','Unternehmen 1'].includes($('hostNameInput').value))$('hostNameInput').value=host?'Professor':'Unternehmen 1';});
$('centerPopupBtn').addEventListener('click',()=>openFieldPopup(true));
function openDashboard(tab='companies'){
 closeFieldPopup();$('dashboardTitle').textContent='Unternehmen & Protokoll';setDashboardTab(tab);if(!$('dashboardDialog').open)$('dashboardDialog').showModal();
}
function setDashboardTab(tab){
 for(const [key,id] of [['companies','dashboardCompanies'],['log','dashboardLog'],['events','dashboardEvents']])$(id).hidden=tab!==key;
 document.querySelectorAll('[data-dashboard]').forEach(b=>{b.classList.toggle('selected',b.dataset.dashboard===tab);b.setAttribute('aria-pressed',String(b.dataset.dashboard===tab));});
 renderGlobalArchive();
}
$('overviewToggle').addEventListener('click',()=>openDashboard());$('dashboardClose').addEventListener('click',()=>$('dashboardDialog').close());
document.querySelectorAll('[data-dashboard]').forEach(b=>b.addEventListener('click',()=>setDashboardTab(b.dataset.dashboard)));
$('dashboardDialog').addEventListener('click',e=>{if(e.target===$('dashboardDialog')){const r=$('dashboardDialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('dashboardDialog').close();}});
let activeGlobal=null,globalAutomatic=false,endPresented=false,reportSelection=null;
let activeTurnKey=null;const acknowledgedTurns=new Set();
const turnKey=()=>`${room.code}:${room.actorId}:${room.turnNumber}`;
function turnWasAcknowledged(key){try{return acknowledgedTurns.has(key)||sessionStorage.getItem('co2_turn_v17_'+key)==='seen';}catch{return acknowledgedTurns.has(key);}}
function syncTurnPopup(){
 const eligible=myTurn()&&['roll','detention'].includes(room.phase);
 if(!eligible){if($('turnDialog').open)$('turnDialog').close();activeTurnKey=null;return;}
 if($('globalDialog').open||$('resultsDialog').open)return;
 const key=turnKey();if(turnWasAcknowledged(key))return;
 if($('turnDialog').open&&activeTurnKey===key)return;
 closeFieldPopup();closeDetails();setActiveTab('board');activeTurnKey=key;
 const p=room.players[room.turn];$('turnAvatar').textContent=String(p.id+1);$('turnAvatar').style.setProperty('--c',COLORS[p.id]);$('turnPopupName').textContent=p.name;
 $('turnPopupHint').textContent=room.phase==='detention'?'Entscheide zuerst, wie du den Audit-Aufenthalt beendest.':room.finalRound?'Dein letzter Zug in dieser Runde. Danach wird das Ergebnis ausgewertet.':'Würfle und entscheide über den nächsten Schritt für dein Unternehmen.';
 $('turnDialog').showModal();
}
function acknowledgeTurn(){
 if(activeTurnKey){acknowledgedTurns.add(activeTurnKey);try{sessionStorage.setItem('co2_turn_v17_'+activeTurnKey,'seen');}catch{}}
 activeTurnKey=null;$('turnDialog').close();refreshExperience();maybeShowFieldPopup();
 if(!$('globalDialog').open&&$('fieldPopup').hidden&&room?.phase==='roll')$('rollBtn').focus({preventScroll:true});
}
$('turnReady').addEventListener('click',acknowledgeTurn);
$('turnDialog').addEventListener('cancel',e=>{e.preventDefault();acknowledgeTurn();});
function auditPassDetails(p){
 if(!p.auditPass&&!p.auditPassUses)return '';
 return `<section class="audit-pass-card"><span aria-hidden="true">🛡</span><div><strong>Integriertes Managementsystem</strong><p>${p.auditPass?'Audit-Schutz gespeichert. Beim nächsten Audit automatisch keine Auditgebühr und kein Aussetzen. Danach wird die Karte zurückgelegt.':'Der Audit-Schutz wurde bereits eingesetzt.'}${p.auditPassUses?` Bereits ${p.auditPassUses}× eingesetzt · ${euro(p.auditPassSavings)} Auditgebühren vermieden.`:''}</p></div></section>`;
}
const globalSeenKey=()=>`co2_global_seen_v17_${room.code}`;
function closeDetails(){for(const id of ['dashboardDialog','companyDialog','resultsDialog','turnDialog'])if($(id).open)$(id).close();}
function investmentList(p){
 const records=p.investments||[];
 const items=p.owned.map(n=>{const f=DATA.fields.find(x=>x.number===n),actual=records.find(x=>x.fieldNumber===n)?.scope||f.scope;return `<article class="investment-item"><div><strong>${clean(f.name)}</strong><span>Feld ${n} · ${euro(Math.max(0,-f.capital))} investiert</span></div><div><b>${f.annual>=0?'+':''}${euro(f.annual)}/Jahr</b><span>Beim Kauf: ${actual.map((v,i)=>`S${i+1} ${v>0?'+':''}${fmt(v,1)} t`).join(' · ')}</span></div></article>`;});
 return items.join('')||'<p class="empty-state">Noch keine Investitionen gekauft. Hier erscheinen deine Maßnahmen mit Kosten, Jahreswirkung und tatsächlich verbuchter CO₂-Wirkung.</p>';
}
function openCompany(id){
 const p=room.players.find(x=>x.id===id);if(!p)return;
 closeFieldPopup();closeDetails();$('companyTitle').textContent=`Spieler ${id+1} · ${p.name}`;
 const cost=p.owned.reduce((sum,n)=>sum+Math.max(0,-DATA.fields[n-1].capital),0);
 $('companyContent').innerHTML=`<div class="detail-metrics"><div><span>Kapital</span><strong>${euro(p.cash)}</strong></div><div><span>Jahresergebnis</span><strong>${euro(p.annual)}</strong></div><div><span>CO₂e / Jahr</span><strong>${fmt(p.co2)} t</strong></div><div><span>Investiert</span><strong>${euro(cost)}</strong></div></div>${auditPassDetails(p)}<h3>Getätigte Investitionen (${p.owned.length})</h3>${investmentList(p)}<h3>Unternehmensentscheidungen</h3>${(p.decisionHistory||[]).map(d=>`<p class="decision-entry"><strong>${clean(DATA.fields[d.fieldNumber-1].name)}</strong> · ${clean(d.name)}<br><small>Kapital ${euro(d.cash)} · Jahresergebnis ${euro(d.annual)} · ${d.scope.map((v,i)=>`S${i+1} ${v>0?'+':''}${fmt(v)} t`).join(' / ')}</small></p>`).join('')||'<p class="helper">Noch keine Unternehmensentscheidung getroffen.</p>'}${room.gameOver?'<button type="button" id="companyReflection" class="primary wide">Persönlichen Reflexionsbericht öffnen</button>':''}`;
 $('companyDialog').showModal();$('companyReflection')?.addEventListener('click',()=>showResults(id));
}
$('companyClose').addEventListener('click',()=>$('companyDialog').close());
function renderGlobalArchive(){
 const events=(room.globalEvents||[]).slice().reverse();
 $('globalArchive').innerHTML=events.map(e=>`<button type="button" class="archive-event" data-global="${e.id}"><span>${clean(e.icon)}</span><div><strong>${clean(e.title)}</strong><small>Zug ${e.turn} · ${e.results.length} Unternehmen</small></div><b>→</b></button>`).join('')||'<p class="empty-state">Noch kein globales Ereignis eingetreten.</p>';
 $('globalArchive').querySelectorAll('[data-global]').forEach(b=>b.addEventListener('click',()=>showGlobal(events.find(e=>e.id===Number(b.dataset.global)),false)));
}
function showGlobal(e,automatic=true){
 if(!e)return;closeFieldPopup();closeDetails();activeGlobal=e;globalAutomatic=automatic;
 const dialog=$('globalDialog');dialog.dataset.theme=e.theme;
 dialog.querySelector('.global-duration').textContent=e.results.some(r=>r.term==='temporary')?'Geldwirkung sofort. Zeitweilige Emissionsänderungen gelten bis zum nächsten eigenen Jahresabschluss.':'Einmalige Geldwirkung. Keine Änderung der physischen CO₂-Emissionen.';
 dialog.querySelector('.global-eyebrow').textContent=e.card>=25?'POLITISCHES SZENARIO · ALLE AKTIVEN UNTERNEHMEN':'GLOBAL · ALLE AKTIVEN UNTERNEHMEN';
 $('globalTitle').textContent=e.title;$('globalIcon').textContent=e.icon;$('globalDescription').textContent=e.description;$('globalLesson').textContent=e.lesson;
 $('globalScene').innerHTML=Array.from({length:18},(_,i)=>`<i style="--i:${i};--x:${(i*37+7)%100}%;--delay:${-(i%6)*.38}s"></i>`).join('');
 $('globalResults').innerHTML=e.results.map(r=>`<article class="global-result${r.playerId===room.actorId?' personal':''}"><div class="global-company"><span class="board-seat" style="--c:${COLORS[r.playerId]}">${r.playerId+1}</span><strong>${clean(r.name)}${r.playerId===room.actorId?' · Du':''}</strong><b class="${r.cash<0?'loss':'gain'}">${r.cash>0?'+':''}${euro(r.cash)}</b></div><p>${r.scope.map((v,i)=>`S${i+1} ${v>0?'+':''}${fmt(v,2)} t`).join(' · ')}</p><p class="protection">${r.protections.length?`Wirksame Investitionen: ${r.protections.map(clean).join(', ')}`:e.card===25?'Keine förderfähige Investition vorhanden':e.card===28?(r.cash>0?'CO₂-Kriterium erfüllt':'CO₂-Kriterium noch nicht erfüllt'):'Keine passende Schutzinvestition'}${r.factor===0&&e.card===2?' · Vollständig geschützt':''}</p><details><summary>Warum dieser Effekt?</summary><p>${clean(r.note)}</p><p>Vergleich ohne passende Investitionen: ${euro(r.baselineCash)}${r.bonusCash?` · Zuschuss/Auftragsbonus: +${euro(r.bonusCash)}`:` · Wirkungsfaktor ${fmt(r.factor,3)}`}. Emissionswerte oben berücksichtigen die Untergrenze null.</p></details></article>`).join('');
 $('globalContinue').textContent=automatic?'Verstanden · weiter zum Spiel':'Zurück zur Übersicht';
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
}
function dismissGlobal(){
 const automatic=globalAutomatic;
 if(activeGlobal&&automatic)safeLocalSet(globalSeenKey(),String(activeGlobal.id));
 activeGlobal=null;globalAutomatic=false;if($('globalDialog').open)$('globalDialog').close();
 if(!automatic){openDashboard('events');return;}
 refreshExperience();if(!$('globalDialog').open&&!$('resultsDialog').open)maybeShowFieldPopup();
}
$('globalContinue').addEventListener('click',dismissGlobal);
$('globalDialog').addEventListener('cancel',e=>{e.preventDefault();dismissGlobal();});
function refreshExperience(){
 if(!room?.started)return;
 const seen=Number(safeLocalGet(globalSeenKey()))||0,next=(room.globalEvents||[]).find(e=>e.id>seen);
 if(!$('globalDialog').open&&next){showGlobal(next,true);return;}
 if(room.gameOver&&!endPresented&&!$('globalDialog').open){endPresented=true;showResults();return;}
 syncTurnPopup();
 if($('companyDialog').open){/* Die Detailansicht bleibt während des Lesens stabil. */}
 if($('dashboardDialog').open)renderGlobalArchive();
}
function showResults(playerId=null){
 if(!room?.gameOver)return;closeFieldPopup();closeDetails();
 const ranked=standings(),top=ranked.slice(0,3),leader=ranked.find(p=>p.co2<=room.config.goal);
 $('podium').innerHTML=top.map((p,i)=>`<article class="podium-place place-${i+1}"><span class="medal" aria-hidden="true">${['🥇','🥈','🥉'][i]}</span><strong>${clean(p.name)}</strong><span>${fmt(p.co2,1)} t CO₂e/Jahr</span><small>${euro(p.cash)}${p.co2<=room.config.goal?' · Ziel erreicht':''}</small><div class="podium-block">${i+1}<small>PLATZ</small></div></article>`).join('')||'<p>Alle Unternehmen sind ausgestiegen. Es gibt keine Platzierung.</p>';
 $('rankingExplanation').textContent=`Platzierung nach aktuellem Jahres-CO₂, bei Gleichstand nach Kapital. Ausgestiegene sind ausgeschlossen.${leader?'':' Kein verbliebenes Unternehmen hat das Ziel erreicht; die Platzierung zeigt daher keinen Zielsieger.'}`;
 const select=$('reflectionPlayer');select.innerHTML=room.players.map(p=>`<option value="${p.id}">${clean(p.name)}</option>`).join('');
 reportSelection=playerId??room.actorId??ranked[0]?.id??room.players[0]?.id;select.value=String(reportSelection);renderReflection();$('resultsDialog').showModal();
}
function renderReflection(){
 const report=room.reflections?.find(r=>r.playerId===Number($('reflectionPlayer').value));if(!report)return;
 const p=room.players.find(x=>x.id===report.playerId);
 $('reflectionContent').innerHTML=`<div class="reflection-intro"><span class="eyebrow">DEINE STRATEGIE · ${clean(report.name)}</span><h3>${report.goalReached?'Klimaziel erreicht':'Dein Weg zum Klimaziel'}</h3><p>${fmt(report.initial)} → <strong>${fmt(report.current)} t CO₂e/Jahr</strong></p></div><div class="detail-metrics"><div><span>Investiert</span><strong>${euro(report.cost)}</strong></div><div><span>Jährliche Investitionswirkung</span><strong>${report.annual>0?'+':''}${euro(report.annual)}</strong></div><div><span>Vermiedene Ereigniskosten</span><strong>${euro(report.avoidedCosts)}</strong></div><div><span>Verbleibendes Kapital</span><strong>${euro(p.cash)}</strong></div></div><h3>Was du aus deiner Partie mitnehmen kannst</h3><div class="reflection-insights">${report.insights.map(t=>`<p>${clean(t)}</p>`).join('')}</div>${auditPassDetails(p)}<h3>Deine Investitionen im Rückblick</h3>${investmentList(p)}<h3>Deine Unternehmensentscheidungen</h3>${report.decisions.map(d=>`<p class="decision-entry"><strong>${clean(DATA.fields[d.fieldNumber-1].name)}</strong> · ${clean(d.name)}<br><small>Jahresergebnis ${euro(d.annual)} · ${d.scope.map((v,i)=>`S${i+1} ${v>0?'+':''}${fmt(v)} t`).join(' / ')}</small></p>`).join('')||'<p class="helper">Keine Entscheidungen erfasst.</p>'}<h3>Wie globale Ereignisse dich getroffen haben</h3>${report.events.map(e=>`<p class="reflection-event"><strong>${clean(e.title)}</strong> · ${euro(e.cash)}<br><small>${e.protections.length?'Wirksam: '+e.protections.map(clean).join(', '):'Keine passende Schutzinvestition'} · ${e.scope.map((v,i)=>`S${i+1} ${v>0?'+':''}${fmt(v,2)} t`).join(' / ')}</small></p>`).join('')||'<p class="helper">In deiner aktiven Spielzeit gab es keine globalen Ereignisse.</p>'}<div class="reflection-questions"><h3>Fragen für deine Reflexion</h3><ol>${report.questions.map(q=>`<li>${clean(q)}</li>`).join('')}</ol></div><p class="helper">Persönliches Feedback aus deinen tatsächlichen Spielentscheidungen. Vereinfachte Spielannahmen; keine vollständige Investitionsrechnung für einen realen Betrieb.</p>`;
}
$('reflectionPlayer').addEventListener('change',renderReflection);$('resultsClose').addEventListener('click',()=>$('resultsDialog').close());$('resultsToggle').addEventListener('click',()=>showResults());
async function initialize(){
 await initializeJoinBase();
 try{DATA=await (await fetch('/game-data.json?v=1.8.0')).json();}catch{showHomeError('Spieldaten konnten nicht geladen werden. Bitte Server prüfen.');return;}
 const fromUrl=new URLSearchParams(location.search).get('room')?.trim().toUpperCase();
 if(fromUrl&&/^[A-HJ-NP-Z2-9]{6}$/.test(fromUrl)){$('codeInput').value=fromUrl;switchEntry(false)}
 try{const saved=JSON.parse(safeLocalGet(STORE)||'null');
  if(saved?.code&&saved?.token&&(!fromUrl||fromUrl===saved.code)){
   access=saved;const res=await api(`/api/rooms/${saved.code}`);room=res;lastSeen=res.lastEvent?.id??-1;$('switchRoomBtn').hidden=false;render();connected(true);
  }
 }catch(e){if(access){access=null;safeLocalSet(STORE,'')}if(fromUrl)switchEntry(false)}
 if(!access||!room)scheduleDurationEstimate(0);
 setInterval(poll,1250);
}
initialize();
})();

