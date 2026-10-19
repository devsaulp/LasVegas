/*
  reportes.js
  Ventas por día (últimos 7 días) y productos más vendidos, calculados
  con los pedidos de ejemplo. Las barras se dibujan solo con CSS: el
  ancho de cada barra va en la variable --valor.
*/
(function () {
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  Panel.cargarPedidos().then(function (pedidos) {
    // Desde las 00:00 de hace 6 días hasta hoy
    var desde = new Date();
    desde.setHours(0, 0, 0, 0);
    desde.setDate(desde.getDate() - 6);

    var semana = pedidos.filter(function (p) { return p.fecha >= desde; });
    var validos = semana.filter(function (p) { return p.estado !== 'cancelado'; });
    var cancelados = semana.length - validos.length;
    var total = validos.reduce(function (s, p) { return s + p.total; }, 0);

    document.getElementById('resumen-reportes').innerHTML =
      tarjeta('Ventas de 7 días', LV.moneda(total), '', 'exito') +
      tarjeta('Pedidos', validos.length, 'Sin contar cancelados', '') +
      tarjeta('Ticket promedio', LV.moneda(validos.length ? total / validos.length : 0), 'Venta media por pedido', 'camino') +
      tarjeta('Cancelados', cancelados, 'En los últimos 7 días', 'aviso');

    // Ventas por día, del más antiguo al de hoy
    var dias = [];
    for (var i = 0; i < 7; i++) {
      var dia = new Date(desde);
      dia.setDate(desde.getDate() + i);
      dias.push({ fecha: dia, monto: 0, pedidos: 0 });
    }
    validos.forEach(function (p) {
      var indice = Math.round((new Date(p.fecha).setHours(0, 0, 0, 0) - desde) / 86400000);
      if (dias[indice]) {
        dias[indice].monto += p.total;
        dias[indice].pedidos += 1;
      }
    });
    var maxDia = Math.max.apply(null, dias.map(function (d) { return d.monto; })) || 1;

    document.getElementById('grafico-dias').innerHTML = dias.map(function (d, i) {
      var nombre = i === 6 ? 'Hoy' : DIAS[d.fecha.getDay()] + ' ' + Panel.fechaCorta(d.fecha).slice(0, 5);
      return barra(nombre + ' (' + d.pedidos + (d.pedidos === 1 ? ' pedido' : ' pedidos') + ')', LV.moneda(d.monto), d.monto / maxDia);
    }).join('');

    // Productos más vendidos por unidades
    var porProducto = {};
    validos.forEach(function (p) {
      p.lineas.forEach(function (l) {
        if (!porProducto[l.id]) porProducto[l.id] = { nombre: l.nombre, unidades: 0, monto: 0 };
        porProducto[l.id].unidades += l.cantidad;
        porProducto[l.id].monto += l.subtotal;
      });
    });
    var top = Object.keys(porProducto).map(function (k) { return porProducto[k]; })
      .sort(function (a, b) { return b.unidades - a.unidades || b.monto - a.monto; })
      .slice(0, 6);
    var maxUnidades = top.length ? top[0].unidades : 1;

    document.getElementById('grafico-productos').innerHTML = top.length ? top.map(function (x) {
      return barra(x.nombre, x.unidades + ' u. · ' + LV.moneda(x.monto), x.unidades / maxUnidades);
    }).join('') : '<li>Sin ventas en estos días.</li>';
  }).catch(function () {
    document.getElementById('resumen-reportes').innerHTML =
      '<div class="aviso aviso--error"><p>No se pudieron cargar los pedidos.</p></div>';
  });

  function barra(etiqueta, valor, proporcion) {
    var porcentaje = Math.max(2, Math.round(proporcion * 100));
    return '<li class="grafico__fila">' +
      '<div class="grafico__etiqueta"><span>' + LV.escapar(etiqueta) + '</span><span>' + valor + '</span></div>' +
      '<div class="grafico__barra" aria-hidden="true"><div class="grafico__relleno" style="--valor: ' + porcentaje + '%"></div></div>' +
      '</li>';
  }

  function tarjeta(titulo, valor, nota, variante) {
    return '<article class="tarjeta-dato' + (variante ? ' tarjeta-dato--' + variante : '') + '">' +
      '<h2 class="tarjeta-dato__titulo">' + titulo + '</h2>' +
      '<p class="tarjeta-dato__valor">' + valor + '</p>' +
      (nota ? '<p class="tarjeta-dato__nota">' + nota + '</p>' : '') + '</article>';
  }
})();
