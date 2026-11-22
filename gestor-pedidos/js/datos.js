// Este fichero define las tres colecciones en memoria que usa la aplicación:
// catálogo de productos, carrito activo e historial de pedidos.
// No se guardan tras recargar la página (no se usa localStorage).

// Catálogo: array de instancias de la clase Producto (definida en producto.js,
// por eso producto.js debe cargarse antes que este fichero).
// Cada producto tiene id único, nombre, categoría, precio y stock.
// Hay tres o más categorías, un producto agotado (Altavoces, stock 0) y otro que
// permite probar el umbral de descuento (Alfombrilla: 2 unidades = 100 €).
const catalogo = [
    new Producto(1, "Teclado", "Periféricos", 25.90, 10),
    new Producto(2, "Ratón", "Periféricos", 15.50, 15),
    new Producto(3, "Monitor", "Pantallas", 149.99, 5),
    new Producto(4, "Auriculares", "Audio", 39.90, 8),
    new Producto(5, "Webcam", "Accesorios", 29.90, 7),
    new Producto(6, "Altavoces", "Audio", 50, 0),       // agotado
    new Producto(7, "Alfombrilla", "Accesorios", 50, 4) // 2 unidades = 100 € exactos
];

// Carrito: array de líneas con la forma { productoId, cantidad }.
// Solo hay una línea por producto; si se añade de nuevo, se suma a la cantidad.
// Es const porque nunca se reasigna: se modifica con push y splice.
const carrito = [];

// Pedidos: historial de pedidos confirmados. También es const y solo cambia con push.
const pedidos = [];