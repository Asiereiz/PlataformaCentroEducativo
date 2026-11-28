import { Router } from "express";
import * as db from "../db/mariadb.js";

const router = Router();

const ESTADOS = ["activa", "cancelada"];

// GET /api/matriculas  ->  200 OK + array JSON
// Filtros opcionales por query string: ?usuario=101&curso=1&estado=activa
router.get("/", async (req, res) => {
  const { usuario, curso, estado } = req.query;

  if (usuario !== undefined && validarId(Number(usuario))) {
    return res.status(400).json({ error: "El filtro usuario no es válido" });
  }
  if (curso !== undefined && validarId(Number(curso))) {
    return res.status(400).json({ error: "El filtro curso no es válido" });
  }
  if (estado !== undefined && !ESTADOS.includes(estado)) {
    return res.status(400).json({ error: "El filtro estado debe ser activa o cancelada" });
  }

  try {
    const matriculas = await db.listarMatriculas({
      usuario: usuario !== undefined ? Number(usuario) : undefined,
      curso: curso !== undefined ? Number(curso) : undefined,
      estado
    });
    res.json(matriculas); // 200 OK + JSON
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/matriculas  ->  201 Created
// Cuerpo JSON: { id_usuario, id_curso, fecha_matricula?, estado? }
router.post("/", async (req, res) => {
  const error = validarMatricula(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const matricula = datosMatricula(req.body);
  try {
    const incumple = await comprobarReglas(matricula);
    if (incumple) {
      return res.status(400).json({ error: incumple });
    }

    const id_matricula = await db.altaMatricula(matricula);
    return res.status(201).json({ id_matricula }); // Creado
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/matriculas/:id  ->  200 OK
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const error = validarId(id) || validarMatricula(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const matricula = datosMatricula(req.body);
  try {
    // 404: la matrícula no existe
    if (!(await db.obtenerMatricula(id))) {
      return res.status(404).json({ error: "Matrícula no encontrada" });
    }

    const incumple = await comprobarReglas(matricula, id);
    if (incumple) {
      return res.status(400).json({ error: incumple });
    }

    await db.modificarMatricula(id, matricula);
    return res.json({ id_matricula: id });
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PATCH /api/matriculas/:id  ->  200 OK (solo permite cancelar una matrícula)
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (validarId(id)) {
    return res.status(400).json({ error: validarId(id) });
  }
  if (!req.body || req.body.estado !== "cancelada") {
    return res.status(400).json({ error: "El estado de la matrícula debe ser cancelada" });
  }

  try {
    if (!(await db.obtenerMatricula(id))) {
      return res.status(404).json({ error: "Matrícula no encontrada" });
    }

    await db.cancelarMatricula(id);
    return res.json({ id_matricula: id, estado: "cancelada" });
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

// ----------------------------------------------------------- validaciones
// Devuelven un texto con el error, o null si todo está bien.

function validarId(id) {
  if (!Number.isSafeInteger(id) || id < 1) {
    return "El identificador no es válido";
  }
  return null;
}

function validarMatricula(datos) {
  if (!datos || datos.id_usuario === undefined || datos.id_curso === undefined) {
    return "Faltan datos obligatorios de la matrícula";
  }
  if (validarId(Number(datos.id_usuario)) || validarId(Number(datos.id_curso))) {
    return "El alumno o el curso no son válidos";
  }
  if (datos.estado !== undefined && !ESTADOS.includes(datos.estado)) {
    return "El estado debe ser activa o cancelada";
  }
  if (datos.fecha_matricula !== undefined && datos.fecha_matricula !== "" && !esFecha(datos.fecha_matricula)) {
    return "La fecha de matrícula debe tener el formato AAAA-MM-DD";
  }
  return null;
}

// "2026-11-05" y que exista de verdad (no vale 2026-02-31)
function esFecha(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }
  const fecha = new Date(texto + "T00:00:00Z");
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

function datosMatricula(datos) {
  return {
    id_usuario: Number(datos.id_usuario),
    id_curso: Number(datos.id_curso),
    fecha_matricula: datos.fecha_matricula ? datos.fecha_matricula : null, // null = ahora
    estado: datos.estado || "activa"
  };
}

// Reglas de negocio. Devuelve un texto con el problema, o null si todo está bien.
// idActual = la matrícula que se está modificando (para no contarla dos veces).
async function comprobarReglas(matricula, idActual = 0) {
  const usuario = await db.obtenerUsuario(matricula.id_usuario);
  if (!usuario) {
    return "Selecciona un alumno válido.";
  }

  const curso = await db.obtenerCurso(matricula.id_curso);
  if (!curso) {
    return "Selecciona un curso válido.";
  }

  // Una matrícula cancelada no ocupa plaza: no hace falta comprobar nada más
  if (matricula.estado !== "activa") {
    return null;
  }

  if (curso.estado !== "activo") {
    return "Selecciona un curso activo.";
  }

  if (await db.existeMatriculaActiva(matricula.id_usuario, matricula.id_curso, idActual)) {
    return "Este usuario ya está matriculado en este curso.";
  }

  const ocupadas = await db.contarMatriculasActivas(matricula.id_curso, idActual);
  if (ocupadas >= Number(curso.plazas)) {
    return "El curso ya ha alcanzado el número máximo de plazas.";
  }

  return null;
}
