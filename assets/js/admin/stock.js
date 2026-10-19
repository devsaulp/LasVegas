/*
  stock.js
  Stock actual y mínimo de cada producto. Los que están bajo el mínimo
  se resaltan en color de aviso y los agotados en color de error.
*/
(function () {
  var tabla = document.getElementById('tabla-stock');
  var casilla = document.getElementById('solo-bajos');
  var resumen = document.getElementById('resumen-stock');
  var datos = null;

  LV.cargarJSON('productos.json').then(function (d) {
    datos = d;
    pintar();
  }).catch(function () {
    tabla.innerHTML = '<tr><td colspan="5">No se pudo cargar el stock.</td></tr>';
  });

  casilla.addEventListener('change', pintar);

  // Situación de un producto según su stock
  function situacion(p) {
    if (p.stock <= 0) return { clase: 'fila-agotado', texto: '<span class="texto-error">Agotado</span>', baja: true };
    if (p.stock < p.stock_minimo) return { clase: 'fila-aviso', texto: '<span class="texto-aviso">Bajo el mínimo</span>', baja: true };
    return { clase: '', texto: 'Correcto', baja: false };
  }

  function pintar() {
    var orden = {};
    datos.categorias.forEach(function (c) { orden[c.id] = c.orden; });

    var conSituacion = datos.productos.map(function (p) { return { p: p, s: situacion(p) }; });
    var bajos = conSituacion.filter(function (x) { return x.s.baja; });
    var agotados = bajos.filter(function (x) { return x.p.stock <= 0; }).length;

    resumen.textContent = (bajos.length - agotados) + ' bajo el mínimo y ' + agotados +
      (agotados === 1 ? ' agotado' : ' agotados') + ' de ' + datos.productos.length + ' productos.';

    // Primero los que necesitan reposición
    var lista = (casilla.checked ? bajos : conSituacion).slice().sort(function (a, b) {
      return (b.s.baja - a.s.baja) || (orden[a.p.categoria] - orden[b.p.categoria]);
    });

    if (!lista.length) {
      tabla.innerHTML = '<tr><td colspan="5">Ningún producto está bajo el mínimo.</td></tr>';
      return;
    }

    tabla.innerHTML = lista.map(function (x) {
      var p = x.p;
      return '<tr class="' + x.s.clase + '">' +
        '<td data-titulo="Producto"><strong>' + LV.escapar(p.nombre) + '</strong></td>' +
        '<td data-titulo="Categoría">' + LV.escapar(LV.nombreCategoria(datos, p.categoria)) + '</td>' +
        '<td data-titulo="Stock actual">' + p.stock + '</td>' +
        '<td data-titulo="Stock mínimo">' + p.stock_minimo + '</td>' +
        '<td data-titulo="Situación">' + x.s.texto + '</td>' +
        '</tr>';
    }).join('');
  }
})();
