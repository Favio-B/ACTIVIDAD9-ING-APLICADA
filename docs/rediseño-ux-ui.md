# MenuShield · revisión UX/UI

Versión local para revisar antes de publicar. Preparada el 28 de octubre de 2026.

## Abrir

Abra proyecto/index.html directamente en su navegador. No requiere instalar paquetes ni conexión a internet para usar el simulador.
También se puede servir la carpeta proyecto con un servidor local. La vista previa de esta sesión usa http://127.0.0.1:8769/ mientras el servidor esté activo.

## Cambios

- Introducción con restaurante ilustrado y profundidad, con acceso directo a configurar y explorar.
- Controles con íconos, significado y unidades. Contexto descriptivo plegable.
- Recomendación, indicadores y descartes visibles; explicaciones secundarias desplegables.
- Barras animadas y comparación de las últimas dos ejecuciones válidas, usando la misma arquitectura en ambos lados.
- Diagramas de monolito, módulos y servicios; recorrido visual del cálculo.
- Escena 3D vinculada a la utilización y capacidad calculadas, con cola ilustrativa cuando se supera capacidad.
- Pausa, pasos manuales, teclado, movimiento reducido y adaptación a móvil.
- Ninguna dependencia nueva. Modelo, coeficientes, reglas, CSV y navegación conservados.

## Verificación

24/24 pruebas del motor; 25/25 comprobaciones existentes del navegador; 13/13 comprobaciones adicionales UX/UI. Sin errores de ejecución ni recursos en la suite existente. Se revisaron 360, 390, 768, 1280 y 1440 px, teclado, movimiento reducido, escenario inicial, duplicar CPU, ninguna opción viable y crecimiento con microservicios.

Los reportes locales están en proyecto/docs/ux-model-tests.json, browser-tests.json, ux-tests.json y ux-verification.json. El último incluye la huella del motor original y confirma que no cambió. Las capturas del rediseño se identifican con ux- en proyecto/artifacts/.

Para repetir las pruebas de navegador, instale las dependencias del proyecto y use npm run test:browser y npm run test:ux. En Windows las suites utilizan Edge. Para ejecutar solo las 24 pruebas del motor sin instalar dependencias: node -e "const r=require('./model.js').runTests();console.table(r.map(t=>({prueba:t.name,aprobada:t.pass})));if(r.some(t=>!t.pass))process.exitCode=1" desde proyecto/.

El script histórico npm test conserva una comparación contra el commit Git 6e1c268 y requiere el historial original del repositorio; el ZIP de revisión no incluye .git. Antes del push se ejecutó además la regresión en el repositorio original: 24/24 pruebas aprobadas, 300 estimaciones idénticas y 400 decisiones idénticas al commit histórico. Se verificó también igualdad SHA-256 del motor.

## Alcance

Versión preparada para publicar en GitHub Pages. Los reportes anteriores incluidos en Evidencias siguen siendo registros históricos; la nueva comprobación local aparece por separado. Las estimaciones siguen siendo didácticas: costos ficticios, disponibilidad estimada y p95 heurístico. La cantidad y velocidad de paquetes 3D no son mediciones reales ni resultados de una simulación de eventos discretos. Los diagramas son ilustraciones, no despliegues reales.

Las comprobaciones de accesibilidad son funcionales; no equivalen a una auditoría WCAG completa ni a pruebas en teléfonos físicos. No se añadieron fotos, rastreadores ni servicios externos.
