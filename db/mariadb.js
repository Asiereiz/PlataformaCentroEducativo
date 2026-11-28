import mariadb from "mariadb";

// Pool de conexiones a MariaDB.
// Los datos de conexión no están en el código: vienen del archivo .env
// (se cargan con "node --env-file=.env app.js", ver package.json).
const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  dateStrings: true // las fechas llegan como "2026-09-01" y no como objeto Date
});

// Ejecuta una consulta parametrizada (los ? se sustituyen por params)
// y devuelve la conexión al pool aunque la consulta falle.
async function query(sql, params) {
  const conn = await pool.getConnection();
  try {
    return await conn.query(sql, params);
  } finally {
    conn.release();
  }
}

// ------------------------------------------------------------ cursos

// Lista todos los cursos
function listarCursos() {
  return query("SELECT * FROM cursos ORDER BY id_curso");
}

// Devuelve un curso por su id (o undefined si no existe)
async function obtenerCurso(id) {
  const filas = await query("SELECT * FROM cursos WHERE id_curso = ?", [id]);
  return filas[0];
}

// Da de alta un curso y devuelve el id que le ha asignado MariaDB
async function altaCurso(curso) {
  const resultado = await query(
    `INSERT INTO cursos
      (nombre, descripcion, id_docente, id_aula, fecha_inicio, fecha_fin, horario, plazas, imagen, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      curso.nombre, curso.descripcion, curso.docente, curso.aula,
      curso.fecha_inicio, curso.fecha_fin, curso.horario,
      curso.max_plazas, curso.imagen, curso.estado
    ]
  );
  // insertId llega como BigInt y res.json no sabe convertirlo: se pasa a Number
  return Number(resultado.insertId);
}

// Modifica todos los datos de un curso
function modificarCurso(id, curso) {
  return query(
    `UPDATE cursos
     SET nombre = ?, descripcion = ?, id_docente = ?, id_aula = ?, fecha_inicio = ?,
         fecha_fin = ?, horario = ?, plazas = ?, imagen = ?, estado = ?
     WHERE id_curso = ?`,
    [
      curso.nombre, curso.descripcion, curso.docente, curso.aula,
      curso.fecha_inicio, curso.fecha_fin, curso.horario,
      curso.max_plazas, curso.imagen, curso.estado, id
    ]
  );
}

// "Elimina" un curso: no se borra, se marca como inactivo
function desactivarCurso(id) {
  return query("UPDATE cursos SET estado = 'inactivo' WHERE id_curso = ?", [id]);
}


// ---------------------------------------------------------- docentes

// Lista todos los docentes
function listarDocentes() {
  return query("SELECT * FROM docentes ORDER BY id_docente");
}

// Devuelve un docente por su id (o undefined si no existe)
async function obtenerDocente(id) {
  const filas = await query("SELECT * FROM docentes WHERE id_docente = ?", [id]);
  return filas[0];
}

// Da de alta un docente y devuelve el id que le ha asignado MariaDB
async function altaDocente(docente) {
  const resultado = await query(
    `INSERT INTO docentes
      (nombre, email, especialidad, telefono, foto, activo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      docente.nombre, docente.email, docente.especialidad,
      docente.telefono, docente.foto, docente.activo
    ]
  );
  // insertId llega como BigInt y res.json no sabe convertirlo: se pasa a Number
  return Number(resultado.insertId);
}

// Modifica todos los datos de un docente
function modificarDocente(id, docente) {
  return query(
    `UPDATE docentes
     SET nombre = ?, email = ?, especialidad = ?, telefono = ?, foto = ?, activo = ?
     WHERE id_docente = ?`,
    [
      docente.nombre, docente.email, docente.especialidad,
      docente.telefono, docente.foto, docente.activo, id
    ]
  );
}

// "Elimina" un docente: no se borra, se marca como inactivo (activo = 0)
function desactivarDocente(id) {
  return query("UPDATE docentes SET activo = 0 WHERE id_docente = ?", [id]);
}

// ---------------------------------------------------------- usuarios

// Devuelve un usuario por su correo (o undefined si no existe)
async function obtenerUsuarioPorEmail(email) {
  const filas = await query("SELECT * FROM usuarios WHERE email = ?", [email]);
  return filas[0];
}

// Da de alta un usuario y devuelve el id que le ha asignado MariaDB
async function altaUsuario(usuario) {
  const resultado = await query(
    `INSERT INTO usuarios
      (nombre, email, password, rol, fecha_registro, activo)
     VALUES (?, ?, ?, ?, NOW(), 1)`,
    [usuario.nombre, usuario.email, usuario.password, usuario.rol]
  );
  // insertId llega como BigInt y res.json no sabe convertirlo: se pasa a Number
  return Number(resultado.insertId);
}

// ------------------------------------- usuarios (listado, perfil)

// Lista los usuarios SIN la contraseña (opcionalmente solo los de un rol)
function listarUsuarios(rol) {
  const columnas = "id_usuario, nombre, email, rol, fecha_registro, activo";
  if (rol) {
    return query(`SELECT ${columnas} FROM usuarios WHERE rol = ? ORDER BY id_usuario`, [rol]);
  }
  return query(`SELECT ${columnas} FROM usuarios ORDER BY id_usuario`);
}

// Devuelve un usuario por su id, sin la contraseña (o undefined si no existe)
async function obtenerUsuario(id) {
  const filas = await query(
    "SELECT id_usuario, nombre, email, rol, fecha_registro, activo FROM usuarios WHERE id_usuario = ?",
    [id]
  );
  return filas[0];
}

// Modifica el nombre y el correo de un usuario
function modificarUsuario(id, usuario) {
  return query(
    "UPDATE usuarios SET nombre = ?, email = ? WHERE id_usuario = ?",
    [usuario.nombre, usuario.email, id]
  );
}

// Cambia la contraseña de un usuario
function actualizarPassword(id, password) {
  return query("UPDATE usuarios SET password = ? WHERE id_usuario = ?", [password, id]);
}

// -------------------------------------------------------- matrículas

// Matrícula + nombre del alumno + datos del curso (para no hacer 3 peticiones)
const SELECT_MATRICULAS = `
  SELECT m.id_matricula, m.id_usuario, m.id_curso, m.fecha_matricula, m.estado,
         u.nombre AS nombre_alumno, c.nombre AS nombre_curso, c.descripcion AS descripcion_curso
  FROM matriculas m
  JOIN usuarios u ON u.id_usuario = m.id_usuario
  JOIN cursos c ON c.id_curso = m.id_curso`;

// Lista matrículas. Filtros opcionales: { usuario, curso, estado }
function listarMatriculas(filtros = {}) {
  const condiciones = [];
  const parametros = [];
  if (filtros.usuario) {
    condiciones.push("m.id_usuario = ?");
    parametros.push(filtros.usuario);
  }
  if (filtros.curso) {
    condiciones.push("m.id_curso = ?");
    parametros.push(filtros.curso);
  }
  if (filtros.estado) {
    condiciones.push("m.estado = ?");
    parametros.push(filtros.estado);
  }
  const where = condiciones.length > 0 ? " WHERE " + condiciones.join(" AND ") : "";
  return query(`${SELECT_MATRICULAS}${where} ORDER BY m.id_matricula`, parametros);
}

// Devuelve una matrícula por su id (o undefined si no existe)
async function obtenerMatricula(id) {
  const filas = await query(`${SELECT_MATRICULAS} WHERE m.id_matricula = ?`, [id]);
  return filas[0];
}

// Cuántas matrículas activas tiene un curso (se puede excluir una, al modificarla)
async function contarMatriculasActivas(idCurso, excluirId = 0) {
  const filas = await query(
    "SELECT COUNT(*) AS total FROM matriculas WHERE id_curso = ? AND estado = 'activa' AND id_matricula <> ?",
    [idCurso, excluirId]
  );
  return Number(filas[0].total); // COUNT llega como BigInt
}

// ¿Ya hay una matrícula activa de ese alumno en ese curso?
async function existeMatriculaActiva(idUsuario, idCurso, excluirId = 0) {
  const filas = await query(
    `SELECT id_matricula FROM matriculas
     WHERE id_usuario = ? AND id_curso = ? AND estado = 'activa' AND id_matricula <> ?`,
    [idUsuario, idCurso, excluirId]
  );
  return filas.length > 0;
}

// Da de alta una matrícula y devuelve su id. Sin fecha se usa la de ahora.
async function altaMatricula(matricula) {
  const resultado = await query(
    `INSERT INTO matriculas (id_usuario, id_curso, fecha_matricula, estado)
     VALUES (?, ?, COALESCE(?, NOW()), ?)`,
    [matricula.id_usuario, matricula.id_curso, matricula.fecha_matricula, matricula.estado]
  );
  return Number(resultado.insertId);
}

// Modifica una matrícula (si no llega fecha, se conserva la anterior)
function modificarMatricula(id, matricula) {
  return query(
    `UPDATE matriculas
     SET id_usuario = ?, id_curso = ?, fecha_matricula = COALESCE(?, fecha_matricula), estado = ?
     WHERE id_matricula = ?`,
    [matricula.id_usuario, matricula.id_curso, matricula.fecha_matricula, matricula.estado, id]
  );
}

// "Elimina" una matrícula: no se borra, se marca como cancelada
function cancelarMatricula(id) {
  return query("UPDATE matriculas SET estado = 'cancelada' WHERE id_matricula = ?", [id]);
}

// ----------------------------------------- preferencias (accesibilidad)

// Devuelve { tema, tamano_letra } de un usuario (o undefined si nunca las guardó)
async function obtenerPreferencias(idUsuario) {
  const filas = await query(
    "SELECT tema, tamano_letra FROM preferencias WHERE id_usuario = ?",
    [idUsuario]
  );
  return filas[0];
}

// Guarda las preferencias de un usuario: las crea o las actualiza
function guardarPreferencias(idUsuario, preferencias) {
  return query(
    `INSERT INTO preferencias (id_usuario, tema, tamano_letra)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE tema = ?, tamano_letra = ?`,
    [idUsuario, preferencias.tema, preferencias.tamano_letra, preferencias.tema, preferencias.tamano_letra]
  );
}

export {
  query,
  listarCursos, obtenerCurso, altaCurso, modificarCurso, desactivarCurso,
  listarDocentes, obtenerDocente, altaDocente, modificarDocente, desactivarDocente,
  obtenerUsuarioPorEmail, altaUsuario,
  listarUsuarios, obtenerUsuario, modificarUsuario, actualizarPassword,
  listarMatriculas, obtenerMatricula, contarMatriculasActivas, existeMatriculaActiva,
  altaMatricula, modificarMatricula, cancelarMatricula,
  obtenerPreferencias, guardarPreferencias
};
