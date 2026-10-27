<!-- BEGIN:commerce-core -->

# Esta tienda usa el núcleo `@mpeduardo98/commerce-core`

Este bloque lo escribe `npx commerce-core instalar`. No lo edites: se reescribe en cada instalación.

## Qué es de quién

- **El núcleo** (repo GitHub MPEduardo98/commerce-core, instalado en `node_modules/@mpeduardo98/commerce-core`) tiene **todo el backend y el panel admin**: base de datos, APIs, pedidos, cobros, cuentas, correos y `/admin`. Es el mismo para todas las tiendas.
- **Esta tienda** sólo tiene su **frontend público**, diseñado desde cero: inicio, catálogo, categoría, producto, carrito, checkout, login/registro, cuenta, páginas legales, header y footer.

## Reglas

- **No escribas backend aquí.** Nada de consultas SQL, conexiones a la base, rutas en `src/app/api` ni páginas en `src/app/admin`. Si una pantalla necesita un dato o una acción que el núcleo no ofrece, **díselo al usuario**: se agrega al núcleo, no a la tienda.
- **No edites los archivos que empiezan con** `// @generado por commerce-core` (los "enchufes" de `src/app/api`, `src/app/admin` y `proxy.ts`). Los reescribe `npx commerce-core instalar`.
- **No copies el diseño de otra tienda del núcleo** (p. ej. craftqube). Cada tienda tiene identidad propia.
- Nombre, logo, colores y moneda de la tienda se configuran en `/admin/ajustes`; léelos con `getStoreConfig()` de `@mpeduardo98/commerce-core/config` en vez de escribirlos a mano.
- **No generes imágenes ni gráficos**: nada de SVG ilustrativos, ilustraciones, íconos dibujados a mano, patrones decorativos ni imágenes generadas. Gastan muchos tokens y siempre se reemplazan por fotos reales. Sí **deja el espacio** para cada imagen: un contenedor con su proporción fija (`aspect-ratio`) y un fondo neutro mientras no haya foto, con `next/image` y un `alt` descriptivo, para que al poner la foto real no se mueva el diseño. Para íconos usa Font Awesome, que ya viene con el núcleo.

## Estructura de archivos: screaming architecture (obligatorio)

Todo el frontend se organiza por **lo que hace la tienda** (dominios del negocio), no por tipo técnico. Al abrir el proyecto, las carpetas deben "gritar" que es una tienda.

```
src/app/                   ← SOLO rutas. Cada page.tsx / layout.tsx es delgado:
                             importa de features/ y compone. Sin lógica ni estilos largos.
src/features/              ← una carpeta por dominio de la tienda
  catalogo/                ← listado, filtros, búsqueda
  producto/                ← detalle, galería, variantes
  carrito/
  checkout/
  cuenta/                  ← perfil, pedidos, direcciones, favoritos
  auth/                    ← login, registro, recuperar contraseña
  marketing/               ← inicio, nosotros, contacto, FAQ
  legal/                   ← políticas
    <cada feature>/
      components/  hooks/  lib/  types/   (sólo las que necesite)
src/shared/                ← lo que usan VARIAS features: ui/ (botones, inputs…),
                             layout/ (header, footer), lib/, hooks/
```

- **Prohibido** agrupar por tipo en la raíz: nada de `components/`, `hooks/` o `utils/` globales con todo revuelto.
- Una feature **no importa archivos internos de otra**. Si dos features comparten algo, va a `shared/`.
- Si algo sólo lo usa una feature, vive dentro de esa feature aunque parezca "genérico".
- Nombres de carpetas y archivos en español y por dominio (`checkout/components/PasoEnvio.tsx`, no `components/Step2.tsx`).

## Qué usar del núcleo en el frontend

**Datos en páginas del servidor** (`@mpeduardo98/commerce-core/catalogo`):
- `getProductosCatalogo({ q, cat, marca, soloStock, sort, page, limit })` → `{ productos, total, pages }`. `sort`: `reciente | precio_asc | precio_desc | az | za`.
- `getProductoBySlug(slug)` → detalle con variantes, imágenes, atributos (o `null`).
- `getCategorias()`, `getCategoriaBySlug(slug)`.
- `getProductosRelacionados(slug, { limit })` → tarjetas para "También te puede interesar" en la ficha, ya elegidas según lo que configuró el admin en el producto (automáticas por categoría/marca/nombre, manuales en su orden, u ocultas: entonces devuelve `[]` y no se pinta la sección). Misma forma que el catálogo. En cliente: `GET /api/productos/relacionados?producto=<slug>&limit=4`; no uses la forma vieja `?categoria=`, que ignora la config.
- `getAllProductoSlugs()`, `getAllCategoriaSlugs()` → para `generateStaticParams` y el sitemap.
- Al carrito se agrega la **variante** (`producto.variante_id`), no el `id` del producto.

**En componentes de cliente:**
- Sesión: `authClient` (`@mpeduardo98/commerce-core/auth/auth-client`) → `signIn.email`, `signUp.email`, `signOut`, `requestPasswordReset`…; `AuthProvider` / `useAuth()` (`@mpeduardo98/commerce-core/auth/context-index`).
- Carrito: `CartProvider` / `useCart()` (`@mpeduardo98/commerce-core/cart`) → `items`, `addItem`, `updateQty`, `removeItem`, `clearCart`, `totalItems`, `totalPrecio`, `isOpen`, `openDrawer`, `closeDrawer`. El núcleo **no trae pantallas** de carrito: el botón, el panel lateral y la página se diseñan aquí.
- Checkout: `CheckoutProvider` / `useCheckout()` (`@mpeduardo98/commerce-core/checkout`) tienen el estado y las acciones del flujo (contacto → envío → pago → confirmación), más `validaciones` y `cotizarEnvio`. Las pantallas de cada paso se diseñan aquí.
- Envío en el checkout: tras `cargarResumen(estado, cupon)`, `resumen.opciones_envio` trae lo que el cliente puede elegir (`nombre`, `logo_url`, `dias_min`/`dias_max`, `precio`, `precio_original`, `gratis`). Si `resumen.envio_modo === "fijo"` hay que mostrar las paqueterías para que elija una con `elegirPaqueteria(id)` (recalcula el total) y mandar `paqueteria_id: paqueteriaId` en el cuerpo de `POST /api/checkout/pagar`; en modo `"dinamico"` hay una sola opción y no se manda nada. `resumen.envio_gratis_desde` sirve para avisar cuánto falta para el envío gratis.
- Reseñas (se activan en `/admin/ajustes/resenas`; apagadas, no se muestra nada): `getProductoBySlug` trae `resenas` (`promedio`, `total`, `distribucion` por estrella, `con_fotos`) o `null` si están apagadas; el catálogo trae `calificacion` y `total_resenas` por producto y acepta `sort: "calificacion"`. La lista se pide a `GET /api/resenas?producto_id=&page=&orden=recientes|mejores|peores&estrellas=&con_fotos=1`. Sólo reseña quien **compró** el producto: `GET /api/resenas/elegibilidad?producto_id=` dice si mostrar el formulario (`puede`) o por qué no (`motivo`: `sin_sesion`, `sin_compra`, `ya_reseno`, `desactivadas`). Para enviar usa `enviarResena({ productoId, calificacion, titulo, comentario, imagenes })` de `@mpeduardo98/commerce-core/resenas/cliente` (1-5 estrellas, comentario de 10 a 2000 caracteres, 0 a 3 fotos que comprime antes de subir); `LIMITES_RESENA` está en `@mpeduardo98/commerce-core/resenas/limites` y los tipos en `@mpeduardo98/commerce-core/resenas/types`. Si responde `estado: "pendiente"`, avisa que la tienda la revisará. `GET /api/resenas/pendientes` lista lo que el cliente compró y aún no reseña (para su cuenta).
- Modal de bienvenida (se activa en `/admin/ajustes/bienvenida`, donde el admin elige el cupón que se regala): `useBienvenida({ retrasoMs, diasOcultar, habilitado })` de `@mpeduardo98/commerce-core/bienvenida/useBienvenida` → `oferta` (`texto` listo para mostrar, p. ej. "10% de descuento", `tipo`, `valor`, `minimo_compra`), `visible`, `estado` (`idle | enviando | enviado | error`), `error`, `codigo`, `enviar({ nombre, email, acepta_marketing })`, `cerrar()`, `abrir()`. El hook decide cuándo aparece (promoción activa, tras el retraso, no a quien ya se suscribió ni a quien lo cerró hace poco); aquí sólo se diseña el modal. Si `oferta` es `null`, no se muestra nada. Con `estado === "enviado"` muestra `codigo` en el modal con un botón para copiarlo (también le llega por correo). `codigo` sigue disponible en visitas posteriores, por si quieres recordárselo en el carrito. El cupón sólo funciona al pagar con el correo suscrito: avísalo junto al código. Pásale `habilitado: false` en checkout y cuenta. Enlaza el aviso de privacidad en el formulario.
- **Modo de venta** (se elige en `/admin/ajustes/venta`): la tienda puede vender en línea o funcionar **sólo como catálogo**. Todo el frontend tiene que funcionar en ambos modos. Léelo en el `layout.tsx` raíz con `getVentaPublica()` de `@mpeduardo98/commerce-core/venta` y pásalo por props o un contexto propio (en cliente también está `GET /api/venta`). Devuelve `ventaEnLinea`, `mostrarPrecios`, `whatsapp` y `mensajeWhatsapp`. Con `ventaEnLinea === false`: no pintes botón ni panel de carrito, "Agregar al carrito", "Comprar ahora" ni enlaces al checkout; las páginas `/carrito` y `/checkout` hacen `redirect("/")`; en su lugar pon "Pedir informes" con `enlaceWhatsApp(venta, { producto: producto.titulo, url })` de `@mpeduardo98/commerce-core/venta/whatsapp` (devuelve `null` si no hay número: entonces usa el teléfono o correo de `getStoreConfig()`). No muestres existencias como "Agotado"/"Últimas piezas" si no aportan. Con `mostrarPrecios === false` no pintes ningún precio (tarjetas, detalle, variantes, filtros y orden por precio) y muestra "Precio a consultar". Las APIs de checkout, envío y cupones responden 403 con `codigo: "modo_catalogo"` en catálogo, y el modal de bienvenida no aparece solo (`oferta` es `null`).
- Avisos: `AlertProvider` / `useAlert()` (`@mpeduardo98/commerce-core/context`).
- Contacto: se configura en `/admin/ajustes/contacto` y los mensajes se consultan en `/admin/contacto`. Crear la página pública de la tienda con `getContactoPublico()` de `@mpeduardo98/commerce-core/contacto` y `ContactoForm` de `@mpeduardo98/commerce-core/contacto/ContactoForm` (props: `config`, `className`, `privacidadUrl`); darle estilos y enlazarla desde la navegación. Si `activo` es false, ocultar el enlace/formulario. Para diseño propio: `GET /api/contacto` entrega las reglas y `POST /api/contacto` recibe los campos. Correo y mensaje son obligatorios. El núcleo guarda la consulta y manda un acuse al visitante y una notificación al correo configurado de la tienda mediante Resend. No implementar estos envíos en el frontend. Ejecutar instalar y migrar al actualizar.
- **Páginas de información** (aviso de privacidad, términos, reembolsos, preguntas frecuentes…): el admin las escribe en `/admin/paginas` con un editor de texto. **No escribas su texto en la tienda.** La URL es `/<grupo>/<slug>` (`/legal/aviso-de-privacidad`, `/ayuda/preguntas-frecuentes`, `/informacion/nosotros`). Crea una sola ruta dinámica `src/app/[grupo]/[slug]/page.tsx`: si `grupo` no está en `GRUPOS_PAGINA` → `notFound()`; `getPaginaBySlug(slug)` de `@mpeduardo98/commerce-core/paginas` (`null` si no existe o es borrador → `notFound()`); si `pagina.grupo !== grupo` (el admin la cambió de grupo) → `permanentRedirect(rutaPagina(pagina))`. Arma todos los enlaces con `rutaPagina(pagina)`, nunca a mano; `generateMetadata` con `metadataPagina(pagina)` de `@mpeduardo98/commerce-core/seo` y el HTML en `dangerouslySetInnerHTML={{ __html: pagina.contenido }}` (ya viene limpio) dentro de un contenedor con estilos propios para `h2`, `h3`, `h4`, `p`, `ul`, `ol`, `blockquote`, `hr` y `a`. Trae `titulo`, `grupo` (`legal | ayuda | informacion`) y `updated_at` (muéstralo como "Última actualización"). Para el footer usa `getPaginas()` (o `{ grupo: "legal" }`) en el layout: devuelve `{ slug, titulo, grupo }` de las publicadas en el orden del panel; no escribas los enlaces a mano. En cliente: `GET /api/paginas?grupo=` y `GET /api/paginas/<slug>`. `metadataPagina` y `sitemapTienda` (que ya las incluye) usan la misma URL. Enlaza el aviso de privacidad real (`/legal/aviso-de-privacidad`) en contacto, registro, bienvenida y analítica.
- Formato e imágenes: `formatPrice` (`@mpeduardo98/commerce-core/lib`), `resolveImageUrl` (`@mpeduardo98/commerce-core/media/resolveImageUrl`).
- Los providers (`AlertProvider`, `AuthProvider`, `CartProvider`) van en el `layout.tsx` raíz de la tienda.
- Analítica: el panel está en `/admin/dashboard`. Monta `AnalyticsConsent` de `@mpeduardo98/commerce-core/analytics/Analytics` en el layout público con el enlace real de privacidad, y una sola `AnalyticsPage` por página (`page="home"`, o `page="product" productId={producto.id}`; en la entrada del checkout añade `checkout`). Los nombres son etiquetas constantes, nunca URLs ni datos personales. Marca botones con `data-analytics-click="nombre_estatico"`. Dentro del formulario de registro monta `AnalyticsRegistrationStart`; `AuthProvider.register` mide el éxito y `CartProvider.addItem` mide adiciones automáticamente. Si usas authClient directamente, llama `track("registration_complete")` tras éxito desde `@mpeduardo98/commerce-core/analytics/client`. Añade preferencias para revocar con `setAnalyticsConsent(false)`. `AnalyticsDemographics` es una encuesta opcional para adultos. Sin consentimiento no se mide navegación. Instala rutas y migra antes de activar.

**SEO** (`@mpeduardo98/commerce-core/seo`): lo que sale de la base (productos, categorías, sitemap) lo arma el núcleo; aquí sólo se conecta. Las páginas propias de la tienda (inicio, nosotros, landings) escriben su propio `metadata`.
- Layout raíz: `export const generateMetadata = () => metadataTienda()` → nombre, descripción y favicon de `/admin/ajustes`, y el formato `"Página | Tienda"` para todos los títulos (`plantilla` lo cambia).
- Producto: `generateMetadata` devuelve `metadataProducto(producto)`, y la página incluye `<JsonLd datos={await jsonLdProducto(producto)} />` (una oferta por variante con precio, rebaja, envío por estado y estrellas para Google).
- Categoría: `generateMetadata` devuelve `metadataCategoria(categoria)`.
- `app/sitemap.ts`: `export default () => sitemapTienda({ paginas: ["/", …] })`. `app/robots.ts`: `export default () => robotsTienda()`.
- Google Merchant Center: `app/feeds/google.xml/route.ts` con `export const revalidate = 3600; export const GET = () => feedGoogleMerchant()` (`@mpeduardo98/commerce-core/seo/merchant`) → un artículo por variante con precio, rebaja, existencias, fotos, marca, GTIN y peso. En Merchant Center se añade como "enlace a tu archivo" con `https://<tienda>/feeds/google.xml`. En modo catálogo con precios ocultos sale vacío.
- Las URLs por defecto son `/productos/[slug]` y `/categoria/[slug]`. Si la tienda usa otras, pásalas en `rutas: { producto, categoria }` a cada función.
- La dirección pública sale de `NEXT_PUBLIC_SITE_URL`: sin ella las URLs canónicas apuntan a localhost.

- Pagos: configura los métodos en `/admin/ajustes/pagos`. En la pantalla pública de pago, filtra las opciones con `metodosPago` de `useCheckout()` (null hasta cargar el resumen; [] bloquea pagar), con `data.metodos_pago` de `POST /api/checkout/resumen` o con `GET /api/pagos` (`data.metodos`). Si el método elegido desaparece, pide otra selección. Ante `metodo_pago_desactivado` vuelve a consultar los métodos. El servidor rechaza métodos apagados antes de crear pedidos. SPEI y OXXO sólo están disponibles en MXN. Los ajustes no cancelan instrucciones de pago ya emitidas. Las claves de Stripe se gestionan en el alojamiento; el panel muestra un diagnóstico local sin exponer secretos.

**APIs públicas del núcleo** (ya existen en esta tienda):
- `POST /api/analytics`
- `POST, GET /api/auth/[...all]`
- `GET, POST /api/bienvenida`
- `POST /api/cart/validar`
- `GET /api/catalogo`
- `GET /api/categorias`
- `POST /api/checkout/pagar`
- `POST /api/checkout/resumen`
- `GET, POST /api/contacto`
- `POST /api/cupones/validar`
- `POST /api/envio/cotizar`
- `POST /api/envio/opciones`
- `GET /api/exchange-rate`
- `GET /api/marcas`
- `POST /api/orders/send-confirmation`
- `GET /api/paginas`
- `GET /api/paginas/[slug]`
- `GET /api/pagos`
- `POST, GET /api/pedidos`
- `GET /api/pedidos/[id]`
- `GET /api/productos`
- `GET /api/productos/[slug]`
- `GET /api/productos/relacionados`
- `GET, POST /api/resenas`
- `GET /api/resenas/elegibilidad`
- `GET /api/resenas/pendientes`
- `POST /api/stripe/webhook`
- `GET, POST /api/users/addresses`
- `PATCH /api/users/profile`
- `GET /api/venta`

## Datos de arranque

- Al actualizar el núcleo: `npx commerce-core instalar` (rutas nuevas) y `npx commerce-core migrar` (cambios de base de datos). **Nunca** `npx commerce-core db` en una tienda con datos: la deja vacía.
- Admin por defecto de una base recién instalada: `admin@tienda.com` / `admin123` (cambiar antes de publicar). Se entra por el `/login` de la tienda.

<!-- END:commerce-core -->


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
