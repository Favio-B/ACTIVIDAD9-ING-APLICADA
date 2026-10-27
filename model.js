/* MenuShield didactic model. Coefficients and equations preserved from 6e1c268. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MenuShieldModel=api;})(globalThis,()=>{
'use strict';
const scenarios={base:{rpm:20,concurrency:40,cores:2,ai:60,network:45},peak:{rpm:170,concurrency:300,cores:4,ai:70,network:85},growth:{rpm:430,concurrency:900,cores:8,ai:85,network:95}};
const archs=[{id:'mono',name:'Monolítica',base:75,net:1,eff:.82,coreCost:1,fixed:10,capacityFactor:1,aiPenalty:.48,baseAvailability:99.40,availabilityPenalty:8},{id:'modular',name:'Monolito modular',base:90,net:1.16,eff:.78,coreCost:1.08,fixed:17,capacityFactor:1.08,aiPenalty:.46,baseAvailability:99.65,availabilityPenalty:7},{id:'micro',name:'Microservicios',base:145,net:2.1,eff:.69,coreCost:1.5,fixed:55,capacityFactor:1.45,aiPenalty:.43,baseAvailability:99.85,availabilityPenalty:4}];
const priorities={balance:{label:'Equilibrio general',weights:[.32,.30,.20,.18]},speed:{label:'Menor latencia',weights:[.55,.16,.17,.12]},cost:{label:'Menor costo',weights:[.15,.60,.15,.10]},availability:{label:'Mayor disponibilidad',weights:[.16,.14,.55,.15]}};
const ranges={rpm:[1,1000],concurrency:[1,2000],cores:[1,32],ai:[0,100],network:[1,300]};
const limitRanges={maxLatency:[50,30000],budget:[1,100000],minAvailability:[90,99.999]};
const defaultLimits={maxLatency:1200,budget:200,minAvailability:99};
function inRanges(x,ranges){return Object.entries(ranges).every(([key,[min,max]])=>Number.isFinite(x[key])&&x[key]>=min&&x[key]<=max);}
function validate(x){return inRanges(x,ranges);}
function validLimits(l){return inRanges(l,limitRanges);}
function estimate(x,a){
 const load=x.rpm,ai=x.ai/100;
 const d=(.46+Math.min(x.concurrency,2000)*.00013)*(1+ai*a.aiPenalty);
 const scaling=a.capacityFactor===1?1:a.id==='modular'?1.08:Math.min(1.45,1+(.45*load/350));
 const cap=60*x.cores*a.eff/d*scaling;
 const rho=load/cap,clampedRho=Math.min(rho,.97);
 const queue=1+Math.min(rho,.97)/(1-Math.min(rho,.97))*.18;
 const penalty=rho>=1?(rho-1)*2500+600:0;
 const latency=a.base+a.net*x.network+d*1000/x.cores*queue+ai*95+penalty;
 const availability=Math.max(90,Math.min(99.99,a.baseAvailability-Math.max(0,rho-.75)*a.availabilityPenalty));
 const cost=30*x.cores*a.coreCost+a.fixed+.012*load*43.2;
 return {...a,d,ai,scaling,clampedRho,queue,penalty,latency,cap,rho,availability,cost};
}
function checks(r,l){return [
 {key:'latency',label:'Latencia',actual:r.latency,operator:'<=',limit:l.maxLatency,unit:'ms',pass:r.latency<=l.maxLatency},
 {key:'cost',label:'Costo',actual:r.cost,operator:'<=',limit:l.budget,unit:'USD/mes',pass:r.cost<=l.budget},
 {key:'availability',label:'Disponibilidad',actual:r.availability,operator:'>=',limit:l.minAvailability,unit:'%',pass:r.availability>=l.minAvailability},
 {key:'rho',label:'Utilización',actual:r.rho*100,operator:'<',limit:100,unit:'%',pass:r.rho<1}
 ];}
function feasible(r,l){return checks(r,l).every(c=>c.pass);}
function scoreDetails(r,priority){
 const weights=(priorities[priority]||priorities.balance).weights;
 const values=[1/(1+r.latency/500),1/(1+r.cost/100),Math.max(0,(r.availability-90)/10),Math.min(1,r.cap/(r.cap+400))];
 const contributions=values.map((v,i)=>v*weights[i]);
 return {weights:[...weights],values,contributions,total:contributions[0]+contributions[1]+contributions[2]+contributions[3]};
}
function normalizedScore(r,all,priority){return scoreDetails(r,priority).total;}
function decide(results,l,priority){
 const eligible=results.filter(r=>feasible(r,l));
 if(!eligible.length)return {winner:null,reason:'Ninguna arquitectura cumple simultáneamente las restricciones. Ajuste recursos, carga, presupuesto o umbrales.'};
 const sorted=[...eligible].sort((a,b)=>normalizedScore(b,results,priority)-normalizedScore(a,results,priority));
 return {winner:sorted[0],reason:`${eligible.length} de ${results.length} alternativas cumplen las restricciones. Se elige la puntuación máxima entre las viables para «${(priorities[priority]||priorities.balance).label}».`};
}
function deepFreeze(x){Object.values(x).forEach(v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v))deepFreeze(v);});return Object.freeze(x);}
function execute(x,l,priority='balance',metadata={}){
 if(!validate(x)||!validLimits(l)||!priorities[priority])throw new RangeError('Entradas o restricciones inválidas.');
 const results=archs.map(a=>{const r=estimate(x,a);return {...r,checks:checks(r,l),scoring:scoreDetails(r,priority),feasible:feasible(r,l)};});
 const choice=decide(results,l,priority);
 return deepFreeze({inputs:{...x},limits:{...l},priority,metadata:{...metadata,roles:[...(metadata.roles||[])]},results,winner:choice.winner,reason:choice.reason});
}
const close=(a,b,tolerance=.02)=>Math.abs(a-b)<=tolerance;
function runTests(){
 const b=scenarios.base,l=defaultLimits,results=x=>archs.map(a=>estimate(x,a)),winner=(x,z=l,p='balance')=>decide(results(x),z,p).winner?.id||null;
 const cases=[
 ['Entradas inválidas rechazadas',{...b,cores:0},false,()=>validate({...b,cores:0})],
 ['Carga mayor aumenta utilización',{base:b,rpm:70},true,()=>estimate({...b,rpm:70},archs[0]).rho>estimate(b,archs[0]).rho],
 ['Más CPU incrementa capacidad',{base:b,cores:4},true,()=>estimate({...b,cores:4},archs[0]).cap>estimate(b,archs[0]).cap],
 ['Sobrecarga incrementa latencia',{base:b,rpm:900},true,()=>estimate({...b,rpm:900},archs[0]).latency>estimate(b,archs[0]).latency],
 ['Presupuesto restrictivo descarta opciones',{b,budget:1},true,()=>results(b).every(r=>!feasible(r,{budget:1,maxLatency:30000,minAvailability:90}))],
 ['Resultados finitos en escenarios oficiales',scenarios,true,()=>Object.values(scenarios).every(s=>results(s).every(r=>Object.values(r).filter(v=>typeof v==='number').every(Number.isFinite)))],
 ['Disponibilidad dentro del rango',scenarios,true,()=>Object.values(scenarios).every(s=>results(s).every(r=>r.availability>=90&&r.availability<=99.99))],
 ['Decisión sin opciones válidas explica fallo',{budget:1,maxLatency:50,minAvailability:99.999},null,()=>winner(b,{budget:1,maxLatency:50,minAvailability:99.999})],
 ['Referencia recomienda Monolítica',{b,l},'mono',()=>winner(b)],
 ['Latencia de referencia',{b},484.07,()=>estimate(b,archs[0]).latency],
 ['Cambiar solo pedidos/min a 70',{...b,rpm:70},516.65,()=>estimate({...b,rpm:70},archs[0]).latency],
 ['Capacidad con 2 CPU',{b},164.23,()=>estimate(b,archs[0]).cap],
 ['Capacidad con 4 CPU',{...b,cores:4},328.45,()=>estimate({...b,cores:4},archs[0]).cap],
 ['Hora pico: presupuesto 200',{...scenarios.peak,...l},null,()=>winner(scenarios.peak)],
 ['Hora pico: presupuesto 350',{...scenarios.peak,budget:350},'mono',()=>winner(scenarios.peak,{...l,budget:350})],
 ['Crecimiento: presupuesto 650',{...scenarios.growth,...l,budget:650},'micro',()=>winner(scenarios.growth,{...l,budget:650})],
 ['Prioridad usa sus pesos',{priorities},true,()=>{const r=estimate(b,archs[0]);return Object.keys(priorities).every(p=>{const d=scoreDetails(r,p);return close(d.weights.reduce((a,b)=>a+b,0),1,1e-12)&&Math.abs(d.total-d.values.reduce((sum,v,i)=>sum+v*priorities[p].weights[i],0))<1e-12;})&&normalizedScore(r,[], 'speed')!==normalizedScore(r,[],'cost');}],
 ['Saturación aplica penalización',{...b,rpm:1000,cores:1},true,()=>{const r=estimate({...b,rpm:1000,cores:1},archs[0]);return r.rho>=1&&r.penalty>=600&&!feasible(r,{...l,budget:100000,maxLatency:30000,minAvailability:90});}],
 ['Espera acota ambos usos de rho a 0.97',{...b,rpm:1000,cores:1},6.82,()=>estimate({...b,rpm:1000,cores:1},archs[0]).queue],
 ['Entradas no finitas y límites inválidos',{ai:'NaN',budget:0},true,()=>!validate({...b,ai:NaN})&&!validate({...b,network:Infinity})&&!validLimits({...l,budget:0})],
 ['Escalamiento micro limitado a 1.45',{rpm:1000},1.45,()=>estimate({...b,rpm:1000},archs[2]).scaling],
 ['Ejecución conserva copia inmutable',{b,l},true,()=>{const x={...b},z={...l},run=execute(x,z);x.rpm=70;z.budget=1;return run.inputs.rpm===20&&run.limits.budget===200&&Object.isFrozen(run.results[0].scoring);}],
 ['Puntaje y decisión comparten resultados',{b,l},true,()=>{const run=execute(b,l);return run.results.every(r=>r.scoring.total===normalizedScore(r,run.results,'balance'))&&run.winner===run.results.find(r=>r.id===run.winner.id);}],
 ['Cero IA y límites extremos son válidos',{...b,ai:0},true,()=>validate({...b,ai:0})&&validLimits({budget:100000,maxLatency:30000,minAvailability:99.999})]
 ];
 return cases.map(([name,input,expected,fn],i)=>{let actual;try{actual=fn();}catch(e){actual=e.message;}return {id:i+1,name,input,expected,actual,pass:typeof expected==='number'?close(actual,expected):actual===expected};});
}
return {scenarios,archs,priorities,ranges,limitRanges,defaultLimits,estimate,validate,validLimits,checks,feasible,scoreDetails,normalizedScore,decide,execute,runTests};
});
