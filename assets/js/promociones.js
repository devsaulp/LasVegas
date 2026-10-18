/*
  promociones.js
  Muestra todas las promociones y combos vigentes.
  Los combos se pueden agregar directamente al carrito.
*/
(function () {
  var contPromos = document.getElementById('lista-promociones');
  var contCombos = document.getElementById('lista-combos');

  LV.cargarTodo().then(function (datos) {
    contPromos.innerHTML = datos.promociones.map(function (pr) {
      return LV.tarjetaPromo(datos, pr);
    }).join('');

    contCombos.innerHTML = datos.combos.map(function (c) {
      return LV.tarjetaCombo(datos, c);
    }).join('');
    LV.activarBotonesAgregar(contCombos, datos);
  }).catch(function () {
    LV.mostrarErrorCarga(contPromos);
  });
})();
