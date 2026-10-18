/*
  delivery-contacto.js
  Zonas y tarifas (desde datos/zonas.json) y datos de contacto
  (desde assets/js/negocio.js).
*/
(function () {
  var n = window.NEGOCIO;

  document.getElementById('horario-delivery').textContent = 'Horario de delivery: ' + n.horarioDelivery + '.';

  document.getElementById('lista-horarios').innerHTML = n.horarios.map(function (h) {
    return '<li><strong>' + LV.escapar(h.dias) + ':</strong> ' + LV.escapar(h.horas) + '</li>';
  }).join('');

  document.getElementById('lista-contacto').innerHTML =
    '<li><strong>Dirección:</strong> ' + LV.escapar(n.direccion) + '</li>' +
    '<li><strong>Referencia:</strong> ' + LV.escapar(n.referencia) + '</li>' +
    '<li><strong>Teléfono:</strong> <a href="tel:+51' + n.telefono.replace(/\s/g, '') + '">' + LV.escapar(n.telefono) + '</a></li>' +
    '<li><strong>WhatsApp:</strong> ' + LV.escapar(n.telefono) + '</li>' +
    '<li><strong>Yape:</strong> ' + LV.escapar(n.yape.numero) + '</li>' +
    '<li><strong>Correo:</strong> ' + LV.escapar(n.correo) + '</li>';

  document.getElementById('btn-whatsapp').href = 'https://wa.me/51' + n.whatsapp +
    '?text=' + encodeURIComponent('Hola, quisiera hacer una consulta.');

  var tabla = document.getElementById('tabla-zonas');
  LV.cargarJSON('zonas.json').then(function (d) {
    tabla.innerHTML = d.zonas.map(function (z) {
      return '<tr>' +
        '<td data-titulo="Zona"><strong>' + LV.escapar(z.nombre) + '</strong></td>' +
        '<td data-titulo="Tarifa">' + LV.moneda(z.tarifa) + '</td>' +
        '<td data-titulo="Pedido mínimo">' + LV.moneda(z.pedido_minimo) + '</td>' +
        '<td data-titulo="Envío gratis desde">' + LV.moneda(z.envio_gratis_desde) + '</td>' +
        '<td data-titulo="Tiempo estimado">' + LV.escapar(z.tiempo_estimado) + '</td>' +
        '</tr>';
    }).join('');
  }).catch(function () {
    tabla.innerHTML = '<tr><td colspan="5">No pudimos cargar las zonas.</td></tr>';
  });
})();
