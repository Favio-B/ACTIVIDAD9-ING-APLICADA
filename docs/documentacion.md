# MenuShield · Actividad 9 de Ingeniería Aplicada

Universidad Libre · 2026-2. Revisión funcional: 26 de octubre de 2026.

## Objetivo y alcance

Relacionar entradas, reglas explícitas, indicadores y recomendación de arquitectura para pedidos por WhatsApp, IA y panel de cocina. Las salidas son **estimaciones didácticas**, no mediciones de una aplicación ni predicciones garantizadas. Se conserva el motor del commit `6e1c268`: no se ajustaron coeficientes para favorecer una arquitectura.

Sitio: https://favio-b.github.io/ACTIVIDAD9-ING-APLICADA/
Repositorio: https://github.com/Favio-B/ACTIVIDAD9-ING-APLICADA

## Uso y jerarquía

1. Abre el sitio o `index.html` con sus archivos locales.
2. Describe proyecto, necesidad y roles: Cliente, Cocina y Administrador. Estos campos solo dan contexto y aparecen en el CSV; **no alteran las fórmulas**.
3. Selecciona prioridad, límites y escenario; modifica las cinco variables si corresponde.
4. Pulsa **Simular escenario**: calcula primero y dirige el foco a la recomendación. Compara indicadores y motivos de descarte.
5. Abre **Cómo se obtuvo esta recomendación** para ver entradas reales, sustituciones, intermedios, comprobaciones, normalización, pesos y contribuciones.
6. Usa el 3D como exploración visual independiente. Seleccionar otra arquitectura no cambia la recomendación ni su puntaje.
7. Al modificar un control aparece **Cambios pendientes de simular**. Las cifras visibles quedan identificadas como la última ejecución; no representan los controles nuevos.
8. **Exportar CSV** valida y recalcula primero. Nunca combina métricas anteriores con límites nuevos. Si una entrada es inválida, explica el error y no descarga archivo.
9. Ejecuta pruebas desde la página o los comandos descritos abajo. Restablecer recupera nombre, roles, escenario, límites, prioridad y resultados originales.

En escritorio hay controles a la izquierda y resultados a la derecha. En móvil se apilan; la introducción es breve y la navegación lleva directamente a Recomendación, Comparación, Modelo y Pruebas. El 3D viene después de recomendación, comparación y trazabilidad. El cálculo y la exportación siguen funcionando si el archivo 3D no carga o el canvas no está disponible.

## Variables, límites y unidades

| Campo | Rango | Unidad | Intervención y efecto esperado |
|---|---:|---|---|
| Pedidos (`rpm`, λ) | 1–1000 | pedidos/min | Demanda; aumenta utilización, espera y costo; modifica escalamiento micro. |
| Usuarios (`concurrency`) | 1–2000 | usuarios simultáneos | Sobrecarga de CPU por pedido, no tasa de llegada independiente. |
| CPU (`cores`) | 1–32 | vCPU | Aumenta capacidad y costo; reduce tiempo CPU por pedido. |
| IA (`ai`) | 0–100 | % de pedidos | Aumenta demanda de CPU y componente fijo de latencia IA. 0 es válido. |
| Red (`network`) | 1–300 | ms | Aumenta latencia según el factor de comunicación de cada alternativa. |
| Latencia máxima | 50–30000 | ms | Restricción obligatoria `L <= máximo`. |
| Presupuesto | 1–100000 | USD/mes | Restricción obligatoria `C <= presupuesto`. |
| Disponibilidad mínima | 90–99.999 | % | Restricción obligatoria `A >= mínimo`. Pedir 99.999 puede dejar cero viables porque el modelo acota A a 99.99. |
| Prioridad | equilibrio, latencia, costo, disponibilidad | categoría | Selecciona pesos del puntaje; no cambia las estimaciones físicas. |

Los controles de carga usan pasos enteros y los límites respetan los intervalos mostrados. El motor acepta números finitos dentro de rango; los pasos del control no son una restricción matemática adicional. Vacíos, NaN, infinitos o valores fuera de rango se rechazan antes de ejecutar y exportar.

## Arquitecturas y coeficientes

- **Monolítica:** un despliegue, baja sobrecarga y operación sencilla; dominios acoplados y escalamiento vertical.
- **Monolito modular:** un despliegue con límites internos de dominio; mejor separación lógica, recursos compartidos.
- **Microservicios:** servicios y despliegues independientes; escalamiento selectivo modelado a cambio de costo, red y complejidad.

| Parámetro | Monolítica | Modular | Microservicios |
|---|---:|---:|---:|
| `base` (ms) | 75 | 90 | 145 |
| `net` (factor de red) | 1 | 1.16 | 2.1 |
| `eff` (eficiencia) | 0.82 | 0.78 | 0.69 |
| `coreCost` (factor CPU) | 1 | 1.08 | 1.5 |
| `fixed` (USD/mes) | 10 | 17 | 55 |
| `capacityFactor` (selector histórico) | 1 | 1.08 | 1.45 |
| `aiPenalty` | 0.48 | 0.46 | 0.43 |
| `baseAvailability` (A0, %) | 99.40 | 99.65 | 99.85 |
| `availabilityPenalty` | 8 | 7 | 4 |

**Todos los coeficientes son hipótesis arbitrarias del ejercicio. No se extrajeron de los artículos citados.** El motor y la referencia de coeficientes de la página comparten el objeto `archs`.

## Ecuaciones completas y exactas

Sea λ = pedidos/min, u = usuarios simultáneos, c = vCPU, a = IA/100 y N = latencia de red en ms.

```text
a = ai / 100
d = (0.46 + min(u,2000)*0.00013)*(1 + a*aiPenalty)
```

`d` se expresa en segundos CPU/pedido. El tope 2000 coincide con el máximo validado de usuarios.

```text
s = 1                                      para Monolítica
s = 1.08                                   para Modular
s = min(1.45, 1 + 0.45*λ/350)              para Microservicios
cap = 60*c*eff/d*s                         pedidos/min
rho = λ/cap                               fracción de utilización
```

`capacityFactor` identifica históricamente la rama de escalamiento: si es 1 se usa s=1; si el id es modular se usa 1.08; en la otra rama se aplica el escalamiento micro. El factor micro alcanza 1.45 desde 350 ped/min. No hay creación real de instancias ni autoscaling.

```text
t = min(rho,0.97)
q = 1 + t/(1-t)*0.18
P = (rho-1)*2500+600 si rho >= 1; de lo contrario P = 0
L = base + net*N + d*1000/c*q + a*95 + P
A = max(90,min(99.99,A0 - max(0,rho-0.75)*availabilityPenalty))
C = 30*c*coreCost + fixed + 0.012*λ*43.2
```

L y P están en ms; A en %; C en USD/mes; q no tiene unidad. **Los dos usos de rho en la espera utilizan el mismo valor acotado t**, tanto numerador como denominador. Al saturarse hay una penalización adicional con salto de 600 ms en rho=1; el modelo no representa una cola estable real en saturación. La utilización no se recorta al 100 % en las salidas. La disponibilidad se acota a [90,99.99]. El costo usa 43.2 = (30*24*60)/1000 y es una función comparativa ficticia.

## Restricciones, normalización y decisión

Se excluye cualquier arquitectura si falla al menos una condición:

```text
L <= maxLatency
C <= budget
A >= minAvailability
rho < 1
```

Para cada alternativa se muestran los cuatro valores, operadores, límites y resultados de comprobación. Solo las alternativas viables compiten por puntuación:

```text
nL   = 1/(1+L/500)
nC   = 1/(1+C/100)
nA   = max(0,(A-90)/10)
nCap = min(1,cap/(cap+400))
S = wL*nL + wC*nC + wA*nA + wCap*nCap
```

Las referencias son fijas: 500 ms, USD 100, intervalo 90–100 % y 400 ped/min. No se normaliza respecto al mínimo/máximo de las tres alternativas. El parámetro histórico `all` de `normalizedScore` se conserva por compatibilidad y no participa en la fórmula. El componente de capacidad favorece capacidad absoluta; no es una medición de margen real de concurrencia. Los cuatro componentes se muestran con seis decimales y se calculan con precisión completa antes de formatear.

| Prioridad | Latencia | Costo | Disponibilidad | Capacidad |
|---|---:|---:|---:|---:|
| Equilibrio | 0.32 | 0.30 | 0.20 | 0.18 |
| Menor latencia | 0.55 | 0.16 | 0.17 | 0.12 |
| Menor costo | 0.15 | 0.60 | 0.15 | 0.10 |
| Mayor disponibilidad | 0.16 | 0.14 | 0.55 | 0.15 |

Los pesos suman 1. Se elige máximo S entre viables. En empate exacto se conserva el orden original: Monolítica, Modular, Microservicios. Si no hay viables, la salida es explícitamente **ninguna alternativa viable**: no se elige la de menor incumplimiento ni se cambian restricciones silenciosamente. Los puntajes de descartadas son informativos y no participan en la selección.

## Escenarios y comparación

| Escenario | Pedidos/min | Usuarios | vCPU | IA % | Red ms |
|---|---:|---:|---:|---:|---:|
| Referencia | 20 | 40 | 2 | 60 | 45 |
| Hora pico | 170 | 300 | 4 | 70 | 85 |
| Crecimiento | 430 | 900 | 8 | 85 | 95 |
| Personalizado | Valores configurados | Valores configurados | Valores configurados | Valores configurados | Valores configurados |

Límites iniciales: 1200 ms, USD 200/mes, disponibilidad mínima 99 %, prioridad equilibrio. Un cambio de escenario actualiza los cinco controles y marca pendiente; no modifica presupuesto ni otros límites. Cada ejecución compara las tres arquitecturas con idénticas entradas. Entre escenarios cambian varios factores: una diferencia no aísla causalidad. Para sensibilidad causal del modelo, cambia una sola entrada conservando las demás.

## Coherencia de estado y trazabilidad

`model.js:execute` valida y crea una copia recursivamente inmutable con entradas, límites, prioridad, contexto, resultados intermedios y finales, comprobaciones, puntajes y ganadora. `app.js:simulate` es la única entrada de cálculo de la interfaz. Tabla, gráfico, explicación, historial, animación y CSV consumen ese objeto. `estimate`, `feasible`, `normalizedScore` y `decide` conservan las reglas anteriores.

- Editar controles marca pendiente y detiene la animación; no cambia la ejecución ya calculada.
- Redimensionar o cambiar el indicador del gráfico redibuja la misma ejecución; no lee límites nuevos para decidir.
- Exportar recalcula y valida primero; las tres filas incluyen id, fecha, entradas, restricciones, prioridad, indicadores, puntaje, selección y motivos de descarte.
- Descriptivos que empiecen con caracteres de fórmula se protegen al exportar CSV; los textos de usuario se escapan en HTML.
- El selector del 3D es exploración visual. Se sincroniza inicialmente con la ganadora, si existe, y después permite explorar sin cambiar resultados.
- Cambiar velocidad o cámara no recalcula. Repetir vuelve a validar/calcular los controles actuales antes del nuevo recorrido.
- El recorrido dura 10 s a velocidad 1× por fines didácticos; no representa la latencia ni volumen real. Con movimiento reducido empieza pausado.

## Validación y evidencia

[Tabla de pruebas ejecutadas](pruebas.md), [salidas del modelo](model-tests.json), [salidas de navegador](browser-tests.json). Las pruebas y sus entradas, valores esperados y valores obtenidos están en archivos versionados. En la página se conservan las ocho pruebas iniciales y se añaden dieciséis, con detalles desplegables.

```sh
npm ci
npm run build:css
npm test
npm run test:browser
```

`npm test` requiere Git y el commit histórico `6e1c268` para cotejar que el motor no cambió. El navegador utiliza Edge instalado en Windows; en Linux/macOS puede instalarse Chromium con `npx playwright install chromium`. Para comprobar el sitio: definir `MENUSHIELD_URL=https://favio-b.github.io/ACTIVIDAD9-ING-APLICADA/` y ejecutar `npm run test:browser`. Capturas y reportes de publicación se guardan en `artifacts/`, excluido de Git.

## Matriz de los 12 requisitos

| # | Requisito | Estado | Evidencia concreta |
|---|---|---|---|
| 1 | Configuración del proyecto | Cumplido | Nombre, necesidad y roles descriptivos; cinco entradas, prioridad y restricciones calculables. `index.html`, `app.js:metadata/validateControls`. |
| 2 | Tres alternativas | Cumplido | Monolítica, modular y microservicios, documentadas y evaluadas sobre la misma copia de entradas. `model.js:archs/execute`. |
| 3 | Variables relevantes | Cumplido | Cinco controles con unidades, rangos y efectos; `model.js:ranges`, ayuda desplegable y sección Variables. |
| 4 | Modelo matemático completo | Cumplido | Fórmulas, coeficientes, espera acotada, saturación, escalamiento, límites, normalización y pesos. `model.js` y trazabilidad en `app.js`. |
| 5 | Escenarios | Cumplido | Referencia, hora pico, crecimiento y personalizado. `model.js:scenarios` y selector. |
| 6 | Indicadores | Cumplido | Latencia, capacidad, utilización, disponibilidad y costo, con unidades en resumen, tabla, gráfico y CSV. |
| 7 | Comparación equivalente | Cumplido | Misma entrada en cada ejecución; gráfico seleccionable de cinco indicadores; advertencia de cambios múltiples entre escenarios. |
| 8 | Recomendación verificable | Cumplido | Cuatro filtros obligatorios, después puntaje; motivos cuantificados de descarte y declaración explícita si no hay viable. |
| 9 | Interfaz accesible y adaptable | Cumplido con alcance declarado | Playwright: 360, 390, 768, 1280 px; teclado, etiquetas, estados, movimiento reducido; inspección visual de capturas. No se certifica auditoría WCAG ni lector de pantalla real. |
| 10 | Validación y pruebas | Cumplido | 24 pruebas de modelo (incluyen las 8 originales), 21 de navegador; regresión contra 300 estimaciones y 400 decisiones del commit anterior. `docs/pruebas.md`. |
| 11 | Documentación y sitio | Cumplido en contenido | README, modelo completo, matriz y evidencia reproducible; sitio público enlazado. Verificación de esta publicación en `docs/publicacion.md` una vez desplegada. |
| 12 | Sustentación | Cumplido | Guion para modificar una variable, historial de cinco ejecuciones, datos sustituidos, CSV y resultados visibles antes del 3D. |

## Sustentación reproducible

1. Restablece: Monolítica, latencia aproximada 484.066830 ms y capacidad 164.225098 ped/min.
2. Cambia solo pedidos/min de 20 a 70: aparece pendiente; simula y muestra latencia 516.650514 ms. Usa historial y trazabilidad para conectar rho y q con el cambio.
3. Restablece; duplica solo CPU de 2 a 4: capacidad 328.450196 ped/min. Explica que el costo también crece.
4. Hora pico con USD 200: ninguna viable. Identifica cada límite incumplido. Con USD 350 y equilibrio: Monolítica.
5. Crecimiento, USD 650, disponibilidad mínima 99 y latencia máxima 1200: Microservicios. Muestra comparación, restricciones y puntajes.
6. Cambia prioridad y verifica pesos y contribuciones. Cambiar prioridad no tiene por qué cambiar siempre la ganadora.

Estos números son comprobaciones del cálculo, nunca salidas fijas de la interfaz.

## Limitaciones y validación real

No hay backend, llamadas a WhatsApp/Meta, Gemini o Sheets, almacenamiento de pedidos ni despliegue real de las arquitecturas. Los roles son descriptivos, no autenticación. No se simulan cuotas de API, memoria, tasas de fallo correlacionadas, almacenamiento, traffic bursts, circuit breakers ni costos reales. p95 no proviene de una distribución observada; disponibilidad no es SLA; normalizaciones y pesos son elecciones del ejercicio. El 3D ilustra un pedido y no constituye carga o telemetría. La revisión de accesibilidad cubre controles etiquetados, teclado, estados y movimiento reducido; no se realizó prueba con lector de pantalla real ni certificación WCAG.

Para validar conclusiones: implementar prototipos equivalentes, mantener infraestructura y entradas iguales, generar carga con JMeter o k6, medir percentiles empíricos p50/p95/p99, throughput, colas, errores, CPU/memoria/red, latencias de IA/API, fallos y recuperación, disponibilidad observada y facturación. Repetir mediciones, reportar variabilidad y calibrar coeficientes con datos separados de validación. Con esos datos se puede contrastar el modelo sin prometer validez externa por los resultados actuales.

## Bibliografía conceptual suministrada

- Tapia, F., et al. (2020). *From Monolithic Systems to Microservices: A Comparative Study of Performance*. Applied Sciences, 10, 5797. DOI: 10.3390/app10175797.
- Blinowski, G., Ojdowska, A., & Przybylek, A. (2022). *Monolithic vs. Microservice Architecture: A Performance and Scalability Evaluation*. IEEE Access. DOI: 10.1109/ACCESS.2022.3152803.
- Al-Debagy, O., & Martinek, P. (2018). *A Comparative Review of Microservices and Monolithic Architectures*. CINTI 2018.
- Sunardi, A., & Suharjito (2019). *MVC Architecture: A Comparative Study Between Laravel Framework and Slim Framework in Freelancer Project Monitoring System Web Based*. Procedia Computer Science 157, 134-141. DOI: 10.1016/j.procs.2019.08.150.

Las referencias se conservan como bibliografía conceptual suministrada; esta revisión no atribuye ni valida coeficientes numéricos a partir de ellas.
