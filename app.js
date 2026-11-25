const express = require("express");
const path = require("path");
const { obtenerPool, verificarConexionMariaDB } = require("./database");

const app = express();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const VIEWS_DIR = path.join(__dirname, "views");

app.use(express.json({ limit: "10mb" }));

app.get("/api/estado", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Conexión con el servidor establecida."
  });
});

app.get("/api/db/estado", async (req, res, next) => {
  try {
    await verificarConexionMariaDB();
    res.json({
      ok: true,
      mensaje: "Conexión con MariaDB establecida."
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/cursos", async (req, res, next) => {
  try {
    const cursos = await obtenerPool().query("SELECT * FROM cursos");
    res.json(cursos);
  } catch (error) {
    next(error);
  }
});

app.post("/api/cursos", async (req, res, next) => {
  const curso = validarCurso(req.body, res);
  if (!curso) {
    return;
  }

  try {
    const resultado = await obtenerPool().query(
      `INSERT INTO cursos
        (nombre, descripcion, id_docente, id_aula, fecha_inicio, fecha_fin, horario, plazas, imagen, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        curso.nombre,
        curso.descripcion,
        curso.docente,
        curso.aula,
        curso.fecha_inicio,
        curso.fecha_fin,
        curso.horario,
        curso.max_plazas,
        curso.foto,
        curso.estado
      ]
    );
    res.status(201).json({ id_curso: resultado.insertId });
  } catch (error) {
    next(error);
  }
});

app.put("/api/cursos/:id", async (req, res, next) => {
  const id = validarIdCurso(req.params.id, res);
  if (!id) {
    return;
  }

  const curso = validarCurso(req.body, res);
  if (!curso) {
    return;
  }

  try {
    const pool = obtenerPool();
    const existentes = await pool.query(
      "SELECT id_curso FROM cursos WHERE id_curso = ?",
      [id]
    );
    if (existentes.length === 0) {
      return res.status(404).json({ ok: false, error: "Curso no encontrado." });
    }

    await pool.query(
      `UPDATE cursos
       SET nombre = ?, descripcion = ?, id_docente = ?, id_aula = ?, fecha_inicio = ?,
           fecha_fin = ?, horario = ?, plazas = ?, imagen = ?, estado = ?
       WHERE id_curso = ?`,
      [
        curso.nombre,
        curso.descripcion,
        curso.docente,
        curso.aula,
        curso.fecha_inicio,
        curso.fecha_fin,
        curso.horario,
        curso.max_plazas,
        curso.foto,
        curso.estado,
        id
      ]
    );
    res.json({ id_curso: id });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/cursos/:id", async (req, res, next) => {
  const id = validarIdCurso(req.params.id, res);
  if (!id) {
    return;
  }

  if (!req.body || req.body.estado !== "inactivo") {
    return res.status(400).json({
      ok: false,
      error: "El estado del curso debe ser inactivo."
    });
  }

  try {
    const pool = obtenerPool();
    const existentes = await pool.query(
      "SELECT id_curso FROM cursos WHERE id_curso = ?",
      [id]
    );
    if (existentes.length === 0) {
      return res.status(404).json({ ok: false, error: "Curso no encontrado." });
    }

    await pool.query(
      "UPDATE cursos SET estado = ? WHERE id_curso = ?",
      ["inactivo", id]
    );
    res.json({ id_curso: id, estado: "inactivo" });
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.use(express.static(PUBLIC_DIR));
app.use(express.static(VIEWS_DIR));

app.use((req, res) => {
  const esRutaApi = req.path === "/api" || req.path.startsWith("/api/");
  if (esRutaApi) {
    return res.status(404).json({
      ok: false,
      error: "Ruta de API no encontrada."
    });
  }

  res.status(404).type("html").send(
    "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><title>404 - Página no encontrada</title></head><body><h1>404</h1><p>Página no encontrada.</p><a href=\"/\">Volver al inicio</a></body></html>"
  );
});

app.use((error, req, res, next) => {
  console.error("Error interno del servidor:", error);
  if (res.headersSent) {
    return next(error);
  }

  const esRutaApi = req.path === "/api" || req.path.startsWith("/api/");
  if (req.path === "/api/db/estado") {
    return res.status(503).json({
      ok: false,
      error: "No se pudo conectar con MariaDB. Comprueba la configuración local."
    });
  }

  if (esRutaApi) {
    return res.status(500).json({
      ok: false,
      error: "Error interno del servidor."
    });
  }

  res.status(500).type("html").send(
    "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><title>500 - Error interno</title></head><body><h1>500</h1><p>Se ha producido un error interno. Inténtalo de nuevo más tarde.</p><a href=\"/\">Volver al inicio</a></body></html>"
  );
});

app.listen(PORT, () => {
  console.log("Servidor en http://localhost:" + PORT);
});

function validarIdCurso(valor, res) {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ ok: false, error: "El identificador del curso no es válido." });
    return null;
  }

  return id;
}

function validarCurso(datos, res) {
  const campos = [
    "nombre",
    "descripcion",
    "docente",
    "aula",
    "fecha_inicio",
    "fecha_fin",
    "horario",
    "max_plazas",
    "foto",
    "estado"
  ];
  if (!datos || campos.some(campo => datos[campo] === undefined || datos[campo] === null)) {
    res.status(400).json({ ok: false, error: "Faltan datos obligatorios del curso." });
    return null;
  }

  const maxPlazas = Number(datos.max_plazas);
  if (
    !Number.isInteger(maxPlazas) ||
    maxPlazas < 1 ||
    !["activo", "inactivo"].includes(datos.estado) ||
    typeof datos.foto !== "string"
  ) {
    res.status(400).json({ ok: false, error: "Los datos del curso no son válidos." });
    return null;
  }

  return {
    nombre: String(datos.nombre).trim(),
    descripcion: String(datos.descripcion).trim(),
    docente: datos.docente,
    aula: datos.aula,
    fecha_inicio: datos.fecha_inicio,
    fecha_fin: datos.fecha_fin,
    horario: String(datos.horario).trim(),
    max_plazas: maxPlazas,
    foto: datos.foto,
    estado: datos.estado
  };
}