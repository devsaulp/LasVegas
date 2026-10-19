/*
  pedidos.js
  Tabla de pedidos con filtro por estado, ventana de detalle y cambio
  de estado. Para pasar a "Asignado" o "En camino" se elige repartidor.
*/
(function () {
  var selectFiltro = document.getElementById('filtro-estado');
  var tabla = document.getElementById('tabla-pedidos');
  var conteo = document.getElementById('conteo-pedidos');
  var ventana = document.getElementById('ventana-pedido');
  var cuerpoVentana = document.getElementById('ventana-pedido-cuerpo');
  var pedidos = [];
  var repartidores = [];

  // Estados que solo tienen sentido con delivery
  var SOLO_DELIVERY = ['asignado', 'en_camino'];

  Panel.ESTADOS.forEach(function (e) {
    var opcion = document.createElement('option');
    opcion.value = e.id;
    opcion.textContent = e.texto;
    selectFiltro.appendChild(opcion);
  });
  selectFiltro.value = LV.parametro('estado') || '';

  Promise.all([Panel.cargarPedidos(), LV.cargarJSON('usuarios.json')]).then(function (r) {
    pedidos = r[0];
    repartidores = r[1].usuarios.filter(function (u) { return u.rol === 'repartidor'; });
    pintarTabla();
  }).catch(function () {
    tabla.innerHTML = '<tr><td colspan="7">No se pudieron cargar los pedidos.</td></tr>';
  });

  selectFiltro.addEventListener('change', pintarTabla);

  tabla.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-ver]');
    if (boton) abrirDetalle(boton.getAttribute('data-ver'));
  });

  ventana.addEventListener('click', function (e) {
    // Cierra con el botón o al hacer clic fuera de la caja
    if (e.target.closest('[data-cerrar]') || e.target === ventana) ventana.close();
  });

  function pintarTabla() {
    var filtro = selectFiltro.value;
    var lista = pedidos.filter(function (p) { return !filtro || p.estado === filtro; });

    conteo.textContent = lista.length + (lista.length === 1 ? ' pedido' : ' pedidos') +
      (filtro ? ' en estado "' + Panel.textoEstado(filtro) + '"' : '') + '.';

    if (!lista.length) {
      tabla.innerHTML = '<tr><td colspan="7">No hay pedidos con este estado.</td></tr>';
      return;
    }

    tabla.innerHTML = lista.map(function (p) {
      var cuando = Panel.esHoy(p.fecha) ? Panel.hora(p.fecha) : Panel.fechaCorta(p.fecha) + ' ' + Panel.hora(p.fecha);
      return '<tr>' +
        '<td data-titulo="Número" class="numero">' + LV.escapar(p.numero) + '</td>' +
        '<td data-titulo="Cliente">' + LV.escapar(p.cliente.nombre) + '</td>' +
        '<td data-titulo="Tipo">' + Panel.textoTipo(p) + '</td>' +
        '<td data-titulo="Total" class="monto">' + LV.moneda(p.total) + '</td>' +
        '<td data-titulo="Estado">' + Panel.etiquetaEstado(p.estado) + '</td>' +
        '<td data-titulo="Hora">' + cuando + '</td>' +
        '<td class="celda-acciones"><button type="button" class="btn btn--secundario" data-ver="' + LV.escapar(p.numero) + '" ' +
        'aria-label="Ver detalle del pedido ' + LV.escapar(p.numero) + '">Ver detalle</button></td>' +
        '</tr>';
    }).join('');
  }

  function abrirDetalle(numero) {
    var p = pedidos.find(function (x) { return x.numero === numero; });
    if (!p) return;
    var esDelivery = p.entrega.tipo === 'delivery';

    document.getElementById('ventana-pedido-titulo').textContent = 'Pedido ' + p.numero;

    var lineas = p.lineas.map(function (l) {
      return '<li><span>' + l.cantidad + ' × ' + LV.escapar(l.nombre) + '</span><span>' + LV.moneda(l.subtotal) + '</span></li>';
    }).join('');

    var opcionesEstado = Panel.ESTADOS.filter(function (e) {
      return esDelivery || SOLO_DELIVERY.indexOf(e.id) === -1;
    }).map(function (e) {
      return '<option value="' + e.id + '"' + (e.id === p.estado ? ' selected' : '') + '>' + e.texto + '</option>';
    }).join('');

    var opcionesRepartidor = '<option value="">Elige un repartidor</option>' + repartidores.map(function (u) {
      return '<option value="' + LV.escapar(u.usuario) + '"' + (u.usuario === p.repartidor ? ' selected' : '') + '>' +
        LV.escapar(u.nombre) + '</option>';
    }).join('');

    var pago = Panel.METODOS[p.pago.metodo] +
      (p.pago.operacion ? ' (operación ' + LV.escapar(p.pago.operacion) + ')' : '') +
      (p.pago.metodo === 'efectivo' && p.pago.pagaCon ? ' · paga con ' + LV.moneda(p.pago.pagaCon) +
        ', vuelto ' + LV.moneda(p.pago.pagaCon - p.total) : '');

    var historial = p.historial.length ? '<h3>Historial de cambios</h3><ul class="historial">' +
      p.historial.map(function (h) {
        var f = new Date(h.fecha);
        return '<li>' + Panel.fechaCorta(f) + ' ' + Panel.hora(f) + ': ' + Panel.textoEstado(h.estado) +
          (h.usuario ? ' (' + LV.escapar(h.usuario) + ')' : '') + '</li>';
      }).join('') + '</ul>' : '';

    cuerpoVentana.innerHTML =
      '<p>' + Panel.etiquetaEstado(p.estado) + (p.origen === 'web' ? ' <span class="chip-rol">Hecho en la web</span>' : '') + '</p>' +
      '<ul class="lista-datos">' +
      '<li><strong>Cliente:</strong> ' + LV.escapar(p.cliente.nombre) + '</li>' +
      '<li><strong>Celular:</strong> <a href="tel:+51' + LV.escapar(p.cliente.telefono) + '">' + LV.escapar(p.cliente.telefono) + '</a></li>' +
      '<li><strong>Fecha:</strong> ' + Panel.fechaCorta(p.fecha) + ' ' + Panel.hora(p.fecha) + '</li>' +
      '<li><strong>Entrega:</strong> ' + (esDelivery
        ? 'Delivery a ' + LV.escapar(p.entrega.direccion) + ' (' + LV.escapar(p.entrega.zona) + ')' +
          (p.entrega.referencia ? '. Referencia: ' + LV.escapar(p.entrega.referencia) : '')
        : 'Recojo en tienda') + '</li>' +
      '<li><strong>Pago:</strong> ' + pago + '</li>' +
      '</ul>' +
      '<h3>Productos</h3>' +
      '<div class="resumen">' +
      '<ul class="resumen__lista">' + lineas + '</ul>' +
      '<div class="resumen__fila"><span>Subtotal</span><span>' + LV.moneda(p.subtotal) + '</span></div>' +
      '<div class="resumen__fila"><span>Envío</span><span>' + (p.envio ? LV.moneda(p.envio) : 'Gratis') + '</span></div>' +
      '<div class="resumen__fila resumen__fila--total"><span>Total</span><span>' + LV.moneda(p.total) + '</span></div>' +
      '</div>' +
      '<h3>Cambiar estado</h3>' +
      '<form id="form-estado" novalidate>' +
      '<div class="campo"><label for="nuevo-estado">Nuevo estado</label>' +
      '<select id="nuevo-estado">' + opcionesEstado + '</select></div>' +
      (esDelivery
        ? '<div class="campo" id="campo-repartidor"><label for="repartidor">Repartidor</label>' +
          '<select id="repartidor" aria-describedby="error-repartidor">' + opcionesRepartidor + '</select>' +
          '<span class="mensaje-error" id="error-repartidor"></span></div>'
        : '') +
      '<p class="aviso aviso--exito oculto" id="mensaje-estado" role="status"></p>' +
      '<div class="ventana__acciones">' +
      '<button type="submit" class="btn btn--principal">Guardar estado</button>' +
      '<button type="button" class="btn btn--borde" data-cerrar>Cerrar</button>' +
      '</div></form>' + historial;

    var selectEstado = document.getElementById('nuevo-estado');
    var campoRepartidor = document.getElementById('campo-repartidor');

    // El repartidor solo se pide para "Asignado" y "En camino"
    function mostrarRepartidor() {
      if (campoRepartidor) campoRepartidor.classList.toggle('oculto', SOLO_DELIVERY.indexOf(selectEstado.value) === -1);
    }
    selectEstado.addEventListener('change', mostrarRepartidor);
    mostrarRepartidor();

    document.getElementById('form-estado').addEventListener('submit', function (e) {
      e.preventDefault();
      var estado = selectEstado.value;
      var repartidor;
      if (campoRepartidor && SOLO_DELIVERY.indexOf(estado) !== -1) {
        var select = document.getElementById('repartidor');
        repartidor = select.value;
        var error = repartidor ? '' : 'Elige el repartidor que llevará el pedido.';
        document.getElementById('error-repartidor').textContent = error;
        campoRepartidor.classList.toggle('campo--error', !!error);
        select.setAttribute('aria-invalid', error ? 'true' : 'false');
        if (error) { select.focus(); return; }
      }
      Panel.cambiarEstado(p, estado, repartidor);
      pintarTabla();
      abrirDetalle(p.numero);
      var mensaje = document.getElementById('mensaje-estado');
      mensaje.textContent = 'Estado actualizado a "' + Panel.textoEstado(estado) + '".';
      mensaje.classList.remove('oculto');
    });

    if (!ventana.open) ventana.showModal();
  }
})();
