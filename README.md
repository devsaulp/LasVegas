# Licorería Las Vegas (Tarapoto)

Página web de catálogo y pedidos para Licorería Las Vegas. Esta es una versión **básica y visual**: se puede recorrer de punta a punta (aviso de edad, catálogo, carrito, pedido y confirmación), pero no tiene servidor, base de datos ni cuentas de usuario.

Hecha con HTML5, CSS3 y JavaScript puro, sin frameworks ni herramientas de compilación.

## Cómo ejecutar

El sitio carga los productos desde archivos JSON, por eso necesita un servidor web (al abrir `index.html` con doble clic el navegador bloquea la carga de datos). Todas las rutas del proyecto son relativas, así que funciona igual en la raíz del servidor o dentro de una subcarpeta.

### Con XAMPP (Apache)

1. Copia la carpeta del proyecto dentro de `C:\xampp\htdocs\` con el nombre `LasVegas`, de modo que quede `C:\xampp\htdocs\LasVegas\index.html`.

   Si prefieres trabajar en otra carpeta (por ejemplo `C:\LasVegas`) sin copiar archivos, crea un enlace desde una consola `cmd`:

   ```bat
   mklink /J C:\xampp\htdocs\LasVegas C:\LasVegas
   ```

2. Abre el **XAMPP Control Panel** y pulsa **Start** en **Apache**. No se necesita MySQL.
3. Entra en <http://localhost/LasVegas/> desde el navegador.

Si Apache no inicia porque el puerto 80 está ocupado, cambia `Listen 80` por `Listen 8080` en `C:\xampp\apache\conf\httpd.conf` y entra en <http://localhost:8080/LasVegas/>.

### Con Python (alternativa rápida)

Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Luego abre <http://localhost:8000> en el navegador.

### Reglas para mantener las rutas

Para que el sitio siga funcionando en una subcarpeta, nunca uses rutas que empiecen con `/`:

- Desde `index.html`: `assets/css/base.css`, `paginas/catalogo.html`.
- Desde `paginas/*.html`: `../assets/css/base.css`, `../index.html`, `catalogo.html`.
- En JavaScript, las rutas a imágenes, datos y páginas se arman con `LV.ruta('...')`, que antepone `""` o `"../"` según el atributo `data-raiz` del `<body>` de cada página.

Para volver a ver el aviso de mayoría de edad o vaciar todo, borra los datos del sitio en el navegador (o, en la consola, `localStorage.clear()`).

## Estructura

```
index.html                  Inicio: banner, categorías, destacados y promociones
paginas/
  catalogo.html             Lista de productos con filtro, búsqueda y orden
  producto.html             Detalle de producto (?id=p001)
  promociones.html          Promociones y combos
  carrito.html              Carrito de compras
  pedido.html               Formulario de pedido
  confirmacion.html         Número de pedido e instrucciones de pago
  delivery-contacto.html    Zonas, tarifas, horarios y contacto
assets/
  css/
    variables.css           Colores, tipografías y medidas (editar aquí)
    base.css                Reinicio, tipografía, cabecera y pie
    componentes.css         Botones, tarjetas, formularios, carrito, etc.
  js/
    negocio.js              Datos de contacto, Yape, cuenta y horarios (un solo archivo)
    edad.js                 Aviso de mayoría de edad
    carrito.js              Carrito guardado en localStorage
    utilidades.js           Funciones comunes, cabecera y pie
    inicio.js, catalogo.js, producto.js, promociones.js,
    carrito-pagina.js, pedido.js, confirmacion.js,
    delivery-contacto.js    Un archivo por página
  img/
    logo.png                Logo original
    logo-web.png            Copia liviana del logo (240 px) usada en el sitio
    logo-provisional.svg    Logo de reemplazo si falta el PNG
    productos/*.svg         Imágenes de reemplazo por categoría
datos/
  productos.json            Categorías y productos de ejemplo
  promociones.json          Promociones y combos de ejemplo
  zonas.json                Zonas de delivery con tarifas de ejemplo
docs/                       Documento técnico y anexos (Word)
```

## Cómo cambiar colores y tipografías

Todo está en `assets/css/variables.css`. Por ejemplo, para cambiar el dorado:

```css
--color-dorado: #F3C977;
```

El resto de archivos usa solo estas variables, así que no hay que tocar nada más.

## Cómo cambiar datos de contacto

Edita `assets/js/negocio.js`: nombre, dirección, teléfono, WhatsApp, correo, número de Yape, cuenta bancaria, horarios y cantidad máxima por producto. El pie de página, la página de contacto, el pedido y la confirmación toman los datos de ahí.

## Cómo cambiar productos, zonas y promociones

- **Productos**: `datos/productos.json`. Cada producto tiene `id`, `nombre`, `categoria`, `marca`, `presentacion`, `precio`, `stock`, `stock_minimo`, `destacado` y `descripcion`. Con `stock` 0 se muestra como agotado y no se puede agregar; con `stock` igual o menor que `stock_minimo` se muestra "Pocas unidades".
- **Zonas**: `datos/zonas.json`, con `tarifa`, `pedido_minimo` y `envio_gratis_desde`.
- **Promociones y combos**: `datos/promociones.json`. Las promociones de tipo `porcentaje` cambian el precio de los productos indicados; la de tipo `regalo` se avisa en el resumen del pedido al llegar al monto mínimo.

Para reemplazar el logo basta con cambiar `assets/img/logo.png` y volver a generar `logo-web.png` en tamaño pequeño (o sobrescribir directamente `logo-web.png`).

## Reglas de negocio aplicadas

- Aviso "¿Eres mayor de 18 años?" al entrar. Con "Sí" se recuerda en el navegador; con "No" se bloquea el contenido.
- Cervezas y Licores aparecen primero en inicio, menú de categorías y catálogo.
- Búsqueda por nombre sin distinguir mayúsculas ni tildes ("jabon" encuentra "Jabón").
- Un producto agotado no se puede agregar. La cantidad máxima es el menor valor entre el stock y 24.
- Pagos: efectivo, Yape y transferencia. Plin solo en tienda. Sin tarjeta.
- Con Yape o transferencia se pide el número de operación (6 a 12 dígitos). Con efectivo se pide con cuánto paga y se muestra el vuelto.
- Delivery: costo según la zona, envío gratis desde un monto y pedido mínimo por zona. Recojo: sin costo ni dirección.
- Teléfono de 9 dígitos que empieza con 9.
- Declaración obligatoria de mayoría de edad al confirmar el pedido.
- Número de pedido con formato `LV-AAAAMMDD-####`.
- Moneda con formato `S/ 12.50`.

## Lo que quedó simulado

- **No hay servidor**: el pedido no llega a la tienda. Se guarda solo en el `localStorage` del navegador y la página de confirmación lo lee de ahí.
- **Número de pedido**: el correlativo `####` es diario y cuenta solo los pedidos hechos en ese navegador.
- **Stock**: se lee de `productos.json` y no se descuenta al pedir.
- **Pagos**: no se verifica el número de operación; solo se valida su formato.
- **Contacto, Yape, cuenta bancaria, dirección, horarios, tarifas y precios**: todos son datos ficticios o de ejemplo.
- **Imágenes de producto**: dibujos SVG por categoría, no fotos reales.
- **Horarios de pedido**: se muestran, pero no se bloquean pedidos fuera de horario.

## Decisiones tomadas

- Los datos de contacto viven en `assets/js/negocio.js` (y no en un JSON) para que la cabecera y el pie se muestren sin esperar una descarga.
- La cabecera y el pie se arman con JavaScript desde `utilidades.js` para no repetirlos en cada página.
- Se generó `logo-web.png` (240 px) porque `logo.png` pesa más de 2 MB.
- Zonas de ejemplo: Tarapoto centro, Morales, La Banda de Shilcayo y una zona periférica, con tarifas inventadas.
- Las promociones no son acumulables: cada producto tiene como máximo un descuento.
- Al confirmar el pedido el carrito se vacía.
- El script de la página del carrito se llama `carrito-pagina.js` para no confundirse con el módulo `carrito.js`.

## Pruebas realizadas

Se revisaron todas las páginas con Playwright (Chromium) a 360 px y 1280 px, sin errores de consola ni desplazamiento horizontal, tanto con `python -m http.server` como con Apache de XAMPP en <http://localhost/LasVegas/> (sin errores 404, sin rutas absolutas y con todos los enlaces internos funcionando). Se probó el recorrido completo: aviso de edad (Sí y No), búsqueda y orden, agregar al carrito, cambiar cantidades, quitar, pedido con delivery y Yape, pedido con recojo y efectivo (vuelto) y confirmación.

---

Tomar bebidas alcohólicas en exceso es dañino. Venta prohibida a menores de 18 años.
