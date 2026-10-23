/*
  utilidades.js
  Funciones compartidas por todas las páginas: formato de moneda, búsqueda
  sin tildes, carga de datos JSON, cálculo de precios y disponibilidad,
  y armado de la cabecera y el pie.
*/
var LV = (function () {
  // Carpeta raíz relativa a la página actual ("" en index, "../" en paginas/)
  var RAIZ = document.body.getAttribute('data-raiz') || '';
  var cacheDatos = {};

  /* ---------- Formato y texto ---------- */

  // Devuelve un monto con el formato "S/ 12.50"
  function moneda(valor) {
    var numero = Math.round((Number(valor) || 0) * 100) / 100;
    return 'S/ ' + numero.toFixed(2);
  }

  // Quita tildes y pasa a minúsculas para comparar textos
  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  // Evita inyectar HTML al mostrar textos
  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parametro(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
  }

  function ruta(relativa) {
    return RAIZ + relativa;
  }

  /* ---------- Datos ---------- */

  function cargarJSON(archivo) {
    if (!cacheDatos[archivo]) {
      cacheDatos[archivo] = fetch(ruta('datos/' + archivo))
        .then(function (respuesta) {
          if (!respuesta.ok) throw new Error('No se pudo cargar ' + archivo);
          return respuesta.json();
        });
    }
    return cacheDatos[archivo];
  }

  // Carga productos, promociones y zonas de una vez
  function cargarTodo() {
    return Promise.all([
      cargarJSON('productos.json'),
      cargarJSON('promociones.json'),
      cargarJSON('zonas.json')
    ]).then(function (r) {
      return {
        categorias: r[0].categorias.slice().sort(function (a, b) { return a.orden - b.orden; }),
        productos: r[0].productos,
        promociones: r[1].promociones,
        combos: r[1].combos,
        zonas: r[2].zonas
      };
    });
  }

  function buscarProducto(datos, id) {
    return datos.productos.find(function (p) { return p.id === id; }) || null;
  }

  function buscarCombo(datos, id) {
    return datos.combos.find(function (c) { return c.id === id; }) || null;
  }

  function nombreCategoria(datos, id) {
    var cat = datos.categorias.find(function (c) { return c.id === id; });
    return cat ? cat.nombre : '';
  }

  function imagenCategoria(categoria) {
    return ruta('assets/img/productos/' + categoria + '.svg');
  }

  /* ---------- Precios y disponibilidad ---------- */

  // Promoción de porcentaje vigente para un producto (o null)
  function promoDeProducto(datos, idProducto) {
    return datos.promociones.find(function (pr) {
      return pr.tipo === 'porcentaje' && pr.productos.indexOf(idProducto) !== -1;
    }) || null;
  }

  // Precio final del producto (con descuento si tiene promoción)
  function precioProducto(datos, producto) {
    var promo = promoDeProducto(datos, producto.id);
    if (!promo) return producto.precio;
    return Math.round(producto.precio * (100 - promo.valor)) / 100;
  }

  // Precio normal de un combo: suma de sus productos sin descuento
  function precioNormalCombo(datos, combo) {
    return combo.items.reduce(function (suma, item) {
      var p = buscarProducto(datos, item.id);
      return suma + (p ? p.precio * item.cantidad : 0);
    }, 0);
  }

  // Cuántos combos se pueden armar con el stock actual
  function stockCombo(datos, combo) {
    return combo.items.reduce(function (minimo, item) {
      var p = buscarProducto(datos, item.id);
      var posibles = p ? Math.floor(p.stock / item.cantidad) : 0;
      return Math.min(minimo, posibles);
    }, Infinity);
  }

  // Estado de disponibilidad: disponible, pocas unidades o agotado
  function estadoStock(stock, stockMinimo) {
    if (stock <= 0) return { clase: 'agotado', texto: 'Agotado' };
    if (stock <= (stockMinimo || 0)) return { clase: 'pocas', texto: 'Pocas unidades' };
    return { clase: 'disponible', texto: 'Disponible' };
  }

  function etiquetaEstado(estado) {
    return '<span class="estado estado--' + estado.clase + '">' + estado.texto + '</span>';
  }

  // Cantidad máxima que se puede pedir de un artículo
  function cantidadMaxima(stock) {
    return Math.max(0, Math.min(stock, window.NEGOCIO.cantidadMaximaPorProducto));
  }

  /* ---------- Componentes de interfaz ---------- */

  // Tarjeta de producto para inicio y catálogo
  function tarjetaProducto(datos, p) {
    var estado = estadoStock(p.stock, p.stock_minimo);
    var precio = precioProducto(datos, p);
    var promo = promoDeProducto(datos, p.id);
    var enlace = ruta('paginas/producto.html?id=' + encodeURIComponent(p.id));
    var precioHTML = '<span class="precio">' + moneda(precio) + '</span>' +
      (promo ? '<span class="precio--tachado"><span class="oculto-visual">Antes </span>' + moneda(p.precio) + '</span>' : '');
    var boton = estado.clase === 'agotado'
      ? '<button type="button" class="btn btn--bloque" disabled>Agotado</button>'
      : '<button type="button" class="btn btn--principal btn--bloque" data-agregar="' + escapar(p.id) + '">Agregar</button>';

    return '<article class="tarjeta-producto">' +
      '<a class="tarjeta-producto__imagen" href="' + enlace + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + imagenCategoria(p.categoria) + '" alt="" loading="lazy" width="200" height="220"></a>' +
      '<div class="tarjeta-producto__cuerpo">' +
      (promo ? '<span class="etiqueta-oferta">-' + promo.valor + ' %</span>' : '') +
      '<h3 class="tarjeta-producto__nombre"><a href="' + enlace + '">' + escapar(p.nombre) + '</a></h3>' +
      '<p class="tarjeta-producto__presentacion">' + escapar(p.presentacion) + '</p>' +
      '<div class="tarjeta-producto__pie">' +
      '<div>' + precioHTML + '</div>' +
      etiquetaEstado(estado) +
      boton +
      '</div></div></article>';
  }

  // Tarjeta de una promoción (porcentaje o regalo)
  function tarjetaPromo(datos, promo) {
    var cuerpo = '<p>' + escapar(promo.descripcion) + '</p>';
    var accion = '';
    if (promo.tipo === 'porcentaje' && promo.productos.length) {
      var p = buscarProducto(datos, promo.productos[0]);
      if (p) {
        cuerpo += '<p><span class="precio">' + moneda(precioProducto(datos, p)) + '</span>' +
          '<span class="precio--tachado"><span class="oculto-visual">Antes </span>' + moneda(p.precio) + '</span></p>';
        accion = '<a class="btn btn--principal" href="' + ruta('paginas/producto.html?id=' + p.id) + '">Ver producto</a>';
      }
    } else {
      accion = '<a class="btn btn--secundario" href="' + ruta('paginas/catalogo.html') + '">Ir al catálogo</a>';
    }
    return '<article class="tarjeta-promo">' +
      '<span class="etiqueta-oferta">' + (promo.tipo === 'regalo' ? 'Regalo' : '-' + promo.valor + ' %') + '</span>' +
      '<h3>' + escapar(promo.titulo) + '</h3>' + cuerpo +
      '<p class="tarjeta-promo__vigencia">' + escapar(promo.vigencia) + '</p>' + accion + '</article>';
  }

  // Tarjeta de un combo con su lista de productos y botón para agregar
  function tarjetaCombo(datos, combo) {
    var normal = precioNormalCombo(datos, combo);
    var stock = stockCombo(datos, combo);
    var items = combo.items.map(function (item) {
      var p = buscarProducto(datos, item.id);
      return '<li>' + item.cantidad + ' × ' + escapar(p ? p.nombre : 'Producto') + '</li>';
    }).join('');
    var boton = stock > 0
      ? '<button type="button" class="btn btn--principal" data-agregar="' + escapar(combo.id) + '">Agregar combo</button>'
      : '<button type="button" class="btn" disabled>Combo agotado</button>';
    return '<article class="tarjeta-promo tarjeta-promo--combo">' +
      '<span class="etiqueta-oferta">Combo</span>' +
      '<h3>' + escapar(combo.nombre) + '</h3>' +
      '<p>' + escapar(combo.descripcion) + '</p>' +
      '<ul>' + items + '</ul>' +
      '<p><span class="precio">' + moneda(combo.precio_promocional) + '</span>' +
      '<span class="precio--tachado"><span class="oculto-visual">Precio normal </span>' + moneda(normal) + '</span></p>' +
      etiquetaEstado(estadoStock(stock, 2)) + boton + '</article>';
  }

  // Activa los botones "Agregar" de una grilla de productos
  function activarBotonesAgregar(contenedor, datos) {
    contenedor.addEventListener('click', function (evento) {
      var boton = evento.target.closest('[data-agregar]');
      if (!boton) return;
      var id = boton.getAttribute('data-agregar');
      var resultado = Carrito.agregar(datos, id, 1);
      mostrarToast(resultado.mensaje);
    });
  }

  var temporizadorToast = null;
  function mostrarToast(mensaje) {
    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.classList.remove('oculto');
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () { toast.classList.add('oculto'); }, 2600);
  }

  function mostrarErrorCarga(contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = '<div class="aviso aviso--error"><p>No pudimos cargar los productos. ' +
      'Abre el sitio con un servidor local (por ejemplo <code>python -m http.server</code>) y vuelve a intentar.</p></div>';
  }

  /* ---------- Cabecera y pie ---------- */

  var ICONO_CARRITO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>' +
    '<path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6"/></svg>';
  var ICONO_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  var ENLACES = [
    { id: 'inicio', texto: 'Inicio', url: 'index.html' },
    { id: 'catalogo', texto: 'Catálogo', url: 'paginas/catalogo.html' },
    { id: 'promociones', texto: 'Promociones', url: 'paginas/promociones.html' },
    { id: 'delivery', texto: 'Delivery y contacto', url: 'paginas/delivery-contacto.html' },
    { id: 'carrito', texto: 'Carrito', url: 'paginas/carrito.html' }
  ];

  function pintarCabecera() {
    var cabecera = document.getElementById('cabecera');
    if (!cabecera) return;
    var actual = document.body.getAttribute('data-pagina');
    var items = ENLACES.map(function (e) {
      var activo = e.id === actual ? ' aria-current="page"' : '';
      return '<li><a href="' + ruta(e.url) + '"' + activo + '>' + e.texto + '</a></li>';
    }).join('');

    cabecera.className = 'cabecera';
    cabecera.innerHTML =
      '<div class="contenedor">' +
      '<div class="cabecera__fila">' +
      '<a class="logo" href="' + ruta('index.html') + '">' +
      '<img src="' + ruta('assets/img/logo-web.png') + '" alt="" width="48" height="48" ' +
      'onerror="this.onerror=null;this.src=\'' + ruta('assets/img/logo-provisional.svg') + '\'">' +
      '<span class="logo__texto">Las Vegas<small>LICORERÍA · TARAPOTO</small></span></a>' +
      '<nav class="nav-principal" id="nav-principal" aria-label="Menú principal"><ul>' + items + '</ul></nav>' +
      '<div class="cabecera__acciones">' +
      '<a class="btn-carrito" href="' + ruta('paginas/carrito.html') + '" aria-label="Ver carrito">' +
      ICONO_CARRITO + '<span class="contador-carrito" id="contador-carrito">0</span></a>' +
      '<button type="button" class="btn-menu" aria-expanded="false" aria-controls="nav-principal" aria-label="Abrir menú">' +
      ICONO_MENU + '</button>' +
      '</div></div></div>';

    // En celular el menú se abre y cierra con el botón
    var boton = cabecera.querySelector('.btn-menu');
    var nav = cabecera.querySelector('.nav-principal');
    boton.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    // En celular el menú va debajo de la fila del logo
    function ubicarMenu() {
      var fila = cabecera.querySelector('.cabecera__fila');
      var contenedor = cabecera.querySelector('.contenedor');
      if (window.innerWidth < 900) {
        if (nav.parentNode !== contenedor) contenedor.appendChild(nav);
      } else if (nav.parentNode !== fila) {
        fila.insertBefore(nav, fila.querySelector('.cabecera__acciones'));
      }
    }
    ubicarMenu();
    window.addEventListener('resize', ubicarMenu);

    if (window.NEGOCIO && window.NEGOCIO.modoMantenimiento && !document.getElementById('aviso-mantenimiento-tienda')) {
      var banner = document.createElement('div');
      banner.id = 'aviso-mantenimiento-tienda';
      banner.className = 'aviso aviso--alerta';
      banner.style.textAlign = 'center';
      banner.style.margin = '0';
      banner.style.borderRadius = '0';
      banner.style.borderWidth = '0 0 1px 0';
      banner.innerHTML = '<strong>Aviso del Desarrollador:</strong> ' +
        (window.NEGOCIO.mensajeMantenimiento ? escapar(window.NEGOCIO.mensajeMantenimiento) : 'Modo mantenimiento / pruebas activo en la plataforma.');
      cabecera.parentNode.insertBefore(banner, cabecera);
    }

    actualizarContador();
  }

  function actualizarContador() {
    var contador = document.getElementById('contador-carrito');
    if (!contador || typeof Carrito === 'undefined') return;
    var total = Carrito.cantidadTotal();
    contador.textContent = total;
    contador.parentNode.setAttribute('aria-label', 'Ver carrito, ' + total + (total === 1 ? ' unidad' : ' unidades'));
  }

  function pintarPie() {
    var pie = document.getElementById('pie');
    if (!pie) return;
    var n = window.NEGOCIO;
    var horarios = n.horarios.map(function (h) {
      return '<li>' + escapar(h.dias) + ': ' + escapar(h.horas) + '</li>';
    }).join('');

    pie.className = 'pie';
    pie.innerHTML =
      '<div class="contenedor">' +
      '<div class="pie__columnas">' +
      '<div><h2>' + escapar(n.nombre) + '</h2><p>' + escapar(n.lema) + '.</p>' +
      '<ul><li><a href="' + ruta('paginas/catalogo.html') + '">Catálogo</a></li>' +
      '<li><a href="' + ruta('paginas/promociones.html') + '">Promociones y combos</a></li>' +
      '<li><a href="' + ruta('paginas/delivery-contacto.html') + '">Delivery y contacto</a></li></ul></div>' +
      '<div><h2>Contacto</h2><ul>' +
      '<li>' + escapar(n.direccion) + '</li>' +
      '<li>Teléfono: <a href="tel:+51' + n.telefono.replace(/\s/g, '') + '">' + escapar(n.telefono) + '</a></li>' +
      '<li>WhatsApp: <a href="https://wa.me/51' + n.whatsapp + '" target="_blank" rel="noopener">' + escapar(n.telefono) + '</a></li>' +
      '</ul></div>' +
      '<div><h2>Horario de atención</h2><ul>' + horarios + '</ul></div>' +
      '</div>' +
      '<div class="pie__legal">' +
      '<p><strong>Tomar bebidas alcohólicas en exceso es dañino.</strong> Consume con responsabilidad.</p>' +
      '<p>Prohibida la venta de alcohol y tabaco a menores de 18 años.</p>' +
      '<p>Datos de contacto y precios referenciales de ejemplo.</p>' +
      '</div></div>';
  }

  // Se arma la cabecera y el pie en cuanto se carga este archivo
  pintarCabecera();
  pintarPie();

  return {
    RAIZ: RAIZ,
    moneda: moneda,
    normalizar: normalizar,
    escapar: escapar,
    parametro: parametro,
    ruta: ruta,
    cargarJSON: cargarJSON,
    cargarTodo: cargarTodo,
    buscarProducto: buscarProducto,
    buscarCombo: buscarCombo,
    nombreCategoria: nombreCategoria,
    imagenCategoria: imagenCategoria,
    promoDeProducto: promoDeProducto,
    precioProducto: precioProducto,
    precioNormalCombo: precioNormalCombo,
    stockCombo: stockCombo,
    estadoStock: estadoStock,
    etiquetaEstado: etiquetaEstado,
    cantidadMaxima: cantidadMaxima,
    tarjetaProducto: tarjetaProducto,
    tarjetaPromo: tarjetaPromo,
    tarjetaCombo: tarjetaCombo,
    activarBotonesAgregar: activarBotonesAgregar,
    mostrarToast: mostrarToast,
    mostrarErrorCarga: mostrarErrorCarga,
    actualizarContador: actualizarContador
  };
})();
