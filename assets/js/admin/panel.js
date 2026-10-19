/*
  panel.js
  Piezas comunes del panel interno: menú lateral según el rol, barra
  superior, estados de pedido y carga de pedidos de ejemplo.
  Usa las funciones de utilidades.js (LV.moneda, LV.cargarJSON, etc.).
*/
var Panel = (function () {
  var CLAVE_CAMBIOS = 'lv_admin_cambios'; // cambios de estado hechos en el panel

  // Estados del pedido en el orden en que avanzan
  var ESTADOS = [
    { id: 'pendiente_pago', texto: 'Pendiente de pago' },
    { id: 'pagado', texto: 'Pagado' },
    { id: 'en_preparacion', texto: 'En preparación' },
    { id: 'asignado', texto: 'Asignado' },
    { id: 'en_camino', texto: 'En camino' },
    { id: 'entregado', texto: 'Entregado' },
    { id: 'cancelado', texto: 'Cancelado' }
  ];

  var METODOS = { efectivo: 'Efectivo', yape: 'Yape', transferencia: 'Transferencia' };

  /* ---------- Iconos del menú (SVG simples) ---------- */
  function icono(trazo) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + trazo + '</svg>';
  }

  var MENU = [
    { id: 'tablero', texto: 'Tablero', url: 'index.html', roles: ['administrador', 'cajero'],
      icono: icono('<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>') },
    { id: 'pedidos', texto: 'Pedidos', url: 'pedidos.html', roles: ['administrador', 'cajero'],
      icono: icono('<path d="M9 5h10M9 12h10M9 19h10"/><circle cx="4" cy="5" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="19" r="1"/>') },
    { id: 'productos', texto: 'Productos', url: 'productos.html', roles: ['administrador'],
      icono: icono('<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>') },
    { id: 'stock', texto: 'Stock', url: 'stock.html', roles: ['administrador'],
      icono: icono('<path d="M3 21h18"/><rect x="5" y="11" width="3" height="10"/><rect x="10.5" y="6" width="3" height="15"/><rect x="16" y="14" width="3" height="7"/>') },
    { id: 'reportes', texto: 'Reportes', url: 'reportes.html', roles: ['administrador'],
      icono: icono('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>') },
    { id: 'entregas', texto: 'Entregas', url: 'entregas.html', roles: ['repartidor'],
      icono: icono('<rect x="1" y="6" width="13" height="10"/><path d="M14 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>') }
  ];

  var ICONO_MENU = icono('<path d="M4 6h16M4 12h16M4 18h16"/>');

  /* ---------- Menú lateral y barra superior ---------- */
  function pintarEstructura() {
    var sesion = Sesion.leer();
    if (!sesion) return;
    var actual = document.body.getAttribute('data-pagina');
    var titulo = document.body.getAttribute('data-titulo') || '';

    var items = MENU.filter(function (m) { return m.roles.indexOf(sesion.rol) !== -1; })
      .map(function (m) {
        return '<li><a href="' + m.url + '"' + (m.id === actual ? ' aria-current="page"' : '') + '>' +
          m.icono + '<span>' + m.texto + '</span></a></li>';
      }).join('');

    var menu = document.getElementById('menu-lateral');
    menu.innerHTML =
      '<a class="logo" href="' + Sesion.inicioDeRol(sesion.rol) + '">' +
      '<img src="' + LV.ruta('assets/img/logo-web.png') + '" alt="" width="48" height="48" ' +
      'onerror="this.onerror=null;this.src=\'' + LV.ruta('assets/img/logo-provisional.svg') + '\'">' +
      '<span class="logo__texto">Las Vegas<small>PANEL INTERNO</small></span></a>' +
      '<nav aria-label="Menú del panel"><ul class="menu-lateral__lista">' + items + '</ul></nav>' +
      '<div class="menu-lateral__pie">' +
      '<p><strong>' + LV.escapar(sesion.nombre) + '</strong>' + Sesion.nombreRol(sesion.rol) + '</p>' +
      '<button type="button" class="btn btn-cerrar-sesion" id="btn-cerrar-sesion">Cerrar sesión</button>' +
      '</div>';

    var barra = document.getElementById('barra-superior');
    barra.innerHTML =
      '<div class="contenedor"><div class="barra-superior__fila">' +
      '<button type="button" class="btn-menu" aria-expanded="false" aria-controls="menu-lateral" aria-label="Abrir menú">' + ICONO_MENU + '</button>' +
      '<span class="barra-superior__titulo">' + LV.escapar(titulo) + '</span>' +
      '<span class="chip-rol">' + Sesion.nombreRol(sesion.rol) + '</span>' +
      '</div></div>';

    document.getElementById('btn-cerrar-sesion').addEventListener('click', Sesion.cerrar);

    // En celular el menú se abre con el botón de hamburguesa
    var boton = barra.querySelector('.btn-menu');
    var velo = document.createElement('div');
    velo.className = 'velo oculto';
    document.body.appendChild(velo);

    function alternar(abrir) {
      menu.classList.toggle('abierto', abrir);
      velo.classList.toggle('oculto', !abrir);
      boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
      if (abrir) {
        var enlace = menu.querySelector('a[aria-current]') || menu.querySelector('a');
        if (enlace) enlace.focus();
      }
    }
    boton.addEventListener('click', function () { alternar(!menu.classList.contains('abierto')); });
    velo.addEventListener('click', function () { alternar(false); boton.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) { alternar(false); boton.focus(); }
    });
  }

  /* ---------- Fechas ---------- */
  function dosDigitos(n) {
    return String(n).padStart(2, '0');
  }

  function fechaClave(fecha) {
    return fecha.getFullYear() + dosDigitos(fecha.getMonth() + 1) + dosDigitos(fecha.getDate());
  }

  function hora(fecha) {
    return dosDigitos(fecha.getHours()) + ':' + dosDigitos(fecha.getMinutes());
  }

  function fechaCorta(fecha) {
    return dosDigitos(fecha.getDate()) + '/' + dosDigitos(fecha.getMonth() + 1) + '/' + fecha.getFullYear();
  }

  function esHoy(fecha) {
    return fechaClave(fecha) === fechaClave(new Date());
  }

  /* ---------- Estados ---------- */
  function textoEstado(id) {
    var e = ESTADOS.find(function (x) { return x.id === id; });
    return e ? e.texto : id;
  }

  function etiquetaEstado(id) {
    return '<span class="estado estado--' + id + '">' + textoEstado(id) + '</span>';
  }

  function leerCambios() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_CAMBIOS) || '{}');
    } catch (e) {
      return {};
    }
  }

  // Guarda un cambio de estado (y el repartidor, si aplica) con su historial
  function cambiarEstado(pedido, estado, repartidor) {
    var cambios = leerCambios();
    var sesion = Sesion.leer();
    var anterior = cambios[pedido.numero] || { historial: [] };
    anterior.estado = estado;
    if (typeof repartidor === 'string') anterior.repartidor = repartidor;
    anterior.historial.push({
      estado: estado,
      fecha: new Date().toISOString(),
      usuario: sesion ? sesion.nombre : ''
    });
    cambios[pedido.numero] = anterior;
    try {
      localStorage.setItem(CLAVE_CAMBIOS, JSON.stringify(cambios));
    } catch (e) { /* sin almacenamiento */ }
    pedido.estado = estado;
    if (typeof repartidor === 'string') pedido.repartidor = repartidor;
    pedido.historial = anterior.historial;
  }

  /* ---------- Pedidos ---------- */

  // Completa un pedido con nombres de productos, subtotal y total
  function completar(pedido, productos) {
    pedido.lineas.forEach(function (l) {
      if (!l.nombre) {
        var p = productos.find(function (x) { return x.id === l.id; });
        l.nombre = p ? p.nombre : l.id;
      }
      l.subtotal = Math.round(l.precio * l.cantidad * 100) / 100;
    });
    pedido.subtotal = Math.round(pedido.lineas.reduce(function (s, l) { return s + l.subtotal; }, 0) * 100) / 100;
    pedido.total = Math.round((pedido.subtotal + (pedido.envio || 0)) * 100) / 100;
    return pedido;
  }

  /*
    Devuelve todos los pedidos ordenados del más reciente al más antiguo:
    - los de ejemplo de datos/pedidos.json (con fecha relativa a hoy)
    - los hechos en el sitio público desde este mismo navegador
    y les aplica los cambios de estado guardados en el panel.
  */
  function cargarPedidos() {
    return Promise.all([LV.cargarJSON('pedidos.json'), LV.cargarJSON('productos.json')]).then(function (r) {
      var productos = r[1].productos;
      var lista = r[0].pedidos.map(function (base) {
        var p = JSON.parse(JSON.stringify(base));
        var fecha = new Date();
        var partes = p.hora.split(':');
        fecha.setDate(fecha.getDate() - p.dias_atras);
        fecha.setHours(parseInt(partes[0], 10), parseInt(partes[1], 10), 0, 0);
        p.fecha = fecha;
        p.numero = 'LV-' + fechaClave(fecha) + '-' + String(p.correlativo).padStart(4, '0');
        p.origen = 'ejemplo';
        return completar(p, productos);
      });

      // Pedidos hechos en el sitio público (localStorage de este navegador)
      var web = [];
      try {
        web = JSON.parse(localStorage.getItem('lv_pedidos') || '[]');
      } catch (e) { web = []; }
      web.forEach(function (w) {
        lista.push({
          numero: w.numero,
          fecha: new Date(w.fecha),
          cliente: w.cliente,
          entrega: w.entrega,
          pago: w.pago,
          lineas: w.lineas.map(function (l) {
            return { id: l.id, nombre: l.nombre, cantidad: l.cantidad, precio: l.precio };
          }),
          envio: w.envio,
          estado: w.estado === 'pendiente' ? 'pendiente_pago' : w.estado,
          repartidor: '',
          origen: 'web'
        });
        completar(lista[lista.length - 1], productos);
      });

      // Cambios hechos desde el panel
      var cambios = leerCambios();
      lista.forEach(function (p) {
        var c = cambios[p.numero];
        p.historial = [];
        if (c) {
          p.estado = c.estado;
          if (typeof c.repartidor === 'string') p.repartidor = c.repartidor;
          p.historial = c.historial || [];
        }
      });

      return lista.sort(function (a, b) { return b.fecha - a.fecha; });
    });
  }

  function textoTipo(pedido) {
    return pedido.entrega.tipo === 'delivery' ? 'Delivery' : 'Tienda';
  }

  // Monto que el repartidor debe cobrar (solo pagos en efectivo)
  function montoACobrar(pedido) {
    return pedido.pago.metodo === 'efectivo' ? pedido.total : 0;
  }

  // Las páginas protegidas arman su menú en cuanto carga este archivo
  if (document.getElementById('menu-lateral')) pintarEstructura();

  return {
    ESTADOS: ESTADOS,
    METODOS: METODOS,
    hora: hora,
    fechaCorta: fechaCorta,
    esHoy: esHoy,
    textoEstado: textoEstado,
    etiquetaEstado: etiquetaEstado,
    cambiarEstado: cambiarEstado,
    cargarPedidos: cargarPedidos,
    textoTipo: textoTipo,
    montoACobrar: montoACobrar
  };
})();
