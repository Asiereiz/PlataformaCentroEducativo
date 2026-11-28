import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  dateStrings: true
});

async function query(sql, params) {
  const conn = await pool.getConnection();
  try {
    return await conn.query(sql, params);
  } finally {
    conn.release();
  }
}

function listarCursos() {
  return query("SELECT * FROM cursos ORDER BY id_curso");
}

async function obtenerCurso(id) {
  const filas = await query("SELECT * FROM cursos WHERE id_curso = ?", [id]);
  return filas[0];
}

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
  return Number(resultado.insertId);
}

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

function desactivarCurso(id) {
  return query("UPDATE cursos SET estado = 'inactivo' WHERE id_curso = ?", [id]);
}


function listarDocentes() {
  return query("SELECT * FROM docentes ORDER BY id_docente");
}

async function obtenerDocente(id) {
  const filas = await query("SELECT * FROM docentes WHERE id_docente = ?", [id]);
  return filas[0];
}

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
  return Number(resultado.insertId);
}

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

function desactivarDocente(id) {
  return query("UPDATE docentes SET activo = 0 WHERE id_docente = ?", [id]);
}

function listarAulas() {
  return query("SELECT * FROM aulas ORDER BY id_aula");
}

async function obtenerAula(id) {
  const filas = await query("SELECT * FROM aulas WHERE id_aula = ?", [id]);
  return filas[0];
}

async function altaAula(aula) {
  const resultado = await query(
    `INSERT INTO aulas
      (nombre, edificio, planta, capacidad, equipamiento, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [aula.nombre, aula.edificio, aula.planta, aula.capacidad, aula.equipamiento, aula.estado]
  );
  return Number(resultado.insertId);
}

function modificarAula(id, aula) {
  return query(
    `UPDATE aulas
     SET nombre = ?, edificio = ?, planta = ?, capacidad = ?, equipamiento = ?, estado = ?
     WHERE id_aula = ?`,
    [aula.nombre, aula.edificio, aula.planta, aula.capacidad, aula.equipamiento, aula.estado, id]
  );
}

function desactivarAula(id) {
  return query("UPDATE aulas SET estado = 'inactiva' WHERE id_aula = ?", [id]);
}

async function contarCursosActivosEnAula(id) {
  const filas = await query(
    "SELECT COUNT(*) AS total FROM cursos WHERE id_aula = ? AND estado = 'activo'",
    [id]
  );
  return Number(filas[0].total);
}

async function obtenerDocentePorEmail(email) {
  const filas = await query("SELECT * FROM docentes WHERE email = ?", [email]);
  return filas[0];
}

async function obtenerUsuarioPorEmail(email) {
  const filas = await query("SELECT * FROM usuarios WHERE email = ?", [email]);
  return filas[0];
}

async function altaUsuario(usuario) {
  const resultado = await query(
    `INSERT INTO usuarios
      (nombre, email, password, rol, fecha_registro, activo)
     VALUES (?, ?, ?, ?, NOW(), ?)`,
    [usuario.nombre, usuario.email, usuario.password, usuario.rol, usuario.activo ?? 1]
  );
  return Number(resultado.insertId);
}

function listarUsuarios(rol) {
  const columnas = "id_usuario, nombre, email, rol, fecha_registro, activo";
  if (rol) {
    return query(`SELECT ${columnas} FROM usuarios WHERE rol = ? ORDER BY id_usuario`, [rol]);
  }
  return query(`SELECT ${columnas} FROM usuarios ORDER BY id_usuario`);
}

async function obtenerUsuario(id) {
  const filas = await query(
    "SELECT id_usuario, nombre, email, rol, fecha_registro, activo FROM usuarios WHERE id_usuario = ?",
    [id]
  );
  return filas[0];
}

function modificarUsuario(id, usuario) {
  return query(
    "UPDATE usuarios SET nombre = ?, email = ?, activo = COALESCE(?, activo) WHERE id_usuario = ?",
    [usuario.nombre, usuario.email, usuario.activo ?? null, id]
  );
}

function desactivarUsuario(id) {
  return query("UPDATE usuarios SET activo = 0 WHERE id_usuario = ?", [id]);
}

function actualizarPassword(id, password) {
  return query("UPDATE usuarios SET password = ? WHERE id_usuario = ?", [password, id]);
}

const SELECT_MATRICULAS = `
  SELECT m.id_matricula, m.id_usuario, m.id_curso, m.fecha_matricula, m.estado,
         u.nombre AS nombre_alumno, c.nombre AS nombre_curso, c.descripcion AS descripcion_curso
  FROM matriculas m
  JOIN usuarios u ON u.id_usuario = m.id_usuario
  JOIN cursos c ON c.id_curso = m.id_curso`;

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

async function obtenerMatricula(id) {
  const filas = await query(`${SELECT_MATRICULAS} WHERE m.id_matricula = ?`, [id]);
  return filas[0];
}

async function contarMatriculasActivas(idCurso, excluirId = 0) {
  const filas = await query(
    "SELECT COUNT(*) AS total FROM matriculas WHERE id_curso = ? AND estado = 'activa' AND id_matricula <> ?",
    [idCurso, excluirId]
  );
  return Number(filas[0].total);
}

async function existeMatriculaActiva(idUsuario, idCurso, excluirId = 0) {
  const filas = await query(
    `SELECT id_matricula FROM matriculas
     WHERE id_usuario = ? AND id_curso = ? AND estado = 'activa' AND id_matricula <> ?`,
    [idUsuario, idCurso, excluirId]
  );
  return filas.length > 0;
}

async function altaMatricula(matricula) {
  const resultado = await query(
    `INSERT INTO matriculas (id_usuario, id_curso, fecha_matricula, estado)
     VALUES (?, ?, COALESCE(?, NOW()), ?)`,
    [matricula.id_usuario, matricula.id_curso, matricula.fecha_matricula, matricula.estado]
  );
  return Number(resultado.insertId);
}

function modificarMatricula(id, matricula) {
  return query(
    `UPDATE matriculas
     SET id_usuario = ?, id_curso = ?, fecha_matricula = COALESCE(?, fecha_matricula), estado = ?
     WHERE id_matricula = ?`,
    [matricula.id_usuario, matricula.id_curso, matricula.fecha_matricula, matricula.estado, id]
  );
}

function cancelarMatricula(id) {
  return query("UPDATE matriculas SET estado = 'cancelada' WHERE id_matricula = ?", [id]);
}

export {
  query,
  listarCursos, obtenerCurso, altaCurso, modificarCurso, desactivarCurso,
  listarDocentes, obtenerDocente, altaDocente, modificarDocente, desactivarDocente,
  obtenerDocentePorEmail,
  listarAulas, obtenerAula, altaAula, modificarAula, desactivarAula, contarCursosActivosEnAula,
  obtenerUsuarioPorEmail, altaUsuario,
  listarUsuarios, obtenerUsuario, modificarUsuario, desactivarUsuario, actualizarPassword,
  listarMatriculas, obtenerMatricula, contarMatriculasActivas, existeMatriculaActiva,
  altaMatricula, modificarMatricula, cancelarMatricula
};
