/*
  login.js
  Inicio de sesión SIMULADO: compara con datos/usuarios.json y guarda
  el rol en localStorage. No ofrece seguridad real.
*/
(function () {
  // Si ya hay sesión, se va directo a la pantalla de su rol
  var actual = Sesion.leer();
  if (actual) {
    window.location.replace(Sesion.inicioDeRol(actual.rol));
    return;
  }

  var form = document.getElementById('form-login');
  var inputUsuario = document.getElementById('usuario');
  var inputClave = document.getElementById('clave');
  var errorGeneral = document.getElementById('error-login');
  var usuarios = [];

  LV.cargarJSON('usuarios.json').then(function (d) {
    usuarios = d.usuarios;
    // Tabla de usuarios de ejemplo para la demostración
    document.getElementById('tabla-usuarios-demo').innerHTML = usuarios.map(function (u) {
      return '<tr><td>' + LV.escapar(u.usuario) + '</td><td>' + LV.escapar(u.clave) + '</td><td>' +
        Sesion.nombreRol(u.rol) + '</td></tr>';
    }).join('');
  }).catch(function () {
    mostrarError('No se pudieron cargar los usuarios. Abre el panel desde un servidor web (por ejemplo XAMPP).');
  });

  function marcar(input, idError, mensaje) {
    document.getElementById(idError).textContent = mensaje;
    input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
    input.closest('.campo').classList.toggle('campo--error', !!mensaje);
  }

  function mostrarError(mensaje) {
    errorGeneral.textContent = mensaje;
    errorGeneral.classList.toggle('oculto', !mensaje);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    mostrarError('');
    var usuario = inputUsuario.value.trim().toLowerCase();
    var clave = inputClave.value;

    marcar(inputUsuario, 'error-usuario', usuario ? '' : 'Escribe tu usuario.');
    marcar(inputClave, 'error-clave', clave ? '' : 'Escribe tu contraseña.');
    if (!usuario) { inputUsuario.focus(); return; }
    if (!clave) { inputClave.focus(); return; }

    var encontrado = usuarios.find(function (u) {
      return u.usuario.toLowerCase() === usuario && u.clave === clave;
    });

    if (!encontrado) {
      // Mensaje genérico: no revela si el usuario existe
      mostrarError('Usuario o contraseña incorrectos.');
      inputClave.value = '';
      inputClave.focus();
      return;
    }

    var sesion = Sesion.guardar(encontrado);
    window.location.href = Sesion.inicioDeRol(sesion.rol);
  });

  inputUsuario.focus();
})();
