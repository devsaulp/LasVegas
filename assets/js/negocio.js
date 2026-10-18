/*
  negocio.js
  Datos de contacto del negocio, centralizados en un solo lugar.
  TODOS LOS DATOS SON FICTICIOS. Reemplázalos por los reales antes de publicar.
*/
window.NEGOCIO = {
  nombre: 'Licorería Las Vegas',
  lema: 'Minimarket y licorería en Tarapoto',
  direccion: 'Jr. Ejemplo 123, Tarapoto, San Martín (dirección ficticia)',
  referencia: 'A media cuadra de la plaza (referencia de ejemplo)',
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
    { dias: 'Lunes a jueves', horas: '09:00 a 23:00' },
    { dias: 'Viernes y sábado', horas: '09:00 a 02:00' },
    { dias: 'Domingo', horas: '10:00 a 22:00' }
  ],
  horarioDelivery: 'Todos los días de 10:00 a 22:00',
  cantidadMaximaPorProducto: 24
};
