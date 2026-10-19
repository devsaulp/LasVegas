/*
  tablero.js
  Resumen del día: pedidos de hoy, pendientes de pago, en camino y
  ventas del día, más la lista de los últimos pedidos.
*/
(function () {
  var sesion = Sesion.leer();
  if (!sesion) return;

  document.getElementById('saludo').textContent =
    'Hola, ' + sesion.nombre + '. Resumen de hoy, ' + Panel.fechaCorta(new Date()) + '.';

  var contTarjetas = document.getElementById('tarjetas-resumen');
  var contUltimos = document.getElementById('ultimos-pedidos');

  Panel.cargarPedidos().then(function (pedidos) {
    var deHoy = pedidos.filter(function (p) { return Panel.esHoy(p.fecha); });
    var pendientes = pedidos.filter(function (p) { return p.estado === 'pendiente_pago'; });
    var enCamino = pedidos.filter(function (p) { return p.estado === 'en_camino'; });
    var ventas = deHoy
      .filter(function (p) { return p.estado !== 'cancelado'; })
      .reduce(function (s, p) { return s + p.total; }, 0);

    contTarjetas.innerHTML =
      tarjeta('Pedidos de hoy', deHoy.length, 'Recibidos desde las 00:00', '') +
      tarjeta('Pendientes de pago', pendientes.length, 'Por verificar o cobrar', 'aviso') +
      tarjeta('En camino', enCamino.length, 'Con el repartidor', 'camino') +
      tarjeta('Ventas del día', LV.moneda(ventas), 'Sin pedidos cancelados', 'exito');

    var ultimos = pedidos.slice(0, 6);
    contUltimos.innerHTML = ultimos.length ? ultimos.map(function (p) {
      return '<li>' +
        '<span class="numero">' + LV.escapar(p.numero) + '</span>' +
        '<span class="monto">' + LV.moneda(p.total) + '</span>' +
        '<span class="lista-pedidos__cliente">' + LV.escapar(p.cliente.nombre) + ' · ' + Panel.textoTipo(p) + ' · ' +
        (Panel.esHoy(p.fecha) ? Panel.hora(p.fecha) : Panel.fechaCorta(p.fecha)) + '</span>' +
        Panel.etiquetaEstado(p.estado) +
        '</li>';
    }).join('') : '<li>Todavía no hay pedidos.</li>';
  }).catch(function () {
    contTarjetas.innerHTML = '<div class="aviso aviso--error"><p>No se pudieron cargar los pedidos.</p></div>';
  });

  function tarjeta(titulo, valor, nota, variante) {
    return '<article class="tarjeta-dato' + (variante ? ' tarjeta-dato--' + variante : '') + '">' +
      '<h2 class="tarjeta-dato__titulo">' + titulo + '</h2>' +
      '<p class="tarjeta-dato__valor">' + valor + '</p>' +
      '<p class="tarjeta-dato__nota">' + nota + '</p></article>';
  }
})();
