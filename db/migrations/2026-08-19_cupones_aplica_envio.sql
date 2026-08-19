-- ─────────────────────────────────────────────────────────────
-- Cupones: el descuento puede considerar el costo de envío.
--
-- Con `aplica_envio = 1` la base sobre la que muerde el cupón deja
-- de ser sólo la mercancía elegible y pasa a incluir el envío ya
-- cotizado. Sólo tiene sentido en cupones de porcentaje y de monto
-- fijo: `envio_gratis` ya pone el envío en cero y `2x1` descuenta
-- por unidades de producto.
--
-- Por defecto 0: todos los cupones existentes se comportan igual
-- que antes (el descuento nunca toca el envío).
-- ─────────────────────────────────────────────────────────────
ALTER TABLE `cupones`
  ADD COLUMN `aplica_envio` TINYINT(1) NOT NULL DEFAULT 0 AFTER `aplica_ids`;
