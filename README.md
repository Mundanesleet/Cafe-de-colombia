# Compro Café de Colombia — Frontend MVP

Primera versión funcional (estática) del storefront de **Compro Café de Colombia**, implementada a partir del proyecto de Google Stitch **"Rediseño Compro Café Colombia"** (pantallas *Marketplace de Café 100% Colombiano* para desktop y *Versión Móvil Responsive*, más el design system "Origen & Grano").

No es una maqueta: el catálogo, la búsqueda, los filtros, el carrito, el detalle de producto y la navegación funcionan. Los datos son estáticos y están separados de la presentación, listos para reemplazarse por una API.

---

## Cómo ejecutarlo

No requiere instalación ni compilación.

- **Opción rápida:** abre `index.html` con doble clic en el navegador.
- **Recomendado (servidor local):** desde la carpeta del proyecto, ejecuta uno de estos comandos y abre `http://localhost:8080`:

  ```bash
  npx serve -l 8080 .
  # o
  python -m http.server 8080
  ```

Los scripts son clásicos (no módulos ES) precisamente para que el sitio también funcione abierto como archivo (`file://`).

## Tecnologías

- HTML5 semántico (`header`, `nav`, `main`, `section`, `article`, `footer`)
- CSS3 sin frameworks: custom properties, Grid, Flexbox y media queries
- JavaScript vanilla (ES2020), sin dependencias
- Google Fonts: Newsreader (titulares) y Plus Jakarta Sans (interfaz), las del design system
- Iconos Material Symbols, incrustados como sprite SVG (no hay fuente de iconos ni librerías)

## Estructura

```
Cafe-Colombia/
├── index.html                 Landing + catálogo (home)
├── pages/
│   ├── producto.html          Detalle de producto → producto.html?id=<id>
│   ├── blog.html              Listado del blog → blog.html  ·  artículo → blog.html?id=<id>
│   └── informacion.html       Ayuda: FAQ, contacto, términos, cambios, envíos
├── css/
│   ├── tokens.css             Variables del design system (colores, tipografía, radios…)
│   ├── base.css               Reset, escala tipográfica, utilidades, animación reveal
│   ├── layout.css             Header, navegación, drawers, footer, ritmo de secciones
│   ├── components.css         Botones, chips, tarjeta de producto, filtros, paginación, carrito, toast
│   ├── sections.css           Secciones de la home (hero, buscador sensorial, regiones, promo…)
│   ├── pages.css              Detalle de producto, blog y ayuda
│   └── responsive.css         Todos los breakpoints (incluye la adaptación al diseño móvil)
├── js/
│   ├── core/
│   │   ├── boot.js            Marca <html class="js"> antes del primer pintado
│   │   ├── config.js          Configuración (rutas, API, paginación, rango de precio)
│   │   ├── utils.js           Formato de precios, normalización de texto, helpers DOM
│   │   └── icons.js           Sprite SVG de iconos
│   ├── data/
│   │   ├── products.js        Dataset de productos (demostración)
│   │   └── content.js         Taxonomías de filtros, tarjetas "Encuentra tu café", regiones, blog
│   ├── services/
│   │   ├── product-service.js getProducts(), getProductById(), getRelatedProducts()
│   │   ├── search.js          searchProducts()
│   │   ├── filters.js         filterProducts(), estado de filtros, sincronización con la URL
│   │   └── cart-service.js    addToCart(), updateQuantity(), removeFromCart()… + localStorage
│   ├── components/
│   │   ├── ui.js              Overlays (drawers/sheets con focus trap), toast, reveal on scroll
│   │   ├── layout.js          Header, menú móvil, footer (una sola definición para todas las páginas)
│   │   ├── product-card.js    Tarjeta de producto
│   │   └── cart-drawer.js     Drawer del carrito
│   ├── pages/
│   │   ├── home.js            Catálogo, filtros, orden, paginación, regiones, blog
│   │   ├── product.js         Detalle de producto
│   │   └── blog.js            Listado y artículo
│   └── app.js                 Arranque común + "Añadir al carrito" global
└── assets/
    ├── images/products/       Fotos de producto (provistas en Stitch)
    ├── images/editorial/      Fotografía editorial (hero, regiones, blog)
    ├── images/banners/        Banners reales del cliente
    ├── logos/                 Logo co-branding Compro Café de Colombia · FNC
    └── icons/                 Favicon
```

**Flujo de datos:** `data/` → `services/` (lógica pura) → `pages/` y `components/` (UI). Ningún producto está escrito en el HTML: todo se genera desde `js/data/products.js` a través de `productService`.

## Funcionalidades

| Área | Qué hace |
|---|---|
| Navegación | Menú desktop con submenú "Acerca de" (hover, clic y teclado), resaltado de la sección visible y menú lateral móvil que se cierra con la X, al elegir una opción, al tocar fuera o con `Esc`. |
| Búsqueda | Desde el header (desktop o lupa móvil). Busca por nombre, marca, departamento, sabor, tipología, tostión y notas, sin distinguir tildes ("narino" encuentra Nariño). Actualiza el catálogo mientras escribes; desde otras páginas lleva al catálogo con la búsqueda aplicada. |
| Filtros | Marca (con buscador), departamento, sabores, nivel de tostión, tipología y precio máximo. Se combinan: OR dentro de un filtro y AND entre filtros. **Aplicar filtros** muestra cuántos resultados habrá antes de aplicar. **Limpiar filtros** reinicia. Los filtros activos aparecen como chips y cada uno se puede quitar por separado. En móvil y tablet los filtros se abren en un bottom sheet desde **Filtrar cafés**. |
| Orden | Más populares, precio menor a mayor, precio mayor a menor, nombre A-Z y novedades. |
| URL | Búsqueda, filtros y orden se reflejan en la URL (`?departamento=Huila&sabor=Chocolate`), así que los enlaces se pueden compartir. |
| Encuentra tu café | Cada chip (sabor, tostión, método, origen) lleva al catálogo filtrado. |
| Colombia Cafetera | Pestañas de región (accesibles con flechas del teclado). "Ver cafés de esta región" filtra por sus departamentos. |
| Carrito | Drawer con cantidades (+/−), eliminar, subtotal y total. Contador en el icono. Se guarda en `localStorage`. |
| Producto | `producto.html?id=N`: imagen, marca, precio, origen, tostión, sabores, presentación, tipología, molienda, cantidad y agregar al carrito; además, cafés similares. |

## Cómo agregar productos

Agrega un objeto al arreglo de `js/data/products.js` respetando la forma documentada al inicio del archivo:

```js
{
  id: 15,                                   // único y numérico
  slug: "cafe-ejemplo-500g",
  name: "Café Ejemplo - Origen",
  brand: "Marca Ejemplo",                   // aparece automáticamente en el filtro de marcas
  weight: "500 g",
  price: 42000,                             // COP, sin puntos
  image: "assets/images/products/cafe-ejemplo-500g.jpg", // o null → placeholder rotulado
  department: "Huila",                      // aparece automáticamente en el filtro de origen
  roast: "Medio",                           // "Ligero" | "Medio" | "Oscuro"
  flavors: ["Chocolate", "Dulce"],          // valores de taxonomy.flavors
  types: ["Grano", "Molido"],               // "Grano" | "Molido" | "Soluble"
  methods: ["Espresso", "Filtrado V60"],
  notes: "Cacao, panela, cuerpo medio",
  description: "…",
  badge: "Huila", badgeTone: "cafeto",      // etiqueta de la tarjeta y su color en móvil
  status: "Disponible",
  popularity: 15, addedAt: "2026-10-01",
  featured: false, demoAttributes: false,
}
```

Las marcas y los departamentos de los filtros, junto con sus contadores, se calculan a partir de los productos. No hay que tocar el HTML.

## Cómo modificar filtros

- **Vocabularios** (sabores, tostiones, tipologías, métodos, moliendas): `taxonomy` en `js/data/content.js`.
- **Nuevo filtro**: agrégalo a `FACETS` en `js/services/filters.js` (campo del producto, etiqueta y parámetro de URL) y su control en `renderFilterBody()` de `js/pages/home.js`.
- **Rango de precio y tamaño de página**: `price` y `catalog` en `js/core/config.js`.
- **Opciones de orden**: `SORTS` en `js/services/filters.js`.

## Cómo cambiar imágenes

- **Producto:** coloca la imagen en `assets/images/products/` (cuadrada, unos 900×900 px, en JPG) y actualiza `image` del producto. Si es `null`, se muestra un placeholder rotulado "Imagen próximamente".
- **Hero:** `assets/images/editorial/hero-cafetal.jpg` (desktop) y `hero-cafetal-mobile.jpg` (móvil), referenciadas en `index.html`.
- **Regiones y blog:** campos `image` en `js/data/content.js`.
- **Logo:** `assets/logos/compro-cafe-colombia-fnc.png`. En el footer se muestra en blanco con un filtro CSS.

## Cómo funciona el carrito (y localStorage)

- Toda la lógica vive en `js/services/cart-service.js`. La UI (`cart-drawer.js`) solo dibuja el estado.
- Cada línea guarda una copia del producto (nombre, precio, imagen, presentación), la molienda elegida y la cantidad. El mismo café con distinta molienda ocupa líneas distintas.
- Cada cambio se guarda en `localStorage` con la clave `ccc.cart.v1` y emite el evento `cart:change`, al que se suscriben el contador y el drawer.
- El carrito sobrevive a recargas, se sincroniza entre pestañas abiertas (evento `storage`) y sigue funcionando para la visita actual si el navegador bloquea el almacenamiento (modo privado).
- La cantidad por línea se limita a 20 (`MAX_QUANTITY`).
- **Finalizar compra** aún no procesa pagos: muestra un aviso, porque la pasarela ePayco/PSE se integrará con el backend.

## Conectar una API (siguiente fase)

La UI nunca lee `CCC.data.products` directamente: siempre pasa por `CCC.productService`, cuyas funciones ya son asíncronas.

1. En `js/core/config.js`, define `apiBaseUrl: "/api"`.
2. Expón en el backend:
   - `GET /api/products` → arreglo de productos con la forma de `products.js`
   - `GET /api/products/:id` → un producto (404 si no existe)
3. Con eso el catálogo, el detalle y los relacionados pasan a usar la API sin cambios en la UI. Si el backend responde con otro formato, adapta solo `fetchJson()`/`getProducts()` en `product-service.js`.
4. Para el carrito del lado del servidor, reemplaza la persistencia de `cart-service.js` (`load`/`persist`) por llamadas a la API, manteniendo las mismas funciones públicas y el evento `cart:change`.
5. El filtrado y la búsqueda son funciones puras (`filters.js`, `search.js`). Con un catálogo grande se pueden mover al servidor enviando `toSearchParams(state)` como query string.

## Responsive

Breakpoints: ≥1440 (diseño desktop tal cual) · 1280–1439 (header más compacto) · 1024–1279 (menú hamburguesa y grilla de 2 columnas) · 768–1023 (tablet: filtros en bottom sheet) · <768 (**diseño móvil de Stitch**). Se verificó a 1440, 1280, 1024, 768, 430, 390 y 375 px, sin scroll horizontal.

Por debajo de 768 px no se escala el diseño de escritorio: se aplica el móvil de Stitch (header blanco, carruseles horizontales, tarjetas compactas de 2 columnas, regiones en píldoras, acordeones en el footer y acentos en rojo cereza).

## Accesibilidad

Botones y enlaces reales, `alt` descriptivo, `label` en todos los controles, foco visible, enlace "Saltar al contenido", drawers con focus trap y cierre con `Esc`, `aria-expanded`/`aria-pressed`/`aria-selected`, regiones `aria-live` para resultados y toasts, áreas táctiles ≥ 40 px en móvil y soporte para `prefers-reduced-motion`. Los estados no dependen solo del color: los activos invierten el fondo o llevan borde o indicador.

## Datos de demostración — importante

- **Nombres, marcas, presentaciones y precios** provienen del listado público de comprocafedecolombia.com y del diseño de Stitch.
- **Departamento, tostión, sabores, métodos, notas y descripciones son datos de demostración** (`demoAttributes: true`). La página de producto lo indica, y deben validarse con cada marca antes de publicar.
- Cuatro productos (Cuatro Aventureros, Ocamon, Umbras, Hacienda La Mesa) no tienen foto en el proyecto y muestran un placeholder rotulado.
- Los **artículos del blog** y los textos de **Ayuda** son contenido de demostración y están marcados como tal.
- Se omitieron afirmaciones del diseño que podrían pasar por datos oficiales sin respaldo, como premios o puntajes SCA de productos concretos.
- "Mi cuenta", "Finalizar compra" y los enlaces de redes sociales muestran un aviso hasta que existan backend y URLs oficiales.
