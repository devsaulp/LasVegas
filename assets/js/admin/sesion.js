/*
  sesion.js
  Sesión SIMULADA del panel interno (no hay servidor ni seguridad real).
  Se carga en el <head> de cada página del panel. Cada página indica en
  <html data-roles="..."> qué roles pueden verla:
  - sin sesión: se envía a login.html
  - con un rol no permitido: se envía a la pantalla principal de su rol
*/
var Sesion = (function () {
  var CLAVE = 'lv_admin_sesion';

  // Pantalla principal de cada rol
  var INICIO = {
    administrador: 'index.html',
    cajero: 'index.html',
    repartidor: 'entregas.html'
  };

  var NOMBRE_ROL = {
    administrador: 'Administrador',
    cajero: 'Cajero',
    repartidor: 'Repartidor'
  };

  function leer() {
    try {
      var s = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      return s && INICIO[s.rol] ? s : null;
    } catch (e) {
      return null;
    }
  }

  function guardar(usuario) {
    var sesion = { usuario: usuario.usuario, nombre: usuario.nombre, rol: usuario.rol };
    try {
      localStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch (e) { /* sin almacenamiento */ }
    return sesion;
  }

  function cerrar() {
    try {
      localStorage.removeItem(CLAVE);
    } catch (e) { /* sin almacenamiento */ }
    window.location.href = 'login.html';
  }

  function inicioDeRol(rol) {
    return INICIO[rol] || 'login.html';
  }

  // Control de acceso de la página actual
  var raiz = document.documentElement;
  var roles = raiz.getAttribute('data-roles');
  if (roles !== null) {
    var sesion = leer();
    if (!sesion) {
      raiz.classList.add('sesion-pendiente');
      window.location.replace('login.html');
    } else if (roles.split(' ').indexOf(sesion.rol) === -1) {
      raiz.classList.add('sesion-pendiente');
      window.location.replace(inicioDeRol(sesion.rol));
    }
  }

  return {
    leer: leer,
    guardar: guardar,
    cerrar: cerrar,
    inicioDeRol: inicioDeRol,
    nombreRol: function (rol) { return NOMBRE_ROL[rol] || rol; }
  };
})();
