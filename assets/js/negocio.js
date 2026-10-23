/*
  negocio.js
  Datos de contacto del negocio, centralizados en un solo lugar.
  TODOS LOS DATOS SON FICTICIOS. Reemplázalos por los reales antes de publicar.
*/
window.NEGOCIO = {
  nombre: 'Licorería Las Vegas',
  lema: 'Minimarket y licorería en Tarapoto',
  direccion: 'Jr. Progreso 787, Tarapoto',
  referencia: 'A lado de Essalud',
  telefono: '900 000 000',
  whatsapp: '900000000', // solo dígitos, sin el código de país
  correo: 'contacto@ejemplo.com',
  yape: {
    numero: '900 000 000',
    titular: 'Titular de ejemplo'
  },
  transferencia: {
    banco: 'Banco de ejemplo',
    cuenta: '000-0000000-0-00',
    cci: '000-000-000000000000-00',
    titular: 'Titular de ejemplo'
  },
  horarios: [
    { dias: 'Lunes a Viernes', horas: '09:00 a 23:00' },
    { dias: 'Sabado y Domingo', horas: '09:00 a 02:00' }

  ],
  horarioDelivery: 'Todos los días de 10:00 a 22:00',
  cantidadMaximaPorProducto: 24
};

// Permite al Superadmin / Desarrollador aplicar ajustes en caliente sin tocar el archivo
try {
  var devConfig = JSON.parse(localStorage.getItem('lv_dev_config') || 'null');
  if (devConfig && typeof devConfig === 'object') {
    for (var k in devConfig) {
      if (Object.prototype.hasOwnProperty.call(devConfig, k)) {
        window.NEGOCIO[k] = devConfig[k];
      }
    }
  }
} catch (e) { /* sin almacenamiento */ }

