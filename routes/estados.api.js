import { Router } from "express";
import { query } from "../db/mariadb.js";

const router = Router();

// GET /api/estado
router.get("/estado", (req, res) => {
  res.json({ ok: true, mensaje: "Conexión con el servidor establecida." });
});

// GET /api/db/estado
router.get("/db/estado", async (req, res, next) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, mensaje: "Conexión con MariaDB establecida." });
  } catch (error) {
    next(error); // lo recoge el middleware de errores de app.js
  }
});

export default router;
