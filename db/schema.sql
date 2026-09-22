-- ============================================================
-- Esquema de base de datos — estructura completa
--
-- Generado por: npm run db:dump-schema
-- No editar a mano: los cambios se hacen en la BD y se vuelcan
-- aquí, o se quedan fuera del repo en el próximo volcado.
--
-- SOLO ESTRUCTURA: no contiene datos de ninguna tienda.
--
-- Para levantar una tienda nueva:
--   npm run db:init -- --env .env.mitienda
--
-- Tablas: 42  |  Vistas: 0  |  FKs: 41
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Tabla: account
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` text NOT NULL,
  `providerId` text NOT NULL,
  `userId` int(11) NOT NULL,
  `accessToken` text DEFAULT NULL,
  `refreshToken` text DEFAULT NULL,
  `idToken` text DEFAULT NULL,
  `accessTokenExpiresAt` timestamp(3) NULL DEFAULT NULL,
  `refreshTokenExpiresAt` timestamp(3) NULL DEFAULT NULL,
  `scope` text DEFAULT NULL,
  `password` text DEFAULT NULL,
  `createdAt` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` timestamp(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_userId_idx` (`userId`),
  CONSTRAINT `fk_account_user` FOREIGN KEY (`userId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: atributos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `atributos`;
CREATE TABLE `atributos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: atributos_valores
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `atributos_valores`;
CREATE TABLE `atributos_valores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `atributo_id` int(11) NOT NULL,
  `valor` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_atributo` (`atributo_id`),
  CONSTRAINT `fk_atributo` FOREIGN KEY (`atributo_id`) REFERENCES `atributos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: carritos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `carritos`;
CREATE TABLE `carritos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL COMMENT 'NULL = guest',
  `sesion_token` varchar(128) DEFAULT NULL COMMENT 'Token anónimo para guest',
  `estado` enum('activo','abandonado','convertido','expirado') NOT NULL DEFAULT 'activo',
  `coupon_id` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `last_activity` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_sesion_token` (`sesion_token`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_carrito_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sesión de carrito con soporte guest + cuenta';

-- ------------------------------------------------------------
-- Tabla: carrito_items
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `carrito_items`;
CREATE TABLE `carrito_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `carrito_id` bigint(20) NOT NULL,
  `variante_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(12,2) NOT NULL COMMENT 'Precio al momento de agregar',
  `notas` text DEFAULT NULL COMMENT 'Instrucciones especiales por ítem',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_carrito_variante` (`carrito_id`,`variante_id`),
  KEY `idx_variante` (`variante_id`),
  CONSTRAINT `fk_ci_carrito` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_variante` FOREIGN KEY (`variante_id`) REFERENCES `producto_variantes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ítems del carrito persistente';

-- ------------------------------------------------------------
-- Tabla: categorias
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `meta_titulo` varchar(100) DEFAULT NULL,
  `meta_descripcion` varchar(160) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_categoria_padre` (`parent_id`),
  CONSTRAINT `fk_categoria_padre` FOREIGN KEY (`parent_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: configuracion
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `configuracion`;
CREATE TABLE `configuracion` (
  `clave` varchar(100) NOT NULL,
  `valor` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- ------------------------------------------------------------
-- Tabla: cotizaciones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `cotizaciones`;
CREATE TABLE `cotizaciones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero` varchar(30) NOT NULL COMMENT 'COT-2026-000001',
  `usuario_id` int(11) DEFAULT NULL,
  `nombre` varchar(160) NOT NULL,
  `empresa` varchar(200) DEFAULT NULL,
  `email` varchar(180) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `estado` enum('nueva','en_revision','enviada','aceptada','rechazada','expirada') NOT NULL DEFAULT 'nueva',
  `items_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Snapshot de ítems solicitados' CHECK (json_valid(`items_json`)),
  `respuesta` text DEFAULT NULL COMMENT 'Respuesta del equipo comercial',
  `total_estimado` decimal(12,2) DEFAULT NULL,
  `valida_hasta` date DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `atendida_por` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_numero` (`numero`),
  KEY `idx_email` (`email`),
  KEY `idx_estado` (`estado`),
  KEY `fk_cot_usuario` (`usuario_id`),
  CONSTRAINT `fk_cot_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Solicitudes de cotización B2B';

-- ------------------------------------------------------------
-- Tabla: cupones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `cupones`;
CREATE TABLE `cupones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(60) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `tipo` enum('porcentaje','monto_fijo','envio_gratis','2x1') NOT NULL DEFAULT 'porcentaje',
  `valor` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT '% o MXN según tipo',
  `minimo_compra` decimal(12,2) DEFAULT NULL COMMENT 'Mínimo del carrito para aplicar',
  `maximo_descuento` decimal(12,2) DEFAULT NULL COMMENT 'Tope en pesos para tipo porcentaje',
  `uso_maximo_total` int(11) DEFAULT NULL COMMENT 'NULL = ilimitado',
  `uso_maximo_usuario` int(11) NOT NULL DEFAULT 1,
  `usos_actuales` int(11) NOT NULL DEFAULT 0,
  `aplica_a` enum('todos','categoria','producto','primera_compra') NOT NULL DEFAULT 'todos',
  `aplica_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de IDs si aplica_a != todos' CHECK (json_valid(`aplica_ids`)),
  `aplica_envio` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `valido_desde` datetime DEFAULT NULL,
  `valido_hasta` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo` (`codigo`),
  KEY `idx_activo` (`activo`),
  KEY `idx_vigencia` (`valido_desde`,`valido_hasta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cupones y códigos de descuento';

-- ------------------------------------------------------------
-- Tabla: cupon_usos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `cupon_usos`;
CREATE TABLE `cupon_usos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cupon_id` int(11) NOT NULL,
  `pedido_id` bigint(20) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `email` varchar(180) NOT NULL,
  `descuento` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_cupon` (`cupon_id`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `fk_cu_cupon` FOREIGN KEY (`cupon_id`) REFERENCES `cupones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de usos de cupones';

-- ------------------------------------------------------------
-- Tabla: direcciones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `direcciones`;
CREATE TABLE `direcciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL COMMENT 'NULL = invitado',
  `alias` varchar(60) DEFAULT NULL COMMENT 'Casa, Trabajo, etc.',
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `empresa` varchar(120) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `calle` varchar(200) NOT NULL,
  `numero_ext` varchar(20) NOT NULL,
  `numero_int` varchar(20) DEFAULT NULL,
  `colonia` varchar(100) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `estado` varchar(80) NOT NULL COMMENT 'Estado/Provincia',
  `codigo_postal` varchar(10) NOT NULL,
  `pais` char(2) NOT NULL DEFAULT 'MX',
  `referencias` text DEFAULT NULL,
  `es_predeterminada` tinyint(1) NOT NULL DEFAULT 0,
  `tipo` enum('envio','facturacion','ambos') NOT NULL DEFAULT 'envio',
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_cp` (`codigo_postal`),
  CONSTRAINT `fk_dir_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Direcciones de envío y facturación';

-- ------------------------------------------------------------
-- Tabla: etiquetas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `etiquetas`;
CREATE TABLE `etiquetas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `tipo` varchar(20) DEFAULT 'secundaria',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: marcas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `marcas`;
CREATE TABLE `marcas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `logo_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: metodos_pago
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `metodos_pago`;
CREATE TABLE `metodos_pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `gateway` varchar(50) NOT NULL COMMENT 'stripe | conekta | paypal | mercadopago',
  `token_externo` varchar(255) NOT NULL COMMENT 'Token del gateway (NO datos reales)',
  `tipo` varchar(30) NOT NULL COMMENT 'card | spei | oxxo | paypal',
  `marca` varchar(20) DEFAULT NULL COMMENT 'visa | mastercard | amex',
  `ultimos_4` char(4) DEFAULT NULL,
  `expiracion` char(7) DEFAULT NULL COMMENT 'MM/YYYY',
  `titular` varchar(120) DEFAULT NULL,
  `es_predeterminado` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `fk_mp_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tarjetas/métodos tokenizados por gateway de pago';

-- ------------------------------------------------------------
-- Tabla: notificaciones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE `notificaciones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(60) NOT NULL COMMENT 'pedido_confirmado | envio_actualizado | promocion',
  `titulo` varchar(120) NOT NULL,
  `mensaje` text NOT NULL,
  `url` varchar(500) DEFAULT NULL COMMENT 'Deep link',
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario_leida` (`usuario_id`,`leida`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notificaciones in-app por usuario';

-- ------------------------------------------------------------
-- Tabla: oauth_cuentas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `oauth_cuentas`;
CREATE TABLE `oauth_cuentas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `proveedor` varchar(50) NOT NULL COMMENT 'google | github | facebook',
  `proveedor_id` varchar(255) NOT NULL COMMENT 'ID externo del proveedor',
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `token_expira_en` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_proveedor_id` (`proveedor`,`proveedor_id`(191)),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `fk_oauth_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas vinculadas por OAuth';

-- ------------------------------------------------------------
-- Tabla: pagos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `pagos`;
CREATE TABLE `pagos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `gateway` varchar(50) NOT NULL COMMENT 'stripe | conekta | paypal | mercadopago',
  `gateway_pago_id` varchar(255) DEFAULT NULL COMMENT 'Payment Intent ID / charge ID',
  `tipo` enum('cargo','pre_autorizacion','captura','reembolso','contracargo') NOT NULL DEFAULT 'cargo',
  `estado` enum('iniciado','procesando','completado','fallido','cancelado','reembolsado','disputado') NOT NULL DEFAULT 'iniciado',
  `monto` decimal(12,2) NOT NULL,
  `moneda` char(3) NOT NULL DEFAULT 'MXN',
  `metodo` varchar(50) DEFAULT NULL COMMENT 'visa | mastercard | oxxo | spei',
  `ultimos_4` char(4) DEFAULT NULL,
  `referencia_externa` varchar(255) DEFAULT NULL,
  `payload_gateway` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Respuesta raw del gateway (PCI: no datos de tarjeta)' CHECK (json_valid(`payload_gateway`)),
  `ip_origen` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pedido` (`pedido_id`),
  KEY `idx_gateway_id` (`gateway_pago_id`(191)),
  CONSTRAINT `fk_pago_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Transacciones del gateway de pago';

-- ------------------------------------------------------------
-- Tabla: pedidos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero` varchar(30) NOT NULL COMMENT 'CQ-2026-000001',
  `usuario_id` int(11) DEFAULT NULL COMMENT 'NULL = guest',
  `estado` enum('pendiente_pago','pago_recibido','en_proceso','listo_envio','enviado','entregado','cancelado','reembolsado','disputa') NOT NULL DEFAULT 'pendiente_pago',
  `envio_nombre` varchar(160) NOT NULL,
  `envio_empresa` varchar(120) DEFAULT NULL,
  `envio_telefono` varchar(20) DEFAULT NULL,
  `envio_calle` varchar(200) NOT NULL,
  `envio_numero_ext` varchar(20) NOT NULL,
  `envio_numero_int` varchar(20) DEFAULT NULL,
  `envio_colonia` varchar(100) NOT NULL,
  `envio_ciudad` varchar(100) NOT NULL,
  `envio_municipio` varchar(100) DEFAULT NULL,
  `envio_estado` varchar(80) NOT NULL,
  `envio_cp` varchar(10) NOT NULL,
  `envio_pais` char(2) NOT NULL DEFAULT 'MX',
  `envio_referencias` text DEFAULT NULL,
  `email` varchar(180) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `costo_envio` decimal(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `moneda` char(3) NOT NULL DEFAULT 'MXN',
  `cupon_id` int(11) DEFAULT NULL,
  `cupon_codigo` varchar(60) DEFAULT NULL,
  `cupon_descuento` decimal(12,2) DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL COMMENT 'tarjeta | transferencia | oxxo | paypal',
  `referencia_pago` varchar(255) DEFAULT NULL COMMENT 'ID de transacción del gateway',
  `pagado_en` datetime DEFAULT NULL,
  `paqueteria` varchar(80) DEFAULT NULL COMMENT 'FedEx | DHL | Estafeta | J&T',
  `numero_guia` varchar(100) DEFAULT NULL,
  `url_rastreo` varchar(500) DEFAULT NULL,
  `enviado_en` datetime DEFAULT NULL,
  `entregado_en` datetime DEFAULT NULL,
  `notas_cliente` text DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `ip_origen` varchar(45) DEFAULT NULL,
  `fuente` varchar(50) DEFAULT 'web' COMMENT 'web | app | admin | api',
  `carrito_id` bigint(20) DEFAULT NULL COMMENT 'Carrito de origen',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_numero` (`numero`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ped_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cabecera de pedidos';

-- ------------------------------------------------------------
-- Tabla: pedido_historial
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `pedido_historial`;
CREATE TABLE `pedido_historial` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) NOT NULL,
  `comentario` text DEFAULT NULL,
  `notificar` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Enviar email al cliente',
  `usuario_id` int(11) DEFAULT NULL COMMENT 'Admin que hizo el cambio',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pedido` (`pedido_id`),
  CONSTRAINT `fk_ph_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Auditoría de cambios de estado en pedidos';

-- ------------------------------------------------------------
-- Tabla: pedido_items
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `pedido_items`;
CREATE TABLE `pedido_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `variante_id` int(11) DEFAULT NULL COMMENT 'NULL si variante fue eliminada',
  `titulo` varchar(255) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `atributos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '[{"atributo":"Color","valor":"gris"}]' CHECK (json_valid(`atributos_json`)),
  `precio_unitario` decimal(12,2) NOT NULL,
  `precio_original` decimal(12,2) NOT NULL COMMENT 'Antes de descuento',
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `descuento_linea` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_linea` decimal(12,2) NOT NULL COMMENT '(precio_unitario - descuento) * cantidad',
  `cantidad_reembolsada` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pedido` (`pedido_id`),
  KEY `idx_variante` (`variante_id`),
  CONSTRAINT `fk_pi_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pi_variante` FOREIGN KEY (`variante_id`) REFERENCES `producto_variantes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Líneas de detalle del pedido';

-- ------------------------------------------------------------
-- Tabla: productos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `marca_id` int(11) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo','borrador') DEFAULT 'borrador',
  `meta_titulo` varchar(100) DEFAULT NULL,
  `meta_descripcion` varchar(160) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_marca` (`marca_id`),
  CONSTRAINT `fk_marca` FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: producto_categorias
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `producto_categorias`;
CREATE TABLE `producto_categorias` (
  `producto_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  PRIMARY KEY (`producto_id`,`categoria_id`),
  KEY `fk_pc_categoria` (`categoria_id`),
  CONSTRAINT `fk_pc_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pc_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: producto_dimensiones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `producto_dimensiones`;
CREATE TABLE `producto_dimensiones` (
  `variante_id` int(11) NOT NULL,
  `largo` decimal(10,2) DEFAULT NULL,
  `ancho` decimal(10,2) DEFAULT NULL,
  `alto` decimal(10,2) DEFAULT NULL,
  `peso` decimal(10,2) DEFAULT NULL,
  `medida_unidad` varchar(10) DEFAULT 'cm',
  `peso_unidad` varchar(10) DEFAULT 'kg',
  PRIMARY KEY (`variante_id`),
  CONSTRAINT `fk_dimensiones_var` FOREIGN KEY (`variante_id`) REFERENCES `producto_variantes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: producto_envio
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `producto_envio`;
CREATE TABLE `producto_envio` (
  `producto_id` int(11) NOT NULL,
  `es_fisico` tinyint(1) NOT NULL DEFAULT 1,
  `largo` decimal(10,2) DEFAULT NULL,
  `ancho` decimal(10,2) DEFAULT NULL,
  `alto` decimal(10,2) DEFAULT NULL,
  `peso` decimal(10,2) DEFAULT NULL,
  `medida_unidad` varchar(10) NOT NULL DEFAULT 'cm',
  `peso_unidad` varchar(10) NOT NULL DEFAULT 'kg',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`producto_id`),
  CONSTRAINT `fk_producto_envio_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- ------------------------------------------------------------
-- Tabla: producto_etiquetas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `producto_etiquetas`;
CREATE TABLE `producto_etiquetas` (
  `producto_id` int(11) NOT NULL,
  `etiqueta_id` int(11) NOT NULL,
  PRIMARY KEY (`producto_id`,`etiqueta_id`),
  KEY `fk_pe_etiqueta` (`etiqueta_id`),
  CONSTRAINT `fk_pe_etiqueta` FOREIGN KEY (`etiqueta_id`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pe_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: producto_imagenes
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `producto_imagenes`;
CREATE TABLE `producto_imagenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `variante_id` int(11) DEFAULT NULL,
  `url` text NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_img_producto` (`producto_id`),
  KEY `fk_img_variante` (`variante_id`),
  CONSTRAINT `fk_img_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_img_variante` FOREIGN KEY (`variante_id`) REFERENCES `producto_variantes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: producto_metacampos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `producto_metacampos`;
CREATE TABLE `producto_metacampos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `variante_id` int(11) DEFAULT NULL,
  `llave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_meta_producto` (`producto_id`),
  KEY `fk_meta_variante` (`variante_id`),
  CONSTRAINT `fk_meta_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meta_variante` FOREIGN KEY (`variante_id`) REFERENCES `producto_variantes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: producto_variantes
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `producto_variantes`;
CREATE TABLE `producto_variantes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `codigo_barras` varchar(100) DEFAULT NULL,
  `precio_original` decimal(12,2) NOT NULL DEFAULT 0.00,
  `precio_final` decimal(12,2) NOT NULL DEFAULT 0.00,
  `costo` decimal(12,2) DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `es_default` tinyint(1) DEFAULT 0,
  `vender_sin_existencia` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `fk_producto_var` (`producto_id`),
  CONSTRAINT `fk_producto_var` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: reembolsos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `reembolsos`;
CREATE TABLE `reembolsos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `pago_id` bigint(20) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','aprobado','procesando','completado','rechazado') NOT NULL DEFAULT 'pendiente',
  `gateway_refund_id` varchar(255) DEFAULT NULL,
  `items_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Items reembolsados [{item_id, cantidad}]' CHECK (json_valid(`items_json`)),
  `aprobado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pedido` (`pedido_id`),
  CONSTRAINT `fk_ref_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Solicitudes y registros de reembolso';

-- ------------------------------------------------------------
-- Tabla: reseñas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `reseñas`;
CREATE TABLE `reseñas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `pedido_item_id` bigint(20) DEFAULT NULL COMMENT 'Compra verificada',
  `nombre` varchar(120) NOT NULL,
  `email` varchar(180) DEFAULT NULL,
  `calificacion` tinyint(1) NOT NULL COMMENT '1-5 estrellas',
  `titulo` varchar(120) DEFAULT NULL,
  `cuerpo` text DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  `util_si` int(11) NOT NULL DEFAULT 0,
  `util_no` int(11) NOT NULL DEFAULT 0,
  `respuesta_tienda` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_producto` (`producto_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_estado_cal` (`estado`,`calificacion`),
  CONSTRAINT `fk_res_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reseñas y calificaciones de productos';

-- ------------------------------------------------------------
-- Tabla: secuencias
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `secuencias`;
CREATE TABLE `secuencias` (
  `nombre` varchar(50) NOT NULL,
  `valor` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contadores para generar números de pedido/cotización';

-- ------------------------------------------------------------
-- Tabla: sesiones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `sesiones`;
CREATE TABLE `sesiones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `refresh_token` varchar(256) NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `expira_en` datetime NOT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_refresh_token` (`refresh_token`(191)),
  KEY `idx_usuario_activa` (`usuario_id`,`activa`),
  CONSTRAINT `fk_ses_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Refresh tokens persistidos para invalidación controlada';

-- ------------------------------------------------------------
-- Tabla: session
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expiresAt` timestamp(3) NOT NULL,
  `token` varchar(255) NOT NULL,
  `createdAt` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` timestamp(3) NOT NULL,
  `ipAddress` text DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `session_userId_idx` (`userId`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`userId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: tarifas_envio
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tarifas_envio`;
CREATE TABLE `tarifas_envio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zona_id` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL COMMENT 'Express | Estándar | Económico',
  `paqueteria` varchar(80) DEFAULT NULL,
  `tipo_calculo` enum('monto_fijo','por_peso','por_monto_compra','gratis','por_guia','flete') NOT NULL DEFAULT 'monto_fijo',
  `precio_base` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_por_kg` decimal(10,2) DEFAULT NULL,
  `peso_maximo_kg` decimal(10,2) DEFAULT NULL,
  `monto_envio_gratis` decimal(12,2) DEFAULT NULL COMMENT 'Compra mín. para envío gratis',
  `dias_estimados_min` int(11) DEFAULT NULL,
  `dias_estimados_max` int(11) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_zona` (`zona_id`),
  CONSTRAINT `fk_tarifa_zona` FOREIGN KEY (`zona_id`) REFERENCES `zonas_envio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tarifas y métodos de envío por zona';

-- ------------------------------------------------------------
-- Tabla: tokens_verificacion
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tokens_verificacion`;
CREATE TABLE `tokens_verificacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `token` varchar(128) NOT NULL,
  `tipo` enum('verificar_email','reset_password','magic_link','invitacion') NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `expira_en` datetime NOT NULL,
  `ip_origen` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token` (`token`),
  KEY `idx_usuario_tipo` (`usuario_id`,`tipo`),
  CONSTRAINT `fk_tv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens temporales para verificación y recuperación';

-- ------------------------------------------------------------
-- Tabla: usuarios
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'NULL = OAuth únicamente',
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('cliente','vendedor','admin','superadmin') NOT NULL DEFAULT 'cliente',
  `estado` enum('activo','inactivo','suspendido','pendiente_verificacion') NOT NULL DEFAULT 'pendiente_verificacion',
  `email_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `avatar_url` varchar(500) DEFAULT NULL,
  `rfc` varchar(20) DEFAULT NULL COMMENT 'Para facturación México',
  `razon_social` varchar(200) DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_rol` (`rol`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas de cliente y staff';

-- ------------------------------------------------------------
-- Tabla: variante_valores
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `variante_valores`;
CREATE TABLE `variante_valores` (
  `variante_id` int(11) NOT NULL,
  `atributo_valor_id` int(11) NOT NULL,
  PRIMARY KEY (`variante_id`,`atributo_valor_id`),
  KEY `fk_vv_valor` (`atributo_valor_id`),
  CONSTRAINT `fk_vv_valor` FOREIGN KEY (`atributo_valor_id`) REFERENCES `atributos_valores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vv_variante` FOREIGN KEY (`variante_id`) REFERENCES `producto_variantes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: verification
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `verification`;
CREATE TABLE `verification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `expiresAt` timestamp(3) NOT NULL,
  `createdAt` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `verification_identifier_idx` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: wishlist
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE `wishlist` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `variante_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_producto` (`usuario_id`,`producto_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `fk_wl_producto` (`producto_id`),
  CONSTRAINT `fk_wl_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wl_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lista de deseos persistente por usuario';

-- ------------------------------------------------------------
-- Tabla: zonas_envio
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `zonas_envio`;
CREATE TABLE `zonas_envio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Zonas geográficas para cálculo de envío';

-- ------------------------------------------------------------
-- Tabla: zona_codigos_postales
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `zona_codigos_postales`;
CREATE TABLE `zona_codigos_postales` (
  `zona_id` int(11) NOT NULL,
  `codigo_postal` varchar(10) NOT NULL,
  PRIMARY KEY (`zona_id`,`codigo_postal`),
  CONSTRAINT `fk_zcp_zona` FOREIGN KEY (`zona_id`) REFERENCES `zonas_envio` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CPs asignados a cada zona de envío';

-- ------------------------------------------------------------
-- Tabla: zona_estados
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `zona_estados`;
CREATE TABLE `zona_estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zona_id` int(11) NOT NULL,
  `estado` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_zona` (`zona_id`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
