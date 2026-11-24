import { query } from "../db/mariadb.js";
import { ErrorApi } from "./errores.js";
import { borrarSubida } from "./archivos.js";

// plazas_ocupadas se calcula contando las matrículas activas de cada curso.
// docente_nombre y aula_nombre vienen de un JOIN para no pedirlos aparte.
const SELECT = `
  SELECT c.id, c.nombre, c.descripcion, c.docente, c.aula, c.fecha_inicio, c.fecha_fin,
         c.horario, c.max_plazas, c.foto, c.estado,
         CONCAT(d.nombre, ' ', d.primer_apellido, ' ', d.segundo_apellido) AS docente_nombre,
         a.nombre AS aula_nombre,
         (SELECT COUNT(*) FROM matriculas m WHERE m.curso = c.id AND m.estado = 'activo') AS plazas_ocupadas
  FROM cursos c
  JOIN docentes d ON d.id = c.docente
  JOIN aulas a ON a.id = c.aula`;

// Campos por los que se puede ordenar (lista blanca, tema 5.3 apartado 4:
// "restringir la ordenación a campos permitidos").
const ORDENABLES = ["id", "nombre", "fecha_inicio", "fecha_fin", "horario", "max_plazas"];

// Filtros: estado, docente, aula. Ordenación: sort=nombre / sort=-nombre.
// Paginación: page y limit (si no se piden, se devuelven todos los cursos).
export async function listar({ estado, docente, aula, sort, page, limit } = {}) {
  const condiciones = [];
  const valores = [];
  if (estado) { condiciones.push("c.estado = ?"); valores.push(estado); }
  if (docente) { condiciones.push("c.docente = ?"); valores.push(docente); }
  if (aula) { condiciones.push("c.aula = ?"); valores.push(aula); }
  const donde = condiciones.length > 0 ? ` WHERE ${condiciones.join(" AND ")}` : "";

  let orden = "c.id";
  if (sort) {
    const campo = sort.replace(/^-/, "");
    if (!ORDENABLES.includes(campo)) {
      throw new ErrorApi(400, "Parámetros no válidos", [`sort solo admite: ${ORDENABLES.join(", ")}`]);
    }
    orden = `c.${campo}${sort.startsWith("-") ? " DESC" : ""}`;
  }

  if (!page && !limit) {
    return await query(`${SELECT}${donde} ORDER BY ${orden}, c.id`, valores);
  }

  const pagina = Number(page) || 1;
  const porPagina = Number(limit) || 10;
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM cursos c${donde}`, valores);
  const filas = await query(
    `${SELECT}${donde} ORDER BY ${orden}, c.id LIMIT ? OFFSET ?`,
    [...valores, porPagina, (pagina - 1) * porPagina]
  );
  return { page: pagina, limit: porPagina, total, data: [...filas] };
}

export async function obtener(id) {
  const filas = await query(`${SELECT} WHERE c.id = ?`, [id]);
  return filas[0];
}

// El docente y el aula tienen que existir
async function comprobarRelaciones(d) {
  const docente = await query("SELECT id FROM docentes WHERE id = ?", [d.docente]);
  if (docente.length === 0) {
    throw new ErrorApi(400, "El docente indicado no existe.");
  }
  const aula = await query("SELECT id FROM aulas WHERE id = ?", [d.aula]);
  if (aula.length === 0) {
    throw new ErrorApi(400, "El aula indicada no existe.");
  }
}

// d.foto es la RUTA de la imagen (p. ej. /uploads/1700-curso.jpg)
export async function crear(d) {
  await comprobarRelaciones(d);
  const resultado = await query(
    `INSERT INTO cursos (nombre, descripcion, docente, aula, fecha_inicio, fecha_fin, horario, max_plazas, foto, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, '/images/curso-ucm.png'), ?)`,
    [d.nombre, d.descripcion, d.docente, d.aula, d.fecha_inicio, d.fecha_fin, d.horario,
     d.max_plazas, d.foto || null, d.estado]
  );
  return await obtener(resultado.insertId);
}

// Si no llega imagen nueva, se conserva la que había
export async function modificar(id, d) {
  const anterior = await obtener(id);
  if (!anterior) {
    return undefined;
  }
  await comprobarRelaciones(d);
  await query(
    `UPDATE cursos SET nombre = ?, descripcion = ?, docente = ?, aula = ?, fecha_inicio = ?, fecha_fin = ?,
            horario = ?, max_plazas = ?, foto = COALESCE(?, foto), estado = ?
     WHERE id = ?`,
    [d.nombre, d.descripcion, d.docente, d.aula, d.fecha_inicio, d.fecha_fin, d.horario,
     d.max_plazas, d.foto || null, d.estado, id]
  );
  if (d.foto) await borrarSubida(anterior.foto);
  return await obtener(id);
}

export async function desactivar(id) {
  if (!(await obtener(id))) {
    return false;
  }
  await query("UPDATE cursos SET estado = 'inactivo' WHERE id = ?", [id]);
  return true;
}
