# Registro de Cambios (Changelog) - Licorería Las Vegas

Todos los cambios notables realizados en este proyecto a partir de esta fecha quedarán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [2026-10-23 16:20] - Documentación Técnica y Control de Versiones en Carpeta docs (.docx)
### Añadido
- **Nuevo documento técnico formal en Word**: [docs/Licoreria_Las_Vegas_Documentacion_Panel_Admin.docx](file:///c:/xampp/htdocs/LasVegas/docs/Licoreria_Las_Vegas_Documentacion_Panel_Admin.docx), estructurado bajo el estándar académico y técnico del proyecto (UNSM / FISI / EPISI):
  - Portada oficial con metadatos del curso, docente y autores.
  - Tabla de control de versiones sincronizada.
  - Especificación exhaustiva de la arquitectura sin base de datos (HTML5, CSS3, JavaScript puro y persistencia en cliente).
  - Guía detallada del módulo de catálogo ([admin/productos.html](file:///c:/xampp/htdocs/LasVegas/admin/productos.html) y [assets/js/admin/productos.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/productos.js)) con operaciones CRUD, tipos de datos, restricciones y validación de campos.
  - Especificación del semáforo de inventario y alertas de stock mínimo ([admin/stock.html](file:///c:/xampp/htdocs/LasVegas/admin/stock.html)).
  - Matriz de roles y niveles de acceso (administrador, encargado, repartidor y superadmin).
  - Bitácora cronológica de modificaciones para auditoría técnica.

### Modificado
- [docs/Licoreria_Las_Vegas_Documento_Tecnico.docx](file:///c:/xampp/htdocs/LasVegas/docs/Licoreria_Las_Vegas_Documento_Tecnico.docx): Actualización de la Tabla 1 (*Control de versiones*) incorporando las versiones 1.1 y 1.2 correspondientes a la integración del panel interno y el módulo interactivo de catálogo de productos.

---

## [2026-10-23 14:55] - Módulo Administrativo y Gestión Completa del Catálogo
### Añadido
- **Gestor visual de catálogo de productos**: [admin/productos.html](file:///c:/xampp/htdocs/LasVegas/admin/productos.html) con su lógica interactiva en [assets/js/admin/productos.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/productos.js), que permite al personal administrativo:
  - Visualizar la lista completa de productos con buscador en tiempo real por nombre, marca o categoría y conteo de resultados.
  - Agregar nuevos productos con asignación de código ID, nombre, categoría, marca, presentación, precio unitario, stock inicial, stock mínimo para alertas, indicador de producto destacado y descripción.
  - Modificar cualquier producto existente a través de un cuadro de diálogo accesible (`<dialog>`), con validación de entradas de formulario.
- **Módulo de control de inventario y existencias**: [admin/stock.html](file:///c:/xampp/htdocs/LasVegas/admin/stock.html) y [assets/js/admin/stock.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/stock.js) para la supervisión y ajuste ágil de niveles de stock (disponibles, pocas unidades y agotados).
- **Panel interno operativo integrado**:
  - Pantalla de inicio de sesión multirrol: [admin/login.html](file:///c:/xampp/htdocs/LasVegas/admin/login.html) y [assets/js/admin/login.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/login.js).
  - Tablero general con métricas de ventas y pedidos del día: [admin/index.html](file:///c:/xampp/htdocs/LasVegas/admin/index.html) y [assets/js/admin/tablero.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/tablero.js).
  - Gestión de pedidos y estados de despacho: [admin/pedidos.html](file:///c:/xampp/htdocs/LasVegas/admin/pedidos.html) y [assets/js/admin/pedidos.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/pedidos.js).
  - Hoja de ruta para motorizados y entregas: [admin/entregas.html](file:///c:/xampp/htdocs/LasVegas/admin/entregas.html) y [assets/js/admin/entregas.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/entregas.js).
  - Reportes de ventas y productos más pedidos: [admin/reportes.html](file:///c:/xampp/htdocs/LasVegas/admin/reportes.html) y [assets/js/admin/reportes.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/reportes.js).
  - Infraestructura de sesión y control de acceso: [assets/js/admin/sesion.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/sesion.js) y [assets/js/admin/panel.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/panel.js).
  - Sistema de diseño de panel interno: [assets/css/admin.css](file:///c:/xampp/htdocs/LasVegas/assets/css/admin.css) con layout de panel lateral, barra superior, componentes modales nativos y tablas adaptadas para móviles.
  - Conjunto de datos base: cuentas de personal en [datos/usuarios.json](file:///c:/xampp/htdocs/LasVegas/datos/usuarios.json) y pedidos simulados en [datos/pedidos.json](file:///c:/xampp/htdocs/LasVegas/datos/pedidos.json).

### Justificación
- Proporcionar a la administración de la licorería una interfaz gráfica dedicada e intuitiva para gestionar el catálogo (precios, stock y nuevos artículos) y la operativa de pedidos sin depender de bases de datos tradicionales ni servidores backend complejos, conservando la ligereza y portabilidad del frontend estático (HTML5, CSS3 y Vanilla JavaScript).

---

## [2026-10-20 16:05] - Aislamiento Completo de Superadmin respecto a las Operaciones Internas de Licorerías
### Modificado
- [assets/js/admin/panel.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/panel.js): Eliminación completa de `superadmin` de los módulos operativos de la tienda (`pedidos`, `productos`, `stock`, `entregas`, `tablero` y `reportes`). El superadmin ahora solo visualiza la opción "Superadmin (Plataforma)" en su menú lateral.
- [admin/pedidos.html](file:///c:/xampp/htdocs/LasVegas/admin/pedidos.html), [admin/productos.html](file:///c:/xampp/htdocs/LasVegas/admin/productos.html), [admin/stock.html](file:///c:/xampp/htdocs/LasVegas/admin/stock.html), [admin/entregas.html](file:///c:/xampp/htdocs/LasVegas/admin/entregas.html): Retirado el rol `superadmin` de los atributos `data-roles` en todas las páginas internas de la tienda, forzando redirección automática a la consola de plataforma si intenta acceder por URL directa.
- [admin/superadmin.html](file:///c:/xampp/htdocs/LasVegas/admin/superadmin.html) y [assets/js/admin/superadmin.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/superadmin.js):
  - Rediseño completo bajo el paradigma **SaaS / Aislamiento Multitenant**.
  - **Eliminadas todas las herramientas internas de tienda:** Retirados inyector de pedidos, generador de clientes sintéticos, configuración comercial de la tienda (horarios y direcciones) y barra de simulación/impersonación de personal de tienda.
  - **Nuevas herramientas de gobierno de plataforma:**
    - Gestión y directorio de licorerías afiliadas (tenants) con estado de licencia de software (Activo / Suspendido) y asignación de planes.
    - Control de Mantenimiento Global de plataforma e información de entorno de infraestructura.
    - Gestión de cuentas técnicas de plataforma y soporte.
    - Respaldos técnicos (Backups/Snapshots JSON) y Hard Reset del motor.
    - Diagnóstico de disponibilidad de servicios y terminal de logs de auditoría de TI.
- [README.md](file:///c:/xampp/htdocs/LasVegas/README.md): Documentación de la separación de responsabilidades: el Superadmin gestiona la plataforma y sus licencias, sin acceso a pedidos, clientes, stock, ventas ni caja de ninguna licorería.

---

## [2026-10-20 15:15] - Restricción de Estadísticas y Confidencialidad Comercial para Superadmin
### Modificado
- [assets/js/admin/sesion.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/sesion.js): Eliminación de bypass global para superadmin, forzando la validación estricta de `data-roles`. Si el superadmin intenta entrar a [admin/reportes.html](file:///c:/xampp/htdocs/LasVegas/admin/reportes.html) o [admin/index.html](file:///c:/xampp/htdocs/LasVegas/admin/index.html), es redirigido a su consola técnica.
- [assets/js/admin/panel.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/panel.js): Ocultamiento de las opciones "Tablero" (ventas del día) y "Reportes" (estadísticas semanales de ingresos y productos más vendidos) en el menú lateral para el rol `superadmin`.
- [admin/pedidos.html](file:///c:/xampp/htdocs/LasVegas/admin/pedidos.html), [admin/productos.html](file:///c:/xampp/htdocs/LasVegas/admin/productos.html), [admin/stock.html](file:///c:/xampp/htdocs/LasVegas/admin/stock.html), [admin/entregas.html](file:///c:/xampp/htdocs/LasVegas/admin/entregas.html): Habilitación explícita de `superadmin` únicamente en las pantallas técnicas y operativas necesarias para soporte.
- [admin/superadmin.html](file:///c:/xampp/htdocs/LasVegas/admin/superadmin.html) y [assets/js/admin/superadmin.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/superadmin.js):
  - Inclusión de un bloque de aviso formal sobre la política de confidencialidad comercial y separación de responsabilidades (SaaS / multirrol).
  - Reemplazo de la tarjeta de métrica de "Pedidos Registrados" por "Integridad del Sistema" (indicadores de salud técnica y servicios sincronizados).
  - Eliminación de enlaces hacia la sección de reportes financieros.
- [README.md](file:///c:/xampp/htdocs/LasVegas/README.md): Actualización de la matriz de permisos de `dev` especificando la exclusión de Tablero y Reportes por motivos de confidencialidad comercial.

---

## [2026-10-20] - Panel de Superadmin (Control de Desarrollador)
### Añadido
- **Nueva pantalla maestra para desarrollador**: [admin/superadmin.html](file:///c:/xampp/htdocs/LasVegas/admin/superadmin.html) con soporte de métricas del entorno, simulación de roles, 5 pestañas de control técnico y modales de gestión.
- **Lógica interactiva de superadmin**: [assets/js/admin/superadmin.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/superadmin.js), que implementa:
  - Modificaciones en caliente (*Live Overrides*) guardadas en `localStorage` (`lv_dev_config`).
  - Gestión y CRUD de cuentas de personal con persistencia en `lv_usuarios_custom`.
  - Inyector de pedidos sintéticos individuales y por lotes (5 pedidos con diversos estados) para pruebas.
  - Explorador y editor de JSON de almacenamiento local (`localStorage`) con descarga e importación de *Snapshots* (`.json`) y *Hard Reset*.
  - Diagnóstico de salud y tiempo de respuesta de los archivos JSON de datos con terminal de logs en vivo.
- **Estilos de consola y controles técnicos**: Añadidas clases visuales en [assets/css/admin.css](file:///c:/xampp/htdocs/LasVegas/assets/css/admin.css) (chip con animación de pulso, botones de pestañas, consola monospace, switch toggle, badges de estado).
- **Nuevo usuario maestro**: Añadido usuario `dev` (clave `dev123`, rol `superadmin`) en [datos/usuarios.json](file:///c:/xampp/htdocs/LasVegas/datos/usuarios.json).

### Modificado
- [assets/js/admin/sesion.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/sesion.js): Registro del rol `superadmin`, pantalla de inicio `superadmin.html` y bypass de permisos para otorgarle acceso total a todas las páginas del panel.
- [assets/js/admin/panel.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/panel.js): Inclusión de la opción "Superadmin (Dev)" en el menú lateral y visibilidad de todas las secciones para el rol `superadmin`.
- [assets/js/admin/login.js](file:///c:/xampp/htdocs/LasVegas/assets/js/admin/login.js): Integración de cuentas personalizadas desde `lv_usuarios_custom` y función de autocompletado rápido al hacer clic en filas de la tabla de demostración.
- [assets/js/negocio.js](file:///c:/xampp/htdocs/LasVegas/assets/js/negocio.js): Integración de sobreescrituras en caliente desde `localStorage` (`lv_dev_config`) para aplicar cambios sin editar archivos.
- [assets/js/utilidades.js](file:///c:/xampp/htdocs/LasVegas/assets/js/utilidades.js): Chequeo de `modoMantenimiento` para renderizar el banner superior en la cabecera cuando el desarrollador lo active.
- [README.md](file:///c:/xampp/htdocs/LasVegas/README.md): Documentación del rol `superadmin`, credenciales de acceso y descripción de la nueva pantalla.

---

## [2026-10-20] - Inicialización de Auditoría
### Añadido
- Creación de [AGENTS.md](file:///c:/xampp/htdocs/LasVegas/AGENTS.md) estableciendo la directriz obligatoria de documentar todas las modificaciones del proyecto.
- Creación de este archivo [CHANGELOG.md](file:///c:/xampp/htdocs/LasVegas/CHANGELOG.md) para el seguimiento cronológico y detallado de futuras alteraciones.

