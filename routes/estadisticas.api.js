import { Router } from "express";
import * as estadisticasService from "../services/estadisticas.js";
import { requiereAdminApi } from "../middlewares/sesion.js";

// GET /api/estadisticas (solo administrador)
const router = Router();

router.get("/", requiereAdminApi, async (req, res, next) => {
  try {
    res.json(await estadisticasService.obtener());
  } catch (err) {
    next(err);
  }
});

export default router;
