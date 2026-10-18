/*
  pedido.js
  Formulario de pedido: datos del cliente, tipo de entrega, método de pago
  y resumen con el costo de envío según la zona.
  Valida cada campo y muestra el error junto a él. Al confirmar, genera
  el número LV-AAAAMMDD-####, guarda el pedido en este navegador,
  vacía el carrito y abre la página de confirmación.
*/
(function () {
  var form = document.getElementById('form-pedido');
  var diseno = document.getElementById('diseno-pedido');
  var estado = document.getElementById('estado-pedido');
  var selectZona = document.getElementById('zona');
  var inputPagaCon = document.getElementById('paga-con');
  var datos = null;
  var info = null; // detalle del carrito

  LV.cargarTodo().then(function (d) {
    datos = d;
    info = Carrito.detalle(datos);

    if (!info.lineas.length) {
      estado.innerHTML = '<div class="vacio"><h2>No hay productos en tu carrito</h2>' +
        '<p>Agrega productos para poder hacer tu pedido.</p>' +
        '<a class="btn btn--principal" href="catalogo.html">Ir al catálogo</a></div>';
      return;
    }
    if (info.avisos.length) {
      estado.innerHTML = '<div class="aviso aviso--alerta">' +
        info.avisos.map(function (a) { return '<p>' + LV.escapar(a) + '</p>'; }).join('') + '</div>';
    }

    // Zonas con su tarifa
    datos.zonas.forEach(function (z) {
      var opcion = document.createElement('option');
      opcion.value = z.id;
      opcion.textContent = z.nombre + ' (' + LV.moneda(z.tarifa) + ')';
      selectZona.appendChild(opcion);
    });

    document.getElementById('texto-recojo').textContent =
      'Recoges tu pedido en ' + window.NEGOCIO.direccion + '. Sin costo de envío. Te avisaremos cuando esté listo.';

    diseno.classList.remove('oculto');
    form.addEventListener('change', actualizar);
    form.addEventListener('input', revalidarCampo);
    form.addEventListener('submit', enviar);
    actualizar();
  }).catch(function () {
    LV.mostrarErrorCarga(estado);
  });

  /* ---------- Lectura del formulario ---------- */

  function valorRadio(nombre) {
    var marcado = form.querySelector('input[name="' + nombre + '"]:checked');
    return marcado ? marcado.value : '';
  }

  function zonaElegida() {
    return datos.zonas.find(function (z) { return z.id === selectZona.value; }) || null;
  }

  // Costo de envío: recojo gratis; delivery según zona, gratis desde un monto
  function calcularEnvio() {
    if (valorRadio('entrega') === 'recojo') return { costo: 0, nota: 'Recojo en tienda: sin costo.' };
    var zona = zonaElegida();
    if (!zona) return { costo: 0, nota: 'Elige tu zona para calcular el envío.', pendiente: true };
    if (info.subtotal >= zona.envio_gratis_desde) {
      return { costo: 0, nota: 'Envío gratis en ' + zona.nombre + ' por compras desde ' + LV.moneda(zona.envio_gratis_desde) + '.' };
    }
    var falta = zona.envio_gratis_desde - info.subtotal;
    return { costo: zona.tarifa, nota: 'Te faltan ' + LV.moneda(falta) + ' para el envío gratis en ' + zona.nombre + '.' };
  }

  function totalPedido() {
    return Math.round((info.subtotal + calcularEnvio().costo) * 100) / 100;
  }

  /* ---------- Interfaz ---------- */

  function mostrar(id, visible) {
    document.getElementById(id).classList.toggle('oculto', !visible);
  }

  // Muestra u oculta bloques y actualiza el resumen
  function actualizar() {
    var entrega = valorRadio('entrega');
    var pago = valorRadio('pago');
    mostrar('bloque-delivery', entrega === 'delivery');
    mostrar('bloque-recojo', entrega === 'recojo');
    mostrar('bloque-efectivo', pago === 'efectivo');
    mostrar('bloque-digital', pago === 'yape' || pago === 'transferencia');

    var zona = zonaElegida();
    document.getElementById('ayuda-zona').textContent = zona
      ? 'Pedido mínimo: ' + LV.moneda(zona.pedido_minimo) + '. Envío gratis desde ' + LV.moneda(zona.envio_gratis_desde) + '. Tiempo estimado: ' + zona.tiempo_estimado + '.'
      : '';

    var envio = calcularEnvio();
    var total = totalPedido();

    document.getElementById('resumen-lista').innerHTML = info.lineas.map(function (l) {
      return '<li><span>' + l.cantidad + ' × ' + LV.escapar(l.nombre) + '</span><span>' + LV.moneda(l.subtotal) + '</span></li>';
    }).join('');
    document.getElementById('resumen-subtotal').textContent = LV.moneda(info.subtotal);
    document.getElementById('resumen-envio').textContent = envio.pendiente ? 'Por calcular' : (envio.costo ? LV.moneda(envio.costo) : 'Gratis');
    document.getElementById('resumen-nota-envio').textContent = envio.nota;
    document.getElementById('resumen-total').textContent = LV.moneda(total);

    // Promoción de regalo por monto mínimo
    var regalo = datos.promociones.find(function (p) { return p.tipo === 'regalo'; });
    var textoRegalo = '';
    if (regalo) {
      textoRegalo = info.subtotal >= regalo.monto_minimo
        ? 'Tu pedido incluye: ' + regalo.titulo.toLowerCase() + ' (sujeto a disponibilidad).'
        : 'Te faltan ' + LV.moneda(regalo.monto_minimo - info.subtotal) + ' para tu ' + regalo.titulo.toLowerCase() + '.';
    }
    document.getElementById('resumen-regalo').textContent = textoRegalo;

    // Instrucciones de pago digital con el total actualizado
    var n = window.NEGOCIO;
    var instrucciones = document.getElementById('instrucciones-digital');
    if (pago === 'yape') {
      instrucciones.innerHTML = '<p><strong>Paga con Yape:</strong> envía ' + LV.moneda(total) + ' al número <strong>' +
        LV.escapar(n.yape.numero) + '</strong> (' + LV.escapar(n.yape.titular) + ') y escribe abajo el número de operación.</p>';
    } else if (pago === 'transferencia') {
      instrucciones.innerHTML = '<p><strong>Transfiere ' + LV.moneda(total) + '</strong> a ' + LV.escapar(n.transferencia.banco) +
        ', cuenta ' + LV.escapar(n.transferencia.cuenta) + ' (CCI ' + LV.escapar(n.transferencia.cci) + '), a nombre de ' +
        LV.escapar(n.transferencia.titular) + '. Luego escribe abajo el número de operación.</p>';
    }

    actualizarVuelto(total);
  }

  function actualizarVuelto(total) {
    var texto = document.getElementById('texto-vuelto');
    var pagaCon = parseFloat(inputPagaCon.value);
    if (valorRadio('pago') !== 'efectivo' || isNaN(pagaCon) || pagaCon < total) {
      texto.textContent = '';
      return;
    }
    texto.textContent = 'Tu vuelto: ' + LV.moneda(pagaCon - total);
  }

  /* ---------- Validación ---------- */

  // Cada regla devuelve el mensaje de error o "" si el valor es correcto
  var reglas = {
    nombre: function () {
      var v = document.getElementById('nombre').value.trim();
      if (!v) return 'Escribe tu nombre y apellido.';
      if (v.length < 3) return 'El nombre debe tener al menos 3 letras.';
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .]+$/.test(v)) return 'Usa solo letras y espacios en tu nombre.';
      return '';
    },
    telefono: function () {
      var v = document.getElementById('telefono').value.replace(/\s/g, '');
      if (!v) return 'Escribe tu número de celular.';
      if (!/^\d+$/.test(v)) return 'El celular solo debe tener números.';
      if (v.length !== 9) return 'El celular debe tener 9 dígitos (tiene ' + v.length + ').';
      if (v.charAt(0) !== '9') return 'El celular debe empezar con 9.';
      return '';
    },
    zona: function () {
      if (valorRadio('entrega') !== 'delivery') return '';
      var zona = zonaElegida();
      if (!zona) return 'Elige la zona de entrega.';
      if (info.subtotal < zona.pedido_minimo) {
        return 'El pedido mínimo para ' + zona.nombre + ' es ' + LV.moneda(zona.pedido_minimo) +
          '. Te faltan ' + LV.moneda(zona.pedido_minimo - info.subtotal) + ', o elige recojo en tienda.';
      }
      return '';
    },
    direccion: function () {
      if (valorRadio('entrega') !== 'delivery') return '';
      var v = document.getElementById('direccion').value.trim();
      if (!v) return 'Escribe la dirección de entrega.';
      if (v.length < 6) return 'La dirección es muy corta. Incluye calle y número.';
      return '';
    },
    pago: function () {
      return valorRadio('pago') ? '' : 'Elige un método de pago.';
    },
    'paga-con': function () {
      if (valorRadio('pago') !== 'efectivo') return '';
      var v = inputPagaCon.value.trim();
      if (!v) return 'Indica con cuánto pagarás para llevar tu vuelto.';
      var monto = parseFloat(v);
      if (isNaN(monto)) return 'Escribe un monto válido, por ejemplo 100.';
      if (monto < totalPedido()) return 'El monto debe ser igual o mayor al total (' + LV.moneda(totalPedido()) + ').';
      return '';
    },
    operacion: function () {
      var pago = valorRadio('pago');
      if (pago !== 'yape' && pago !== 'transferencia') return '';
      var v = document.getElementById('operacion').value.trim();
      if (!v) return 'Escribe el número de operación de tu pago.';
      if (!/^\d{6,12}$/.test(v)) return 'El número de operación debe tener entre 6 y 12 dígitos, sin letras ni espacios.';
      return '';
    },
    'mayor-edad': function () {
      return document.getElementById('mayor-edad').checked ? '' : 'Debes declarar que eres mayor de 18 años para continuar.';
    }
  };

  // Muestra (o limpia) el error de un campo y marca el campo
  function marcarError(nombre, mensaje) {
    var error = document.getElementById('error-' + nombre);
    if (error) error.textContent = mensaje;
    var campo = document.getElementById(nombre);
    if (campo) {
      campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
      var contenedor = campo.closest('.campo');
      if (contenedor) contenedor.classList.toggle('campo--error', !!mensaje);
    }
  }

  function validarTodo() {
    var errores = [];
    Object.keys(reglas).forEach(function (nombre) {
      var mensaje = reglas[nombre]();
      marcarError(nombre, mensaje);
      if (mensaje) errores.push({ nombre: nombre, mensaje: mensaje });
    });
    return errores;
  }

  // Si un campo ya mostraba error, se revisa otra vez mientras se corrige
  function revalidarCampo(e) {
    var nombre = e.target.name;
    if (nombre === 'paga-con') actualizarVuelto(totalPedido());
    var error = document.getElementById('error-' + nombre);
    if (reglas[nombre] && error && error.textContent) marcarError(nombre, reglas[nombre]());
  }

  /* ---------- Envío ---------- */

  function enviar(e) {
    e.preventDefault();
    actualizar();
    var errores = validarTodo();
    var resumen = document.getElementById('resumen-errores');

    if (errores.length) {
      resumen.innerHTML = '<p><strong>Revisa ' + (errores.length === 1 ? 'un dato' : errores.length + ' datos') +
        ' antes de confirmar:</strong></p><ul>' + errores.map(function (er) {
          return '<li><a href="#' + er.nombre + '">' + LV.escapar(er.mensaje) + '</a></li>';
        }).join('') + '</ul>';
      resumen.classList.remove('oculto');
      resumen.focus();
      return;
    }
    resumen.classList.add('oculto');

    var pedido = armarPedido();
    guardarPedido(pedido);
    Carrito.vaciar();
    window.location.href = 'confirmacion.html?pedido=' + encodeURIComponent(pedido.numero);
  }

  function armarPedido() {
    var entrega = valorRadio('entrega');
    var pago = valorRadio('pago');
    var zona = zonaElegida();
    var envio = calcularEnvio();
    var total = totalPedido();
    return {
      numero: generarNumero(),
      fecha: new Date().toISOString(),
      cliente: {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.replace(/\s/g, '')
      },
      entrega: {
        tipo: entrega,
        zona: entrega === 'delivery' && zona ? zona.nombre : '',
        direccion: entrega === 'delivery' ? document.getElementById('direccion').value.trim() : '',
        referencia: entrega === 'delivery' ? document.getElementById('referencia').value.trim() : ''
      },
      pago: {
        metodo: pago,
        operacion: pago === 'efectivo' ? '' : document.getElementById('operacion').value.trim(),
        pagaCon: pago === 'efectivo' ? parseFloat(inputPagaCon.value) : null
      },
      lineas: info.lineas.map(function (l) {
        return { id: l.id, nombre: l.nombre, cantidad: l.cantidad, precio: l.precio, subtotal: l.subtotal };
      }),
      subtotal: info.subtotal,
      envio: envio.costo,
      total: total,
      estado: 'pendiente'
    };
  }

  // Número de pedido LV-AAAAMMDD-#### con correlativo diario (en este navegador)
  function generarNumero() {
    var hoy = new Date();
    var fecha = hoy.getFullYear() +
      String(hoy.getMonth() + 1).padStart(2, '0') +
      String(hoy.getDate()).padStart(2, '0');
    var contador = { fecha: fecha, n: 0 };
    try {
      var guardado = JSON.parse(localStorage.getItem('lv_contador_pedidos') || 'null');
      if (guardado && guardado.fecha === fecha) contador = guardado;
    } catch (e) { /* se empieza de cero */ }
    contador.n += 1;
    try {
      localStorage.setItem('lv_contador_pedidos', JSON.stringify(contador));
    } catch (e) { /* sin almacenamiento */ }
    return 'LV-' + fecha + '-' + String(contador.n).padStart(4, '0');
  }

  function guardarPedido(pedido) {
    try {
      var pedidos = JSON.parse(localStorage.getItem('lv_pedidos') || '[]');
      pedidos.push(pedido);
      localStorage.setItem('lv_pedidos', JSON.stringify(pedidos.slice(-20)));
    } catch (e) { /* sin almacenamiento */ }
  }
})();
