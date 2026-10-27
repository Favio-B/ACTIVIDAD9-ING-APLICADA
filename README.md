# MenuShield · Laboratorio de arquitecturas

Actividad 9 de Ingeniería Aplicada · Universidad Libre · 2026-2.

**Sitio:** https://favio-b.github.io/ACTIVIDAD9-ING-APLICADA/

Compara Monolítica, Monolito modular y Microservicios con las mismas entradas. La recomendación se calcula con cuatro restricciones obligatorias y una puntuación ponderada entre alternativas viables. Todas las cifras son **estimaciones didácticas**, no mediciones, SLA ni cotizaciones.

## Uso

1. Configura proyecto, roles descriptivos, variables, prioridad y restricciones.
2. Pulsa **Simular escenario**. La recomendación aparece antes de la animación y muestra indicadores, cumplimiento y motivos de descarte.
3. Despliega **Cómo se obtuvo esta recomendación**: entradas reales, ecuaciones sustituidas, intermedios, pesos y contribuciones.
4. Modificar controles muestra **Cambios pendientes de simular**. Exportar valida y recalcula primero para mantener todo el CSV coherente.
5. Explora el 3D sin alterar la decisión calculada. Tiene pausa, pasos, velocidad, rotación, zoom y control por teclado; es opcional para el cálculo.

No necesitas servidor ni internet: abre `index.html` conservando `model.js`, `app.js`, `simulation.js`, `theme.css`, `simulation.css` y `assets/` en sus ubicaciones.

## Estilos

Bootstrap 5 y Tailwind 4 están compilados localmente. Tailwind usa prefijo `tw:` y omite Preflight para convivir con Bootstrap. Se conserva la paleta MenuShield: azul `#1E3A5F`, rojo `#E63946`, blanco, gris claro `#F3F4F6`, texto `#374151`, verde `#22C55E` y amarillo `#F59E0B`. Estados acompañados de texto; introducción breve y navegación a Recomendación, Comparación, Modelo y Pruebas.

## Verificación reproducible

```sh
npm ci
npm run build:css
npm test
npm run test:browser
```

- 24 pruebas del modelo, incluidas las ocho originales.
- Regresión contra el commit `6e1c268`: 300 estimaciones y 400 decisiones idénticas.
- 21 comprobaciones de navegador: CSV, invalidación, escenarios, prioridades, 3D independiente, teclado, movimiento reducido, fallback y anchos 360/390/768/1280.
- Windows usa Edge instalado; otros sistemas necesitan `npx playwright install chromium`.
- `npm test` necesita Git y el commit de referencia. Las capturas se guardan en `artifacts/` (no versionado).

Para probar la versión publicada, define `MENUSHIELD_URL` con la URL del sitio antes de `npm run test:browser`.

## Documentación y evidencia

- [Modelo completo, coeficientes, reglas y matriz de los 12 requisitos](docs/documentacion.md).
- [Pruebas ejecutadas: entradas, esperado y obtenido](docs/pruebas.md).
- [Reporte del modelo](docs/model-tests.json) y [reporte de navegador local](docs/browser-tests.json).
- [Verificación de publicación](docs/publicacion.md).

El código conserva los coeficientes del motor anterior; la interfaz no contiene recomendaciones predeterminadas. Las comparaciones entre escenarios cambian varias variables; para explicar una causa se modifica una sola entrada. Hace falta validación empírica con prototipos, carga, métricas observadas y costos reales para extrapolar los resultados.
