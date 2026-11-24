import { Router } from "express";
import * as docentesService from "../services/docentes.js";
import { requiereLoginApi, requiereAdminApi } from "../middlewares/sesion.js";
import { subirFoto, rutaFoto, descartarSubida } from "../middlewares/subida.js";
import { validarDocente, validarApi } from "../middlewares/validaciones.js";

// API REST de docentes. En app.js se monta con app.use("/api/docentes", router).
// Consultar: cualquier usuario con sesión. Crear, modificar y borrar: administrador.
const router = Router();

router.param("id", (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Identificador no válido" });
  }
  next();
});

const datosDocente = req => ({
  nombre: req.body.nombre,
  primer_apellido: req.body.primer_apellido,
  segundo_apellido: req.body.segundo_apellido,
  correo: req.body.correo,
  especialidad: req.body.especialidad,
  telefono: req.body.telefono,
  fotografia: rutaFoto(req),
  estado: req.body.estado
});

router.get("/", requiereLoginApi, async (req, res, next) => {
  try {
    const { estado } = req.query;
    if (estado && !["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({ error: "Parámetros no válidos", details: ["estado debe ser activo o inactivo"] });
    }
    res.json(await docentesService.listar({ estado }));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requiereLoginApi, async (req, res, next) => {
  try {
    const docente = await docentesService.obtener(req.params.id);
    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }
    res.json(docente);
  } catch (err) {
    next(err);
  }
});

router.post("/", requiereAdminApi, subirFoto("foto"), validarDocente, validarApi, async (req, res, next) => {
  try {
    const docente = await docentesService.crear(datosDocente(req));
    res.status(201).location(`/api/docentes/${docente.id}`).json(docente);
  } catch (err) {
    await descartarSubida(req);
    next(err);
  }
});

router.put("/:id", requiereAdminApi, subirFoto("foto"), validarDocente, validarApi, async (req, res, next) => {
  try {
    const docente = await docentesService.modificar(req.params.id, datosDocente(req));
    if (!docente) {
      await descartarSubida(req);
      return res.status(404).json({ error: "Docente no encontrado" });
    }
    res.json(docente);
  } catch (err) {
    await descartarSubida(req);
    next(err);
  }
});

router.delete("/:id", requiereAdminApi, async (req, res, next) => {
  try {
    if (!(await docentesService.desactivar(req.params.id))) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
