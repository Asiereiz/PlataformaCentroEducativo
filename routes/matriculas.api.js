import { Router } from "express";
import * as matriculasService from "../services/matriculas.js";
import { requiereLoginApi, requiereAdminApi } from "../middlewares/sesion.js";
import { validarMatricula, validarApi } from "../middlewares/validaciones.js";

// API REST de matrículas. En app.js se monta con app.use("/api/matriculas", router).
//   - Un alumno solo ve SUS matrículas.
//   - El administrador ve todas (con filtros ?alumno=&curso=&estado=) y puede crear, modificar y borrar.
const router = Router();

router.param("id", (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Identificador no válido" });
  }
  next();
});

const datosMatricula = req => ({
  alumno: Number(req.body.alumno),
  curso: Number(req.body.curso),
  fecha_matricula: req.body.fecha_matricula,
  estado: req.body.estado
});

router.get("/", requiereLoginApi, async (req, res, next) => {
  try {
    const { alumno, curso, estado } = req.query;
    const errores = [];
    for (const [nombre, valor] of Object.entries({ alumno, curso })) {
      if (valor !== undefined && !/^[1-9]\d*$/.test(valor)) errores.push(`${nombre} debe ser un entero mayor que 0`);
    }
    if (estado && !["activo", "inactivo"].includes(estado)) errores.push("estado debe ser activo o inactivo");
    if (errores.length > 0) {
      return res.status(400).json({ error: "Parámetros no válidos", details: errores });
    }

    const filtros = { alumno, curso, estado };
    if (req.session.usuario.rol !== "admin") {
      filtros.alumno = req.session.usuario.id; // un alumno nunca ve las de otros
    }
    res.json(await matriculasService.listar(filtros));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requiereLoginApi, async (req, res, next) => {
  try {
    const matricula = await matriculasService.obtener(req.params.id);
    const esMia = matricula && matricula.alumno === req.session.usuario.id;
    if (!matricula || (req.session.usuario.rol !== "admin" && !esMia)) {
      return res.status(404).json({ error: "Matrícula no encontrada" });
    }
    res.json(matricula);
  } catch (err) {
    next(err);
  }
});

router.post("/", requiereAdminApi, validarMatricula, validarApi, async (req, res, next) => {
  try {
    const matricula = await matriculasService.crear(datosMatricula(req));
    res.status(201).location(`/api/matriculas/${matricula.id}`).json(matricula);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requiereAdminApi, validarMatricula, validarApi, async (req, res, next) => {
  try {
    const matricula = await matriculasService.modificar(req.params.id, datosMatricula(req));
    if (!matricula) {
      return res.status(404).json({ error: "Matrícula no encontrada" });
    }
    res.json(matricula);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requiereAdminApi, async (req, res, next) => {
  try {
    if (!(await matriculasService.desactivar(req.params.id))) {
      return res.status(404).json({ error: "Matrícula no encontrada" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
