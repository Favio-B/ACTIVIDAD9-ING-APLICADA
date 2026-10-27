# Evidencia de pruebas · MenuShield

Fecha: 26 de octubre de 2026. Ejecución local real en Node y Edge headless mediante Playwright. Los JSON conservan precisión completa y entradas; esta tabla resume su salida.

## Modelo: 24/24 aprobadas

Comando: `npm test`. Motor histórico: commit `6e1c268`; 100 vectores deterministas, 300 estimaciones (cinco indicadores por arquitectura) y 400 decisiones bajo cuatro prioridades: **coincidencia exacta**. No se cambiaron coeficientes ni se fijaron resultados en la interfaz.

| # | Prueba e inputs | Esperado | Obtenido | Estado |
|---|---|---|---|---|
| 1 | Entradas inválidas rechazadas; `{"rpm": 20, "concurrency": 40, "cores": 0, "ai": 60, "network": 45}` | `false` | `false` | APROBADA |
| 2 | Carga mayor aumenta utilización; `{"base": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "rpm": 70}` | `true` | `true` | APROBADA |
| 3 | Más CPU incrementa capacidad; `{"base": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "cores": 4}` | `true` | `true` | APROBADA |
| 4 | Sobrecarga incrementa latencia; `{"base": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "rpm": 900}` | `true` | `true` | APROBADA |
| 5 | Presupuesto restrictivo descarta opciones; `{"b": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "budget": 1}` | `true` | `true` | APROBADA |
| 6 | Resultados finitos en escenarios oficiales; `{"base": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "peak": {"rpm": 170, "concurrency": 300, "cores": 4, "ai": 70, "network": 85}, "growth": {"rpm": 430, "concurrency": 900, "cores": 8, "ai": 85, "network": 95}}` | `true` | `true` | APROBADA |
| 7 | Disponibilidad dentro del rango; `{"base": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "peak": {"rpm": 170, "concurrency": 300, "cores": 4, "ai": 70, "network": 85}, "growth": {"rpm": 430, "concurrency": 900, "cores": 8, "ai": 85, "network": 95}}` | `true` | `true` | APROBADA |
| 8 | Decisión sin opciones válidas explica fallo; `{"budget": 1, "maxLatency": 50, "minAvailability": 99.999}` | `null` | `null` | APROBADA |
| 9 | Referencia recomienda Monolítica; `{"b": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "l": {"maxLatency": 1200, "budget": 200, "minAvailability": 99}}` | `"mono"` | `"mono"` | APROBADA |
| 10 | Latencia de referencia; `{"b": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}}` | `484.07` | `484.06683049501834` | APROBADA |
| 11 | Cambiar solo pedidos/min a 70; `{"rpm": 70, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}` | `516.65` | `516.6505135501318` | APROBADA |
| 12 | Capacidad con 2 CPU; `{"b": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}}` | `164.23` | `164.22509786747702` | APROBADA |
| 13 | Capacidad con 4 CPU; `{"rpm": 20, "concurrency": 40, "cores": 4, "ai": 60, "network": 45}` | `328.45` | `328.45019573495404` | APROBADA |
| 14 | Hora pico: presupuesto 200; `{"rpm": 170, "concurrency": 300, "cores": 4, "ai": 70, "network": 85, "maxLatency": 1200, "budget": 200, "minAvailability": 99}` | `null` | `null` | APROBADA |
| 15 | Hora pico: presupuesto 350; `{"rpm": 170, "concurrency": 300, "cores": 4, "ai": 70, "network": 85, "budget": 350}` | `"mono"` | `"mono"` | APROBADA |
| 16 | Crecimiento: presupuesto 650; `{"rpm": 430, "concurrency": 900, "cores": 8, "ai": 85, "network": 95, "maxLatency": 1200, "budget": 650, "minAvailability": 99}` | `"micro"` | `"micro"` | APROBADA |
| 17 | Prioridad usa sus pesos; `{"priorities": {"balance": {"label": "Equilibrio general", "weights": [0.32, 0.3, 0.2, 0.18]}, "speed": {"label": "Menor latencia", "weights": [0.55, 0.16, 0.17, 0.12]}, "cost": {"label": "Menor costo", "weights": [0.15, 0.6, 0.15, 0.1]}, "availability": {"label": "Mayor disponibilidad", "weights": [0.16, 0.14, 0.55, 0.15]}}}` | `true` | `true` | APROBADA |
| 18 | Saturación aplica penalización; `{"rpm": 1000, "concurrency": 40, "cores": 1, "ai": 60, "network": 45}` | `true` | `true` | APROBADA |
| 19 | Espera acota ambos usos de rho a 0.97; `{"rpm": 1000, "concurrency": 40, "cores": 1, "ai": 60, "network": 45}` | `6.82` | `6.819999999999995` | APROBADA |
| 20 | Entradas no finitas y límites inválidos; `{"ai": "NaN", "budget": 0}` | `true` | `true` | APROBADA |
| 21 | Escalamiento micro limitado a 1.45; `{"rpm": 1000}` | `1.45` | `1.45` | APROBADA |
| 22 | Ejecución conserva copia inmutable; `{"b": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "l": {"maxLatency": 1200, "budget": 200, "minAvailability": 99}}` | `true` | `true` | APROBADA |
| 23 | Puntaje y decisión comparten resultados; `{"b": {"rpm": 20, "concurrency": 40, "cores": 2, "ai": 60, "network": 45}, "l": {"maxLatency": 1200, "budget": 200, "minAvailability": 99}}` | `true` | `true` | APROBADA |
| 24 | Cero IA y límites extremos son válidos; `{"rpm": 20, "concurrency": 40, "cores": 2, "ai": 0, "network": 45}` | `true` | `true` | APROBADA |

Tolerancia de las referencias numéricas: 0,02. Las comparaciones contra el motor anterior usan igualdad exacta. [JSON completo](model-tests.json).

## Navegador: 23/23 comprobaciones aprobadas

Comando: `npm run test:browser`. Reporte local completo en [browser-tests.json](browser-tests.json). Se verifican ocho secciones independientes, conservación de estado, selector móvil, controles numéricos y ausencia de errores. Capturas en `artifacts/`.

| Comprobación | Entrada o acción | Esperado | Obtenido | Estado |
|---|---|---|---|---|
| Referencia y jerarquía | `{}` | Monolítica; recomendación antes de 3D | `{"winner": "Monolítica", "latency": 484.06683049501834}` | APROBADA |
| Cambios pendientes y resize coherente | `{"budget": 1}` | Aviso; ejecución anterior intacta | `{"pending": true, "budgetOfDisplayedExecution": 200}` | APROBADA |
| CSV recalcula entradas y límites | `{"rpm": 70, "budget": 1}` | Tres filas coherentes, ninguna viable | `{"rows": 3, "rpm": 70, "budget": 1, "winner": null}` | APROBADA |
| Entradas inválidas bloquean exportación | `{"budget": ""}` | Sin archivo; error accesible | `{"downloads": 0, "invalid": true}` | APROBADA |
| Restablecer | `{}` | Referencia original y resultados actuales | `{"winner": "Monolítica", "budget": 200}` | APROBADA |
| Sensibilidad de una variable | `{"rpm": 70}` | 516.65 ms; demás entradas iguales | `516.6505135501318` | APROBADA |
| Duplicar CPU | `{"cores": 4}` | 328.45 ped/min | `328.45019573495404` | APROBADA |
| Hora pico presupuesto 200 | `{"scenario": "peak", "budget": 200}` | Ninguna viable y motivos | `[{"name": "Monolítica", "failures": ["cost"]}, {"name": "Monolito modular", "failures": ["cost"]}, {"name": "Microservicios", "failures": ["cost"]}]` | APROBADA |
| Hora pico presupuesto 350 | `{"budget": 350}` | Monolítica | `"Monolítica"` | APROBADA |
| Crecimiento presupuesto 650 | `{"scenario": "growth", "budget": 650}` | Microservicios | `"Microservicios"` | APROBADA |
| Saturación explícita | `{"rpm": 1000, "cores": 1}` | Descarta por utilización | `[{"rho": 16.51252032520325, "penalty": 39381.30081300813}, {"rho": 15.879372427983535, "penalty": 37798.43106995884}, {"rho": 13.124995835415623, "penalty": 30912.489588539058}]` | APROBADA |
| Prioridades usan sus ponderaciones | `{}` | Cuatro conjuntos de pesos reales | `[{"priority": "balance", "weights": [0.32, 0.3, 0.2, 0.18], "score": 0.5693085598331846}, {"priority": "speed", "weights": [0.55, 0.16, 0.17, 0.12], "score": 0.5628876666102465}, {"priority": "cost", "weights": [0.15, 0.6, 0.15, 0.1], "score": 0.5789738867373087}, {"priority": "availability", "weights": [0.16, 0.14, 0.55, 0.15], "score": 0.7195738443385999}]` | APROBADA |
| 3D no altera decisión; pausa y pasos | `{}` | Misma ejecución al explorar | `{"sameExecution": true, "complete": true}` | APROBADA |
| Cálculo visible y foco en recomendación | `{}` | Valores, pesos, restricciones y foco | `{"trace": true, "focus": "decisionTitle"}` | APROBADA |
| Navegación, etiquetas y estados accesibles | `{}` | Enlaces y nombres disponibles por teclado | `{"links": 4, "labels": true, "states": true}` | APROBADA |
| Matriz adaptable | `{"widths": [360, 390, 768, 1280]}` | Sin desbordamiento; captura por ancho | `[{"viewport": 360, "content": 360, "columns": "332px"}, {"viewport": 390, "content": 390, "columns": "362px"}, {"viewport": 768, "content": 768, "columns": "185px 519px"}, {"viewport": 1280, "content": 1280, "columns": "220px 988px"}]` | APROBADA |
| Pruebas visibles conservadas y ampliadas | `{}` | 24/24 aprobadas | `"24 / 24 pruebas aprobadas"` | APROBADA |
| Gráficos usan el último resultado | `{}` | Cinco indicadores; sin recalcular decisión | `{"indicators": 5, "sameExecution": true}` | APROBADA |
| Motor funciona sin archivo 3D | `{}` | Recomendación y CSV sin animación | `{"recommendation": true, "csv": true}` | APROBADA |
| Canvas 3D no disponible | `{}` | Mensaje alternativo y cálculo válido | `{"fallback": true, "winner": "mono"}` | APROBADA |
| Menú muestra una sola sección y conserva datos | `{}` | Ocho vistas, misma ejecución y controles | `{"views": ["configuration", "results", "comparison", "calculation", "visual", "model", "tests", "presentation"], "sameExecution": true}` | APROBADA |
| Selector móvil y botón global | `{"width": 360}` | Cambios de sección sin desplazamiento largo | `{"visibleSections": 1, "resultHeight": 1690}` | APROBADA |
| Consola y recursos normales | `{}` | Cero errores | `{"runtime": 0, "console": 0, "resources": 0}` | APROBADA |

## Fallos reproducidos antes de corregir

Con Referencia ya calculada, cambiar presupuesto de 200 a 1 conservaba el texto «Arquitectura recomendada: Monolítica», sin aviso. `current[0].cost` era 80.368 mientras `limits().budget` era 1 y `feasible(current[0],limits())` era false. La exportación usaba esa mezcla y el redimensionamiento recalculaba la ganadora con límites nuevos.

La solución guarda una ejecución inmutable, marca pendiente al editar, redibuja esa misma ejecución y recalcula/valida antes de exportar. Las pruebas de CSV comprueban exactamente las cifras de las tres filas contra los resultados del motor y los límites de la misma ejecución. Entradas inválidas producen cero descargas.

## Alcance de accesibilidad y límites de la evidencia

Se ejecutaron navegación por teclado, nombres de controles, estados con texto y `role=status`, foco en recomendación, preferencia de movimiento reducido y revisión visual de capturas. No se ejecutó un lector de pantalla real, una certificación WCAG ni pruebas físicas en teléfonos. El fallo del archivo 3D y la falta de canvas se inyectan intencionalmente; la revisión de consola sin errores corresponde a la carga normal.

Las pruebas no son benchmarks del sistema real. No se midieron latencias de WhatsApp/Gemini ni infraestructura cloud. [Estado de la publicación y prueba del sitio](publicacion.md).

## Verificación final del sitio público

La misma suite pasó **21/21** contra GitHub Pages; cero errores de consola, ejecución y recursos. Se verificaron por hash los nueve archivos de la versión funcional. Ver [publicación](publicacion.md), [reporte público completo](published-tests.json) y [hashes de despliegue](deployment.json). Los 12 requisitos funcionales quedan cubiertos con los límites de alcance declarados.
