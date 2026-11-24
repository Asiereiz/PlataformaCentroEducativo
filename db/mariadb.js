import "dotenv/config";
import mariadb from "mariadb";

// Pool de conexiones a MariaDB (tema 5.2, apartado 6).
// Los datos de conexión se leen del archivo .env con dotenv.
const pool = mariadb.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "centro_educativo",
  connectionLimit: 10,
  acquireTimeout: 5000,
  dateStrings: true,      // las fechas llegan como "2026-09-01" (texto)
  bigIntAsNumber: true,   // COUNT(*) llega como número normal
  insertIdAsNumber: true  // el id que devuelve un INSERT también
});

// Función de acceso a datos: pide una conexión al pool, lanza la consulta
// parametrizada y devuelve siempre la conexión al pool (try / finally).
export async function query(sql, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    return await conn.query(sql, params);
  } finally {
    if (conn) conn.release();
  }
}

export default pool;
