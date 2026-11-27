import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mariadb from "mariadb";

// En módulos ES no existe __dirname: se construye a partir de import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

let pool;

export function obtenerPool() {
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
      connectionLimit: 5,
      dateStrings: true // las fechas llegan como "2026-09-01", no como fecha completa
    });
  }

  return pool;
}

export async function verificarConexionMariaDB() {
  await obtenerPool().query("SELECT 1");
}