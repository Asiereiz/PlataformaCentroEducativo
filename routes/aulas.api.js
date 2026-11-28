import { Router } from "express";
import * as db from "../db/mariadb.js";

const router = Router();

const ESTADOS = ["activa", "inactiva"];

router.get("/", async (req, res) => {
  try {
    const aulas = await db.listarAulas();
    res.json(aulas);
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/", async (req, res) => {
  const error = validarAula(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const id_aula = await db.altaAula(datosAula(req.body));
    return res.status(201).json({ id_aula });
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const error = validarId(id) || validarAula(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    if (!(await db.obtenerAula(id))) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }

    await db.modificarAula(id, datosAula(req.body));
    return res.json({ id_aula: id });
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (validarId(id)) {
    return res.status(400).json({ error: validarId(id) });
  }
  if (!req.body || req.body.estado !== "inactiva") {
    return res.status(400).json({ error: "Solo se puede desactivar un aula (estado: inactiva)" });
  }

  try {
    if (!(await db.obtenerAula(id))) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }
    if ((await db.contarCursosActivosEnAula(id)) > 0) {
      return res.status(400).json({ error: "No se puede eliminar el aula porque está asignada a un curso activo" });
    }

    await db.desactivarAula(id);
    return res.json({ id_aula: id, estado: "inactiva" });
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

function validarId(id) {
  if (!Number.isSafeInteger(id) || id < 1) {
    return "El identificador del aula no es válido";
  }
  return null;
}

function validarAula(datos) {
  const campos = ["nombre", "edificio", "planta", "capacidad", "equipamiento", "estado"];
  if (!datos || campos.some(campo => datos[campo] === undefined || String(datos[campo]).trim() === "")) {
    return "Faltan datos obligatorios del aula";
  }

  const capacidad = Number(datos.capacidad);
  if (!Number.isInteger(capacidad) || capacidad < 1) {
    return "La capacidad debe ser un número entero mayor que 0";
  }
  if (!ESTADOS.includes(datos.estado)) {
    return "El estado debe ser activa o inactiva";
  }
  if (String(datos.nombre).trim().length > 100 || String(datos.edificio).trim().length > 50 ||
      String(datos.planta).trim().length > 10 || String(datos.equipamiento).trim().length > 255) {
    return "Alguno de los textos del aula es demasiado largo";
  }
  return null;
}

function datosAula(datos) {
  return {
    nombre: String(datos.nombre).trim(),
    edificio: String(datos.edificio).trim(),
    planta: String(datos.planta).trim(),
    capacidad: Number(datos.capacidad),
    equipamiento: String(datos.equipamiento).trim(),
    estado: datos.estado
  };
}
