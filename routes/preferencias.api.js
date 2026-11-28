import { Router } from "express";
import * as db from "../db/mariadb.js";

const router = Router();

const TEMAS = ["claro", "oscuro", "contraste"];
const TAMANOS = ["small", "medium", "large"];
const PREDETERMINADAS = { tema: "claro", tamano_letra: "medium" };

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (validarId(id)) {
    return res.status(400).json({ error: validarId(id) });
  }

  try {
    if (!(await db.obtenerUsuario(id))) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const preferencias = await db.obtenerPreferencias(id);
    res.json(preferencias || PREDETERMINADAS);
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const error = validarId(id) || validarPreferencias(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    if (!(await db.obtenerUsuario(id))) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const preferencias = { tema: req.body.tema, tamano_letra: req.body.tamano_letra };
    await db.guardarPreferencias(id, preferencias);
    return res.json(preferencias);
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

function validarId(id) {
  if (!Number.isSafeInteger(id) || id < 1) {
    return "El identificador del usuario no es válido";
  }
  return null;
}

function validarPreferencias(datos) {
  if (!datos || !TEMAS.includes(datos.tema)) {
    return "El tema debe ser claro, oscuro o contraste";
  }
  if (!TAMANOS.includes(datos.tamano_letra)) {
    return "El tamaño de letra debe ser small, medium o large";
  }
  return null;
}
