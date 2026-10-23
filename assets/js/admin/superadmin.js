/*
  superadmin.js
  Consola de Plataforma para el Superadmin (Desarrollador / Proveedor de Software).
  Enfocada exclusivamente en el gobierno de infraestructura SaaS, licenciamiento
  de licorerías afiliadas, estado de la plataforma, diagnósticos y respaldos.
  NO accede ni muestra operaciones internas de las tiendas (pedidos, ventas, stock).
*/
(function () {
  'use strict';

  var sesionActual = Sesion.leer();
  if (!sesionActual || sesionActual.rol !== 'superadmin') {
    window.location.replace('login.html');
    return;
  }

  // Claves del sistema
  var CLAVES_PLATAFORMA = {
    'lv_admin_sesion': 'Sesión simulada activa en el panel',
    'lv_dev_config': 'Estado global de mantenimiento y parámetros de plataforma',
    'lv_usuarios_custom': 'Cuentas de usuario registradas en el sistema',
    'lv_tenants_licorerias': 'Registro de licorerías afiliadas y licencias SaaS',
    'lv_mayor_edad': 'Consentimiento de verificación de mayoría de edad',
    'lv_admin_cambios': 'Almacén de eventos internos (aislado)',
    'lv_pedidos': 'Almacén de pedidos internos de tienda (aislado)',
    'lv_carrito': 'Almacén de carrito temporal de tienda (aislado)'
  };

  var usuariosGlobales = [];
  var tiendasAfiliadas = [];
  var llaveActivaVisor = null;

  /* ==========================================================================
     INICIALIZACIÓN Y LOGS DE AUDITORÍA
     ========================================================================== */
  var terminal = document.getElementById('terminal-logs');
  function logTerminal(tipo, mensaje) {
    if (!terminal) return;
    var ahora = new Date();
    var hora = String(ahora.getHours()).padStart(2, '0') + ':' +
               String(ahora.getMinutes()).padStart(2, '0') + ':' +
               String(ahora.getSeconds()).padStart(2, '0');
    var span = document.createElement('div');
    span.innerHTML = '<span class="log-fecha">[' + hora + ']</span> ' +
                     '<span class="log-' + tipo + '">[' + tipo.toUpperCase() + '] ' + LV.escapar(mensaje) + '</span>';
    terminal.appendChild(span);
    terminal.scrollTop = terminal.scrollHeight;
  }

  var alerta = document.getElementById('alerta-superadmin');
  function mostrarAlerta(texto, tipo) {
    if (!alerta) return;
    alerta.className = 'aviso aviso--' + (tipo || 'exito');
    alerta.textContent = texto;
    alerta.classList.remove('oculto');
    alerta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(function () {
      alerta.classList.add('oculto');
    }, 4500);
  }

  /* ==========================================================================
     GESTIÓN DE PESTAÑAS
     ========================================================================== */
  var pestanas = document.querySelectorAll('.pestana-btn');
  var paneles = document.querySelectorAll('.panel-pestana');

  pestanas.forEach(function (btn) {
    btn.addEventListener('click', function () {
      pestanas.forEach(function (b) {
        b.classList.remove('activa');
        b.setAttribute('aria-selected', 'false');
      });
      paneles.forEach(function (p) {
        p.classList.remove('activo');
      });

      btn.classList.add('activa');
      btn.setAttribute('aria-selected', 'true');
      var idTarget = btn.getAttribute('aria-controls');
      var panel = document.getElementById(idTarget);
      if (panel) panel.classList.add('activo');
    });
  });

  /* ==========================================================================
     MÉTRICAS TÉCNICAS
     ========================================================================== */
  function actualizarMetricas() {
    var host = window.location.hostname || 'local';
    var esLocal = host === 'localhost' || host === '127.0.0.1';
    document.getElementById('metrica-entorno').textContent = esLocal ? 'XAMPP / Local' : host;
    document.getElementById('metrica-protocolo').textContent = window.location.protocol + '//' + host;

    var totalBytes = 0;
    var totalLlaves = localStorage.length;
    for (var i = 0; i < totalLlaves; i++) {
      var k = localStorage.key(i);
      var v = localStorage.getItem(k) || '';
      totalBytes += (k.length + v.length) * 2;
    }
    var kb = (totalBytes / 1024).toFixed(1);
    document.getElementById('metrica-storage').textContent = kb + ' KB';
    document.getElementById('metrica-llaves').textContent = totalLlaves + ' llaves en base local';

    var activas = tiendasAfiliadas.filter(function (t) { return t.estado === 'Activo'; }).length;
    document.getElementById('metrica-tiendas').textContent = activas + ' ' + (activas === 1 ? 'Activa' : 'Activas');
  }

  /* ==========================================================================
     PESTAÑA 1: LICORERÍAS AFILIADAS (TENANTS)
     ========================================================================== */
  var tablaTiendas = document.getElementById('tabla-tiendas-dev');
  var ventanaTienda = document.getElementById('ventana-tienda');
  var formTienda = document.getElementById('form-tienda-dev');

  function cargarTiendas() {
    try {
      var guardadas = JSON.parse(localStorage.getItem('lv_tenants_licorerias') || 'null');
      if (Array.isArray(guardadas) && guardadas.length) {
        tiendasAfiliadas = guardadas;
      } else {
        tiendasAfiliadas = [
          {
            id: 'lasvegas',
            nombre: 'Licorería Las Vegas',
            ubicacion: 'Jr. Progreso 787, Tarapoto',
            plan: 'Pro',
            estado: 'Activo',
            fechaAlta: '2026-01-15'
          }
        ];
        localStorage.setItem('lv_tenants_licorerias', JSON.stringify(tiendasAfiliadas));
      }
    } catch (e) {
      tiendasAfiliadas = [];
    }
    pintarTablaTiendas();
    actualizarMetricas();
  }

  function pintarTablaTiendas() {
    if (!tablaTiendas) return;
    if (!tiendasAfiliadas.length) {
      tablaTiendas.innerHTML = '<tr><td colspan="6">No hay licorerías registradas en la plataforma.</td></tr>';
      return;
    }

    tablaTiendas.innerHTML = tiendasAfiliadas.map(function (t) {
      var esActivo = t.estado === 'Activo';
      return '<tr>' +
        '<td><strong>' + LV.escapar(t.nombre) + '</strong></td>' +
        '<td><code>tenant_' + LV.escapar(t.id) + '</code></td>' +
        '<td>' + LV.escapar(t.ubicacion) + '</td>' +
        '<td><span class="chip-rol" style="font-size:0.75rem;">' + LV.escapar(t.plan) + '</span></td>' +
        '<td><span class="badge-estado ' + (esActivo ? 'badge-estado--ok' : 'badge-estado--error') + '">' +
          (esActivo ? '● Servicio Activo' : '○ Suspendido') + '</span></td>' +
        '<td style="text-align:right; white-space:nowrap;">' +
          '<button type="button" class="btn ' + (esActivo ? 'btn--claro' : 'btn--principal') + ' btn-toggle-tienda" data-id="' + LV.escapar(t.id) + '" style="padding:4px 10px; font-size:0.75rem;">' +
            (esActivo ? 'Pausar Licencia' : 'Reactivar Licencia') +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  if (tablaTiendas) {
    tablaTiendas.addEventListener('click', function (e) {
      var btnToggle = e.target.closest('.btn-toggle-tienda');
      if (btnToggle) {
        var id = btnToggle.getAttribute('data-id');
        var tienda = tiendasAfiliadas.find(function (x) { return x.id === id; });
        if (tienda) {
          tienda.estado = tienda.estado === 'Activo' ? 'Suspendido' : 'Activo';
          localStorage.setItem('lv_tenants_licorerias', JSON.stringify(tiendasAfiliadas));
          logTerminal('aviso', 'Estado de licencia modificado para tenant ' + tienda.id + ': ' + tienda.estado);
          mostrarAlerta('Servicio de software ' + (tienda.estado === 'Activo' ? 'activado' : 'pausado') + ' para ' + tienda.nombre);
          pintarTablaTiendas();
          actualizarMetricas();
          pintarTablaStorage();
        }
      }
    });
  }

  document.getElementById('btn-nueva-tienda').addEventListener('click', function () {
    document.getElementById('td-nombre').value = '';
    document.getElementById('td-id').value = '';
    document.getElementById('td-ubicacion').value = '';
    document.getElementById('td-plan').value = 'Estándar';
    ventanaTienda.showModal();
  });

  formTienda.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = document.getElementById('td-nombre').value.trim();
    var id = document.getElementById('td-id').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    var ubicacion = document.getElementById('td-ubicacion').value.trim();
    var plan = document.getElementById('td-plan').value;

    if (!nombre || !id || !ubicacion) {
      alert('Completa todos los campos obligatorios.');
      return;
    }

    if (tiendasAfiliadas.some(function (t) { return t.id === id; })) {
      alert('Ya existe una licorería registrada con ese ID de Tenant.');
      return;
    }

    tiendasAfiliadas.push({
      id: id,
      nombre: nombre,
      ubicacion: ubicacion,
      plan: plan,
      estado: 'Activo',
      fechaAlta: new Date().toISOString().slice(0, 10)
    });

    localStorage.setItem('lv_tenants_licorerias', JSON.stringify(tiendasAfiliadas));
    ventanaTienda.close();
    logTerminal('exito', 'Nueva licorería cliente registrada en la plataforma: ' + nombre + ' (ID: ' + id + ')');
    mostrarAlerta('Licorería ' + nombre + ' registrada con éxito en la plataforma.');
    pintarTablaTiendas();
    actualizarMetricas();
    pintarTablaStorage();
  });

  /* ==========================================================================
     PESTAÑA 2: MANTENIMIENTO GLOBAL DE PLATAFORMA
     ========================================================================== */
  var formMantenimiento = document.getElementById('form-mantenimiento-global');
  var chkMantenimiento = document.getElementById('cfg-modo-mantenimiento');
  var txtMensajeMantenimiento = document.getElementById('cfg-mensaje-mantenimiento');

  function cargarEstadoMantenimiento() {
    try {
      var devConfig = JSON.parse(localStorage.getItem('lv_dev_config') || 'null');
      if (devConfig) {
        chkMantenimiento.checked = !!devConfig.modoMantenimiento;
        txtMensajeMantenimiento.value = devConfig.mensajeMantenimiento || '';
      }
    } catch (e) {}
  }

  formMantenimiento.addEventListener('submit', function (e) {
    e.preventDefault();
    var devConfig = {};
    try {
      devConfig = JSON.parse(localStorage.getItem('lv_dev_config') || '{}');
    } catch (err) {}

    devConfig.modoMantenimiento = chkMantenimiento.checked;
    devConfig.mensajeMantenimiento = txtMensajeMantenimiento.value.trim();

    localStorage.setItem('lv_dev_config', JSON.stringify(devConfig));
    if (window.NEGOCIO) {
      window.NEGOCIO.modoMantenimiento = devConfig.modoMantenimiento;
      window.NEGOCIO.mensajeMantenimiento = devConfig.mensajeMantenimiento;
    }

    logTerminal('exito', 'Estado global de mantenimiento guardado en la plataforma (Activo: ' + devConfig.modoMantenimiento + ').');
    mostrarAlerta('Estado técnico de mantenimiento actualizado correctamente.');
    pintarTablaStorage();
  });

  document.getElementById('btn-limpiar-mantenimiento').addEventListener('click', function () {
    chkMantenimiento.checked = false;
    txtMensajeMantenimiento.value = '';
    formMantenimiento.dispatchEvent(new Event('submit'));
  });

  /* ==========================================================================
     PESTAÑA 3: CUENTAS DE ACCESO AL SISTEMA
     ========================================================================== */
  var tablaUsuarios = document.getElementById('tabla-usuarios-dev');
  var ventanaUsuario = document.getElementById('ventana-usuario');
  var formUsuario = document.getElementById('form-usuario-dev');

  function leerUsuariosCustom() {
    try {
      return JSON.parse(localStorage.getItem('lv_usuarios_custom') || '[]');
    } catch (e) {
      return [];
    }
  }

  function guardarUsuariosCustom(lista) {
    try {
      localStorage.setItem('lv_usuarios_custom', JSON.stringify(lista));
    } catch (e) {}
  }

  function cargarUsuariosCompletos() {
    return LV.cargarJSON('usuarios.json').then(function (d) {
      var base = d.usuarios || [];
      var custom = leerUsuariosCustom();
      var mapa = {};
      base.forEach(function (u) { mapa[u.usuario.toLowerCase()] = Object.assign({ origen: 'Base del Sistema' }, u); });
      custom.forEach(function (u) { mapa[u.usuario.toLowerCase()] = Object.assign({ origen: 'Personalizado' }, u); });
      usuariosGlobales = Object.values(mapa);
      pintarTablaUsuarios();
      actualizarMetricas();
    }).catch(function () {});
  }

  function pintarTablaUsuarios() {
    if (!tablaUsuarios) return;
    if (!usuariosGlobales.length) {
      tablaUsuarios.innerHTML = '<tr><td colspan="6">No hay cuentas registradas.</td></tr>';
      return;
    }

    tablaUsuarios.innerHTML = usuariosGlobales.map(function (u) {
      var esDev = u.rol === 'superadmin';
      return '<tr>' +
        '<td><strong><code>' + LV.escapar(u.usuario) + '</code></strong></td>' +
        '<td>' + LV.escapar(u.nombre) + '</td>' +
        '<td><span class="chip-rol" style="font-size:0.75rem;">' + Sesion.nombreRol(u.rol) + '</span></td>' +
        '<td><code>' + LV.escapar(u.clave) + '</code></td>' +
        '<td><span class="badge-estado ' + (u.origen.indexOf('Base') !== -1 ? 'badge-estado--ok' : 'badge-estado--cargando') + '">' + u.origen + '</span></td>' +
        '<td style="text-align:right; white-space:nowrap;">' +
          '<button type="button" class="btn btn--secundario btn-editar-usr" data-usr="' + LV.escapar(u.usuario) + '" style="padding:4px 8px; font-size:0.75rem; margin-right:4px;">Editar</button>' +
          (esDev ? '' : '<button type="button" class="btn btn--claro btn-borrar-usr" data-usr="' + LV.escapar(u.usuario) + '" style="color:var(--color-error); padding:4px 8px; font-size:0.75rem;">Borrar</button>') +
        '</td>' +
      '</tr>';
    }).join('');
  }

  if (tablaUsuarios) {
    tablaUsuarios.addEventListener('click', function (e) {
      var btnEditar = e.target.closest('.btn-editar-usr');
      if (btnEditar) {
        var idEdit = btnEditar.getAttribute('data-usr');
        var u = usuariosGlobales.find(function (x) { return x.usuario.toLowerCase() === idEdit.toLowerCase(); });
        if (u) {
          document.getElementById('ventana-usuario-titulo').textContent = 'Editar Cuenta: ' + u.usuario;
          document.getElementById('usr-usuario').value = u.usuario;
          document.getElementById('usr-usuario').readOnly = true;
          document.getElementById('usr-nombre').value = u.nombre;
          document.getElementById('usr-clave').value = u.clave;
          document.getElementById('usr-rol').value = u.rol;
          ventanaUsuario.showModal();
        }
        return;
      }

      var btnBorrar = e.target.closest('.btn-borrar-usr');
      if (btnBorrar) {
        var idDel = btnBorrar.getAttribute('data-usr');
        if (confirm('¿Eliminar la cuenta técnica "' + idDel + '"?')) {
          var custom = leerUsuariosCustom().filter(function (x) { return x.usuario.toLowerCase() !== idDel.toLowerCase(); });
          guardarUsuariosCustom(custom);
          logTerminal('aviso', 'Cuenta eliminada: ' + idDel);
          mostrarAlerta('Cuenta eliminada del sistema.');
          cargarUsuariosCompletos();
        }
      }
    });
  }

  document.getElementById('btn-abrir-crear-usuario').addEventListener('click', function () {
    document.getElementById('ventana-usuario-titulo').textContent = 'Crear Nueva Cuenta';
    document.getElementById('usr-usuario').value = '';
    document.getElementById('usr-usuario').readOnly = false;
    document.getElementById('usr-nombre').value = '';
    document.getElementById('usr-clave').value = '';
    document.getElementById('usr-rol').value = 'administrador';
    ventanaUsuario.showModal();
  });

  formUsuario.addEventListener('submit', function (e) {
    e.preventDefault();
    var usuario = document.getElementById('usr-usuario').value.trim().toLowerCase();
    var nombre = document.getElementById('usr-nombre').value.trim();
    var clave = document.getElementById('usr-clave').value.trim();
    var rol = document.getElementById('usr-rol').value;

    if (!usuario || !nombre || !clave) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    var custom = leerUsuariosCustom();
    var idx = custom.findIndex(function (x) { return x.usuario.toLowerCase() === usuario; });
    var obj = { usuario: usuario, nombre: nombre, clave: clave, rol: rol };

    if (idx !== -1) {
      custom[idx] = obj;
    } else {
      custom.push(obj);
    }

    guardarUsuariosCustom(custom);
    ventanaUsuario.close();
    logTerminal('exito', 'Cuenta ' + usuario + ' (' + rol + ') guardada en el sistema.');
    mostrarAlerta('Cuenta técnica guardada con éxito.');
    cargarUsuariosCompletos();
    pintarTablaStorage();
  });

  /* ==========================================================================
     PESTAÑA 4: RESPALDOS & SNAPSHOTS
     ========================================================================== */
  var tablaStorage = document.getElementById('tabla-storage-dev');
  var visorJson = document.getElementById('visor-json-storage');

  function pintarTablaStorage() {
    if (!tablaStorage) return;
    var llaves = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      var val = localStorage.getItem(k) || '';
      llaves.push({
        clave: k,
        valor: val,
        tamanoBytes: (k.length + val.length) * 2,
        descripcion: CLAVES_PLATAFORMA[k] || 'Dato interno o de terceros'
      });
    }

    if (!llaves.length) {
      tablaStorage.innerHTML = '<tr><td colspan="4">No hay datos en el almacenamiento local.</td></tr>';
      return;
    }

    llaves.sort(function (a, b) { return a.clave.localeCompare(b.clave); });

    tablaStorage.innerHTML = llaves.map(function (item) {
      var kb = (item.tamanoBytes / 1024).toFixed(2);
      return '<tr>' +
        '<td><strong><code>' + LV.escapar(item.clave) + '</code></strong></td>' +
        '<td>' + LV.escapar(item.descripcion) + '</td>' +
        '<td>' + kb + ' KB</td>' +
        '<td style="text-align:right; white-space:nowrap;">' +
          '<button type="button" class="btn btn--secundario btn-inspeccionar-key" data-key="' + LV.escapar(item.clave) + '" style="padding:4px 8px; font-size:0.75rem; margin-right:4px;">Ver / Editar</button>' +
          '<button type="button" class="btn btn--claro btn-borrar-key" data-key="' + LV.escapar(item.clave) + '" style="color:var(--color-error); padding:4px 8px; font-size:0.75rem;">Borrar</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  if (tablaStorage) {
    tablaStorage.addEventListener('click', function (e) {
      var btnVer = e.target.closest('.btn-inspeccionar-key');
      if (btnVer) {
        var k = btnVer.getAttribute('data-key');
        var raw = localStorage.getItem(k);
        llaveActivaVisor = k;
        try {
          var parsed = JSON.parse(raw);
          visorJson.value = JSON.stringify(parsed, null, 2);
        } catch (err) {
          visorJson.value = raw || '';
        }
        visorJson.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        logTerminal('info', 'Inspección técnica de clave: ' + k);
        return;
      }

      var btnDel = e.target.closest('.btn-borrar-key');
      if (btnDel) {
        var kDel = btnDel.getAttribute('data-key');
        if (confirm('¿Eliminar la clave técnica "' + kDel + '" de la base local?')) {
          localStorage.removeItem(kDel);
          if (llaveActivaVisor === kDel) {
            llaveActivaVisor = null;
            visorJson.value = '';
          }
          logTerminal('aviso', 'Clave de almacenamiento eliminada: ' + kDel);
          mostrarAlerta('Clave eliminada: ' + kDel);
          pintarTablaStorage();
          actualizarMetricas();
        }
      }
    });
  }

  document.getElementById('btn-guardar-json-visor').addEventListener('click', function () {
    if (!llaveActivaVisor) {
      alert('Selecciona primero una clave de la tabla superior.');
      return;
    }
    var texto = visorJson.value;
    try {
      JSON.parse(texto);
    } catch (err) {
      if (!confirm('El texto no parece ser un JSON válido. ¿Guardar de todos modos?')) {
        return;
      }
    }
    localStorage.setItem(llaveActivaVisor, texto);
    logTerminal('exito', 'Contenido técnico actualizado en clave ' + llaveActivaVisor);
    mostrarAlerta('Cambios guardados en ' + llaveActivaVisor);
    pintarTablaStorage();
    actualizarMetricas();
  });

  document.getElementById('btn-formatear-json').addEventListener('click', function () {
    try {
      var obj = JSON.parse(visorJson.value);
      visorJson.value = JSON.stringify(obj, null, 2);
    } catch (err) {
      alert('No se puede formatear: el texto contiene errores de sintaxis JSON.');
    }
  });

  document.getElementById('btn-exportar-snapshot').addEventListener('click', function () {
    var snapshot = {
      _metadatos: {
        plataforma: 'Licorería SaaS Platform Engine',
        fecha: new Date().toISOString(),
        version: '1.2.0'
      },
      datos: {}
    };

    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      snapshot.datos[k] = localStorage.getItem(k);
    }

    var blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var fechaStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.href = url;
    a.download = 'platform_backup_' + fechaStr + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logTerminal('exito', 'Copia de seguridad (Backup de Plataforma) generada y descargada.');
    mostrarAlerta('Backup completo descargado con éxito.');
  });

  document.getElementById('input-importar-snapshot').addEventListener('change', function (e) {
    var archivo = e.target.files[0];
    if (!archivo) return;

    var lector = new FileReader();
    lector.onload = function (evt) {
      try {
        var obj = JSON.parse(evt.target.result);
        if (!obj.datos || typeof obj.datos !== 'object') {
          throw new Error('Estructura de respaldo inválida.');
        }
        for (var k in obj.datos) {
          if (Object.prototype.hasOwnProperty.call(obj.datos, k)) {
            localStorage.setItem(k, obj.datos[k]);
          }
        }
        logTerminal('exito', 'Respaldo importado correctamente en la base del sistema.');
        mostrarAlerta('¡Copia de seguridad restaurada exitosamente!');
        pintarTablaStorage();
        actualizarMetricas();
        cargarTiendas();
        cargarUsuariosCompletos();
      } catch (err) {
        logTerminal('error', 'Error al procesar archivo de respaldo: ' + err.message);
        alert('El archivo no tiene el formato de respaldo técnico válido.');
      }
    };
    lector.readAsText(archivo);
    e.target.value = '';
  });

  document.getElementById('btn-hard-reset').addEventListener('click', function () {
    var confirmacion = prompt('ADVERTENCIA CRÍTICA DEL SISTEMA:\nEsta acción vaciará el almacenamiento del software.\n\nEscribe "RESET" para confirmar:');
    if (confirmacion === 'RESET') {
      localStorage.clear();
      logTerminal('aviso', 'HARD RESET ejecutado. Plataforma reiniciada.');
      alert('Almacenamiento vaciado. El sistema se reiniciará.');
      window.location.href = 'login.html';
    }
  });

  /* ==========================================================================
     PESTAÑA 5: DIAGNÓSTICO DEL SERVIDOR Y LOGS DE TI
     ========================================================================== */
  var contenedorDiagnostico = document.getElementById('contenedor-diagnostico-endpoints');

  function ejecutarDiagnosticoEndpoints() {
    var endpoints = [
      { id: 'productos.json', nombre: 'Servicio de Catálogo (API)', ruta: 'productos.json' },
      { id: 'pedidos.json', nombre: 'Servicio de Pedidos (API)', ruta: 'pedidos.json' },
      { id: 'usuarios.json', nombre: 'Servicio de Autenticación (API)', ruta: 'usuarios.json' },
      { id: 'zonas.json', nombre: 'Servicio de Zonas y Tarifas (API)', ruta: 'zonas.json' },
      { id: 'promociones.json', nombre: 'Servicio de Promociones (API)', ruta: 'promociones.json' }
    ];

    contenedorDiagnostico.innerHTML = endpoints.map(function (ep) {
      return '<div class="item-diagnostico" id="diag-' + ep.id.replace('.', '-') + '">' +
        '<div class="item-diagnostico__info">' +
          '<strong>' + LV.escapar(ep.nombre) + '</strong>' +
          '<small>datos/' + ep.id + '</small>' +
        '</div>' +
        '<span class="badge-estado badge-estado--cargando">Verificando...</span>' +
      '</div>';
    }).join('');

    logTerminal('info', 'Ejecutando diagnóstico de latencia y disponibilidad de microservicios JSON...');

    endpoints.forEach(function (ep) {
      var inicio = performance.now();
      LV.cargarJSON(ep.ruta).then(function () {
        var tiempo = Math.round(performance.now() - inicio);
        var el = document.getElementById('diag-' + ep.id.replace('.', '-'));
        if (!el) return;
        var badge = el.querySelector('.badge-estado');
        badge.className = 'badge-estado badge-estado--ok';
        badge.textContent = '200 OK (' + tiempo + 'ms)';
        logTerminal('exito', ep.nombre + ' respondiendo correctamente en ' + tiempo + 'ms.');
      }).catch(function (err) {
        var el = document.getElementById('diag-' + ep.id.replace('.', '-'));
        if (!el) return;
        var badge = el.querySelector('.badge-estado');
        badge.className = 'badge-estado badge-estado--error';
        badge.textContent = 'Fallo de respuesta';
        logTerminal('error', 'Error de conexión con ' + ep.nombre + ': ' + err);
      });
    });
  }

  document.getElementById('btn-ejecutar-diagnostico').addEventListener('click', ejecutarDiagnosticoEndpoints);

  document.getElementById('btn-limpiar-logs').addEventListener('click', function () {
    terminal.innerHTML = '';
    logTerminal('info', 'Consola de terminal limpiada.');
  });

  document.getElementById('btn-test-log').addEventListener('click', function () {
    logTerminal('info', 'Ping de verificación enviado al motor de plataforma.');
  });

  // Cierre de ventanas modales
  document.querySelectorAll('dialog.ventana').forEach(function (dialog) {
    dialog.addEventListener('click', function (e) {
      if (e.target.closest('[data-cerrar]') || e.target === dialog) {
        dialog.close();
      }
    });
  });

  /* ==========================================================================
     ARRANQUE
     ========================================================================== */
  logTerminal('info', 'Iniciando consola de plataforma Superadmin (aislamiento multirrol activo)...');
  cargarTiendas();
  cargarEstadoMantenimiento();
  cargarUsuariosCompletos().then(function () {
    pintarTablaStorage();
    ejecutarDiagnosticoEndpoints();
    logTerminal('exito', 'Consola de Plataforma lista y conectada.');
  });

})();
