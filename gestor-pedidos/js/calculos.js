// Este fichero contiene las funciones de cálculo y validación.
// Ninguna lee ni modifica el DOM: reciben sus datos por parámetros y devuelven
// resultados, así se pueden probar en la consola sin necesidad de la interfaz.

/**
 * Suma el importe de todas las líneas del carrito (precio × cantidad).
 * @param {{productoId: number, cantidad: number}[]} carrito
 * @param {Producto[]} catalogo
 * @returns {number} Subtotal numérico (sin formatear).
 * @throws {TypeError} Si una línea apunta a un producto que no está en el catálogo.
 */
function calcularSubtotal(carrito, catalogo) {
    // El acumulador empieza en 0, de modo que un carrito vacío da subtotal 0.
    let subtotal = 0;

    // Se recorre cada línea del carrito con for...of.
    for (const linea of carrito) {
        // Se busca en el catálogo el producto de la línea comparando su id con productoId.
        // find devuelve el producto encontrado o undefined si no existe.
        const producto = catalogo.find(
            producto => producto.id === linea.productoId
        );

        // Si la línea apunta a un producto inexistente es un error de datos, no se ignora:
        // se lanza una excepción para no calcular un subtotal incorrecto sin avisar.
        if (producto === undefined) {
            throw new TypeError("Producto no encontrado en el catálogo");
        }

        // Importe de la línea = precio unitario × cantidad, sumado al acumulador.
        // Se trabaja siempre con números; el formato (toFixed) se aplica solo al mostrar.
        subtotal += producto.precio * linea.cantidad;
    }

    // Se devuelve el subtotal total del carrito.
    return subtotal;
}


/**
 * Calcula el importe de la rebaja (no el precio final).
 * @param {number} subtotal Importe finito no negativo.
 * @param {number} porcentaje Fracción entre 0 y 1 (0.10 = 10 %).
 * @returns {number} Importe del descuento; 0 si el subtotal es menor de 100.
 */
function calcularDescuento(subtotal, porcentaje = 0.10) {
    // Si el subtotal no alcanza los 100 € no hay descuento.
    // Con 100 exactos sí se aplica, porque la condición es "menor que 100".
    if (subtotal < 100) {
        return 0;
    }

    // Si llega al umbral, el descuento es el subtotal por el porcentaje.
    // El parámetro por defecto (0.10) aplica un 10 % cuando no se indica otro.
    return subtotal * porcentaje;
}


/**
 * Valida los datos del pedido sin tocar el DOM.
 * @param {object} datos nombre, email, entrega, direccion, cp, observaciones, acepto
 * @returns {object} Un mensaje por campo con error, usando como clave el name del
 *                   campo HTML. Si no hay claves, los datos son válidos.
 */
function validarDatosPedido(datos) {
    // Objeto donde se guarda un mensaje por cada campo incorrecto.
    // La clave coincide con el name del campo HTML, para saber dónde mostrar cada error.
    const errores = {};

    // Se normalizan los datos de entrada. "?? ''" sustituye null o undefined por una
    // cadena vacía, para que trim() y length no fallen si falta algún campo.
    const nombre = (datos.nombre ?? "").trim();
    const email = (datos.email ?? "").trim();
    const entrega = datos.entrega;
    const observaciones = datos.observaciones ?? "";

    // Nombre: entre 2 y 60 caracteres una vez quitados los espacios exteriores.
    // Una cadena de solo espacios queda con longitud 0 y se rechaza.
    if (nombre.length < 2 || nombre.length > 60) {
        errores.nombre = "El nombre debe tener entre 2 y 60 caracteres.";
    }

    // Email: obligatorio y con formato aceptable mediante una expresión regular
    // (algo, una @, algo, un punto y algo, sin espacios). Comprueba el formato,
    // no que la dirección exista.
    if (email === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.email = "El correo electrónico no es válido.";
    }

    // Entrega: no basta con confiar en el HTML, se comprueba que el valor sea
    // una de las dos opciones admitidas.
    if (entrega !== "recogida" && entrega !== "envio") {
        errores.entrega = "Elige una modalidad de entrega válida.";
    }

    // Los datos postales solo se exigen si la modalidad es envío.
    // Para recogida no se comprueban ni se piden.
    if (entrega === "envio") {
        const direccion = (datos.direccion ?? "").trim();
        const cp = (datos.cp ?? "").trim();

        // Dirección: entre 5 y 100 caracteres tras quitar espacios exteriores.
        if (direccion.length < 5 || direccion.length > 100) {
            errores.direccion = "La dirección debe tener entre 5 y 100 caracteres.";
        }

        // Código postal: expresión regular con agrupación y alternativas.
        // Los dos primeros dígitos (provincia) deben ser 01-09, 10-49 o 50-52,
        // seguidos de tres cifras más. Se prueba con test().
        if (!/^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/.test(cp)) {
            errores.cp = "El código postal debe tener 5 cifras y provincia entre 01 y 52.";
        }
    }

    // Observaciones: son opcionales, pero no pueden pasar de 200 caracteres.
    if (observaciones.length > 200) {
        errores.observaciones = "Las observaciones no pueden superar 200 caracteres.";
    }

    // Aceptación: el checkbox debe estar marcado (true). Se compara con
    // comparación estricta para no aceptar valores que solo "parecen" verdaderos.
    if (datos.acepto !== true) {
        errores.acepto = "Debes aceptar la confirmación del pedido.";
    }

    // Se devuelve el objeto de errores. Si está vacío (sin claves), los datos son válidos.
    return errores;
}