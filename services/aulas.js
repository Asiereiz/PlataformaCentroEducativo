import { query } from "../db/mariadb.js";
import { ErrorApi } from "./errores.js";

// Capa de servicio: aquí está la lógica y el acceso a MariaDB (tema 5.2, apartado 6).
// Todas las consultas son parametrizadas (?) para evitar inyección SQL.

const COLUMNAS = "id, nombre, edificio, planta, capacidad, equipamiento, estado";

export async function listar() {
  return await query(`SELECT ${COLUMNAS} FROM aulas ORDER BY id`);
}

export async function obtener(id) {
  const filas = await query(`SELECT ${COLUMNAS} FROM aulas WHERE id = ?`, [id]);
  return filas[0];
}

export async function crear(d) {
  const resultado = await query(
    "INSERT INTO aulas (nombre, edificio, planta, capacidad, equipamiento, estado) VALUES (?, ?, ?, ?, ?, ?)",
    [d.nombre, d.edificio, d.planta, d.capacidad, d.equipamiento, d.estado]
  );
  return await obtener(resultado.insertId);
}

export async function modificar(id, d) {
  if (!(await obtener(id))) {
    return undefined;
  }
  await query(
    "UPDATE aulas SET nombre = ?, edificio = ?, planta = ?, capacidad = ?, equipamiento = ?, estado = ? WHERE id = ?",
    [d.nombre, d.edificio, d.planta, d.capacidad, d.equipamiento, d.estado, id]
  );
  return await obtener(id);
}

// Baja lógica: el aula no se borra, pasa a "inactivo"
export async function desactivar(id) {
  if (!(await obtener(id))) {
    return false;
  }
  const cursos = await query("SELECT COUNT(*) AS total FROM cursos WHERE aula = ? AND estado = 'activo'", [id]);
  if (cursos[0].total > 0) {
    throw new ErrorApi(409, "No se puede eliminar el aula porque está asignada a un curso activo.");
  }
  await query("UPDATE aulas SET estado = 'inactivo' WHERE id = ?", [id]);
  return true;
}
