'use strict';
// Didaktische Spielannahmen: keine Prognose realer Energiepreise oder Wetterfolgen.
const definitions={
 1:{theme:'carbon',icon:'CO₂',category:'CO₂-Preis',lesson:'Weniger reale Emissionen reduzieren die Belastung durch einen CO₂-Preis.'},
 2:{theme:'power',icon:'ϟ',category:'Energiepreise',lesson:'Eigenerzeugung und Effizienz verringern die Abhängigkeit vom Strommarkt. Vollständiger PV-Schutz ist hier eine vereinfachte Spielregel.'},
 10:{theme:'cold',icon:'❄',category:'Klimaanpassung',lesson:'Dämmung senkt den Wärmebedarf; Wärmerückgewinnung und Wärmepumpe ergänzen den Schutz.'},
 11:{theme:'heat',icon:'☀',category:'Klimaanpassung',lesson:'Dämmung begrenzt Kühllasten. PV liefert bei Sonne Strom; effiziente Antriebe senken zusätzliche Lasten.'},
 15:{theme:'transport',icon:'↔',category:'Lieferketten',lesson:'Bahnabhängigkeit ist ein betriebliches Risiko trotz guter CO₂-Bilanz. Digitale Planung erleichtert die Umleitung.'},
 17:{theme:'sun',icon:'☀',category:'Eigenerzeugung',lesson:'PV erschließt Ertragschancen, die ohne vorherige Investition ungenutzt bleiben.'},
 21:{theme:'grid',icon:'ϟ',category:'Versorgung',lesson:'PV, vorausschauende Wartung und effiziente Antriebe reduzieren die Folgen eines Netzengpasses. PV allein ersetzt keine Inselversorgung.'},
 22:{theme:'materials',icon:'♻',category:'Kreislaufwirtschaft',lesson:'Recyclingmaterial und materialarmes Design verringern die Abhängigkeit von Primärrohstoffen.'},
 23:{theme:'rain',icon:'☂',category:'Lieferketten',lesson:'Digitale Planung und gebündelte Transporte verbessern die Reaktionsfähigkeit bei gestörter Logistik.'}
};
function globalEffect(room,id,p,fields){
 const def=definitions[id];if(!def)return null;
 const owned=source=>p.owned.includes(fields.find(f=>f.sourceNumber===source)?.number);
 let factor=1,baseCash=0,baseScope=[0,0,0],term='cash';const protections=[];
 const mitigate=(source,mult)=>{if(owned(source)){factor*=mult;protections.push(fields.find(f=>f.sourceNumber===source).name);}};
 const x=k=>Number(room.params[String(k)])||0;
 let note='';
 switch(id){
 case 1:baseCash=-p.base.map((v,i)=>Math.max(0,v+p.temp[i])).reduce((a,b)=>a+b,0)*50*room.config.initialCash/1000000;note='50 €/t × Startkapitalfaktor × aktuelle Jahresemissionen. Bereits vermiedene Tonnen werden nicht belastet.';break;
 case 2:baseCash=-x(5)*x(24);mitigate(6,0);mitigate(2,.9);mitigate(4,.9);mitigate(10,.75);mitigate(22,.9);note='PV: vollständiger Schutz im Spiel. LED, Druckluft, Maschinen und Antriebe senken die übrige Belastung multiplikativ.';break;
 case 10:baseCash=-18000;baseScope=[x(6)*x(7)*x(34)*x(17)/1000,0,x(6)*x(7)*x(34)*x(18)/1000];term='temporary';mitigate(39,.4);mitigate(8,.65);mitigate(34,.5);note='Dämmung −60 %, Wärmerückgewinnung −35 %, Wärmepumpe −50 %; kombinierte Restbelastung wird multipliziert.';break;
 case 11:baseCash=-16000;baseScope=[0,x(9)*x(35)*x(15)/1000,x(9)*x(35)*x(16)/1000];term='temporary';mitigate(39,.5);mitigate(6,.6);mitigate(22,.85);note='Dämmung −50 %, PV −40 %, effiziente Antriebe −15 % der jeweils verbleibenden Belastung.';break;
 case 15:baseCash=-12000;baseScope=[0,0,x(39)*(x(20)-x(21))/1000];term='temporary';if(owned(26)){factor=1.5;note='Schieneninvestition: 50 % höhere Streikbelastung. ';}mitigate(32,.4);note+='Digitale Planung verringert die Restbelastung um 60 %.';break;
 case 17:baseCash=12000;baseScope=[0,-x(12)*x(41)*x(15)/1000,-x(12)*x(41)*x(16)/1000];term='temporary';if(!owned(6))factor=0;else protections.push('Photovoltaik');note=owned(6)?'Deine PV erschließt den zusätzlichen Ertrag.':'Ohne PV gibt es weder Zusatzertrag noch zusätzliche Emissionsminderung.';break;
 case 21:baseCash=-30000;mitigate(6,.7);mitigate(24,.5);mitigate(22,.75);note='PV −30 %, Predictive Maintenance −50 %, effiziente Antriebe −25 % der verbleibenden Ausfallkosten.';break;
 case 22:baseCash=-40000;mitigate(19,.4);mitigate(38,.6);mitigate(28,.8);note='Recyclingmaterial −60 %, materialarmes Design −40 %, Mehrwegverpackung −20 % der Restkosten.';break;
 case 23:baseCash=-25000;baseScope=[0,0,12];term='temporary';mitigate(32,.4);mitigate(14,.75);note='Digitale Planung −60 %, Routenzug −25 % der verbleibenden Umweg- und Lieferkosten.';break;
 }
 const round=n=>Math.round(n*100)/100||0;
 return {cash:round(baseCash*factor),scope:baseScope.map(n=>round(n*factor)),term,valid:true,note,global:true,theme:def.theme,factor,protections,baselineCash:round(baseCash),baselineScope:baseScope.map(round),lesson:def.lesson};
}
module.exports={definitions,globalEffect};
