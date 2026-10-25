# Núcleo con contacto

`mpeduardo98-commerce-core-0.9.2-5c02e576.tgz` contiene el núcleo local con el sistema de contacto integrado el 23 de octubre de 2026. `package.json` y `package-lock.json` apuntan a este archivo para que `npm ci` instale la misma versión sin depender de cambios todavía no publicados en GitHub.

Cuando commerce-core publique estos cambios, sustituir la dependencia por el SHA correspondiente siguiendo el flujo habitual de actualización. No volver al SHA anterior: no contiene los módulos ni las rutas de contacto.

La migración `2026-10-23_contacto.sql` ya se aplicó a la base configurada en `.env.local`. El formulario está activo y las consultas se dirigen al correo de la tienda: `ventas@craftqube.mx`. La configuración se administra en `/admin/ajustes/contacto`.

Se verificaron TypeScript, el build de producción, la página pública, la configuración pública, el rechazo de datos inválidos y la protección de las APIs administrativas. No se enviaron correos de prueba reales. No hubo navegador conectado disponible para la revisión visual.

Actualización del paquete local (24 de octubre de 2026): incluye los últimos cambios de los selectores compartidos, las barras laterales, el layout de ajustes y el panel de contacto. Pasaron las 17 pruebas de contacto, la comprobación de tipos y la compilación de producción de Craftqube. Las rutas ya estaban al día y los 273 archivos instalados coinciden con el núcleo actual, normalizando saltos de línea. No hay cambios nuevos de esquema ni de migraciones respecto al paquete anterior; no se modificó la base de datos. La actualización permanece local, sin publicación en producción.
