const path = require("path");
const dotenv = require("dotenv");
const mariadb = require("mariadb");

dotenv.config({ path: path.join(__dirname, ".env") });

let pool;

function obtenerPool() {
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;

  if (!database || !user) {
    throw new Error("Configura DB_NAME y DB_USER en el archivo .env.");
  }

  if (!pool) {
    pool = mariadb.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      database,
      user,
      password: process.env.DB_PASSWORD || "",
      connectionLimit: 5
    });
  }

  return pool;
}

async function verificarConexionMariaDB() {
  await obtenerPool().query("SELECT 1");
}

module.exports = { obtenerPool, verificarConexionMariaDB };
