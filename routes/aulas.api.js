import { Router } from "express";
import * as aulasService from "../services/aulas.js";
import { requiereAdminApi } from "../middlewares/sesion.js";
import { validarAula, validarApi } from "../middlewares/validaciones.js";

// API REST de aulas. En app.js se monta con app.use("/api/aulas", router).
// Todas las operaciones son solo para el administrador.
const router = Router();
router.use(requiereAdminApi);

router.param("id", (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Identificador no válido" });
  }
  next();
});

const datosAula = req => ({
  nombre: req.body.nombre,
  edificio: req.body.edificio,
  planta: req.body.planta,
  capacidad: Number(req.body.capacidad),
  equipamiento: req.body.equipamiento,
  estado: req.body.estado
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await aulasService.listar());
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const aula = await aulasService.obtener(req.params.id);
    if (!aula) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }
    res.json(aula);
  } catch (err) {
    next(err);
  }
});

router.post("/", validarAula, validarApi, async (req, res, next) => {
  try {
    const aula = await aulasService.crear(datosAula(req));
    res.status(201).location(`/api/aulas/${aula.id}`).json(aula);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validarAula, validarApi, async (req, res, next) => {
  try {
    const aula = await aulasService.modificar(req.params.id, datosAula(req));
    if (!aula) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }
    res.json(aula);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!(await aulasService.desactivar(req.params.id))) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
