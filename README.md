# MenuShield — Simulador de arquitecturas (Actividad 9)

Proyecto académico de Ingeniería Aplicada, Universidad Libre, 2026-2.

## Simulador

Abre `index.html` en un navegador o visita GitHub Pages después de activar **Settings → Pages → Deploy from a branch → main → /(root)**.

El simulador compara arquitecturas monolítica, monolítica modular y de microservicios mediante un modelo analítico **didáctico**. Las cifras son estimaciones del modelo, no mediciones reales ni cotizaciones de proveedores.

## Funciones

- Configuración de proyecto y restricciones de calidad.
- Escenarios de referencia, hora pico, crecimiento y personalizado.
- Variables de carga, concurrencia, CPU, participación de IA y latencia de red.
- Estimación de latencia, capacidad, utilización, disponibilidad y costo.
- Comparación gráfica, recomendación explicable, exportación CSV y pruebas internas.

## Documentación

Consulta [documentación del modelo](docs/documentacion.md) para conocer fórmulas, criterios, supuestos, limitaciones y validación.

## Publicación

URL prevista tras activar Pages: https://favio-b.github.io/ACTIVIDAD9-ING-APLICADA/

No se requieren credenciales ni backend para esta simulación. Bootstrap y Tailwind se distribuyen como CSS local.

## Recorrido interactivo y vista 3D

Al pulsar **Simular escenario** se anima un pedido desde WhatsApp hasta la respuesta, pasando por IA, pedidos y cocina. Se puede pausar, avanzar por pasos, repetir y cambiar la velocidad. La vista 3D permite comparar los límites de despliegue de las tres arquitecturas, girar arrastrando y acercar con la rueda. También admite flechas y teclas + / −.

La animación representa un pedido didáctico: su duración no es la latencia real ni una prueba de carga. Los indicadores conservan el modelo analítico existente. Con movimiento reducido, el recorrido comienza pausado. Cambiar entradas cancela el recorrido para evitar mezclar configuraciones.

Mantén `index.html`, `simulation.css` y `simulation.js` en la misma carpeta; incluye también `theme.css` y la carpeta `assets/`. No se requiere internet para usar el simulador.

## Diseño y estilos

Bootstrap 5 aporta formularios, botones, tarjetas y tablas. Tailwind CSS 4 aporta utilidades de composición con prefijo `tw:`; se omite Preflight para convivir con Bootstrap. Ambos se sirven desde `assets/`, sin CDN ni compilación al abrir la página.

La identidad utiliza azul `#1E3A5F`, rojo `#E63946`, blanco `#FFFFFF`, gris claro `#F3F4F6` y texto gris `#374151`. Verde `#22C55E` indica completado y amarillo `#F59E0B` indica proceso. Los estados incluyen texto o símbolos. Para texto pequeño sobre fondos claros se usan tonos oscuros de los colores semánticos para mantener contraste. Los colores se comparten entre formularios, gráficos y vista 3D mediante `theme.css` y la misma paleta en canvas.

Para reconstruir los estilos locales tras cambios:

```sh
npm ci
npm run build:css
```

Las referencias de integración son la [documentación oficial de Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/) y la [guía de Tailwind sin Preflight y con prefijo](https://tailwindcss.com/docs/preflight).
