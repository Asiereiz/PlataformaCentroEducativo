import { Router } from "express";
import * as db from "../db/mariadb.js";

const router = Router();

// Valores permitidos (los mismos que ofrece accesibilidad.html)
const TEMAS = ["claro", "oscuro", "contraste"];
const TAMANOS = ["small", "medium", "large"];
const PREDETERMINADAS = { tema: "claro", tamano_letra: "medium" };

// GET /api/preferencias/:id  ->  200 OK + { tema, tamano_letra }
// Si el usuario nunca las ha cambiado, devuelve las predeterminadas.
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

// PUT /api/preferencias/:id  ->  200 OK
// Cuerpo JSON: { tema, tamano_letra }. Crea las preferencias o las actualiza.
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

// ----------------------------------------------------------- validaciones
// Devuelven un texto con el error, o null si todo está bien.

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
