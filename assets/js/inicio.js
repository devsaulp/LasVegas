/*
  inicio.js
  Página de inicio: categorías (cervezas y licores primero),
  productos destacados y promociones vigentes.
*/
(function () {
  var contCategorias = document.getElementById('lista-categorias');
  var contDestacados = document.getElementById('lista-destacados');
  var contPromos = document.getElementById('lista-promos');

  LV.cargarTodo().then(function (datos) {
    // Categorías ordenadas por "orden": las principales van primero
    contCategorias.innerHTML = datos.categorias.map(function (c) {
      return '<a class="tarjeta-categoria' + (c.principal ? ' tarjeta-categoria--principal' : '') + '" ' +
        'href="paginas/catalogo.html?categoria=' + encodeURIComponent(c.id) + '">' +
        '<img src="' + LV.imagenCategoria(c.id) + '" alt="" width="64" height="64">' +
        '<span>' + LV.escapar(c.nombre) + '</span></a>';
    }).join('');

    // Solo los productos marcados como destacados
    var destacados = datos.productos.filter(function (p) { return p.destacado; });
    contDestacados.innerHTML = destacados.map(function (p) {
      return LV.tarjetaProducto(datos, p);
    }).join('');
    LV.activarBotonesAgregar(contDestacados, datos);

    // Promociones y combos
    contPromos.innerHTML =
      datos.promociones.slice(0, 2).map(function (pr) { return LV.tarjetaPromo(datos, pr); }).join('') +
      datos.combos.slice(0, 1).map(function (c) { return LV.tarjetaCombo(datos, c); }).join('');
    LV.activarBotonesAgregar(contPromos, datos);
  }).catch(function () {
    LV.mostrarErrorCarga(contDestacados);
  });
})();
