/* Section navigation preserves controls, execution and visualization state. */
'use strict';
(() => {
 const views={configuration:['Configuración','controlsPanel'],results:['Recomendación','recommendation'],comparison:['Comparación','comparison'],calculation:['Cálculo explicado','traceSection'],visual:['Exploración 3D','visualSupport'],model:['Modelo y supuestos','model'],tests:['Pruebas','validation'],conclusions:['Conclusiones','conclusions'],documentation:['Documentación','documentation'],evidence:['Evidencias','evidence']};
 let active='results';
 function show(view,options={}){
  if(!views[view])view='results';
  active=view;
  document.querySelectorAll('[data-view]').forEach(panel=>panel.hidden=panel.dataset.view!==view);
  document.querySelectorAll('.workspace-nav a').forEach(link=>{if(link.dataset.target===view)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  document.getElementById('viewSelect').value=view;
  document.getElementById('viewTitle').textContent=views[view][0];
  if(view==='calculation')document.getElementById('calculationTrace').open=true;
  if(options.history!==false && location.hash!=='#'+views[view][1])window.history.pushState(null,'','#'+views[view][1]);
  document.dispatchEvent(new CustomEvent('menushield:viewchange',{detail:{view}}));
  // A hidden chart has no layout width. Draw it again only after its section is visible.
  window.dispatchEvent(new Event('resize'));
  if(options.focus){document.getElementById('viewTitle').focus({preventScroll:true});document.querySelector('.workspace-content').scrollIntoView({block:'start',behavior:'instant'});}
 }
 function fromHash(){const id=location.hash.slice(1)==='presentation'?'conclusions':location.hash.slice(1),view=Object.keys(views).find(v=>views[v][1]===id);show(view||'results',{history:false});}
 document.querySelectorAll('.workspace-nav a').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();show(link.dataset.target,{focus:true});}));
 document.getElementById('viewSelect').addEventListener('change',e=>show(e.target.value,{focus:true}));
 document.getElementById('configure').addEventListener('click',()=>show('configuration',{focus:true}));
 document.getElementById('globalRun').addEventListener('click',()=>document.getElementById('run').click());
 document.addEventListener('click',e=>{const button=e.target.closest('[data-open-view]');if(button){e.preventDefault();show(button.dataset.openView,{focus:true});}});
 window.addEventListener('popstate',fromHash);window.addEventListener('hashchange',fromHash);
 document.addEventListener('menushield:pending',()=>{const el=document.getElementById('workspaceStatus');el.textContent='! Cambios pendientes de simular';el.dataset.state='pending';});
 document.addEventListener('menushield:computed',()=>{const el=document.getElementById('workspaceStatus');el.textContent='✓ Resultados actualizados';el.dataset.state='current';});
 window.MenuShieldNavigation={show,get active(){return active;}};
 fromHash();
})();

