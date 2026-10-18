/*
  edad.js
  Aviso de mayoría de edad. Se carga en el <head> de cada página para
  ocultar el contenido antes de que se pinte, hasta que la persona responda.
  - "Sí": se guarda en localStorage y no vuelve a preguntar.
  - "No": el contenido queda bloqueado (no se guarda la respuesta).
*/
(function () {
  var CLAVE_EDAD = 'lv_mayor_edad';

  function yaConfirmo() {
    try {
      return localStorage.getItem(CLAVE_EDAD) === 'si';
    } catch (e) {
      return false;
    }
  }

  if (yaConfirmo()) return;

  // Oculta el contenido desde el inicio para que no se vea el catálogo
  document.documentElement.classList.add('edad-pendiente');

  function mostrarAviso() {
    var raiz = document.body.getAttribute('data-raiz') || '';
    var modal = document.createElement('div');
    modal.className = 'modal-edad';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'titulo-edad');
    modal.innerHTML =
      '<div class="modal-edad__caja">' +
      '  <img src="' + raiz + 'assets/img/logo-web.png" alt="Logo de Licorería Las Vegas" ' +
      '       onerror="this.onerror=null;this.src=\'' + raiz + 'assets/img/logo-provisional.svg\'">' +
      '  <h2 id="titulo-edad">¿Eres mayor de 18 años?</h2>' +
      '  <p>Este sitio vende bebidas alcohólicas y tabaco. Solo pueden ingresar personas mayores de edad.</p>' +
      '  <div class="modal-edad__botones">' +
      '    <button type="button" class="btn btn--principal" data-edad="si">Sí, soy mayor</button>' +
      '    <button type="button" class="btn btn--secundario" data-edad="no">No</button>' +
      '  </div>' +
      '  <p class="modal-edad__bloqueo oculto" role="alert">Lo sentimos, el contenido de este sitio es solo para mayores de 18 años.</p>' +
      '</div>';
    document.body.appendChild(modal);

    var botonSi = modal.querySelector('[data-edad="si"]');
    var botonNo = modal.querySelector('[data-edad="no"]');
    botonSi.focus();

    botonSi.addEventListener('click', function () {
      try {
        localStorage.setItem(CLAVE_EDAD, 'si');
      } catch (e) { /* sin almacenamiento: solo se permite en esta visita */ }
      document.documentElement.classList.remove('edad-pendiente');
      modal.remove();
    });

    botonNo.addEventListener('click', function () {
      // Se bloquea el contenido: se quitan los botones y se muestra el mensaje
      modal.querySelector('.modal-edad__botones').remove();
      modal.querySelector('.modal-edad__bloqueo').classList.remove('oculto');
      modal.querySelector('#titulo-edad').textContent = 'Acceso no permitido';
      // Por seguridad, el contenido de la página se elimina del documento
      Array.prototype.forEach.call(document.body.children, function (el) {
        if (el !== modal) el.innerHTML = '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mostrarAviso);
  } else {
    mostrarAviso();
  }
})();
