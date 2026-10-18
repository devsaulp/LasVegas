/*
  producto.js
  Ficha de un producto: foto, descripción, precio (con promoción si aplica),
  disponibilidad, selector de cantidad y botón "Agregar al carrito".
  Un producto agotado no se puede agregar.
*/
(function () {
  var contenedor = document.getElementById('detalle-producto');
  var migas = document.getElementById('migas');
  var id = LV.parametro('id');

  LV.cargarTodo().then(function (datos) {
    var p = LV.buscarProducto(datos, id);
    if (!p) {
      document.title = 'Producto no encontrado | Licorería Las Vegas';
      contenedor.innerHTML = '<div class="vacio"><h1>Producto no encontrado</h1>' +
        '<p>El producto que buscas no existe o ya no está disponible.</p>' +
        '<a class="btn btn--principal" href="catalogo.html">Ir al catálogo</a></div>';
      return;
    }

    document.title = p.nombre + ' | Licorería Las Vegas';
    var categoria = LV.nombreCategoria(datos, p.categoria);
    migas.innerHTML += ' / <a href="catalogo.html?categoria=' + p.categoria + '">' + LV.escapar(categoria) + '</a>';

    var estado = LV.estadoStock(p.stock, p.stock_minimo);
    var promo = LV.promoDeProducto(datos, p.id);
    var precio = LV.precioProducto(datos, p);
    var maximo = LV.cantidadMaxima(p.stock);
    var agotado = estado.clase === 'agotado';

    contenedor.innerHTML =
      '<article class="detalle">' +
      '<div class="detalle__imagen"><img src="' + LV.imagenCategoria(p.categoria) + '" ' +
      'alt="Imagen referencial de ' + LV.escapar(categoria) + '" width="420" height="462"></div>' +
      '<div class="detalle__info">' +
      (promo ? '<span class="etiqueta-oferta">' + LV.escapar(promo.titulo) + '</span>' : '') +
      '<h1>' + LV.escapar(p.nombre) + '</h1>' +
      '<p><span class="precio">' + LV.moneda(precio) + '</span>' +
      (promo ? '<span class="precio--tachado"><span class="oculto-visual">Precio normal </span>' + LV.moneda(p.precio) + '</span>' : '') + '</p>' +
      LV.etiquetaEstado(estado) +
      '<p>' + LV.escapar(p.descripcion) + '</p>' +
      '<dl class="detalle__datos">' +
      '<dt>Marca</dt><dd>' + LV.escapar(p.marca) + '</dd>' +
      '<dt>Presentación</dt><dd>' + LV.escapar(p.presentacion) + '</dd>' +
      '<dt>Categoría</dt><dd>' + LV.escapar(categoria) + '</dd>' +
      '</dl>' +
      (agotado
        ? '<div class="aviso aviso--error"><p>Este producto está agotado por ahora. Revisa otros productos de la misma categoría.</p></div>' +
          '<button type="button" class="btn btn--bloque" disabled>Agotado</button>'
        : '<div class="detalle__compra">' +
          '<label for="cantidad" class="oculto-visual">Cantidad</label>' +
          '<div class="cantidad">' +
          '<button type="button" data-paso="-1" aria-label="Quitar una unidad">−</button>' +
          '<input type="number" id="cantidad" value="1" min="1" max="' + maximo + '" inputmode="numeric">' +
          '<button type="button" data-paso="1" aria-label="Agregar una unidad">+</button>' +
          '</div>' +
          '<button type="button" class="btn btn--principal" id="btn-agregar">Agregar al carrito</button>' +
          '</div>' +
          '<p class="ayuda">Puedes llevar hasta ' + maximo + (maximo === 1 ? ' unidad.' : ' unidades.') + '</p>' +
          '<a class="btn btn--secundario" href="carrito.html">Ver carrito</a>') +
      '</div></article>';

    if (!agotado) activarCompra(datos, p, maximo);
    pintarRelacionados(datos, p);
  }).catch(function () {
    LV.mostrarErrorCarga(contenedor);
  });

  function activarCompra(datos, p, maximo) {
    var input = document.getElementById('cantidad');
    var botones = contenedor.querySelectorAll('[data-paso]');

    function fijar(valor) {
      var n = parseInt(valor, 10);
      if (isNaN(n) || n < 1) n = 1;
      if (n > maximo) n = maximo;
      input.value = n;
      botones[0].disabled = n <= 1;
      botones[1].disabled = n >= maximo;
    }

    botones.forEach(function (b) {
      b.addEventListener('click', function () {
        fijar(parseInt(input.value, 10) + parseInt(b.getAttribute('data-paso'), 10));
      });
    });
    input.addEventListener('change', function () { fijar(input.value); });
    fijar(1);

    document.getElementById('btn-agregar').addEventListener('click', function () {
      fijar(input.value);
      var resultado = Carrito.agregar(datos, p.id, parseInt(input.value, 10));
      LV.mostrarToast(resultado.mensaje);
    });
  }

  // Hasta 4 productos de la misma categoría
  function pintarRelacionados(datos, p) {
    var relacionados = datos.productos.filter(function (x) {
      return x.categoria === p.categoria && x.id !== p.id;
    }).slice(0, 4);
    if (!relacionados.length) return;
    var lista = document.getElementById('lista-relacionados');
    lista.innerHTML = relacionados.map(function (x) { return LV.tarjetaProducto(datos, x); }).join('');
    LV.activarBotonesAgregar(lista, datos);
    document.getElementById('seccion-relacionados').classList.remove('oculto');
  }
})();
