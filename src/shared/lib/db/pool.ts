// Reexporta desde el nucleo compartido. La conexion sale de las
// variables DB_* de esta tienda; el pool en si vive en el paquete.
export { pool } from "@mpeduardo98/commerce-core/db";
