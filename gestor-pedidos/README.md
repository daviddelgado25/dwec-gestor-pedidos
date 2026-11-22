# Gestor de pedidos de material

Práctica de integración de Desarrollo Web en Entorno Cliente (sesiones 8–13).
Aplicación web que muestra un catálogo de material informático, gestiona un carrito y confirma pedidos. Toda la lógica se ejecuta en el navegador con HTML, CSS y JavaScript, sin frameworks, backend ni persistencia (`localStorage`, cookies).

Autor: **David Delgado Alonso**

## 1. Cómo ejecutar la aplicación

La aplicación debe servirse por HTTP, **no** abriendo el HTML con `file://`. Desde la carpeta del proyecto, con cualquiera de estas opciones:

```bash
# Opción A: Node.js
npx serve .

# Opción B: Python
python3 -m http.server 8000
```

También sirve la extensión Live Server de VS Code. Después abre la dirección que indique la terminal (por ejemplo `http://localhost:8000`).

## 2. Estructura de carpetas

```
gestor-pedidos/
├── index.html          Estructura de la página (catálogo, carrito, formulario, historial)
├── css/
│   └── styles.css      Estilos y estados (agotado, errores, mensajes)
├── js/
│   ├── producto.js     Clase Producto
│   ├── calculos.js     Cálculos y validación (sin acceso al DOM)
│   ├── datos.js        Colecciones en memoria: catalogo, carrito, pedidos
│   └── app.js          DOM, eventos y pintado de las vistas
├── docs/               Capturas de evidencia (breakpoint y Network)
└── README.md
```

Orden de carga en `index.html` (todos con `defer`): `producto.js` → `calculos.js` → `datos.js` → `app.js`. Cada fichero depende de los anteriores.

## 3. Datos de partida

Siete productos creados como instancias de `Producto`, en cuatro categorías:

| id | Nombre | Categoría | Precio | Stock |
|----|--------|-----------|--------|-------|
| 1 | Teclado | Periféricos | 25,90 € | 10 |
| 2 | Ratón | Periféricos | 15,50 € | 15 |
| 3 | Monitor | Pantallas | 149,99 € | 5 |
| 4 | Auriculares | Audio | 39,90 € | 8 |
| 5 | Webcam | Accesorios | 29,90 € | 7 |
| 6 | Altavoces | Audio | 50,00 € | **0 (agotado)** |
| 7 | Alfombrilla | Accesorios | 50,00 € | 4 (2 unidades = 100 € exactos) |

El carrito arranca vacío y el historial de pedidos también.

## 4. Funcionalidades

### 4.1 Catálogo de productos
Muestra cada producto con nombre, categoría, precio, existencias y un campo de cantidad. Los productos sin stock se muestran, pero su botón queda deshabilitado.
- **Ficheros:** `index.html` (`#catalogo`), `datos.js`, `app.js`.
- **Clase:** `Producto` (`producto.js`).
- **Funciones:** `crearTarjetaProducto`, `renderCatalogo`.

### 4.2 Búsqueda y filtro por categoría
Busca por nombre sin distinguir mayúsculas y minúsculas y filtra por categoría; ambos criterios se combinan. Si no hay resultados, muestra un mensaje expreso.
- **Funciones:** `renderCatalogo` (usa `filter`). Se activa con los eventos `input` y `change`.

### 4.3 Carrito
Añade una cantidad entera positiva que no supere el stock disponible (contando lo que ya hay en el carrito). Si el producto ya está, suma a su línea. Las líneas se quitan con un botón propio. Muestra unidades, subtotal, descuento y total. Añadir al carrito **no** descuenta stock.
- **Funciones:** `renderCarrito`, listener delegado en `#catalogo` (añadir) y en `#carrito-lista` (quitar).
- **Clase:** `Producto.hayStock`.

### 4.4 Cálculos económicos
Subtotal = suma de precio × cantidad. Descuento del 10 % si el subtotal es ≥ 100 €. Total = subtotal − descuento. Los cálculos usan números; solo se formatean con dos decimales al mostrarlos.
- **Funciones:** `calcularSubtotal(carrito, catalogo)`, `calcularDescuento(subtotal, porcentaje = 0.10)` (parámetro por defecto). No leen ni modifican el DOM.
- Decisión de diseño: `calcularSubtotal` lanza `TypeError` si una línea apunta a un producto que no existe en el catálogo, para no calcular un importe incorrecto sin avisar. `porcentaje` es una fracción (0.10 = 10 %).

### 4.5 Formulario y validación del pedido

Campos: nombre y apellidos, correo, entrega (recogida/envío), dirección y código postal (solo con envío), observaciones con contador, y checkbox de aceptación. Formulario con `novalidate`, evento `submit` con `preventDefault()`, `FormData`, Constraint Validation API y validación completa al enviar.
- **Funciones:** `validarDatosPedido(datos)` (ya implementada en `calculos.js`; devuelve un objeto con un mensaje por campo con error, usando como clave el `name` del campo HTML).
- La regex del código postal usa agrupación y alternativas: `^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$`.

## 5. Casos de prueba

Datos de partida: los de la sección 3. Recarga la página antes de cada prueba (no hay persistencia).

### 5.1 Clase `Producto` y cálculos (consola de DevTools)

| Prueba | Entrada | Resultado esperado |
|--------|---------|--------------------|
| Stock suficiente | `catalogo[0].hayStock(10)` | `true` |
| Stock insuficiente | `catalogo[0].hayStock(11)` | `false` |
| Cantidad no entera | `catalogo[0].hayStock(2.5)` | `false` |
| Cadena en vez de número | `catalogo[0].hayStock("3")` | `false` |
| Descontar válido | `catalogo[0].descontar(3)` | `true`; stock pasa a 7 |
| Descontar inválido | `catalogo[0].descontar(99)` | `false`; stock no cambia |
| Dato inválido en constructor | `new Producto(1, "  ", "x", 1, 1)` | lanza `TypeError` |
| Descuento por debajo del umbral | `calcularDescuento(99.99)` | `0` |
| Descuento en el umbral | `calcularDescuento(100)` | `10` |
| Descuento por encima | `calcularDescuento(250)` | `25` |
| Validación correcta | `validarDatosPedido({nombre:"Ana", email:"ana@x.es", entrega:"recogida", acepto:true})` | `{}` |
| Validación con errores | `validarDatosPedido({nombre:"  ", email:"a@b", entrega:"envio", direccion:"C/", cp:"53000", acepto:false})` | claves `nombre`, `email`, `direccion`, `cp`, `acepto` |

### 5.2 Pruebas en la interfaz

| Funcionalidad | Caso | Pasos y datos | Resultado esperado |
|---------------|------|---------------|--------------------|
| Catálogo | Carga inicial | Abrir la página | 7 tarjetas; sin errores en consola |
| Catálogo | **Producto agotado** | Observar "Altavoces" | Aparece "Agotado", con botón e input deshabilitados |
| Búsqueda | Sin distinguir mayúsculas | Escribir `RAT` | Solo aparece "Ratón" |
| Filtro | Por categoría | Elegir *Audio* | Aparecen Auriculares y Altavoces |
| Filtros | **Sin resultados** | Escribir `rat` y elegir *Audio* | Mensaje "Ningún producto coincide…" |
| Carrito | **Carrito vacío** | Abrir la página | Mensaje de carrito vacío; unidades 0 y total 0,00 € |
| Carrito | Añadir | Ratón, cantidad 2, *Añadir* | Una línea "2 × 15,50 €", subtotal 31,00 €, unidades 2 |
| Carrito | **Suma de cantidades** | Después, Ratón, cantidad 3, *Añadir* | Sigue habiendo una sola línea, con cantidad 5 y 77,50 € |
| Carrito | **Stock insuficiente** | Alfombrilla, cantidad 5 | Mensaje de error; no se añade nada |
| Carrito | Stock contando el carrito | Alfombrilla, 3; luego 2 | Segundo intento: "Solo puedes añadir 1 unidad(es) más." |
| Carrito | Cantidad inválida | Vaciar el input, o poner 0, -1 o 1.5 | Mensaje "Indica una cantidad entera mayor que 0."; no se añade |
| Descuento | **Por debajo de 100 €** | Alfombrilla ×1, Webcam ×1, Ratón ×1 (95,40 €) | Descuento 0,00 €; total 95,40 € |
| Descuento | **Umbral exacto** | Alfombrilla ×2 (100,00 €) | Descuento 10,00 €; total 90,00 € |
| Descuento | Por encima | Monitor ×1 (149,99 €) | Descuento 15,00 €; total 134,99 € |
| Carrito | **Eliminación de líneas** | Pulsar *Quitar* en una línea | La línea desaparece y los totales se actualizan; si era la última, vuelve el mensaje de carrito vacío |
| Formulario | Nombre inválido | Nombre `"   "` o `"A"` y enviar | Error en el campo nombre |
| Formulario | **Correo inválido** | Correo `a@b` y enviar | Error en el campo correo; no se crea el pedido |
| Formulario | **Código postal inválido** | Envío; CP `53000`, `00100` y `1234` | Error en el campo CP en los tres casos |
| Formulario | Código postal válido | Envío; CP `41001` | Sin error en el CP |
| Formulario | **Cambio de modalidad** | Envío con CP incorrecto → cambiar a recogida | Los campos postales se ocultan, no son obligatorios ni conservan error |
| Formulario | Contador | Escribir en observaciones | El contador sube y se detiene en 200 |
| Formulario | Aceptación | Enviar sin marcar el checkbox | Error en la aceptación |
| Confirmación | **Carrito vacío** | Enviar el formulario sin productos | No se crea el pedido; mensaje claro |
| Confirmación | Pedido correcto | Carrito con productos y datos válidos | Pedido en el historial, stock descontado, carrito vacío |
| Historial | Filtro y resumen | Filtrar por *Envío* | Solo pedidos de envío; el número y la suma corresponden a los filtrados |
| Historial | Estado vacío | Abrir sin pedidos | Mensaje de historial vacío (sin `NaN` ni `Infinity`) |
| Exportación | JSON | Pulsar *Exportar historial* | El `textarea` muestra el JSON de los pedidos |

> Las filas de Formulario, Confirmación, Historial y Exportación dependen de la parte pendiente de `app.js`. **Comprueba cada una en el navegador antes de entregar y corrige el resultado esperado si lo que observas difiere.**

Explicación: en DevTools → Network, con la página recargada, se ve `js/app.js` (y el resto de ficheros) con método `GET`, estado `200` y origen `localhost`, lo que demuestra que se sirve por HTTP.

## 6. Uso de la inteligencia artificial

Conversación utilizada: https://claude.ai/share/2f757a63-9af1-441d-8b47-024028ad0744

| Qué se consultó | Qué propuso la IA | Decisión |
|-----------------|-------------------|----------|
| Plan y estructura del proyecto | Fases, carpetas y orden de carga de scripts | Aceptado |
| `index.html` y `styles.css` | La IA los generó, con los ids que usa el JS | Aceptado; las categorías del `<select>` se adaptaron a mis datos |
| `producto.js` (escrito por mí) | Revisión: aplicar `trim()` también a la categoría | Aceptado |
| `calculos.js` (escrito por mí) | Devolver errores por campo (objeto) en vez de un array, proteger con `?? ""` y renombrar `cp` y `acepto` | Aceptado, para asociar cada error a su control |
| `datos.js` (escrito por mí) | Ampliar a 7 productos con uno agotado; `const` en vez de `let` | Aceptado |
| `app.js` (primera versión mía) | Detectó ids incorrectos, uso de `innerHTML`, falta de cantidad, errores silenciosos y de buscador | Reescrito con la ayuda de la IA para el catálogo y el carrito |
| Comentarios del código | La IA los redactó | Revisados para poder explicarlos en la defensa |
