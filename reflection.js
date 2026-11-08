'use strict';
function reflection(room,p,fields,footprint){
 const purchased=(p.investments||[]),current=footprint(p),initial=room.config.starting.reduce((a,b)=>a+b,0);
 const groups=[['Energie & Effizienz',[2,4,6,10,12,15,22,24,32,36]],['Wärme & Gebäude',[8,34,39]],['Material & Lieferkette',[14,17,19,26,28,30,38]]];
 const investments=p.owned.map(n=>{const f=fields.find(f=>f.number===n),entry=purchased.find(i=>i.fieldNumber===n);return {fieldNumber:n,name:f.name,cost:Math.max(0,-f.capital),annual:f.annual,scope:entry?.scope||f.scope,nominalScope:f.scope};});
 const cost=investments.reduce((s,i)=>s+i.cost,0),annual=investments.reduce((s,i)=>s+i.annual,0);
 const nominal=investments.reduce((s,i)=>s-i.nominalScope.reduce((a,b)=>a+b,0),0),actual=investments.reduce((s,i)=>s-i.scope.reduce((a,b)=>a+b,0),0);
 const positive=investments.filter(i=>i.annual>0).sort((a,b)=>a.cost/a.annual-b.cost/b.annual),impact=investments.slice().sort((a,b)=>a.nominalScope.reduce((x,y)=>x+y,0)-b.nominalScope.reduce((x,y)=>x+y,0))[0];
 const experiences=p.eventExperience||[],avoided=experiences.reduce((s,e)=>s+(e.baselineCash<0?Math.max(0,e.cash-e.baselineCash):0),0),burden=experiences.reduce((s,e)=>s+Math.max(0,-e.cash),0);
 const strategies=groups.map(([name,sources])=>({name,count:investments.filter(i=>sources.includes(fields.find(f=>f.number===i.fieldNumber).sourceNumber)).length}));
 const insights=[];
 if(!investments.length)insights.push('Du hast keine Investition gekauft. Dadurch blieb Kapital verfügbar; dauerhafte Einsparungen und Schutz vor Ereignissen wurden jedoch nicht erschlossen.');
 else{insights.push(`Du hast ${investments.length} Investition${investments.length===1?'':'en'} umgesetzt. Die Einzelmaßnahmen ergeben nominal ${nominal.toFixed(1)} t CO₂e/Jahr Minderung; tatsächlich beim Kauf verbucht wurden ${actual.toFixed(1)} t. Überschneidungen und die Untergrenze null können die Wirkung begrenzen.`);
 if(impact)insights.push(`Dein größter nominaler CO₂-Hebel war „${impact.name}“. Prüfe, ob er den emissionsstärksten Scope deines Unternehmens adressiert hat.`);
 if(positive[0])insights.push(`„${positive[0].name}“ hat unter deinen Maßnahmen mit positivem Ergebnis die kürzeste einfache Amortisation: ${(positive[0].cost/positive[0].annual).toFixed(1)} Jahre. Das ist eine statische Betrachtung ohne Zinsen oder Ereignisse.`);
 if(investments.some(i=>i.annual<0))insights.push('Du hast auch Maßnahmen mit laufenden Mehrkosten gewählt. Sie können das Klimaziel beschleunigen, verringern aber den finanziellen Spielraum. Vergleiche CO₂-Wirkung, laufende Kosten und Risikoschutz.');}
 insights.push(`Dein Jahres-CO₂-Wert hat sich gegenüber dem Start um ${(initial-current).toFixed(1)} t verändert. Diese Gesamtänderung umfasst auch Entscheidungen und Ereignisse; sie ist nicht allein deinen Investitionen zuzuschreiben.`);
 if(experiences.length)insights.push(`Globale Ereignisse verursachten bei dir ${Math.round(burden).toLocaleString('de-DE')} € direkte Kosten. Gegenüber denselben Ereignissen ohne die hinterlegten Schutzinvestitionen wurden ${Math.round(avoided).toLocaleString('de-DE')} € Kosten vermieden. Das ist ein Ereignisvergleich, keine vollständige Alternativrechnung deiner Strategie.`);
 const gap=strategies.find(s=>s.count===0);if(gap)insights.push(`Im Bereich „${gap.name}“ hast du noch keine Investition gewählt. Überlege, welche Abhängigkeit oder welches Risiko dort offen blieb.`);
 if(p.withdrawn)insights.push('Dein Unternehmen ist ausgestiegen und wird nicht auf dem Podest gewertet. Der Bericht berücksichtigt deine bis zum Ausstieg erfassten Entscheidungen.');
 const questions=[`Welche deiner Maßnahmen würdest du bei ${Math.round(room.config.initialCash/2).toLocaleString('de-DE')} € Startkapital zuerst wählen – und warum?`,avoided>0?'Welcher Schutz hat sich bei dir bewährt, und wäre er auch ohne dieses Ereignis sinnvoll gewesen?':'Welches nicht abgesicherte Ereignis hätte deine Strategie besonders belastet?',`Wie würdest du die Differenz von ${Math.abs(current-room.config.goal).toFixed(1)} t zum Ziel erklären: durch Effizienz, Energieträger, Lieferkette oder zeitweilige Ereignisse?`];
 return {playerId:p.id,name:p.name,initial,current,goal:room.config.goal,goalReached:current<=room.config.goal,cost,annual,nominalReduction:nominal,actualReduction:actual,avoidedCosts:avoided,burden,investments,decisions:p.decisionHistory||[],strategies,insights,questions,events:experiences};
}
module.exports={reflection};
