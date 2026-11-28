import { Router } from "express";
import * as db from "../db/mariadb.js";
import { subirFoto, rutaFoto, borrarSubida } from "./imagenes.js";

const router = Router();

const IMAGEN_PREDETERMINADA = "img/icono_usuario.png";

router.get("/", async (req, res) => {
  try {
    const docentes = await db.listarDocentes();
    res.json(docentes);
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/", subirFoto("foto", "docentes"), async (req, res) => {
  const nueva = rutaFoto(req);

  const error = validarDocente(req.body);
  if (error) {
    borrarSubida(nueva);
    return res.status(400).json({ error });
  }

  try {
    if (await db.obtenerDocentePorEmail(datosDocente(req.body).email)) {
      borrarSubida(nueva);
      return res.status(400).json({ error: "Ya existe un docente con ese correo" });
    }

    const id_docente = await db.altaDocente({
      ...datosDocente(req.body),
      foto: nueva || IMAGEN_PREDETERMINADA
    });
    return res.status(201).json({ id_docente });
  } catch (err) {
    borrarSubida(nueva);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe un docente con ese correo" });
    }
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:id", subirFoto("foto", "docentes"), async (req, res) => {
  const nueva = rutaFoto(req);

  const id = Number(req.params.id);
  const error = validarId(id) || validarDocente(req.body);
  if (error) {
    borrarSubida(nueva);
    return res.status(400).json({ error });
  }

  try {
    const existente = await db.obtenerDocente(id);
    if (!existente) {
      borrarSubida(nueva);
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    const repetido = await db.obtenerDocentePorEmail(datosDocente(req.body).email);
    if (repetido && repetido.id_docente !== id) {
      borrarSubida(nueva);
      return res.status(400).json({ error: "Ya existe un docente con ese correo" });
    }

    await db.modificarDocente(id, {
      ...datosDocente(req.body),
      foto: nueva || existente.foto
    });
    if (nueva) {
      borrarSubida(existente.foto);
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

function datosDocente(datos) {
  return {
    nombre: String(datos.nombre).trim(),
    email: String(datos.email).trim(),
    especialidad: String(datos.especialidad).trim(),
    telefono: String(datos.telefono).trim(),
    activo: Number(datos.activo)
  };
}