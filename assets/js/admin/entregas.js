/*
  entregas.js
  Vista del repartidor: sus entregas asignadas con dirección, teléfono
  y monto a cobrar. "Salí" pasa el pedido a En camino y "Entregué" a
  Entregado (previa verificación del documento de identidad).
*/
(function () {
  var sesion = Sesion.leer();
  if (!sesion) return;

  var contPendientes = document.getElementById('entregas-pendientes');
  var contHechas = document.getElementById('entregas-hechas');
  var resumen = document.getElementById('resumen-entregas');
  var pedidos = [];

  Panel.cargarPedidos().then(function (lista) {
    pedidos = lista.filter(function (p) {
      return p.entrega.tipo === 'delivery' && p.repartidor === sesion.usuario;
    });
    pintar();
  }).catch(function () {
    contPendientes.innerHTML = '<div class="aviso aviso--error"><p>No se pudieron cargar las entregas.</p></div>';
  });

  document.querySelector('main').addEventListener('click', function (e) {
    var boton = e.target.closest('[data-accion]');
    if (!boton) return;
    var p = pedidos.find(function (x) { return x.numero === boton.getAttribute('data-numero'); });
    if (!p) return;

    if (boton.getAttribute('data-accion') === 'sali') {
      Panel.cambiarEstado(p, 'en_camino');
      LV.mostrarToast('Pedido ' + p.numero + ' en camino.');
    } else {
      var ok = window.confirm('¿Verificaste el documento de identidad y que la persona es mayor de 18 años?' +
        (Panel.montoACobrar(p) ? '\n\nCobra ' + LV.moneda(Panel.montoACobrar(p)) + ' en efectivo.' : ''));
      if (!ok) return;
      Panel.cambiarEstado(p, 'entregado');
      LV.mostrarToast('Pedido ' + p.numero + ' entregado.');
    }
    pintar();
  });

  function pintar() {
    var porEntregar = pedidos.filter(function (p) { return p.estado === 'asignado' || p.estado === 'en_camino'; })
      .sort(function (a, b) { return a.fecha - b.fecha; });
    var hechas = pedidos.filter(function (p) { return p.estado === 'entregado' && Panel.esHoy(p.fecha); });
    var porCobrar = porEntregar.reduce(function (s, p) { return s + Panel.montoACobrar(p); }, 0);

    resumen.textContent = porEntregar.length + (porEntregar.length === 1 ? ' entrega pendiente' : ' entregas pendientes') +
      '. Efectivo por cobrar: ' + LV.moneda(porCobrar) + '.';

    contPendientes.innerHTML = porEntregar.length
      ? porEntregar.map(tarjeta).join('')
      : '<div class="vacio"><p>No tienes entregas pendientes.</p></div>';

    contHechas.innerHTML = hechas.length
      ? hechas.map(tarjeta).join('')
      : '<p>Todavía no hay entregas completadas hoy.</p>';
  }

  function tarjeta(p) {
    var cobro = Panel.montoACobrar(p);
    var vuelto = cobro && p.pago.pagaCon ? ' (paga con ' + LV.moneda(p.pago.pagaCon) + ', lleva vuelto de ' +
      LV.moneda(p.pago.pagaCon - p.total) + ')' : '';
    var botones = '';
    if (p.estado !== 'entregado') {
      botones = '<div class="tarjeta-entrega__botones">' +
        '<button type="button" class="btn btn--secundario" data-accion="sali" data-numero="' + p.numero + '"' +
        (p.estado === 'asignado' ? '' : ' disabled') + '>Salí</button>' +
        '<button type="button" class="btn btn--principal" data-accion="entregue" data-numero="' + p.numero + '"' +
        (p.estado === 'en_camino' ? '' : ' disabled') + '>Entregué</button>' +
        '</div>';
    }
    return '<article class="tarjeta-entrega tarjeta-entrega--' + p.estado + '">' +
      '<div class="tarjeta-entrega__cabecera">' +
      '<h3>' + LV.escapar(p.numero) + '</h3>' + Panel.etiquetaEstado(p.estado) +
      '</div>' +
      '<ul class="lista-datos">' +
      '<li><strong>Cliente:</strong> ' + LV.escapar(p.cliente.nombre) + '</li>' +
      '<li><strong>Dirección:</strong> ' + LV.escapar(p.entrega.direccion) + ', ' + LV.escapar(p.entrega.zona) +
      (p.entrega.referencia ? '. ' + LV.escapar(p.entrega.referencia) : '') + '</li>' +
      '<li><strong>Teléfono:</strong> <a href="tel:+51' + LV.escapar(p.cliente.telefono) + '">' + LV.escapar(p.cliente.telefono) + '</a></li>' +
      '<li><strong>Productos:</strong> ' + p.lineas.map(function (l) {
        return l.cantidad + ' × ' + LV.escapar(l.nombre);
      }).join(', ') + '</li>' +
      '</ul>' +
      '<p><strong>Monto a cobrar:</strong> <span class="cobro">' + LV.moneda(cobro) + '</span>' +
      (cobro ? vuelto : ' (ya pagado con ' + Panel.METODOS[p.pago.metodo] + ')') + '</p>' +
      botones +
      '</article>';
  }
})();
