import { Router } from "express";
import * as db from "../db/mariadb.js";
import { subirFoto, rutaFoto, borrarSubida } from "./imagenes.js";

const router = Router();

// Misma forma de ruta que usa el script SQL: sin "/" inicial (img/cursos/curso01.png)
const IMAGEN_PREDETERMINADA = "img/curso-ucm.png";

// GET /api/cursos  ->  200 OK + array JSON
router.get("/", async (req, res) => {
  try {
    const cursos = await db.listarCursos();
    res.json(cursos); // 200 OK + JSON
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/cursos  ->  201 Created
// (multipart/form-data: los campos llegan en req.body y la imagen en req.file)
router.post("/", subirFoto("foto", "cursos"), async (req, res) => {
  const nueva = rutaFoto(req); // "img/cursos/xxxx.png" o null

  // 1) Validación de entrada -> 400
  const error = validarCurso(req.body);
  if (error) {
    borrarSubida(nueva); // datos mal: no dejar la imagen huérfana
    return res.status(400).json({ error });
  }

  try {
    const id_curso = await db.altaCurso({
      ...datosCurso(req.body),
      imagen: nueva || IMAGEN_PREDETERMINADA
    });
    return res.status(201).json({ id_curso }); // Creado
  } catch (err) {
    borrarSubida(nueva);
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/cursos/:id  ->  200 OK
router.put("/:id", subirFoto("foto", "cursos"), async (req, res) => {
  const nueva = rutaFoto(req);

  const id = Number(req.params.id);
  const error = validarId(id) || validarCurso(req.body);
  if (error) {
    borrarSubida(nueva);
    return res.status(400).json({ error });
  }

  try {
    // 404: el curso no existe
    const existente = await db.obtenerCurso(id);
    if (!existente) {
      borrarSubida(nueva);
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    await db.modificarCurso(id, {
      ...datosCurso(req.body),
      imagen: nueva || existente.imagen // sin foto nueva se conserva la anterior
    });
    if (nueva) {
      borrarSubida(existente.imagen); // la foto antigua ya no se usa
    }
    return res.json({ id_curso: id });
  } catch (err) {
    borrarSubida(nueva);
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PATCH /api/cursos/:id  ->  200 OK (solo permite desactivar un curso)
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (validarId(id)) {
    return res.status(400).json({ error: validarId(id) });
  }
  if (!req.body || req.body.estado !== "inactivo") {
    return res.status(400).json({ error: "El estado del curso debe ser inactivo" });
  }

  try {
    const existente = await db.obtenerCurso(id);
    if (!existente) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    await db.desactivarCurso(id);
    return res.json({ id_curso: id, estado: "inactivo" });
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
    return "El identificador del curso no es válido";
  }
  return null;
}

function validarCurso(datos) {
  const campos = [
    "nombre", "descripcion", "docente", "aula", "fecha_inicio",
    "fecha_fin", "horario", "max_plazas", "estado"
  ];
  if (!datos || campos.some(campo => datos[campo] === undefined || datos[campo] === null)) {
    return "Faltan datos obligatorios del curso";
  }

  const maxPlazas = Number(datos.max_plazas);
  if (!Number.isInteger(maxPlazas) || maxPlazas < 1) {
    return "El máximo de plazas debe ser un número entero mayor que 0";
  }
  if (!["activo", "inactivo"].includes(datos.estado)) {
    return "El estado debe ser activo o inactivo";
  }
  return null;
}

// Pasa los campos del formulario al formato que espera el servicio
function datosCurso(datos) {
  return {
    nombre: String(datos.nombre).trim(),
    descripcion: String(datos.descripcion).trim(),
    docente: datos.docente,
    aula: datos.aula,
    fecha_inicio: datos.fecha_inicio,
    fecha_fin: datos.fecha_fin,
    horario: String(datos.horario).trim(),
    max_plazas: Number(datos.max_plazas),
    estado: datos.estado
  };
}
