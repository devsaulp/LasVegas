/*
  carrito-pagina.js
  Página del carrito: cambiar cantidades, quitar productos, vaciar,
  y ver subtotal y total. El costo de envío se calcula en el pedido.
*/
(function () {
  var contenedor = document.getElementById('contenido-carrito');
  var avisos = document.getElementById('avisos-carrito');
  var datos = null;

  LV.cargarTodo().then(function (d) {
    datos = d;
    pintar(true);

    contenedor.addEventListener('click', function (e) {
      var boton = e.target.closest('button');
      if (!boton) return;
      var id = boton.getAttribute('data-id');

      if (boton.hasAttribute('data-paso')) {
        var actual = parseInt(contenedor.querySelector('input[data-id="' + id + '"]').value, 10) || 1;
        Carrito.cambiarCantidad(datos, id, actual + parseInt(boton.getAttribute('data-paso'), 10));
        pintar(false, id);
      } else if (boton.hasAttribute('data-quitar')) {
        Carrito.quitar(id);
        LV.mostrarToast('Producto quitado del carrito.');
        pintar(false);
      } else if (boton.id === 'btn-vaciar') {
        if (window.confirm('¿Seguro que quieres vaciar el carrito?')) {
          Carrito.vaciar();
          pintar(false);
        }
      }
    });

    contenedor.addEventListener('change', function (e) {
      var input = e.target.closest('input[data-id]');
      if (!input) return;
      var id = input.getAttribute('data-id');
      Carrito.cambiarCantidad(datos, id, parseInt(input.value, 10) || 1);
      pintar(false, id);
    });
  }).catch(function () {
    LV.mostrarErrorCarga(contenedor);
  });

  // Vuelve a dibujar el carrito; "enfocar" devuelve el foco al artículo editado
  function pintar(mostrarAvisos, enfocar) {
    var info = Carrito.detalle(datos);

    if (mostrarAvisos && info.avisos.length) {
      avisos.innerHTML = '<div class="aviso aviso--alerta">' +
        info.avisos.map(function (a) { return '<p>' + LV.escapar(a) + '</p>'; }).join('') + '</div>';
    }

    if (!info.lineas.length) {
      contenedor.innerHTML = '<div class="vacio"><h2>Tu carrito está vacío</h2>' +
        '<p>Agrega productos desde el catálogo o las promociones.</p>' +
        '<a class="btn btn--principal" href="catalogo.html">Ir al catálogo</a></div>';
      return;
    }

    var filas = info.lineas.map(function (l) {
      var enlace = l.tipo === 'producto' ? 'producto.html?id=' + l.id : 'promociones.html';
      return '<li class="item-carrito">' +
        '<img src="' + l.imagen + '" alt="" width="72" height="72">' +
        '<div class="item-carrito__info">' +
        '<h3><a href="' + enlace + '">' + LV.escapar(l.nombre) + '</a></h3>' +
        '<p>' + LV.escapar(l.detalle) + ' · ' + LV.moneda(l.precio) + ' c/u</p>' +
        '<div class="item-carrito__acciones">' +
        '<div class="cantidad">' +
        '<button type="button" data-id="' + l.id + '" data-paso="-1" aria-label="Quitar una unidad de ' + LV.escapar(l.nombre) + '"' + (l.cantidad <= 1 ? ' disabled' : '') + '>−</button>' +
        '<input type="number" data-id="' + l.id + '" value="' + l.cantidad + '" min="1" max="' + l.maximo + '" inputmode="numeric" aria-label="Cantidad de ' + LV.escapar(l.nombre) + '">' +
        '<button type="button" data-id="' + l.id + '" data-paso="1" aria-label="Agregar una unidad de ' + LV.escapar(l.nombre) + '"' + (l.cantidad >= l.maximo ? ' disabled' : '') + '>+</button>' +
        '</div>' +
        '<span class="item-carrito__subtotal">' + LV.moneda(l.subtotal) + '</span>' +
        '</div>' +
        '<button type="button" class="btn-texto" data-id="' + l.id + '" data-quitar>Quitar</button>' +
        '</div></li>';
    }).join('');

    var unidades = info.lineas.reduce(function (s, l) { return s + l.cantidad; }, 0);

    contenedor.innerHTML =
      '<div class="diseno-carrito">' +
      '<div><ul class="lista-carrito">' + filas + '</ul>' +
      '<button type="button" class="btn-texto" id="btn-vaciar">Vaciar carrito</button></div>' +
      '<aside class="resumen" aria-labelledby="titulo-resumen">' +
      '<h2 id="titulo-resumen">Resumen</h2>' +
      '<div class="resumen__fila"><span>Subtotal (' + unidades + (unidades === 1 ? ' unidad' : ' unidades') + ')</span><span>' + LV.moneda(info.subtotal) + '</span></div>' +
      '<div class="resumen__fila"><span>Envío</span><span>Se calcula en el pedido</span></div>' +
      '<div class="resumen__fila resumen__fila--total"><span>Total</span><span>' + LV.moneda(info.subtotal) + '</span></div>' +
      '<a class="btn btn--principal btn--bloque" href="pedido.html">Continuar con el pedido</a>' +
      '<a class="btn btn--borde btn--bloque" href="catalogo.html">Seguir comprando</a>' +
      '</aside></div>';

    if (enfocar) {
      var input = contenedor.querySelector('input[data-id="' + enfocar + '"]');
      if (input) input.focus();
    }
  }
})();
