/*
  confirmacion.js
  Muestra el número de pedido, el resumen y las instrucciones de pago.
  El pedido se lee de este navegador (no hay servidor en esta versión).
*/
(function () {
  var contenedor = document.getElementById('contenido-confirmacion');
  var numero = LV.parametro('pedido');
  var n = window.NEGOCIO;
  var pedido = null;

  try {
    var pedidos = JSON.parse(localStorage.getItem('lv_pedidos') || '[]');
    pedido = pedidos.find(function (p) { return p.numero === numero; }) || null;
  } catch (e) { /* sin almacenamiento */ }

  if (!pedido) {
    contenedor.innerHTML = '<div class="vacio"><h1>No encontramos el pedido</h1>' +
      '<p>Revisa el enlace o vuelve a hacer tu pedido desde el carrito.</p>' +
      '<a class="btn btn--principal" href="catalogo.html">Ir al catálogo</a></div>';
    return;
  }

  var esDelivery = pedido.entrega.tipo === 'delivery';
  var metodo = { efectivo: 'Efectivo', yape: 'Yape', transferencia: 'Transferencia bancaria' }[pedido.pago.metodo];

  // Pasos a seguir según el método de pago
  var pasos = [];
  if (pedido.pago.metodo === 'efectivo') {
    pasos.push('Te llamaremos o escribiremos al ' + pedido.cliente.telefono + ' para confirmar tu pedido.');
    pasos.push(esDelivery
      ? 'Paga ' + LV.moneda(pedido.total) + ' en efectivo al repartidor. Llevaremos vuelto de ' +
        LV.moneda(pedido.pago.pagaCon) + ': ' + LV.moneda(pedido.pago.pagaCon - pedido.total) + '.'
      : 'Paga ' + LV.moneda(pedido.total) + ' en efectivo al recoger tu pedido.');
  } else {
    var destino = pedido.pago.metodo === 'yape'
      ? 'por Yape al ' + n.yape.numero + ' (' + n.yape.titular + ')'
      : 'por transferencia a ' + n.transferencia.banco + ', cuenta ' + n.transferencia.cuenta + ' (CCI ' + n.transferencia.cci + ')';
    pasos.push('Si aún no lo hiciste, paga ' + LV.moneda(pedido.total) + ' ' + destino + '.');
    pasos.push('Registramos tu número de operación ' + pedido.pago.operacion + '. Nuestro personal verificará el pago.');
    pasos.push('El pago debe hacerse dentro de 30 minutos; si no se verifica, el pedido se cancela.');
    pasos.push('Cuando confirmemos el pago te avisaremos al ' + pedido.cliente.telefono + '.');
  }
  pasos.push(esDelivery
    ? 'Al recibir, muestra tu documento de identidad. Si no se verifica la mayoría de edad, el pedido no se entrega.'
    : 'Recoge tu pedido en ' + n.direccion + ' con tu documento de identidad y tu número de pedido.');

  var lineas = pedido.lineas.map(function (l) {
    return '<li><span>' + l.cantidad + ' × ' + LV.escapar(l.nombre) + '</span><span>' + LV.moneda(l.subtotal) + '</span></li>';
  }).join('');

  var mensajeWhatsApp = encodeURIComponent('Hola, hice el pedido ' + pedido.numero + ' por la web.');

  contenedor.innerHTML =
    '<section class="confirmacion" aria-labelledby="titulo-confirmacion">' +
    '<h1 id="titulo-confirmacion">¡Gracias, ' + LV.escapar(pedido.cliente.nombre.split(' ')[0]) + '! Recibimos tu pedido</h1>' +
    '<p>Tu número de pedido es:</p>' +
    '<p class="numero-pedido">' + LV.escapar(pedido.numero) + '</p>' +
    '<p>Estado: <span class="estado estado--pocas">Pendiente de confirmación</span></p>' +
    '<h2>Qué sigue</h2>' +
    '<ol class="pasos">' + pasos.map(function (p) { return '<li>' + LV.escapar(p) + '</li>'; }).join('') + '</ol>' +
    '<h2>Resumen</h2>' +
    '<div class="resumen">' +
    '<ul class="resumen__lista">' + lineas + '</ul>' +
    '<div class="resumen__fila"><span>Subtotal</span><span>' + LV.moneda(pedido.subtotal) + '</span></div>' +
    '<div class="resumen__fila"><span>Envío</span><span>' + (pedido.envio ? LV.moneda(pedido.envio) : 'Gratis') + '</span></div>' +
    '<div class="resumen__fila resumen__fila--total"><span>Total</span><span>' + LV.moneda(pedido.total) + '</span></div>' +
    '</div>' +
    '<ul class="lista-datos">' +
    '<li><strong>Entrega:</strong> ' + (esDelivery
      ? 'Delivery a ' + LV.escapar(pedido.entrega.direccion) + ' (' + LV.escapar(pedido.entrega.zona) + ')'
      : 'Recojo en tienda') + '</li>' +
    '<li><strong>Pago:</strong> ' + metodo + '</li>' +
    '<li><strong>Celular:</strong> ' + LV.escapar(pedido.cliente.telefono) + '</li>' +
    '</ul>' +
    '<p class="aviso aviso--info">Versión de demostración: el pedido se guarda solo en este navegador y no llega a la tienda.</p>' +
    '<div class="banner__acciones">' +
    '<a class="btn btn--principal" href="https://wa.me/51' + n.whatsapp + '?text=' + mensajeWhatsApp + '" target="_blank" rel="noopener">Avisar por WhatsApp</a>' +
    '<a class="btn btn--secundario" href="../index.html">Volver al inicio</a>' +
    '</div></section>';
})();
