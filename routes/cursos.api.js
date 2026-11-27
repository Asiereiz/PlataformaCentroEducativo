import { Router } from "express";
import { obtenerPool } from "../database.js";
import { subirFoto, rutaFoto, borrarSubida } from "./imagenes.js";

const router = Router();

// GET /api/cursos
router.get("/", async (req, res, next) => {
  try {
    const cursos = await obtenerPool().query("SELECT * FROM cursos");
    res.json(cursos);
  } catch (error) {
    next(error);
  }
});

// Misma forma de ruta que usa el script SQL: sin "/" inicial (img/cursos/curso01.png)
const IMAGEN_PREDETERMINADA = "img/curso-ucm.png";

// POST /api/cursos  (multipart/form-data, con la imagen en el campo "foto")
router.post("/", subirFoto("foto", "cursos"), async (req, res, next) => {
  const nueva = rutaFoto(req);                 // "img/cursos/xxxx.png" o null
  const curso = validarCurso(req.body, res);
  if (!curso) {
    borrarSubida(nueva);                       // datos mal: no dejar la imagen huérfana
    return;
  }

  try {
    const resultado = await obtenerPool().query(
      `INSERT INTO cursos
        (nombre, descripcion, id_docente, id_aula, fecha_inicio, fecha_fin, horario, plazas, imagen, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        curso.nombre, curso.descripcion, curso.docente, curso.aula,
        curso.fecha_inicio, curso.fecha_fin, curso.horario,
        curso.max_plazas, nueva || IMAGEN_PREDETERMINADA, curso.estado
      ]
    );
    res.status(201).json({ id_curso: Number(resultado.insertId) });
  } catch (error) {
    borrarSubida(nueva);
    next(error);
  }
});

// PUT /api/cursos/:id
router.put("/:id", subirFoto("foto", "cursos"), async (req, res, next) => {
  const nueva = rutaFoto(req);
  const id = validarIdCurso(req.params.id, res);
  const curso = id && validarCurso(req.body, res);
  if (!curso) {
    borrarSubida(nueva);
    return;
  }

  try {
    const pool = obtenerPool();
    const existentes = await pool.query("SELECT imagen FROM cursos WHERE id_curso = ?", [id]);
    if (existentes.length === 0) {
      borrarSubida(nueva);
      return res.status(404).json({ ok: false, error: "Curso no encontrado." });
    }

    const anterior = existentes[0].imagen;
    await pool.query(
      `UPDATE cursos
       SET nombre = ?, descripcion = ?, id_docente = ?, id_aula = ?, fecha_inicio = ?,
           fecha_fin = ?, horario = ?, plazas = ?, imagen = ?, estado = ?
       WHERE id_curso = ?`,
      [
        curso.nombre, curso.descripcion, curso.docente, curso.aula,
        curso.fecha_inicio, curso.fecha_fin, curso.horario,
        curso.max_plazas, nueva || anterior, curso.estado, id   // sin foto nueva se conserva la anterior
      ]
    );
    if (nueva) {
      borrarSubida(anterior);                  // la foto antigua ya no se usa
    }
    res.json({ id_curso: id });
  } catch (error) {
    borrarSubida(nueva);
    next(error);
  }
});

// PATCH /api/cursos/:id  (solo permite desactivar)
router.patch("/:id", async (req, res, next) => {
  const id = validarIdCurso(req.params.id, res);
  if (!id) {
    return;
  }

  if (!req.body || req.body.estado !== "inactivo") {
    return res.status(400).json({ ok: false, error: "El estado del curso debe ser inactivo." });
  }

  try {
    const pool = obtenerPool();
    const existentes = await pool.query("SELECT id_curso FROM cursos WHERE id_curso = ?", [id]);
    if (existentes.length === 0) {
      return res.status(404).json({ ok: false, error: "Curso no encontrado." });
    }

    await pool.query("UPDATE cursos SET estado = ? WHERE id_curso = ?", ["inactivo", id]);
    res.json({ id_curso: id, estado: "inactivo" });
  } catch (error) {
    next(error);
  }
});

export default router;

// ----------------------------------------------------------- validaciones

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
    "nombre", "descripcion", "docente", "aula", "fecha_inicio",
    "fecha_fin", "horario", "max_plazas", "estado"
  ];
  if (!datos || campos.some(campo => datos[campo] === undefined || datos[campo] === null)) {
    res.status(400).json({ ok: false, error: "Faltan datos obligatorios del curso." });
    return null;
  }

  const maxPlazas = Number(datos.max_plazas);
  if (
    !Number.isInteger(maxPlazas) ||
    maxPlazas < 1 ||
    !["activo", "inactivo"].includes(datos.estado)
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
    estado: datos.estado
  };
}
