/* All views and exports consume one immutable execution from model.js. */
'use strict';
const $=id=>document.getElementById(id);
const fmt=(v,n=2)=>Number(v).toLocaleString('es-CO',{maximumFractionDigits:n,minimumFractionDigits:n});
const {scenarios,archs,priorities,defaultLimits,estimate,validate,validLimits,feasible,normalizedScore,decide}=MenuShieldModel;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fieldNames={rpm:'Pedidos/min',concurrency:'Usuarios simultáneos',cores:'vCPU',ai:'IA (%)',network:'Red (ms)',maxLatency:'Latencia máxima (ms)',budget:'Presupuesto (USD/mes)',minAvailability:'Disponibilidad mínima (%)'};
let lastRun=null,sequence=0,dirty=false;
const history=[];
function readNumber(id){const value=$(id).value.trim();return value===''?NaN:Number(value);}
function input(){return Object.fromEntries(Object.keys(MenuShieldModel.ranges).map(k=>[k,readNumber(k)]));}
function limits(){return Object.fromEntries(Object.keys(MenuShieldModel.limitRanges).map(k=>[k,readNumber(k)]));}
function metadata(){return {project:$('project').value,description:$('description').value,roles:[...document.querySelectorAll('[name=roles]:checked')].map(x=>x.value),scenario:$('scenario').value,id:`ejecucion-${++sequence}`,timestamp:new Date().toISOString()};}
function updateLabels(){for(const k of Object.keys(MenuShieldModel.ranges))$(k+'Out').textContent=$(k).value+(k==='ai'?' %':k==='network'?' ms':'');}
function markDirty(){dirty=true;$('runState').dataset.state='pending';$('runState').textContent='! Cambios pendientes de simular. La recomendación y las cifras visibles pertenecen a la última ejecución; pulsa Simular para actualizarlas.';$('recommendation').dataset.state='pending';document.dispatchEvent(new CustomEvent('menushield:pending'));}
function validateControls(x,l){
 const errors=[];
 for(const [k,[min,max]] of Object.entries({...MenuShieldModel.ranges,...MenuShieldModel.limitRanges})){
  const value=k in x?x[k]:l[k],invalid=!Number.isFinite(value)||value<min||value>max;
  $(k).setAttribute('aria-invalid',String(invalid));if(invalid)errors.push(`${fieldNames[k]} debe ser un número entre ${min} y ${max}.`);
 }
 if(!priorities[$('quality').value])errors.push('Selecciona una prioridad válida.');
 $('validationErrors').hidden=!errors.length;
 $('validationErrors').innerHTML=errors.length?'<strong>No se calculó ni se exportó: revisa las entradas.</strong><ul>'+errors.map(e=>`<li>${esc(e)}</li>`).join('')+'</ul>':'';
 if(errors.length){markDirty();$('runState').dataset.state='error';$('runState').textContent='! Entradas inválidas. Los resultados anteriores no representan estos controles.';}
 return !errors.length;
}
function checkText(c){return `${c.label}: ${fmt(c.actual)} ${c.unit} ${c.pass?'cumple':'incumple'} ${c.operator} ${fmt(c.limit)} ${c.unit}`;}
function checksHtml(checks){return '<ul class="checks-list">'+checks.map(c=>`<li class="${c.pass?'ok':'fail'}">${c.pass?'✓ Cumple':'! No cumple'} · ${esc(checkText(c))}</li>`).join('')+'</ul>';}
function renderExecution(run){
 const w=run.winner,p=priorities[run.priority];
 $('headline').textContent=w?`Arquitectura recomendada: ${w.name}`:'Ninguna arquitectura cumple las restricciones: no hay alternativa viable';
 $('headline').classList.toggle('no-winner',!w);
 $('reasons').textContent=run.reason+(w?` Puntaje: ${fmt(w.scoring.total,6)} / 1. Prioridad: ${p.label}.`:'');
 $('constraint').textContent=`Restricciones de esta ejecución: latencia <= ${fmt(run.limits.maxLatency)} ms; costo <= USD ${fmt(run.limits.budget)}/mes; disponibilidad >= ${fmt(run.limits.minAvailability,3)} %; utilización < 100 %.`;
 const metrics=w?[['Latencia estimada',fmt(w.latency)+' ms'],['Capacidad',fmt(w.cap)+' ped/min'],['Utilización',fmt(w.rho*100)+' %'],['Disponibilidad',fmt(w.availability,3)+' %'],['Costo estimado','USD '+fmt(w.cost)+'/mes']]:[['Alternativas viables','0 / 3']];
 $('summary').innerHTML=metrics.map(([k,v])=>`<div class="metric"><small>${k}</small><strong>${v}</strong></div>`).join('');
 $('executionInputs').innerHTML=`<details><summary>Entradas y contexto utilizados · ${esc(run.metadata.id)}</summary><p>${esc(run.metadata.project)} · ${esc(run.metadata.description)} · Roles: ${esc(run.metadata.roles.join(', ')||'sin especificar')} (descriptivos).</p><p>${Object.entries(run.inputs).map(([k,v])=>`${fieldNames[k]}: <b>${fmt(v,0)}</b>`).join(' · ')}</p><p>Escenario: ${esc(run.metadata.scenario)} · Prioridad: ${p.label} · Registro UTC: ${esc(run.metadata.timestamp)}</p></details>`;
 $('winnerChecks').innerHTML=w?'<h3>Cumplimiento de la alternativa seleccionada</h3>'+checksHtml(w.checks):'';
 $('decisionReasons').innerHTML='<h3>Comparación y motivos de descarte</h3>'+run.results.map(r=>{
  const failures=r.checks.filter(c=>!c.pass);
  return `<div class="decision-item"><strong>${esc(r.name)} · ${r.feasible?'Viable':'Descartada'}</strong><p>${failures.length?failures.map(checkText).map(esc).join('; '):`Cumple las cuatro restricciones. Puntaje ${fmt(r.scoring.total,6)}${w&&w.id===r.id?' · Mayor puntuación entre las viables.':` · Menor puntuación que ${esc(w.name)} (${fmt(w.scoring.total,6)}).`}`}</p></div>`;
 }).join('')+(w?`<p class="tiny">${w.id==='mono'?'Ventaja: baja sobrecarga y despliegue sencillo. Limitación: escala verticalmente y acopla dominios.':w.id==='modular'?'Ventaja: límites internos y despliegue sencillo. Limitación: sigue compartiendo recursos y despliegue.':'Ventaja: escalamiento selectivo modelado. Limitación: mayor costo, red y complejidad operativa.'} La selección depende de estas entradas y de las ponderaciones; no es universal.</p>`:'');
 $('results').innerHTML=run.results.map(r=>`<tr class="${w&&w.id===r.id?'winner':''}"><th scope="row">${esc(r.name)}${w&&w.id===r.id?' ✓ Seleccionada':''}</th><td>${fmt(r.latency)}</td><td>${fmt(r.cap)}</td><td>${fmt(r.rho*100)}</td><td>${fmt(r.availability,3)}</td><td>${fmt(r.cost)}</td><td class="${r.feasible?'ok':'fail'}">${r.feasible?'✓ Cumple':'! No cumple'}<br><small>Puntaje ${fmt(r.scoring.total,6)}${r.feasible?'':' (excluido)'}</small></td></tr>`).join('');
 renderTrace(run);draw(run);renderHistory();
}
function renderTrace(run){
 const x=run.inputs,f=n=>fmt(n,6);
 $('traceContent').innerHTML=`<p>Datos de <strong>${esc(run.metadata.id)}</strong>, sin recalcular fórmulas por separado. Se muestran seis decimales; el motor conserva precisión completa.</p><p>${Object.entries(x).map(([k,v])=>`${fieldNames[k]} = ${v}`).join('; ')}. Prioridad: ${priorities[run.priority].label}.</p>`+run.results.map(r=>`<details><summary>${r.name} · ${r.feasible?'viable':'descartada'} · puntaje ${f(r.scoring.total)}</summary><pre class="formula-block">IA = ${x.ai}/100 = ${f(r.ai)}
d = (0.46 + min(${x.concurrency},2000)*0.00013)*(1 + ${r.ai}*${r.aiPenalty}) = ${f(r.d)} s CPU/pedido
s = ${r.id==='mono'?'1':r.id==='modular'?'1.08':`min(1.45, 1 + 0.45*${x.rpm}/350)`} = ${f(r.scaling)}
cap = 60*${x.cores}*${r.eff}/${f(r.d)}*${f(r.scaling)} = ${f(r.cap)} ped/min
rho = ${x.rpm}/${f(r.cap)} = ${f(r.rho)}
t = min(${f(r.rho)},0.97) = ${f(r.clampedRho)}
q = 1 + ${f(r.clampedRho)}/(1 - ${f(r.clampedRho)})*0.18 = ${f(r.queue)}
P = rho >= 1 ? (rho - 1)*2500 + 600 : 0 = ${f(r.penalty)} ms
L = ${r.base} + ${r.net}*${x.network} + ${f(r.d)}*1000/${x.cores}*${f(r.queue)} + ${r.ai}*95 + ${f(r.penalty)} = ${f(r.latency)} ms
A = max(90,min(99.99,${r.baseAvailability} - max(0,${f(r.rho)} - 0.75)*${r.availabilityPenalty})) = ${f(r.availability)} %
C = 30*${x.cores}*${r.coreCost} + ${r.fixed} + 0.012*${x.rpm}*43.2 = ${f(r.cost)} USD/mes</pre>${checksHtml(r.checks)}<div class="table-responsive"><table class="table score-table"><caption>Normalización y contribución al puntaje de ${r.name}</caption><thead><tr><th>Componente</th><th>Regla con valores</th><th>Normalizado</th><th>Peso</th><th>Contribución</th></tr></thead><tbody>${['Latencia','Costo','Disponibilidad','Capacidad'].map((name,i)=>`<tr><th scope="row">${name}</th><td><code>${[`1/(1+${f(r.latency)}/500)`,`1/(1+${f(r.cost)}/100)`,`max(0,(${f(r.availability)}-90)/10)`,`min(1,${f(r.cap)}/(${f(r.cap)}+400))`][i]}</code></td><td>${f(r.scoring.values[i])}</td><td>${r.scoring.weights[i]}</td><td>${f(r.scoring.contributions[i])}</td></tr>`).join('')}</tbody></table></div><p><b>Total = ${r.scoring.contributions.map(f).join(' + ')} = ${f(r.scoring.total)}</b>. ${r.feasible?'Participa en la selección.':'No participa en la selección porque incumple requisitos.'}</p></details>`).join('');
}
function draw(run){
 const c=$('bars'),ctx=c.getContext('2d');if(!ctx)return;
 const width=Math.max(c.clientWidth,200),height=280,dpr=window.devicePixelRatio||1;c.width=width*dpr;c.height=height*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);ctx.font='12px system-ui';
 const key=$('chartMetric').value,labels={latency:['Latencia estimada','ms','menor es mejor'],cap:['Capacidad','ped/min','mayor es mejor'],rho:['Utilización CPU','%','menor es mejor'],availability:['Disponibilidad estimada','%','mayor es mejor'],cost:['Costo estimado','USD/mes','menor es mejor']},[name,unit,hint]=labels[key];
 const values=run.results.map(r=>key==='rho'?r.rho*100:r[key]),max=Math.max(...values)*1.15;
 $('chartDescription').textContent=`${name} (${unit}) · ${hint}. Datos de ${run.metadata.id}. La alternativa seleccionada se identifica en la tabla y con ✓ en el gráfico.`;
 run.results.forEach((r,i)=>{const y=35+i*80,barWidth=width-100;ctx.fillStyle='#374151';ctx.fillText(`${r.name}${run.winner?.id===r.id?' ✓':''}`,8,y);ctx.fillStyle='#F3F4F6';ctx.fillRect(8,y+8,barWidth,25);ctx.fillStyle=run.winner?.id===r.id?'#22C55E':'#1E3A5F';ctx.fillRect(8,y+8,Math.max(1,barWidth*values[i]/max),25);ctx.fillStyle='#1E3A5F';ctx.fillText(fmt(values[i])+' '+unit,Math.min(width-90,14+barWidth*values[i]/max),y+26);});
}
function renderHistory(){
 $('runHistory').innerHTML='<h3>Últimas ejecuciones · evidencia para sustentación</h3>'+history.map(run=>`<p class="history-item"><strong>${esc(run.metadata.id)}: ${run.winner?.name||'Ninguna viable'}</strong><br>${Object.entries(run.inputs).map(([k,v])=>`${fieldNames[k]} ${v}`).join(' · ')}<br>Presupuesto ${run.limits.budget}; p95 máx. ${run.limits.maxLatency}; disponibilidad mín. ${run.limits.minAvailability}; ${priorities[run.priority].label}.<br>Monolítica: ${fmt(run.results[0].latency)} ms; ${fmt(run.results[0].cap)} ped/min.</p>`).join('');
}
function simulate(options={}){
 const x=input(),l=limits();if(!validateControls(x,l)){if(options.focus)focusDecision();return null;}
 lastRun=MenuShieldModel.execute(x,l,$('quality').value,metadata());history.unshift(lastRun);if(history.length>5)history.pop();dirty=false;
 $('runState').dataset.state='current';$('runState').textContent=`✓ Resultados actualizados · ${lastRun.metadata.id} · ${priorities[lastRun.priority].label}`;$('recommendation').dataset.state='current';
 renderExecution(lastRun);document.dispatchEvent(new CustomEvent('menushield:computed',{detail:lastRun}));if(options.focus)focusDecision();return lastRun;
}
function focusDecision(){$('decisionTitle').focus({preventScroll:true});$('recommendation').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function buildCsv(run){
 const head=['Ejecucion','Fecha_UTC','Proyecto_descriptivo','Necesidad_descriptiva','Roles_descriptivos','Escenario','Prioridad','Pedidos_min','Usuarios','vCPU','IA_pct','Red_ms','Limite_latencia_ms','Limite_costo_USD_mes','Min_disponibilidad_pct','Arquitectura','Latencia_p95_aprox_ms','Capacidad_ped_min','CPU_pct','Disponibilidad_pct','Costo_USD_mes','Cumple','Puntaje','Seleccionada','Motivos_descarte'];
 const rows=run.results.map(r=>[run.metadata.id,run.metadata.timestamp,run.metadata.project,run.metadata.description,run.metadata.roles.join(' / '),run.metadata.scenario,run.priority,...Object.values(run.inputs),run.limits.maxLatency,run.limits.budget,run.limits.minAvailability,r.name,r.latency,r.cap,r.rho*100,r.availability,r.cost,r.feasible?'SI':'NO',r.scoring.total,run.winner?.id===r.id?'SI':'NO',r.checks.filter(c=>!c.pass).map(checkText).join(' | ')]);
 return '\ufeff'+[head,...rows].map(row=>row.map(value=>{const text=String(value);const safe=typeof value==='string'&&/^[=+@-]/.test(text)?"'"+text:text;return '"'+safe.replace(/"/g,'""')+'"';}).join(';')).join('\r\n');
}
function csv(){const run=simulate();if(!run){focusDecision();return;}const url=URL.createObjectURL(new Blob([buildCsv(run)],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');a.href=url;a.download=`MenuShield_${run.metadata.id}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function tests(){const rows=MenuShieldModel.runTests();$('testResults').innerHTML=`<p class="status">${rows.filter(x=>x.pass).length} / ${rows.length} pruebas aprobadas</p>`+rows.map(r=>`<details class="${r.pass?'ok':'fail'}"><summary>${r.pass?'APROBADA':'FALLIDA'} · ${r.id}. ${esc(r.name)}</summary><p>Entradas: <code>${esc(JSON.stringify(r.input))}</code></p><p>Esperado: ${esc(JSON.stringify(r.expected))}. Obtenido: ${esc(JSON.stringify(r.actual))}. Tolerancia numérica: 0,02.</p></details>`).join('');}
function modelReference(){
 $('modelReference').innerHTML=`<pre class="formula-block">a = IA/100; d = (0.46 + min(usuarios,2000)*0.00013)*(1+a*penalizacionIA)
s = 1 (Monolítica); 1.08 (Modular); min(1.45,1+0.45*pedidos/350) (Microservicios)
cap = 60*vCPU*eficiencia/d*s; rho = pedidos/cap
t = min(rho,0.97); q = 1 + t/(1-t)*0.18
P = rho >= 1 ? (rho-1)*2500+600 : 0
L = base + factorRed*red + d*1000/vCPU*q + a*95 + P
A = max(90,min(99.99,A0-max(0,rho-0.75)*penalizacionDisponibilidad))
C = 30*vCPU*factorCosto + fijo + 0.012*pedidos*43.2
nL = 1/(1+L/500); nC = 1/(1+C/100)
nA = max(0,(A-90)/10); nCap = min(1,cap/(cap+400))
Puntaje = wL*nL + wC*nC + wA*nA + wCap*nCap</pre><p>Unidades: d en segundos CPU/pedido; cap en ped/min; rho y q sin unidad; L y P en ms; A en %; C en USD/mes. 43.2 = 30*24*60/1000. El numerador y denominador de espera utilizan el mismo rho acotado. Si rho >= 1 hay penalización adicional; no se oculta la saturación.</p><div class="table-responsive"><table class="table"><caption>Coeficientes arbitrarios del modelo, no extraídos de los artículos</caption><thead><tr><th>Arquitectura</th><th>Base ms</th><th>Red</th><th>Eficiencia</th><th>Costo CPU</th><th>Fijo USD</th><th>Penal. IA</th><th>A0 %</th><th>Penal. A</th></tr></thead><tbody>${archs.map(a=>`<tr><th scope="row">${a.name}</th>${[a.base,a.net,a.eff,a.coreCost,a.fixed,a.aiPenalty,a.baseAvailability,a.availabilityPenalty].map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>El campo histórico capacityFactor (1; 1.08; 1.45) identifica el tipo de escalamiento. Los factores efectivos son los expresados en s; el límite 1.45 se alcanza en microservicios desde 350 ped/min.</p><div class="table-responsive"><table class="table"><caption>Ponderaciones (suma = 1)</caption><thead><tr><th>Prioridad</th><th>Latencia</th><th>Costo</th><th>Disponibilidad</th><th>Capacidad</th></tr></thead><tbody>${Object.values(priorities).map(p=>`<tr><th scope="row">${p.label}</th>${p.weights.map(w=>`<td>${w}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>Primero: L <= límite, C <= presupuesto, A >= mínimo y rho < 1. Después: máximo puntaje entre viables. En empate exacto se conserva el orden Monolítica, Modular, Microservicios. Las normalizaciones usan referencias fijas (500 ms, USD 100, 90–100 % y 400 ped/min); no dependen del conjunto comparado.</p>`;
}
for(const k of Object.keys(MenuShieldModel.ranges))$(k).addEventListener('input',()=>{$('scenario').value='custom';updateLabels();});
document.querySelector('aside').addEventListener('input',markDirty);
document.querySelector('aside').addEventListener('change',markDirty);
$('scenario').addEventListener('change',()=>{const scenario=scenarios[$('scenario').value];if(scenario)for(const [k,v] of Object.entries(scenario))$(k).value=v;updateLabels();markDirty();});
$('run').addEventListener('click',()=>{const run=simulate({focus:true});if(run&&typeof window.startInteractiveSimulation==='function'){try{window.startInteractiveSimulation(run);}catch(e){$('visualSupport').textContent='La animación no está disponible. Los resultados numéricos siguen siendo válidos.';}}});
$('reset').addEventListener('click',()=>{$('project').value='MenuShield';$('description').selectedIndex=0;document.querySelectorAll('[name=roles]').forEach(el=>el.checked=true);for(const [k,v] of Object.entries(scenarios.base))$(k).value=v;for(const [k,v] of Object.entries(defaultLimits))$(k).value=v;$('quality').value='balance';$('scenario').value='base';updateLabels();simulate();});
$('export').addEventListener('click',csv);$('tests').addEventListener('click',tests);$('chartMetric').addEventListener('change',()=>{if(lastRun)draw(lastRun);});
window.addEventListener('resize',()=>{if(lastRun)draw(lastRun);});
window.MenuShieldApp={get lastRun(){return lastRun;},get dirty(){return dirty;},simulate,buildCsv};
modelReference();updateLabels();simulate();
