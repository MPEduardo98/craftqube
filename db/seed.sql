-- ============================================================
-- Datos semilla para una tienda nueva
--
-- Se ejecuta DESPUÉS de db/schema.sql. Deja la tienda en un
-- estado mínimo operable: identidad genérica, moneda y límites
-- de envío por defecto. Todo esto se edita luego desde
-- /admin/ajustes — aquí sólo se garantiza que ninguna consulta
-- se encuentre con la tabla vacía.
--
-- NO contiene productos, categorías ni usuarios: eso lo carga
-- cada tienda por su cuenta.
--
--   mysql -u USUARIO -p NOMBRE_BD < db/seed.sql
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- Configuración base (clave/valor)
--
-- INSERT IGNORE: si la clave ya existe no se pisa. Esto hace el
-- archivo re-ejecutable sobre una tienda ya configurada sin
-- borrarle sus ajustes.
-- ------------------------------------------------------------
INSERT IGNORE INTO `configuracion` (`clave`, `valor`) VALUES
  -- ── Identidad ────────────────────────────────────────────
  ('tienda_nombre',        'Mi Tienda'),
  ('tienda_descripcion',   ''),
  ('tienda_logo_url',      ''),
  ('tienda_favicon_url',   ''),
  ('tienda_email',         ''),
  ('tienda_telefono',      ''),

  -- ── Tema del panel (se inyectan como variables CSS) ──────
  ('tema_color_primario',  '#1238a0'),
  ('tema_color_acento',    '#2563EB'),

  -- ── Moneda ───────────────────────────────────────────────
  -- moneda_captura: en la que el admin escribe los precios.
  -- moneda_tienda:  en la que se cobra y se muestra.
  -- Iguales por defecto = sin conversión, el caso simple.
  ('moneda_captura',       'MXN'),
  ('moneda_tienda',        'MXN'),

  -- ── Límites de paquetería ────────────────────────────────
  -- Topes por paquete usados al cotizar envío.
  ('envio_peso_max_kg',    '20'),
  ('envio_volumen_max_m3', '0.125'),
  ('envio_dim_max_cm',     '100');
