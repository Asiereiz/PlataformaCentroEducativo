import { Router } from "express";
import { verificarConexionMariaDB } from "../database.js";

const router = Router();

// GET /api/estado
router.get("/estado", (req, res) => {
  res.json({ ok: true, mensaje: "Conexión con el servidor establecida." });
});

// GET /api/db/estado
router.get("/db/estado", async (req, res, next) => {
  try {
    await verificarConexionMariaDB();
    res.json({ ok: true, mensaje: "Conexión con MariaDB establecida." });
  } catch (error) {
    next(error);
  }
});

export default router;