# Verificación de GitHub Pages

**Sitio verificado:** https://favio-b.github.io/ACTIVIDAD9-ING-APLICADA/

Versión funcional: [`f2a6453`](https://github.com/Favio-B/ACTIVIDAD9-ING-APLICADA/commit/f2a6453417f8f7672acd97319a6fd140c95d2bb7). Comprobación UTC: `2026-10-27T03:04:07Z`.

Se descargaron los archivos desde GitHub Pages con HTTP 200 y se compararon sus hashes SHA-256 con los archivos locales. Se normalizaron únicamente los finales de línea CRLF/LF. **Los diez archivos coinciden.** La prueba de navegador se ejecutó contra la URL pública normal, sin cambiar código ni usar resultados locales como sustituto.

| Archivo | HTTP | Coincide con local |
|---|---:|---|
| `index.html` | 200 | Sí |
| `model.js` | 200 | Sí |
| `navigation.js` | 200 | Sí |
| `app.js` | 200 | Sí |
| `simulation.js` | 200 | Sí |
| `theme.css` | 200 | Sí |
| `simulation.css` | 200 | Sí |
| `assets/tailwind.css` | 200 | Sí |
| `assets/bootstrap.min.css` | 200 | Sí |
| `assets/favicon.svg` | 200 | Sí |

## Resultado público

**23/23 comprobaciones aprobadas**, incluyendo las seis referencias de decisión/sensibilidad, exportación coherente, invalidación, prioridades, teclado, movimiento reducido, cuatro anchos, navegación, cinco gráficos y funcionamiento sin animación. Cero errores de ejecución, consola, solicitudes fallidas o HTTP en la carga normal.

- [Reporte público completo: entradas, esperado y obtenido](published-tests.json).
- [Hashes, archivos, HTTP, versión y momento de comprobación](deployment.json).
- [Pruebas locales y del motor](pruebas.md).

Se detectó y corrigió un 404 del icono durante la primera comprobación pública. Se repitió la suite completa tras añadir `assets/favicon.svg`; el reporte enlazado corresponde a la ejecución final aprobada. Los fallos del archivo 3D y canvas de las pruebas de fallback son intencionales y aislados.

El commit de evidencia posterior solo añade documentación y reportes; la versión funcional identificada arriba contiene el código, estilos y recursos comprobados. Los 12 requisitos funcionales se consideran cubiertos con el alcance de la [matriz](documentacion.md#matriz-de-los-12-requisitos). No se ejecutaron lector de pantalla real, certificación WCAG, pruebas físicas de teléfonos ni benchmarks contra proveedores reales.

El despliegue se actualizó por la rama `main` del repositorio existente. Si hubiera una regresión futura, puede revertirse el cambio mediante un nuevo commit de reversión y volver a comprobar el sitio; no se requieren migraciones ni backend.

La actualización de navegación muestra una sola sección a la vez mediante menú lateral o selector móvil fijo. Las dos pruebas añadidas verifican conservación de datos, ocho vistas, controles globales y reducción de desplazamiento.
