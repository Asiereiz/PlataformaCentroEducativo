import { query } from "../db/mariadb.js";
import { ErrorApi } from "./errores.js";
import { borrarSubida } from "./archivos.js";

const COLUMNAS = "id, nombre, primer_apellido, segundo_apellido, correo, especialidad, telefono, fotografia, estado";

function controlarCorreoRepetido(error) {
  if (error.code === "ER_DUP_ENTRY") {
    throw new ErrorApi(409, "Ya existe un docente con ese correo.");
  }
  throw error;
}

export async function listar({ estado } = {}) {
  if (estado) {
    return await query(`SELECT ${COLUMNAS} FROM docentes WHERE estado = ? ORDER BY id`, [estado]);
  }
  return await query(`SELECT ${COLUMNAS} FROM docentes ORDER BY id`);
}

export async function obtener(id) {
  const filas = await query(`SELECT ${COLUMNAS} FROM docentes WHERE id = ?`, [id]);
  return filas[0];
}

// d.fotografia es la RUTA de la imagen (p. ej. /uploads/1700-foto.jpg), no la imagen en sí
export async function crear(d) {
  try {
    const resultado = await query(
      `INSERT INTO docentes (nombre, primer_apellido, segundo_apellido, correo, especialidad, telefono, fotografia, estado)
       VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, '/images/usuario-predeterminado.jpg'), ?)`,
      [d.nombre, d.primer_apellido, d.segundo_apellido, d.correo, d.especialidad, d.telefono,
       d.fotografia || null, d.estado]
    );
    return await obtener(resultado.insertId);
  } catch (error) {
    controlarCorreoRepetido(error);
  }
}

// Si no llega fotografía nueva, se conserva la que había
export async function modificar(id, d) {
  const anterior = await obtener(id);
  if (!anterior) {
    return undefined;
  }
  try {
    await query(
      `UPDATE docentes SET nombre = ?, primer_apellido = ?, segundo_apellido = ?, correo = ?,
              especialidad = ?, telefono = ?, fotografia = COALESCE(?, fotografia), estado = ?
       WHERE id = ?`,
      [d.nombre, d.primer_apellido, d.segundo_apellido, d.correo, d.especialidad, d.telefono,
       d.fotografia || null, d.estado, id]
    );
  } catch (error) {
    controlarCorreoRepetido(error);
  }
  if (d.fotografia) await borrarSubida(anterior.fotografia);
  return await obtener(id);
}

export async function desactivar(id) {
  if (!(await obtener(id))) {
    return false;
  }
  const cursos = await query("SELECT COUNT(*) AS total FROM cursos WHERE docente = ? AND estado = 'activo'", [id]);
  if (cursos[0].total > 0) {
    throw new ErrorApi(409, "No se puede eliminar este docente porque está asignado a un curso. Reasigna o elimina el curso antes de eliminar al docente.");
  }
  await query("UPDATE docentes SET estado = 'inactivo' WHERE id = ?", [id]);
  return true;
}
