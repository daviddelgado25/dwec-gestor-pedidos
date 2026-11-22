// app.js conecta la lógica con el HTML: pinta el catálogo y el carrito
// y reacciona a los eventos del usuario.

// DOMContentLoaded asegura que el código se ejecuta cuando el HTML ya está cargado,
// para no intentar acceder a elementos que todavía no existen.
document.addEventListener("DOMContentLoaded", () => {

    // ---------- Referencias al DOM (ids del index.html) ----------
    // Se guardan una sola vez en constantes los elementos que se van a usar,
    // en lugar de buscarlos con getElementById cada vez.
    const contenedorCatalogo = document.getElementById("catalogo");
    const catalogoVacio = document.getElementById("catalogo-vacio");
    const inputBusqueda = document.getElementById("busqueda");
    const selectCategoria = document.getElementById("filtro-categoria");

    const contenedorCarrito = document.getElementById("carrito-lista");
    const carritoVacio = document.getElementById("carrito-vacio");
    const textoUnidades = document.getElementById("carrito-unidades");
    const textoSubtotal = document.getElementById("carrito-subtotal");
    const textoDescuento = document.getElementById("carrito-descuento");
    const textoTotal = document.getElementById("carrito-total");

    // ---------- Utilidades ----------
    // Convierte un número en texto con dos decimales y el símbolo del euro.
    // Solo formatea para mostrar: los cálculos se hacen siempre con números.
    function formatearImporte(importe) {
        return importe.toFixed(2) + " €";
    }

    // ---------- Catálogo ----------
    // Construye y devuelve la tarjeta de un producto. No la inserta en la página:
    // eso lo hace renderCatalogo. Todo se crea con createElement y textContent
    // (sin innerHTML), de modo que ningún texto se interpreta como HTML.
    function crearTarjetaProducto(producto) {
        // Contenedor principal de la tarjeta, con su clase CSS.
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta");

        // Nombre y categoría del producto.
        const titulo = document.createElement("h3");
        titulo.textContent = producto.nombre;

        const categoria = document.createElement("p");
        categoria.classList.add("categoria");
        categoria.textContent = producto.categoria;

        // Precio formateado con dos decimales.
        const precio = document.createElement("p");
        precio.classList.add("precio");
        precio.textContent = formatearImporte(producto.precio);

        // Existencias: se muestra el stock o "Agotado" si es 0.
        const stock = document.createElement("p");
        stock.classList.add("stock");
        stock.textContent = producto.stock > 0
            ? "Stock: " + producto.stock
            : "Agotado";

        // Zona de acciones: input de cantidad y botón de añadir.
        const acciones = document.createElement("div");
        acciones.classList.add("acciones");

        const campo = document.createElement("div");
        campo.classList.add("campo");

        // La etiqueta se asocia al input con htmlFor/id (accesibilidad). El id lleva
        // el id del producto para que sea único en toda la página.
        const etiqueta = document.createElement("label");
        etiqueta.htmlFor = "cantidad-" + producto.id;
        etiqueta.textContent = "Cantidad";

        // Input numérico con restricciones HTML5 (mínimo 1, paso 1) y valor inicial 1.
        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.id = "cantidad-" + producto.id;
        inputCantidad.min = "1";
        inputCantidad.step = "1";
        inputCantidad.value = "1";

        campo.append(etiqueta, inputCantidad);

        // Botón de añadir. El id del producto se guarda en data-id para recuperarlo
        // después desde el evento click.
        const boton = document.createElement("button");
        boton.type = "button";
        boton.classList.add("btn", "btn-principal");
        boton.dataset.id = producto.id;
        boton.textContent = "Añadir";

        acciones.append(campo, boton);

        // Mensaje de error propio de la tarjeta. Está vacío al principio y el CSS
        // lo oculta; role="alert" hace que los lectores de pantalla lo anuncien.
        const mensaje = document.createElement("p");
        mensaje.classList.add("error");
        mensaje.setAttribute("role", "alert");

        // Si no hay stock, el producto se muestra pero no se puede añadir:
        // clase .agotado y controles deshabilitados. Si hay stock, el máximo del input
        // es el stock disponible.
        if (!producto.hayStock(1)) {
            tarjeta.classList.add("agotado");
            boton.disabled = true;
            inputCantidad.disabled = true;
        } else {
            inputCantidad.max = String(producto.stock);
        }

        // Se montan todas las piezas dentro de la tarjeta y se devuelve.
        tarjeta.append(titulo, categoria, precio, stock, acciones, mensaje);
        return tarjeta;
    }

    // Pinta el catálogo aplicando el buscador y el filtro de categoría a la vez.
    function renderCatalogo() {
        // Se leen los criterios: el texto se pasa a minúsculas para no distinguir
        // mayúsculas, y trim quita espacios sobrantes.
        const texto = inputBusqueda.value.trim().toLowerCase();
        const categoria = selectCategoria.value;

        // filter conserva los productos cuyo nombre contiene el texto Y que son de la
        // categoría elegida (o cualquiera si el select está en "Todas", valor vacío).
        const resultados = catalogo.filter(producto =>
            producto.nombre.toLowerCase().includes(texto) &&
            (categoria === "" || producto.categoria === categoria)
        );

        // Se vacía el contenedor y se añade una tarjeta por cada producto resultante.
        contenedorCatalogo.replaceChildren();
        resultados.forEach(producto => {
            contenedorCatalogo.append(crearTarjetaProducto(producto));
        });

        // Si no hay resultados se muestra el mensaje expreso de "sin resultados".
        catalogoVacio.hidden = resultados.length > 0;
    }

    // ---------- Carrito ----------
    // Pinta las líneas del carrito y actualiza unidades, subtotal, descuento y total.
    function renderCarrito() {
        // Se limpia lo pintado antes y se inicia el contador de unidades.
        contenedorCarrito.replaceChildren();
        let unidades = 0;

        // Para cada línea del carrito se busca su producto en el catálogo (find)
        // y se crea la fila con los datos que hay que mostrar.
        carrito.forEach(linea => {
            const producto = catalogo.find(p => p.id === linea.productoId);
            if (producto === undefined) return;

            // Se acumulan las unidades totales del carrito.
            unidades += linea.cantidad;

            const fila = document.createElement("div");
            fila.classList.add("linea-carrito");

            // Nombre del producto.
            const nombre = document.createElement("span");
            nombre.classList.add("nombre");
            nombre.textContent = producto.nombre;

            // Subtotal de la línea (precio × cantidad).
            const subtotalLinea = document.createElement("span");
            subtotalLinea.classList.add("subtotal");
            subtotalLinea.textContent = formatearImporte(producto.precio * linea.cantidad);

            // Detalle con la cantidad y el precio unitario.
            const detalle = document.createElement("span");
            detalle.classList.add("detalle");
            detalle.textContent = linea.cantidad + " × " + formatearImporte(producto.precio);

            // Botón para quitar la línea completa. El id del producto va en
            // data-producto-id para identificarlo en la delegación de eventos.
            const quitar = document.createElement("button");
            quitar.type = "button";
            quitar.classList.add("btn", "btn-quitar");
            quitar.dataset.productoId = producto.id;
            quitar.textContent = "Quitar";

            fila.append(nombre, subtotalLinea, detalle, quitar);
            contenedorCarrito.append(fila);
        });

        // Los importes se calculan con las funciones de calculos.js, que no conocen
        // el DOM. Aquí solo se obtienen los números y luego se muestran.
        const subtotal = calcularSubtotal(carrito, catalogo);
        const descuento = calcularDescuento(subtotal);
        const total = subtotal - descuento;

        // Se escriben los resultados en la página; los importes se formatean
        // en este último paso, no antes.
        textoUnidades.textContent = unidades;
        textoSubtotal.textContent = formatearImporte(subtotal);
        textoDescuento.textContent = formatearImporte(descuento);
        textoTotal.textContent = formatearImporte(total);

        // El mensaje de carrito vacío solo se ve cuando no hay líneas.
        carritoVacio.hidden = carrito.length > 0;
    }

    // ---------- Eventos ----------
    // Cada vez que se escribe en el buscador o se cambia la categoría se
    // vuelve a pintar el catálogo con los filtros combinados.
    inputBusqueda.addEventListener("input", renderCatalogo);
    selectCategoria.addEventListener("change", renderCatalogo);

    // Delegación de eventos: un único listener en el contenedor atiende los botones
    // "Añadir" de todas las tarjetas, incluidas las creadas dinámicamente.
    contenedorCatalogo.addEventListener("click", evento => {
        // closest sube desde el elemento pulsado hasta el botón con data-id.
        // Si el clic no fue en un botón de añadir, no se hace nada.
        const boton = evento.target.closest("button[data-id]");
        if (boton === null) return;

        // Se localizan los elementos de la tarjeta donde se hizo clic.
        const tarjeta = boton.closest(".tarjeta");
        const inputCantidad = tarjeta.querySelector("input");
        const mensaje = tarjeta.querySelector(".error");

        // Se recupera el id del botón (los data-* son texto, por eso Number)
        // y se busca el producto en el catálogo.
        const id = Number(boton.dataset.id);
        const producto = catalogo.find(p => p.id === id);
        if (producto === undefined) return;

        // valueAsNumber devuelve NaN si el campo está vacío (no 0). Se rechazan
        // cantidades vacías, decimales, cero y negativas.
        const cantidad = inputCantidad.valueAsNumber;
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            mensaje.textContent = "Indica una cantidad entera mayor que 0.";
            return;
        }

        // Se mira cuántas unidades de este producto hay ya en el carrito, porque el
        // límite es el stock total: lo ya añadido más lo nuevo no puede superarlo.
        const linea = carrito.find(l => l.productoId === id);
        const yaEnCarrito = linea === undefined ? 0 : linea.cantidad;

        // hayStock (método de la clase) comprueba que la suma no supere el stock.
        // Si no se puede, se indica al usuario cuántas unidades le quedan por añadir.
        if (!producto.hayStock(yaEnCarrito + cantidad)) {
            const disponibles = producto.stock - yaEnCarrito;
            mensaje.textContent = disponibles > 0
                ? "Solo puedes añadir " + disponibles + " unidad(es) más."
                : "Ya tienes en el carrito todo el stock disponible.";
            return;
        }

        // Si el producto ya está en el carrito se suma la cantidad a su línea
        // (no se duplica); si no, se crea una línea nueva con push.
        // Añadir al carrito NO descuenta stock: eso solo ocurre al confirmar el pedido.
        if (linea !== undefined) {
            linea.cantidad += cantidad;
        } else {
            carrito.push({ productoId: id, cantidad: cantidad });
        }

        // Se borra cualquier error anterior y se repinta el carrito.
        mensaje.textContent = "";
        renderCarrito();
    });

    // Delegación de eventos: un único listener en el carrito atiende todos los
    // botones "Quitar", aunque las líneas se creen y se destruyan dinámicamente.
    contenedorCarrito.addEventListener("click", evento => {
        // Si el clic no fue en (o dentro de) un botón de quitar, se ignora.
        const boton = evento.target.closest(".btn-quitar");
        if (boton === null) return;

        // Se obtiene el id del producto y la posición de su línea en el array.
        const id = Number(boton.dataset.productoId);
        const indice = carrito.findIndex(l => l.productoId === id);

        // findIndex devuelve -1 si no la encuentra; solo se borra si existe,
        // porque splice(-1, 1) eliminaría la última línea por error.
        if (indice !== -1) {
            carrito.splice(indice, 1);
        }
        renderCarrito();
    });

    // ---------- Arranque ----------
    // Al cargar la página se pinta el catálogo y el carrito (vacío al principio).
    renderCatalogo();
    renderCarrito();

    // PENDIENTE (hazlo tú): formulario y validación, confirmar pedido,
    // historial, filtro del historial y exportación JSON.
});