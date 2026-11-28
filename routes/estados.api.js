import { Router } from "express";
import { query } from "../db/mariadb.js";

const router = Router();

router.get("/estado", (req, res) => {
  res.json({ ok: true, mensaje: "Conexión con el servidor establecida." });
});

router.get("/db/estado", async (req, res, next) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, mensaje: "Conexión con MariaDB establecida." });
  } catch (error) {
    next(error);
  }
});

export default router;
