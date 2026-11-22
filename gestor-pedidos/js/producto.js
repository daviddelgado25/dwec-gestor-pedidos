// Clase Producto: modelo de cada artículo del catálogo.
// Agrupa los datos de un producto (id, nombre, categoría, precio y stock)
// y las operaciones relacionadas con ellos (comprobar disponibilidad y descontar).
class Producto {

    // El constructor recibe los datos, los valida y solo después los guarda en this.
    // Si algún dato no es válido lanza un TypeError: el throw interrumpe el constructor
    // y, por tanto, NO se llega a crear la instancia.
    constructor(id, nombre, categoria, precio, stock) {

        // El id debe ser un número entero y positivo.
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("El id debe ser un entero positivo");
        }

        // El nombre debe ser una cadena y no estar vacío ni formado solo por espacios (trim).
        if (typeof nombre !== "string" || nombre.trim() === "") {
            throw new TypeError("El nombre no puede estar vacío");
        }

        // La categoría sigue la misma regla que el nombre.
        if (typeof categoria !== "string" || categoria.trim() === "") {
            throw new TypeError("La categoría no puede estar vacía");
        }

        // El precio debe ser un número finito (descarta NaN e Infinity) y mayor que cero.
        if (!Number.isFinite(precio) || precio <= 0) {
            throw new TypeError("El precio debe ser un número finito positivo");
        }

        // El stock debe ser un entero mayor o igual que cero (0 significa agotado).
        if (!Number.isInteger(stock) || stock < 0) {
            throw new TypeError("El stock debe ser un entero mayor o igual a cero");
        }

        // Si todas las comprobaciones pasan, se guardan los datos en la nueva instancia.
        // Con trim() se eliminan espacios sobrantes en nombre y categoría, para que
        // el filtro por categoría compare textos idénticos.
        this.id = id;
        this.nombre = nombre.trim();
        this.categoria = categoria.trim();
        this.precio = precio;
        this.stock = stock;
    }

    // Comprueba si se puede disponer de una cantidad concreta de este producto.
    // Devuelve true solo si es un entero, es mayor que 0 y no supera el stock (this.stock).
    // No modifica el stock: solo responde a una pregunta.
    hayStock(cantidad) {
        return Number.isInteger(cantidad) &&
               cantidad > 0 &&
               cantidad <= this.stock;
    }

    // Resta del stock la cantidad indicada (se usará al confirmar un pedido).
    // Primero reutiliza hayStock: si la cantidad no es válida, devuelve false
    // sin tocar nada. Si es válida, descuenta y devuelve true, de modo que quien
    // llama sabe si el estado del objeto ha cambiado.
    descontar(cantidad) {
        if (!this.hayStock(cantidad)) {
            return false;
        }

        this.stock -= cantidad;
        return true;
    }
}