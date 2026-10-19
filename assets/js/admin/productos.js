/*
  productos.js
  Tabla de productos con buscador y formulario para agregar o editar.
  Es una demostración: los cambios quedan solo en memoria (se pierden
  al recargar) y no se escriben en datos/productos.json.
*/
(function () {
  var tabla = document.getElementById('tabla-productos');
  var inputBuscar = document.getElementById('buscar-producto');
  var conteo = document.getElementById('conteo-productos');
  var ventana = document.getElementById('ventana-producto');
  var form = document.getElementById('form-producto');
  var selectCategoria = document.getElementById('prod-categoria');
  var datos = null;
  var editando = null; // id del producto en edición, o null si es nuevo
  var botonQueAbrio = null;

  LV.cargarJSON('productos.json').then(function (d) {
    // Copia en memoria para poder editar sin tocar el archivo
    datos = JSON.parse(JSON.stringify(d));
    datos.categorias.sort(function (a, b) { return a.orden - b.orden; });
    datos.categorias.forEach(function (c) {
      var opcion = document.createElement('option');
      opcion.value = c.id;
      opcion.textContent = c.nombre;
      selectCategoria.appendChild(opcion);
    });
    pintarTabla();
  }).catch(function () {
    tabla.innerHTML = '<tr><td colspan="6">No se pudieron cargar los productos.</td></tr>';
  });

  inputBuscar.addEventListener('input', pintarTabla);

  document.getElementById('btn-nuevo').addEventListener('click', function (e) {
    abrirFormulario(null, e.currentTarget);
  });

  tabla.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-editar]');
    if (boton) abrirFormulario(boton.getAttribute('data-editar'), boton);
  });

  ventana.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar]') || e.target === ventana) ventana.close();
  });

  ventana.addEventListener('close', function () {
    if (botonQueAbrio && document.body.contains(botonQueAbrio)) botonQueAbrio.focus();
  });

  function nombreCategoria(id) {
    var c = datos.categorias.find(function (x) { return x.id === id; });
    return c ? c.nombre : '';
  }

  function pintarTabla() {
    if (!datos) return;
    var texto = LV.normalizar(inputBuscar.value);
    var lista = datos.productos.filter(function (p) {
      if (!texto) return true;
      return LV.normalizar(p.nombre + ' ' + p.marca + ' ' + nombreCategoria(p.categoria)).indexOf(texto) !== -1;
    });

    conteo.textContent = lista.length + (lista.length === 1 ? ' producto' : ' productos') + '.';

    if (!lista.length) {
      tabla.innerHTML = '<tr><td colspan="6">No se encontraron productos con esa búsqueda.</td></tr>';
      return;
    }

    tabla.innerHTML = lista.map(function (p) {
      return '<tr>' +
        '<td data-titulo="Producto"><span><strong>' + LV.escapar(p.nombre) + '</strong><br>' +
        '<span class="ayuda">' + LV.escapar([p.marca, p.presentacion].filter(Boolean).join(' · ')) + '</span></span></td>' +
        '<td data-titulo="Categoría">' + LV.escapar(nombreCategoria(p.categoria)) + '</td>' +
        '<td data-titulo="Precio" class="monto">' + LV.moneda(p.precio) + '</td>' +
        '<td data-titulo="Stock">' + p.stock + '</td>' +
        '<td data-titulo="Estado">' + LV.etiquetaEstado(LV.estadoStock(p.stock, p.stock_minimo)) + '</td>' +
        '<td class="celda-acciones"><button type="button" class="btn btn--secundario" data-editar="' + p.id + '" ' +
        'aria-label="Editar ' + LV.escapar(p.nombre) + '">Editar</button></td>' +
        '</tr>';
    }).join('');
  }

  /* ---------- Formulario ---------- */

  var campos = {
    nombre: document.getElementById('prod-nombre'),
    categoria: selectCategoria,
    marca: document.getElementById('prod-marca'),
    presentacion: document.getElementById('prod-presentacion'),
    precio: document.getElementById('prod-precio'),
    stock: document.getElementById('prod-stock'),
    minimo: document.getElementById('prod-minimo'),
    destacado: document.getElementById('prod-destacado'),
    descripcion: document.getElementById('prod-descripcion')
  };

  function abrirFormulario(id, boton) {
    editando = id;
    botonQueAbrio = boton;
    form.reset();
    limpiarErrores();
    var p = id ? datos.productos.find(function (x) { return x.id === id; }) : null;
    document.getElementById('ventana-producto-titulo').textContent = p ? 'Editar producto' : 'Agregar producto';
    if (p) {
      campos.nombre.value = p.nombre;
      campos.categoria.value = p.categoria;
      campos.marca.value = p.marca || '';
      campos.presentacion.value = p.presentacion || '';
      campos.precio.value = p.precio.toFixed(2);
      campos.stock.value = p.stock;
      campos.minimo.value = p.stock_minimo;
      campos.destacado.checked = !!p.destacado;
      campos.descripcion.value = p.descripcion || '';
    }
    ventana.showModal();
    campos.nombre.focus();
  }

  function marcar(input, mensaje) {
    var error = document.getElementById('error-' + input.id);
    if (error) error.textContent = mensaje;
    input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
    input.closest('.campo').classList.toggle('campo--error', !!mensaje);
    return !mensaje;
  }

  function limpiarErrores() {
    form.querySelectorAll('.mensaje-error').forEach(function (e) { e.textContent = ''; });
    form.querySelectorAll('.campo--error').forEach(function (c) { c.classList.remove('campo--error'); });
  }

  function entero(valor) {
    return /^\d+$/.test(String(valor).trim()) ? parseInt(valor, 10) : NaN;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = campos.nombre.value.trim();
    var precio = parseFloat(campos.precio.value);
    var stock = entero(campos.stock.value);
    var minimo = entero(campos.minimo.value);

    var ok = [
      marcar(campos.nombre, !nombre ? 'Escribe el nombre del producto.' : nombre.length < 3 ? 'El nombre debe tener al menos 3 caracteres.' : ''),
      marcar(campos.categoria, campos.categoria.value ? '' : 'Elige una categoría.'),
      marcar(campos.precio, isNaN(precio) ? 'Escribe el precio, por ejemplo 12.50.' : precio <= 0 ? 'El precio debe ser mayor que cero.' : ''),
      marcar(campos.stock, isNaN(stock) ? 'Escribe el stock como número entero, 0 o más.' : ''),
      marcar(campos.minimo, isNaN(minimo) ? 'Escribe el stock mínimo como número entero, 0 o más.' : '')
    ];
    var primero = form.querySelector('[aria-invalid="true"]');
    if (ok.indexOf(false) !== -1) {
      if (primero) primero.focus();
      return;
    }

    var producto = editando ? datos.productos.find(function (x) { return x.id === editando; }) : null;
    if (!producto) {
      producto = { id: 'p' + String(datos.productos.length + 1).padStart(3, '0') };
      datos.productos.push(producto);
    }
    producto.nombre = nombre;
    producto.categoria = campos.categoria.value;
    producto.marca = campos.marca.value.trim();
    producto.presentacion = campos.presentacion.value.trim();
    producto.precio = Math.round(precio * 100) / 100;
    producto.stock = stock;
    producto.stock_minimo = minimo;
    producto.destacado = campos.destacado.checked;
    producto.descripcion = campos.descripcion.value.trim();

    ventana.close();
    pintarTabla();
    LV.mostrarToast((editando ? 'Cambios guardados' : 'Producto agregado') + ' en esta demostración (no se guarda en el archivo).');
  });
})();
