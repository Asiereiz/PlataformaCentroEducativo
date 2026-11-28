import { Router } from "express";
import * as db from "../db/mariadb.js";
import { subirFoto, rutaFoto, borrarSubida } from "./imagenes.js";

const router = Router();

// Misma forma de ruta que usa el script SQL: sin "/" inicial (img/docentes/docente01.png)
const IMAGEN_PREDETERMINADA = "img/icono_usuario.png";

// GET /api/docentes  ->  200 OK + array JSON
router.get("/", async (req, res) => {
  try {
    const docentes = await db.listarDocentes();
    res.json(docentes); // 200 OK + JSON
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/docentes  ->  201 Created
// (multipart/form-data: los campos llegan en req.body y la imagen en req.file)
router.post("/", subirFoto("foto", "docentes"), async (req, res) => {
  const nueva = rutaFoto(req); // "img/docentes/xxxx.png" o null

  // 1) Validación de entrada -> 400
  const error = validarDocente(req.body);
  if (error) {
    borrarSubida(nueva); // datos mal: no dejar la imagen huérfana
    return res.status(400).json({ error });
  }

  try {
    const id_docente = await db.altaDocente({
      ...datosDocente(req.body),
      foto: nueva || IMAGEN_PREDETERMINADA
    });
    return res.status(201).json({ id_docente }); // Creado
  } catch (err) {
    borrarSubida(nueva);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe un docente con ese correo" });
    }
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/docentes/:id  ->  200 OK
router.put("/:id", subirFoto("foto", "docentes"), async (req, res) => {
  const nueva = rutaFoto(req);

  const id = Number(req.params.id);
  const error = validarId(id) || validarDocente(req.body);
  if (error) {
    borrarSubida(nueva);
    return res.status(400).json({ error });
  }

  try {
    // 404: el docente no existe
    const existente = await db.obtenerDocente(id);
    if (!existente) {
      borrarSubida(nueva);
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    await db.modificarDocente(id, {
      ...datosDocente(req.body),
      foto: nueva || existente.foto // sin foto nueva se conserva la anterior
    });
    if (nueva) {
      borrarSubida(existente.foto); // la foto antigua ya no se usa
    }
    return res.json({ id_docente: id });
  } catch (err) {
    borrarSubida(nueva);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe un docente con ese correo" });
    }
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PATCH /api/docentes/:id  ->  200 OK (solo permite desactivar un docente)
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (validarId(id)) {
    return res.status(400).json({ error: validarId(id) });
  }
  if (!req.body || Number(req.body.activo) !== 0 || req.body.activo === "") {
    return res.status(400).json({ error: "Solo se puede desactivar un docente (activo: 0)" });
  }

  try {
    const existente = await db.obtenerDocente(id);
    if (!existente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    await db.desactivarDocente(id);
    return res.json({ id_docente: id, activo: 0 });
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
    return "El identificador del docente no es válido";
  }
  return null;
}

function validarDocente(datos) {
  const campos = ["nombre", "email", "especialidad", "telefono", "activo"];
  if (!datos || campos.some(campo => datos[campo] === undefined || String(datos[campo]).trim() === "")) {
    return "Faltan datos obligatorios del docente";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    return "El correo electrónico no es válido";
  }
  if (!["0", "1"].includes(String(datos.activo))) {
    return "El campo activo debe ser 0 o 1";
  }
  return null;
}

// Pasa los campos del formulario al formato que espera mariadb.js
// (desde FormData todo llega como texto: activo "1" -> 1)
function datosDocente(datos) {
  return {
    nombre: String(datos.nombre).trim(),
    email: String(datos.email).trim(),
    especialidad: String(datos.especialidad).trim(),
    telefono: String(datos.telefono).trim(),
    activo: Number(datos.activo)
  };
}