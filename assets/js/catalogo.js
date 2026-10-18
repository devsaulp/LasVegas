/*
  catalogo.js
  Lista de productos con filtro por categoría, búsqueda por nombre
  (sin distinguir mayúsculas ni tildes) y orden por precio.
  Los filtros se reflejan en la dirección (?categoria=...&q=...) para
  poder compartir o volver a la misma búsqueda.
*/
(function () {
  var inputBuscar = document.getElementById('buscar');
  var selectCategoria = document.getElementById('filtro-categoria');
  var selectOrden = document.getElementById('orden');
  var lista = document.getElementById('lista-productos');
  var conteo = document.getElementById('conteo');
  var datos = null;

  document.getElementById('form-filtros').addEventListener('submit', function (e) {
    e.preventDefault();
  });

  LV.cargarTodo().then(function (d) {
    datos = d;

    // Opciones de categoría (cervezas y licores primero por su "orden")
    datos.categorias.forEach(function (c) {
      var opcion = document.createElement('option');
      opcion.value = c.id;
      opcion.textContent = c.nombre;
      selectCategoria.appendChild(opcion);
    });

    // Valores iniciales desde la dirección
    selectCategoria.value = LV.parametro('categoria') || '';
    inputBuscar.value = LV.parametro('q') || '';
    selectOrden.value = LV.parametro('orden') || '';

    inputBuscar.addEventListener('input', aplicar);
    selectCategoria.addEventListener('change', aplicar);
    selectOrden.addEventListener('change', aplicar);
    LV.activarBotonesAgregar(lista, datos);

    // Sugerencias cuando no hay resultados: limpian la búsqueda
    lista.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-categoria]');
      if (!chip) return;
      inputBuscar.value = '';
      selectCategoria.value = chip.getAttribute('data-categoria');
      aplicar();
    });

    aplicar();
  }).catch(function () {
    LV.mostrarErrorCarga(lista);
  });

  function aplicar() {
    var texto = LV.normalizar(inputBuscar.value);
    var categoria = selectCategoria.value;
    var orden = selectOrden.value;

    var resultado = datos.productos.filter(function (p) {
      if (categoria && p.categoria !== categoria) return false;
      if (texto && LV.normalizar(p.nombre).indexOf(texto) === -1) return false;
      return true;
    });

    if (orden) {
      resultado.sort(function (a, b) {
        var diferencia = LV.precioProducto(datos, a) - LV.precioProducto(datos, b);
        return orden === 'precio-asc' ? diferencia : -diferencia;
      });
    } else {
      // Relevancia: disponibles primero, respetando el orden de categorías
      var posicion = {};
      datos.categorias.forEach(function (c, i) { posicion[c.id] = i; });
      resultado.sort(function (a, b) {
        var agotadoA = a.stock <= 0 ? 1 : 0;
        var agotadoB = b.stock <= 0 ? 1 : 0;
        return (agotadoA - agotadoB) || (posicion[a.categoria] - posicion[b.categoria]);
      });
    }

    actualizarDireccion(categoria, inputBuscar.value.trim(), orden);

    if (!resultado.length) {
      conteo.textContent = 'No encontramos productos.';
      lista.innerHTML = '<div class="sin-resultados">' +
        '<p><strong>No hay productos que coincidan con tu búsqueda.</strong></p>' +
        '<p>Revisa lo que escribiste o prueba con una de estas categorías:</p>' +
        '<div class="chips">' + datos.categorias.map(function (c) {
          return '<button type="button" class="chip" data-categoria="' + c.id + '">' + LV.escapar(c.nombre) + '</button>';
        }).join('') + '</div></div>';
      return;
    }

    conteo.textContent = resultado.length + (resultado.length === 1 ? ' producto encontrado' : ' productos encontrados') +
      (categoria ? ' en ' + LV.nombreCategoria(datos, categoria) : '') + '.';
    lista.innerHTML = resultado.map(function (p) { return LV.tarjetaProducto(datos, p); }).join('');
  }

  function actualizarDireccion(categoria, q, orden) {
    var params = new URLSearchParams();
    if (categoria) params.set('categoria', categoria);
    if (q) params.set('q', q);
    if (orden) params.set('orden', orden);
    var cadena = params.toString();
    history.replaceState(null, '', window.location.pathname + (cadena ? '?' + cadena : ''));
  }
})();
