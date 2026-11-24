import { query } from "../db/mariadb.js";
import { ErrorApi } from "./errores.js";

// Se devuelven también el nombre del curso y del alumno para no tener que pedirlos aparte
const SELECT = `
  SELECT m.id, m.alumno, m.curso, m.fecha_matricula, m.estado,
         c.nombre AS curso_nombre, c.descripcion AS curso_descripcion,
         CONCAT(u.nombre, ' ', u.primer_apellido) AS alumno_nombre
  FROM matriculas m
  JOIN cursos c ON c.id = m.curso
  JOIN usuarios u ON u.id = m.alumno`;

// filtros opcionales: alumno, curso, estado
export async function listar(filtros = {}) {
  const condiciones = [];
  const valores = [];
  if (filtros.alumno) { condiciones.push("m.alumno = ?"); valores.push(filtros.alumno); }
  if (filtros.curso) { condiciones.push("m.curso = ?"); valores.push(filtros.curso); }
  if (filtros.estado) { condiciones.push("m.estado = ?"); valores.push(filtros.estado); }
  const donde = condiciones.length > 0 ? ` WHERE ${condiciones.join(" AND ")}` : "";
  return await query(`${SELECT}${donde} ORDER BY m.id`, valores);
}

export async function obtener(id) {
  const filas = await query(`${SELECT} WHERE m.id = ?`, [id]);
  return filas[0];
}

// Reglas de negocio. idActual es la matrícula que se está modificando (para no contarla dos veces).
async function comprobarReglas(d, idActual = 0) {
  const alumnos = await query("SELECT id FROM usuarios WHERE id = ? AND rol = 'alumno'", [d.alumno]);
  if (alumnos.length === 0) {
    throw new ErrorApi(400, "El alumno indicado no existe.");
  }
  const cursos = await query("SELECT id, estado, max_plazas FROM cursos WHERE id = ?", [d.curso]);
  if (cursos.length === 0) {
    throw new ErrorApi(400, "El curso indicado no existe.");
  }

  if (d.estado !== "activo") {
    return;
  }

  const curso = cursos[0];
  if (curso.estado !== "activo") {
    throw new ErrorApi(409, "El curso no está activo.");
  }

  const repetida = await query(
    "SELECT id FROM matriculas WHERE alumno = ? AND curso = ? AND estado = 'activo' AND id <> ?",
    [d.alumno, d.curso, idActual]
  );
  if (repetida.length > 0) {
    throw new ErrorApi(409, "Este alumno ya está matriculado en este curso.");
  }

  const ocupadas = await query(
    "SELECT COUNT(*) AS total FROM matriculas WHERE curso = ? AND estado = 'activo' AND id <> ?",
    [d.curso, idActual]
  );
  if (ocupadas[0].total >= curso.max_plazas) {
    throw new ErrorApi(409, "El curso ya ha alcanzado el número máximo de plazas.");
  }
}

export async function crear(d) {
  await comprobarReglas(d);
  const resultado = await query(
    "INSERT INTO matriculas (alumno, curso, fecha_matricula, estado) VALUES (?, ?, COALESCE(?, CURDATE()), ?)",
    [d.alumno, d.curso, d.fecha_matricula || null, d.estado]
  );
  return await obtener(resultado.insertId);
}

export async function modificar(id, d) {
  if (!(await obtener(id))) {
    return undefined;
  }
  await comprobarReglas(d, Number(id));
  await query(
    "UPDATE matriculas SET alumno = ?, curso = ?, fecha_matricula = COALESCE(?, fecha_matricula), estado = ? WHERE id = ?",
    [d.alumno, d.curso, d.fecha_matricula || null, d.estado, id]
  );
  return await obtener(id);
}

// Baja lógica: la matrícula pasa a "inactivo" (sirve también para cancelarla)
export async function desactivar(id) {
  if (!(await obtener(id))) {
    return false;
  }
  await query("UPDATE matriculas SET estado = 'inactivo' WHERE id = ?", [id]);
  return true;
}
