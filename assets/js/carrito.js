/*
  carrito.js
  Carrito de compras guardado en localStorage (no reserva stock).
  Cada línea guarda solo { id, cantidad }; el id puede ser de un producto
  ("p001") o de un combo ("combo1"). Precios y stock se leen siempre de
  los datos JSON, así se revalidan cada vez que se muestra el carrito.
*/
var Carrito = (function () {
  var CLAVE = 'lv_carrito';

  function leer() {
    try {
      var lista = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function guardar(lista) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista));
    } catch (e) { /* almacenamiento no disponible */ }
    if (typeof LV !== 'undefined') LV.actualizarContador();
  }

  // Busca el artículo (producto o combo) y devuelve sus datos de venta
  function articulo(datos, id) {
    var producto = LV.buscarProducto(datos, id);
    if (producto) {
      return {
        id: id,
        tipo: 'producto',
        nombre: producto.nombre,
        detalle: producto.presentacion,
        imagen: LV.imagenCategoria(producto.categoria),
        precio: LV.precioProducto(datos, producto),
        stock: producto.stock
      };
    }
    var combo = LV.buscarCombo(datos, id);
    if (combo) {
      return {
        id: id,
        tipo: 'combo',
        nombre: combo.nombre,
        detalle: 'Combo promocional',
        imagen: LV.imagenCategoria('combos'),
        precio: combo.precio_promocional,
        stock: LV.stockCombo(datos, combo)
      };
    }
    return null;
  }

  function cantidadTotal() {
    return leer().reduce(function (suma, l) { return suma + l.cantidad; }, 0);
  }

  // Agrega unidades respetando stock y cantidad máxima por producto
  function agregar(datos, id, cantidad) {
    var art = articulo(datos, id);
    if (!art) return { ok: false, mensaje: 'Producto no encontrado.' };
    if (art.stock <= 0) return { ok: false, mensaje: art.nombre + ' está agotado.' };

    var lista = leer();
    var linea = lista.find(function (l) { return l.id === id; });
    var actual = linea ? linea.cantidad : 0;
    var maximo = LV.cantidadMaxima(art.stock);
    var nueva = Math.min(actual + cantidad, maximo);

    if (nueva === actual) {
      return { ok: false, mensaje: 'Ya tienes la cantidad máxima disponible de ' + art.nombre + '.' };
    }
    if (linea) linea.cantidad = nueva; else lista.push({ id: id, cantidad: nueva });
    guardar(lista);

    var agregadas = nueva - actual;
    var mensaje = 'Agregaste ' + agregadas + ' × ' + art.nombre + ' al carrito.';
    if (agregadas < cantidad) mensaje += ' Solo había ' + agregadas + ' disponibles.';
    return { ok: true, mensaje: mensaje };
  }

  function cambiarCantidad(datos, id, cantidad) {
    var art = articulo(datos, id);
    var lista = leer();
    var linea = lista.find(function (l) { return l.id === id; });
    if (!linea || !art) return;
    linea.cantidad = Math.max(1, Math.min(cantidad, LV.cantidadMaxima(art.stock)));
    guardar(lista);
  }

  function quitar(id) {
    guardar(leer().filter(function (l) { return l.id !== id; }));
  }

  function vaciar() {
    guardar([]);
  }

  /*
    Devuelve las líneas listas para mostrar y el subtotal.
    También corrige el carrito si algo cambió (agotado o menos stock)
    y devuelve avisos para informar a la persona.
  */
  function detalle(datos) {
    var lista = leer();
    var avisos = [];
    var lineas = [];
    var corregida = [];

    lista.forEach(function (l) {
      var art = articulo(datos, l.id);
      if (!art) {
        avisos.push('Un producto ya no está disponible y se quitó del carrito.');
        return;
      }
      if (art.stock <= 0) {
        avisos.push(art.nombre + ' se agotó y se quitó del carrito.');
        return;
      }
      var maximo = LV.cantidadMaxima(art.stock);
      var cantidad = Math.max(1, Math.min(l.cantidad, maximo));
      if (cantidad !== l.cantidad) {
        avisos.push('Ajustamos la cantidad de ' + art.nombre + ' a ' + cantidad + ' por disponibilidad.');
      }
      corregida.push({ id: l.id, cantidad: cantidad });
      art.cantidad = cantidad;
      art.maximo = maximo;
      art.subtotal = Math.round(art.precio * cantidad * 100) / 100;
      lineas.push(art);
    });

    if (avisos.length) guardar(corregida);

    var subtotal = lineas.reduce(function (s, l) { return s + l.subtotal; }, 0);
    return {
      lineas: lineas,
      subtotal: Math.round(subtotal * 100) / 100,
      avisos: avisos
    };
  }

  return {
    leer: leer,
    agregar: agregar,
    cambiarCantidad: cambiarCantidad,
    quitar: quitar,
    vaciar: vaciar,
    cantidadTotal: cantidadTotal,
    detalle: detalle
  };
})();
