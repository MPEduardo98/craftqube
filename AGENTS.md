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
- `getAllProductoSlugs()`, `getAllCategoriaSlugs()` → para `generateStaticParams` y el sitemap.
- Al carrito se agrega la **variante** (`producto.variante_id`), no el `id` del producto.

**En componentes de cliente:**
- Sesión: `authClient` (`@mpeduardo98/commerce-core/auth/auth-client`) → `signIn.email`, `signUp.email`, `signOut`, `requestPasswordReset`…; `AuthProvider` / `useAuth()` (`@mpeduardo98/commerce-core/auth/context-index`).
- Carrito: `CartProvider` / `useCart()` (`@mpeduardo98/commerce-core/cart`) → `items`, `addItem`, `updateQty`, `removeItem`, `clearCart`, `totalItems`, `totalPrecio`, `isOpen`, `openDrawer`, `closeDrawer`. El núcleo **no trae pantallas** de carrito: el botón, el panel lateral y la página se diseñan aquí.
- Checkout: `CheckoutProvider` / `useCheckout()` (`@mpeduardo98/commerce-core/checkout`) tienen el estado y las acciones del flujo (contacto → envío → pago → confirmación), más `validaciones` y `cotizarEnvio`. Las pantallas de cada paso se diseñan aquí.
- Envío en el checkout: tras `cargarResumen(estado, cupon)`, `resumen.opciones_envio` trae lo que el cliente puede elegir (`nombre`, `logo_url`, `dias_min`/`dias_max`, `precio`, `precio_original`, `gratis`). Si `resumen.envio_modo === "fijo"` hay que mostrar las paqueterías para que elija una con `elegirPaqueteria(id)` (recalcula el total) y mandar `paqueteria_id: paqueteriaId` en el cuerpo de `POST /api/checkout/pagar`; en modo `"dinamico"` hay una sola opción y no se manda nada. `resumen.envio_gratis_desde` sirve para avisar cuánto falta para el envío gratis.
- Avisos: `AlertProvider` / `useAlert()` (`@mpeduardo98/commerce-core/context`).
- Formato e imágenes: `formatPrice` (`@mpeduardo98/commerce-core/lib`), `resolveImageUrl` (`@mpeduardo98/commerce-core/media/resolveImageUrl`).
- Los providers (`AlertProvider`, `AuthProvider`, `CartProvider`) van en el `layout.tsx` raíz de la tienda.

**APIs públicas del núcleo** (ya existen en esta tienda):
- `POST, GET /api/auth/[...all]`
- `POST /api/cart/validar`
- `GET /api/catalogo`
- `GET /api/categorias`
- `POST /api/checkout/pagar`
- `POST /api/checkout/resumen`
- `POST /api/cupones/validar`
- `POST /api/envio/cotizar`
- `POST /api/envio/opciones`
- `GET /api/exchange-rate`
- `GET /api/marcas`
- `POST /api/orders/send-confirmation`
- `POST, GET /api/pedidos`
- `GET /api/pedidos/[id]`
- `GET /api/productos`
- `GET /api/productos/[slug]`
- `GET /api/productos/relacionados`
- `POST /api/stripe/webhook`
- `GET, POST /api/users/addresses`
- `PATCH /api/users/profile`

## Datos de arranque

- Admin por defecto de una base recién instalada: `admin@tienda.com` / `admin123` (cambiar antes de publicar). Se entra por el `/login` de la tienda.
- El checkout y los métodos de pago están en revisión en el núcleo: antes de diseñar el checkout, pregúntale al usuario.

<!-- END:commerce-core -->
