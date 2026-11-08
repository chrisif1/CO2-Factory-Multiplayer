'use strict';
function minimumAfterInvestments(base,owned,fields){
 const remaining=fields.filter(f=>f.type==='Investition'&&!owned.includes(f.number));
 return base.reduce((total,v,i)=>total+Math.max(0,v+remaining.reduce((s,f)=>s+Math.min(0,f.scope[i]),0)),0);
}
function fitStarting(starting,goal,fields){
 const original=starting.slice();
 // Worst additional emissions in each Scope from all six one-time choices.
 const reserve=[0,1,2].map(i=>fields.filter(f=>f.type==='Entscheidung').reduce((s,f)=>s+Math.max(0,...f.options.map(o=>o.scope[i])),0));
 const worst=s=>minimumAfterInvestments(s.map((n,i)=>n+reserve[i]),[],fields);
 let lo=0,hi=1;
 if(worst(starting)>goal){for(let i=0;i<60;i++){const m=(lo+hi)/2;if(worst(original.map(n=>n*m))<=goal)lo=m;else hi=m;}starting=original.map(n=>Math.floor(n*lo*100)/100);}
 return {starting,feasibility:{adjusted:starting.some((n,i)=>n!==original[i]),requested:original,minimum:minimumAfterInvestments(starting,[],fields),worstCaseMinimum:worst(starting),choiceReserve:reserve}};
}
function allowedOption(room,p,option,fields){
 const base=p.base.map((n,i)=>Math.max(0,n+option.scope[i]));
 return minimumAfterInvestments(base,p.owned,fields)<=room.config.goal+1e-7;
}
module.exports={minimumAfterInvestments,fitStarting,allowedOption};
