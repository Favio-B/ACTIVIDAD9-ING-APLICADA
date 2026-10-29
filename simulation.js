
'use strict';
(() => {
  const panel = document.createElement('section');
  panel.className = 'card lab3d tw:rounded-2xl';
  panel.id = 'interactiveLab';
  panel.innerHTML = `<div class="lab-heading"><h2>El recorrido de tu pedido <span class="tiny">/ Vista 3D</span></h2><span id="processState" class="process-state" data-state="ready" role="status">○ Listo para simular</span></div>
    <p class="tiny">Sigue un pedido representativo. La duración de la animación es ilustrativa; las métricas corresponden al modelo del escenario.</p>
    <div class="lab-toolbar"><label>Exploración visual (no cambia la recomendación)<select class="form-select" id="viewArch"><option value="mono">Monolítica</option><option value="modular" selected>Monolito modular</option><option value="micro">Microservicios</option></select></label><label>Velocidad del recorrido<select class="form-select" id="playSpeed"><option value="0.5">0,5× · lenta</option><option value="1" selected>1× · normal</option><option value="2">2× · rápida</option><option value="4">4× · muy rápida</option></select></label></div>
    <div class="lab-stage"><span class="lab-badge" id="sceneBadge">Vista 3D · arrastra para girar</span><canvas id="architecture3d" tabindex="0" role="img" aria-label="Arquitectura 3D. Arrastra o usa las flechas para girar; usa más y menos para acercar y alejar."></canvas></div>
    <div class="lab-controls"><button id="playPause" class="btn btn-outline-primary secondary" disabled>Pausar</button><button id="nextStep" class="btn btn-outline-primary secondary" disabled>Siguiente paso</button><button id="replay" class="btn btn-outline-primary secondary">Repetir recorrido</button><button id="cameraReset" class="btn btn-outline-primary secondary">Centrar vista</button></div>
    <p class="tiny">Arrastra para girar · rueda o teclas + / − para zoom · flechas para rotar. Cambia la arquitectura para comparar sus límites de despliegue.</p>
    <div class="lab-legend"><span><i class="legend-dot" aria-hidden="true"></i>Pendiente</span><span><i class="legend-dot pending" aria-hidden="true"></i>En proceso</span><span><i class="legend-dot done" aria-hidden="true"></i>Completado</span></div><progress id="processProgress" class="lab-progress" max="5" value="0" aria-label="Avance del pedido"></progress>
    <ol class="lab-steps" id="processSteps"><li>1. WhatsApp</li><li>2. IA</li><li>3. Pedido</li><li>4. Cocina</li><li>5. Respuesta</li></ol>
    <div id="processStatus" class="lab-status" aria-live="polite">Pulsa «Simular escenario» para iniciar el recorrido del pedido.</div><div id="processLog" class="lab-log"></div>`;
  $('visualSupport').replaceChildren(panel);
  const canvas = $('architecture3d'), ctx = canvas.getContext('2d');
  if(!ctx){panel.textContent='Vista 3D no disponible. El cálculo y la recomendación funcionan de forma independiente.';return;}
  let elapsed = 0, running = false, paused = false, started = false, lastStage = -1;
  let snapshot = MenuShieldApp.lastRun.inputs, modeled = MenuShieldApp.lastRun.results;
  let yaw = -.48, pitch = .48, zoom = 1, drag = null, previous = 0;
  const duration = 2000;
  const labels = ['WhatsApp','IA','Pedidos','Cocina','Respuesta'];
  const colors = labels.map(() => '#1E3A5F');
  function nodes() {
    return labels.map((label,i) => ({label, x:(i-2)*1.85, y:i===1?.5:i===3?.25:0, z:(i%2?-.65:.45), color:colors[i], i}));
  }
  function project(x,y,z,w,h) {
    const rx = x*Math.cos(yaw)+z*Math.sin(yaw), rz = -x*Math.sin(yaw)+z*Math.cos(yaw);
    const ry = y*Math.cos(pitch)-rz*Math.sin(pitch), depth = y*Math.sin(pitch)+rz*Math.cos(pitch);
    const scale = Math.min(w/13,h/6)*zoom*12/(12+depth);
    return {x:w/2+rx*scale,y:h/2+30-ry*scale,depth};
  }
  function line(points,color,width=1) {
    ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
  }
  function drawScene() {
    if($('visualSupport').hidden)return;
    const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const p=(x,y,z)=>project(x,y,z,w,h);
    for(let x=-6;x<=6;x++)line([p(x,-.65,-3),p(x,-.65,3)],'#dce2e8');
    for(let z=-3;z<=3;z++)line([p(-6,-.65,z),p(6,-.65,z)],'#dce2e8');
    const ns=nodes(),active=Math.min(4,Math.floor(elapsed/duration)),arch=$('viewArch').value;
    const selected=modeled.find(r=>r.id===arch);
    // The packet count is a bounded illustration of computed utilization, never a queue measurement.
    const packets=Math.min(12,Math.max(1,Math.ceil(selected.rho*8)));
    ctx.font='11px system-ui';ctx.textAlign='left';ctx.fillStyle='#374151';
    ctx.fillText('Carga ilustrada · '+fmt(selected.rho*100,1)+' % de utilización',14,h-37);
    if(selected.rho>=1){ctx.fillStyle='#a61f2c';ctx.fillText('! Capacidad superada · pedidos en espera (ilustración)',14,h-17);}
    else ctx.fillText('Representación didáctica · la duración no mide la latencia',14,h-17);
    for(let i=0;i<packets;i++){
      const moving=started&&running&&!paused&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
      const phase=((moving?elapsed/(duration*5):.25)+i/packets)%1;
      const path=phase*4,segment=Math.min(3,Math.floor(path)),local=path-segment,a=ns[segment],b=ns[segment+1];
      const packet=p(a.x+(b.x-a.x)*local,a.y+(b.y-a.y)*local+.7,a.z+(b.z-a.z)*local);
      ctx.fillStyle='#FFFFFF';ctx.strokeStyle='#1E3A5F';ctx.lineWidth=1;
      ctx.fillRect(packet.x-6,packet.y-5,12,10);ctx.strokeRect(packet.x-6,packet.y-5,12,10);
    }
    if(selected.rho>=1){for(let i=0;i<Math.min(8,Math.ceil((selected.rho-1)*5)+2);i++){const q=p(-.5+(i%4)*.35,.8+Math.floor(i/4)*.3,1.5);ctx.fillStyle='#E63946';ctx.fillRect(q.x-4,q.y-3,8,6);}}

    // A single deployment encloses the three internal domains in monolithic variants.
    if(arch!=='micro'){
      const outline=[p(-2.7,-.6,-1.4),p(2.7,-.6,-1.4),p(2.7,-.6,1.4),p(-2.7,-.6,1.4)];
      line([...outline,outline[0]],arch==='mono'?'#1E3A5F':'#1E3A5F',2);
      ctx.fillStyle='#374151';ctx.font='11px system-ui';const t=p(0,-.6,-1.8);ctx.textAlign='center';ctx.fillText(arch==='mono'?'UN SOLO DESPLIEGUE · módulos acoplados':'UN SOLO DESPLIEGUE · módulos separados',t.x,t.y-10);
    }
    ns.slice(1).forEach((n,i)=>{
      const a=ns[i],start=p(a.x,a.y,a.z),end=p(n.x,n.y,n.z);
      line([start,end],started&&active>i?'#22C55E':'#1E3A5F',2);
      if(started && active===i+1 && elapsed<duration*5){
        const t=(elapsed%duration)/duration;
        const q=p(a.x+(n.x-a.x)*t,a.y+(n.y-a.y)*t+.2,a.z+(n.z-a.z)*t);
        ctx.beginPath();ctx.arc(q.x,q.y,5,0,Math.PI*2);ctx.fillStyle='#F59E0B';ctx.shadowColor='#F59E0B';ctx.shadowBlur=0;ctx.fill();ctx.shadowBlur=0;
      }
    });
    const faces=[];
    for(const n of ns){
      const size=arch==='mono' && n.i>0 && n.i<4?.68:.55;
      const v=[[-size,-.45,-.5],[size,-.45,-.5],[size,.55,-.5],[-size,.55,-.5],[-size,-.45,.5],[size,-.45,.5],[size,.55,.5],[-size,.55,.5]].map(([x,y,z])=>p(n.x+x,n.y+y,n.z+z));
      for(const ids of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]])faces.push({points:ids.map(i=>v[i]),depth:ids.reduce((s,i)=>s+v[i].depth,0)/4,n});
    }
    faces.sort((a,b)=>b.depth-a.depth).forEach(({points,n})=>{
      ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();
      ctx.fillStyle=started&&(elapsed>=duration*5||n.i<active)?'#22C55E':started&&n.i===active?'#F59E0B':'#FFFFFF';ctx.fill();ctx.strokeStyle=n.color;ctx.lineWidth=1.3;ctx.stroke();
    });
    ns.forEach(n=>{const q=p(n.x,n.y+1,n.z);ctx.textAlign='center';ctx.font=w<500?'bold 10px system-ui':'bold 12px system-ui';ctx.fillStyle='#1E3A5F';ctx.fillText(n.label,q.x,q.y);if(w>=500&&arch==='micro'&&n.i>0&&n.i<4){ctx.font='10px system-ui';ctx.fillStyle='#374151';ctx.fillText('servicio independiente',q.x,q.y-16);}});
  }
  function updateStage() {
    const stage=Math.min(4,Math.floor(elapsed/duration)),complete=elapsed>=5*duration;
    $('processProgress').value=elapsed/duration;
    [...$('processSteps').children].forEach((li,i)=>{li.className=complete||i<stage?'done':started&&i===stage?'active':'';li.textContent=`${i+1}. ${labels[i]} ${complete||i<stage?'✓':started&&i===stage?'· En proceso':''}`;});
    const r=modeled.find(a=>a.id===$('viewArch').value);
    setState(complete?'complete':r.rho>=1&&stage===2?'error':paused?'ready':'running',complete?'✓ Pedido confirmado':r.rho>=1&&stage===2?'! Capacidad superada':paused?'Ⅱ Recorrido pausado':'◷ Pedido en proceso');
    const descriptions=[
      `Entra un pedido por WhatsApp. Escenario: ${snapshot.rpm} pedidos/min y ${snapshot.concurrency} usuarios simultáneos.`,
      snapshot.ai===0?'La IA se omite: el escenario usa 0 % de pedidos con IA. El pedido continúa con datos estructurados.':`La IA interpreta los productos y cantidades. En este escenario participa en el ${snapshot.ai} % de los pedidos; este recorrido ilustra esa rama.`,
      `Se valida y registra el pedido con ${snapshot.cores} vCPU. Utilización estimada de ${r.name}: ${fmt(r.rho*100,1)} %. ${r.rho>=1?'La demanda supera la capacidad: se acumulan pedidos en cola.':'El modelo mantiene margen de capacidad.'}`,
      `Cocina recibe el pedido. ${$('viewArch').value==='micro'?'Se comunica con un servicio desplegado de forma independiente.':'El módulo de cocina pertenece al mismo despliegue.'} Red base: ${snapshot.network} ms.`,
      `Se confirma el pedido al cliente. Latencia estimada de ${r.name}: ${fmt(r.latency,0)} ms. La comparación de las tres arquitecturas y la recomendación están arriba.`
    ];
    if(stage!==lastStage||complete){
      $('processStatus').textContent=complete?'Recorrido completado. '+descriptions[4]:`Paso ${stage+1} de 5 · ${descriptions[stage]}`;
      $('processLog').textContent=complete?'WhatsApp · IA / datos estructurados · Pedidos · Cocina · Confirmación':labels.slice(0,stage+1).join(' · ');
      lastStage=stage;
    }
    if(complete){running=false;$('playPause').disabled=true;$('nextStep').disabled=true;$('sceneBadge').textContent='Recorrido completado · explora la vista 3D';}
  }
  function setState(state,label){const badge=$('processState');if(badge.textContent!==label){badge.dataset.state=state;badge.textContent=label;}}
  window.startInteractiveSimulation=(execution)=>{
    const run=execution||MenuShieldApp.simulate();if(!run)return;
    snapshot=run.inputs;modeled=run.results;if(run.winner)$('viewArch').value=run.winner.id;elapsed=0;lastStage=-1;started=true;running=true;paused=false;document.dispatchEvent(new CustomEvent('menushield:visualchange'));
    $('playPause').disabled=false;$('nextStep').disabled=false;$('playPause').textContent='Pausar';$('sceneBadge').textContent='Pedido en proceso · vista 3D';updateStage();
    drawScene();
    if($('visualSupport').hidden||matchMedia('(prefers-reduced-motion: reduce)').matches){paused=true;$('playPause').textContent='Continuar';updateStage();}
    scheduleFrame();
  };
  $('playPause').onclick=()=>{paused=!paused;$('playPause').textContent=paused?'Continuar':'Pausar';updateStage();};
  $('nextStep').onclick=()=>{paused=true;$('playPause').textContent='Continuar';elapsed=Math.min(5*duration,(Math.floor(elapsed/duration)+1)*duration);updateStage();drawScene();};
  $('replay').onclick=()=>window.startInteractiveSimulation(MenuShieldApp.lastRun);
  $('viewArch').onchange=()=>{lastStage=-1;if(started)updateStage();drawScene();};
  $('cameraReset').onclick=()=>{yaw=-.48;pitch=.48;zoom=1;drawScene();};
  function cancel(){snapshot=MenuShieldApp.lastRun.inputs;modeled=MenuShieldApp.lastRun.results;running=false;started=false;elapsed=0;lastStage=-1;$('playPause').disabled=true;$('nextStep').disabled=true;$('processProgress').value=0;[...$('processSteps').children].forEach((li,i)=>{li.className='';li.textContent=`${i+1}. ${labels[i]}`;});setState('ready','○ Listo para simular');$('processStatus').textContent='Configuración actualizada. Pulsa «Simular escenario» para iniciar un nuevo recorrido.';$('processLog').textContent='';$('sceneBadge').textContent='Vista 3D · arrastra para girar';drawScene();}
  document.addEventListener('menushield:viewchange',e=>{if(e.detail.view!=='visual'&&running){paused=true;$('playPause').textContent='Continuar';updateStage();}});
  document.addEventListener('menushield:pending',cancel);
  document.addEventListener('menushield:computed',cancel);
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag.x)*.008;pitch=Math.max(-.5,Math.min(1.1,pitch+(e.clientY-drag.y)*.008));drag={x:e.clientX,y:e.clientY};drawScene();});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.6,zoom-e.deltaY*.001));drawScene();},{passive:false});
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=Math.min(1.1,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-.5,pitch-.1);if(e.key==='+'||e.key==='=')zoom=Math.min(1.6,zoom+.1);if(e.key==='-')zoom=Math.max(.65,zoom-.1);drawScene();});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(drawScene).observe(canvas);
  let frameId=null;
  function scheduleFrame(){if(frameId===null&&running&&!paused&&!$('visualSupport').hidden&&!document.hidden)frameId=requestAnimationFrame(frame);}
  function frame(now){frameId=null;const delta=previous?Math.min(now-previous,100):0;previous=now;if(running&&!paused&&!$('visualSupport').hidden&&!document.hidden){elapsed=Math.min(duration*5,elapsed+delta*Number($('playSpeed').value));updateStage();drawScene();}scheduleFrame();}
  document.addEventListener('menushield:viewchange',()=>{previous=0;drawScene();scheduleFrame();});
  document.addEventListener('click',()=>{previous=0;scheduleFrame();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches&&running){paused=true;$('playPause').textContent='Continuar';updateStage();drawScene();}});

  document.addEventListener('visibilitychange',()=>{previous=0;if(document.hidden&&running){paused=true;$('playPause').textContent='Continuar';updateStage();}scheduleFrame();});
  drawScene();
})();
