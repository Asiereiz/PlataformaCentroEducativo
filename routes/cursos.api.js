import { Router } from "express";
import * as cursosService from "../services/cursos.js";
import { ErrorApi } from "../services/errores.js";
import { requiereAdminApi } from "../middlewares/sesion.js";
import { subirFoto, rutaFoto, descartarSubida } from "../middlewares/subida.js";
import { validarCurso, validarApi } from "../middlewares/validaciones.js";

// API REST de cursos (tema 5.3). En app.js se monta con app.use("/api/cursos", router)
//   GET    /api/cursos       -> listar (filtros, orden y paginación opcionales)
//   GET    /api/cursos/:id   -> obtener uno
//   POST   /api/cursos       -> crear      (201)  [admin]
//   PUT    /api/cursos/:id   -> reemplazar (200)  [admin]
//   DELETE /api/cursos/:id   -> baja lógica (204) [admin]
const router = Router();

// Antes de cualquier ruta con :id se comprueba que es un número
router.param("id", (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Identificador no válido" });
  }
  next();
});

// Los datos que llegan en el cuerpo, ya validados y limpios, listos para el servicio
const datosCurso = req => ({
  nombre: req.body.nombre,
  descripcion: req.body.descripcion,
  docente: Number(req.body.docente),
  aula: Number(req.body.aula),
  fecha_inicio: req.body.fecha_inicio,
  fecha_fin: req.body.fecha_fin,
  horario: req.body.horario,
  max_plazas: Number(req.body.max_plazas),
  foto: rutaFoto(req),
  estado: req.body.estado
});

// GET /api/cursos            -> lista de cursos guardados en MariaDB (JSON)
// GET /api/cursos?estado=activo&docente=2&sort=-nombre&page=1&limit=3
router.get("/", async (req, res, next) => {
  try {
    const { estado, docente, aula, sort, page, limit } = req.query;
    const errores = [];
    if (estado && !["activo", "inactivo"].includes(estado)) errores.push("estado debe ser activo o inactivo");
    for (const [nombre, valor] of Object.entries({ docente, aula, page, limit })) {
      if (valor !== undefined && !/^[1-9]\d*$/.test(valor)) errores.push(`${nombre} debe ser un entero mayor que 0`);
    }
    if (limit !== undefined && Number(limit) > 100) errores.push("limit no puede ser mayor que 100");
    if (errores.length > 0) {
      throw new ErrorApi(400, "Parámetros no válidos", errores);
    }
    res.json(await cursosService.listar({ estado, docente, aula, sort, page, limit }));
  } catch (err) {
    next(err);
  }
});

// GET /api/cursos/:id
router.get("/:id", async (req, res, next) => {
  try {
    const curso = await cursosService.obtener(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json(curso);
  } catch (err) {
    next(err);
  }
});

// POST /api/cursos (JSON o multipart/form-data con la imagen en el campo "foto")
router.post("/", requiereAdminApi, subirFoto("foto"), validarCurso, validarApi, async (req, res, next) => {
  try {
    const curso = await cursosService.crear(datosCurso(req));
    res.status(201).location(`/api/cursos/${curso.id}`).json(curso);
  } catch (err) {
    await descartarSubida(req);
    next(err);
  }
});

// PUT /api/cursos/:id (se envía el curso completo; si no se envía imagen, se conserva la actual)
router.put("/:id", requiereAdminApi, subirFoto("foto"), validarCurso, validarApi, async (req, res, next) => {
  try {
    const curso = await cursosService.modificar(req.params.id, datosCurso(req));
    if (!curso) {
      await descartarSubida(req);
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json(curso);
  } catch (err) {
    await descartarSubida(req);
    next(err);
  }
});

// DELETE /api/cursos/:id (baja lógica: el curso pasa a "inactivo")
router.delete("/:id", requiereAdminApi, async (req, res, next) => {
  try {
    if (!(await cursosService.desactivar(req.params.id))) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
