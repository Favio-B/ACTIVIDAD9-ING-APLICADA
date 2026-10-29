/* Definitions only: formulas and the decision model remain unchanged. */
'use strict';
(() => {
 const groups=[
 ['Entradas del escenario',[
 ['pedidos / rpm / λ','Pedidos que llegan por minuto (ped/min).'],
 ['usuarios / concurrency / u','Personas que usan el sistema al mismo tiempo.'],
 ['vCPU / cores / c','CPU virtual disponible para procesar pedidos.'],
 ['IA','Porcentaje de pedidos con inteligencia artificial (0 a 100 %).'],
 ['a','Fracción de pedidos con IA: IA / 100. Por ejemplo, 60 % se convierte en 0,60. En el cálculo detallado la primera línea también llama IA a esta fracción.'],
 ['red / network / N','Tiempo base de comunicación de la red (ms).']]],
 ['Capacidad y utilización',[
 ['d','Segundos de CPU necesarios para procesar un pedido (s CPU/pedido).'],
 ['eficiencia / eff / ε','Factor de aprovechamiento de CPU de cada arquitectura; sin unidad.'],
 ['penalizacionIA / aiPenalty','Factor que incrementa la demanda de CPU cuando se utiliza IA.'],
 ['s / scaling','Factor de escalamiento: 1 en monolito, 1,08 en modular y hasta 1,45 en microservicios.'],
 ['cap / μ','Capacidad estimada: cuántos pedidos puede atender el sistema por minuto.'],
 ['rho / ρ','Utilización = pedidos / capacidad. 0,50 significa 50 %; 1 significa 100 % y saturación.']]],
 ['Espera y latencia',[
 ['t','Utilización acotada a un máximo de 0,97, utilizada para calcular la espera sin dividir entre cero.'],
 ['q','Multiplicador de espera: crece al acercarse la demanda a la capacidad. No es la cantidad de pedidos en una cola.'],
 ['P / penalty','Penalización de latencia por saturación (ms). Es cero si rho es menor que 1.'],
 ['base','Latencia propia de la arquitectura antes de agregar red, procesamiento y espera (ms).'],
 ['factorRed / net','Factor que multiplica el tiempo de red; representa la sobrecarga de comunicación.'],
 ['L / latency','Tiempo de respuesta estimado (ms), mostrado como p95 heurístico; no es un percentil medido.']]],
 ['Disponibilidad y costo',[
 ['A / availability','Porcentaje estimado de tiempo que el sistema permanece disponible.'],
 ['A0 / baseAvailability','Disponibilidad inicial asignada a cada arquitectura (%).'],
 ['penalizacionDisponibilidad / availabilityPenalty','Factor que reduce la disponibilidad cuando rho supera 0,75.'],
 ['C / cost','Costo mensual ficticio estimado (USD/mes).'],
 ['factorCosto / coreCost','Factor de costo de CPU de cada arquitectura.'],
 ['fijo / fixed','Costo fijo mensual ficticio de la arquitectura (USD/mes).']]],
 ['Puntuación y selección',[
 ['nL, nC, nA, nCap','Indicadores normalizados de latencia, costo, disponibilidad y capacidad, respectivamente. Permiten combinar unidades distintas.'],
 ['wL, wC, wA, wCap','Pesos de importancia de esos cuatro indicadores. Cambian con la prioridad elegida y suman 1.'],
 ['Puntaje / S','Suma de cada indicador normalizado multiplicado por su peso. Gana el mayor puntaje entre las alternativas viables.'],
 ['Límite de latencia, presupuesto y disponibilidad mínima','Requisitos obligatorios configurados por el usuario. También se exige rho menor que 1. Una opción descartada no puede ganar por puntaje.']]],
 ['Constantes y símbolos',[
 ['60 y 1000','60 convierte segundos en minutos en la capacidad; 1000 convierte segundos en milisegundos en la latencia.'],
 ['0,46 y 0,00013','Supuestos de demanda base de CPU y demanda adicional por usuario simultáneo.'],
 ['0,45; 350; 1,45','Regulan el escalamiento modelado de microservicios y su máximo.'],
 ['0,97 y 0,18','Límite de rho para la espera y factor de intensidad de esa espera.'],
 ['2500 y 600','Factores didácticos de la penalización de latencia cuando hay saturación (ms).'],
 ['95','Latencia adicional de IA multiplicada por su fracción a (ms).'],
 ['90; 99,99; 0,75','Piso y techo de disponibilidad (%) y utilización desde la cual empieza su penalización.'],
 ['30; 0,012; 43,2','Factores del costo: CPU mensual, demanda y minutos de 30 días divididos entre 1000 (43,2). Son costos ficticios.'],
 ['500; 100; 90; 10; 400','Referencias fijas para normalizar latencia, costo, disponibilidad y capacidad.'],
 ['min(x,y) y max(x,y)','Eligen el menor o el mayor de los dos valores.'],
 ['* o ×; /; <=; >=','Multiplicar; dividir; menor o igual; mayor o igual.']]]
 ];
 function guide(){const section=document.createElement('section');section.className='formula-guide';section.setAttribute('aria-label','Significado de las variables y unidades');section.innerHTML='<h3>¿Qué significa cada variable?</h3><p>Para explicar: las entradas determinan la capacidad y la espera; después se calculan latencia, disponibilidad y costo. Se revisan los límites y se puntúan las opciones viables.</p>'+groups.map(([title,rows],i)=>`<details${i===0?' open':''}><summary>${title}</summary><dl>${rows.map(([symbol,meaning])=>`<div><dt>${symbol}</dt><dd>${meaning}</dd></div>`).join('')}</dl></details>`).join('')+'<p class="tiny">Los coeficientes son supuestos didácticos del modelo. Esta guía explica las fórmulas implementadas; no modifica sus valores.</p>';return section;}
 function attach(){for(const id of ['modelReference','traceContent']){const host=document.getElementById(id);if(host&&!host.querySelector('.formula-guide'))host.prepend(guide());}}
 document.addEventListener('menushield:computed',attach);attach();
})();
