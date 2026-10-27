# MenuShield — Actividad 9: Simulador de arquitecturas

**Ingeniería Aplicada · Universidad Libre · Período 2026-2**

## Objetivo
Evaluar tres arquitecturas de implementación funcionalmente equivalentes para MenuShield, un sistema de pedidos por WhatsApp con integración de IA, menú y panel de cocina. Los resultados son exclusivamente **estimaciones de un modelo didáctico**, no resultados empíricos.

## Uso
1. Abrir `index.html` en Chrome, Edge o Firefox (no requiere servidor).
2. Registrar el nombre del proyecto, la prioridad de calidad y los límites obligatorios.
3. Elegir Referencia, Hora pico o Crecimiento; ajustar pedidos/min, usuarios simultáneos, vCPU, proporción de pedidos con IA y latencia de red.
4. Pulsar **Simular escenario** y contrastar las tres alternativas.
5. Analizar restricciones, indicadores, gráfico y recomendación explicada.
6. Pulsar **Ejecutar 8 pruebas**; exportar resultados en CSV si se desea.

## Arquitecturas
- **Monolítica:** un proceso/despliegue para todos los módulos.
- **Monolito modular:** un único despliegue con límites internos bien definidos.
- **Microservicios:** servicios independientes conectados por interfaces de red.

## Variables y relación con la calidad
- **Pedidos/minuto (λ):** demanda; eleva utilización y saturación.
- **Usuarios simultáneos:** complejidad/sobrecarga aproximada por demanda concurrente.
- **vCPU:** capacidad de procesamiento asignada.
- **Porcentaje de pedidos con IA:** incrementa tiempo computacional estimado.
- **Latencia de red:** overhead de comunicación, especialmente de microservicios.

## Indicadores y fórmulas
Los siguientes coeficientes son supuestos arbitrarios, editables en el arreglo `archs` del código JavaScript. **No son cifras de los artículos.**
- Demanda por pedido `d = (0.46 + concurrency × 0.00013) × (1 + fractionAI × aiPenalty)`.
- Capacidad `μ = 60 × vCPU × efficiency / d × scaling`, pedidos/minuto.
- Utilización `ρ = λ/μ`.
- Cola heurística `q = 1 + min(ρ,0.97)/(1-min(ρ,0.97)) × 0.18`.
- Latencia p95 aproximada `L = base + networkFactor × latencyNetwork + d × 1000/vCPU × q + fractionAI × 95 + penalty(ρ≥1)`.
- Disponibilidad `A = clamp(A0 − max(0,ρ−0.75) × penaltyAvailability,90,99.99)`.
- Costo `C = 30 × vCPU × coreCost + fixed + 0.012 × λ × 43.2` USD/mes.

Las unidades de `μ` y `λ` son pedidos/min; `d` es segundos CPU/pedido; `L` milisegundos; `C` USD/mes. El indicador denominado p95 es una **aproximación heurística** y no constituye un percentil estadístico medido. Los factores y sobrecargas modelan decisiones de diseño, pero no permiten anticipar de forma confiable el desempeño real.

## Escenarios
| Escenario | Pedidos/min | Usuarios | vCPU | % IA | Latencia red |
|---|---:|---:|---:|---:|---:|
| Referencia | 20 | 40 | 2 | 60 | 45 ms |
| Hora pico | 170 | 300 | 4 | 70 | 85 ms |
| Crecimiento | 430 | 900 | 8 | 85 | 95 ms |

## Criterios de decisión
Restricciones: `latencia ≤ máximo`, `costo ≤ presupuesto`, `disponibilidad ≥ mínimo` y `utilización < 100%`. Si ninguna arquitectura cumple, se informa que **no hay solución viable**. Para alternativas viables, se calcula puntuación ponderada de cuatro dimensiones normalizadas: menor latencia, menor costo, mayor disponibilidad, margen de capacidad. Las ponderaciones cambian al seleccionar equilibrio, velocidad, costo o disponibilidad.

## Pruebas automáticas
1. Rechazo de vCPU fuera de rango.
2. Mayor carga eleva utilización.
3. Más vCPU eleva capacidad.
4. Saturación eleva latencia.
5. Presupuesto insuficiente descarta alternativas.
6. Resultados numéricos finitos en los tres escenarios.
7. Disponibilidad dentro del rango declarado.
8. Escenario sin alternativas válidas devuelve recomendación negativa.

## Supuestos y limitaciones
No se realizan llamadas a Gemini, WhatsApp, Google Sheets ni al sistema real. No se modelan cuotas, costos medidos, almacenamiento persistente, tráfico irregular, memoria, circuit breakers, latencias externas reales o fallas correlacionadas. La división de microservicios es conceptual; el archivo simula las consecuencias asumidas, sin desplegar las arquitecturas. Para validación externa: implementar sistemas funcionalmente equivalentes, utilizar pruebas de carga JMeter/k6 bajo el mismo hardware y comparar percentiles empíricos, tasa de errores, CPU, memoria, disponibilidad observada y facturación cloud.

## Bibliografía suministrada
- Tapia, F., et al. (2020). *From Monolithic Systems to Microservices: A Comparative Study of Performance*. Applied Sciences, 10, 5797. DOI: 10.3390/app10175797.
- Blinowski, G., Ojdowska, A., & Przybyłek, A. (2022). *Monolithic vs. Microservice Architecture: A Performance and Scalability Evaluation*. IEEE Access. DOI: 10.1109/ACCESS.2022.3152803.
- Al-Debagy, O., & Martinek, P. (2018). *A Comparative Review of Microservices and Monolithic Architectures*. CINTI 2018.
- Sunardi, A., & Suharjito (2019). *MVC Architecture: A Comparative Study Between Laravel Framework and Slim Framework in Freelancer Project Monitoring System Web Based*. Procedia Computer Science 157, 134–141. DOI: 10.1016/j.procs.2019.08.150.

## Correspondencia con la guía
1. Configuración: sección 01. 2. Arquitecturas: sección 05. 3. Variables: sección 02. 4. Modelo: sección 05. 5. Escenarios: sección 02. 6. Indicadores: secciones 03–04. 7. Comparación: sección 04. 8. Decisión: sección 03. 9. Responsive: interfaz adaptable. 10. Validación: sección 06. 11. Documentación: este documento y sección 05. 12. Sustentación: sección 07. **Pendiente para entrega final:** publicar el HTML en un hosting estático y adjuntar el enlace.
