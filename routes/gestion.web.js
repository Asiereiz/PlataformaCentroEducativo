import { Router } from "express";
import { ErrorApi } from "../services/errores.js";
import { avisar } from "../middlewares/sesion.js";
import { subirFoto, descartarSubida } from "../middlewares/subida.js";
import { validarId, erroresDe } from "../middlewares/validaciones.js";

// ---------------------------------------------------------------------------
// Fábrica de rutas web de gestión (alta, modificación, eliminación y consulta).
// Las cinco páginas de administración funcionan igual; cada una solo cambia
// en su configuración (cfg), que se define en routes/admin.web.js.
//
//   GET  /admin/<ruta>             -> pinta la página con los cuatro formularios
//   POST /admin/<ruta>             -> alta
//   POST /admin/<ruta>/modificar   -> modificación
//   POST /admin/<ruta>/eliminar    -> baja lógica
// (La consulta no pasa por aquí: la página usa Fetch contra la API.)
//
// Los formularios HTML solo permiten GET y POST, por eso modificar y eliminar
// son POST. La API REST (routes/*.api.js) sí usa PUT y DELETE.
// ---------------------------------------------------------------------------
export function crearRouterGestion(cfg) {
  const router = Router();
  const subir = cfg.foto ? subirFoto(cfg.foto) : (req, res, next) => next();
  const terminacion = cfg.femenino ? "a" : "o";

  // Pinta la página de gestión. "extra" lleva los errores y los datos escritos.
  async function pintar(req, res, extra = {}) {
    const [campos, filas] = await Promise.all([cfg.campos(), cfg.listar()]);
    const g = {
      clave: cfg.clave,
      ruta: cfg.ruta,
      actual: cfg.ruta,
      titulo: cfg.titulo,
      eliminar: cfg.eliminar,
      consultaPor: cfg.consultaPor || "id",
      info: cfg.info,
      campos,
      ids: filas.map(fila => ({ valor: fila.id, texto: cfg.etiquetaId(fila) }))
    };
    res.status(extra.status || 200).render("admin/gestion", { g, ...extra });
  }

  // Si algo falla: se borra la imagen subida y se vuelve a pintar la página con el error
  async function fallo(req, res, next, err, formulario) {
    await descartarSubida(req);
    if (err instanceof ErrorApi) {
      try {
        return await pintar(req, res, { errores: [err.message], datos: req.body, formulario, status: err.status });
      } catch (otro) {
        return next(otro);
      }
    }
    next(err);
  }

  router.get("/", async (req, res, next) => {
    try {
      await pintar(req, res);
    } catch (err) {
      next(err);
    }
  });

  // ------------------------------------------------------------------ alta
  router.post("/", subir, ...cfg.validar, async (req, res, next) => {
    try {
      const errores = erroresDe(req);
      if (errores.length > 0) {
        await descartarSubida(req);
        return await pintar(req, res, { errores, datos: req.body, formulario: "alta", status: 400 });
      }
      await cfg.servicio.crear(cfg.datos(req));
      avisar(req, "ok", `${cfg.nombre} registrad${terminacion} correctamente.`);
      res.redirect(`/admin/${cfg.ruta}`);
    } catch (err) {
      await fallo(req, res, next, err, "alta");
    }
  });

  // ---------------------------------------------------------- modificación
  router.post("/modificar", subir, ...validarId, ...(cfg.validarMod || cfg.validar), async (req, res, next) => {
    try {
      const errores = erroresDe(req);
      if (errores.length > 0) {
        await descartarSubida(req);
        return await pintar(req, res, { errores, datos: req.body, formulario: "mod", status: 400 });
      }
      const modificado = await cfg.servicio.modificar(req.body.id, cfg.datos(req));
      if (!modificado) {
        await descartarSubida(req);
        return await pintar(req, res, { errores: [`${cfg.nombre} no encontrad${terminacion}.`], datos: req.body, formulario: "mod", status: 404 });
      }
      avisar(req, "ok", `${cfg.nombre} modificad${terminacion} correctamente.`);
      res.redirect(`/admin/${cfg.ruta}`);
    } catch (err) {
      await fallo(req, res, next, err, "mod");
    }
  });

  // ----------------------------------------------------------- eliminación
  router.post("/eliminar", ...validarId, async (req, res, next) => {
    try {
      const errores = erroresDe(req);
      if (errores.length > 0) {
        return await pintar(req, res, { errores, datos: req.body, formulario: "del", status: 400 });
      }
      if (!(await cfg.servicio.desactivar(req.body.id))) {
        return await pintar(req, res, { errores: [`${cfg.nombre} no encontrad${terminacion}.`], datos: req.body, formulario: "del", status: 404 });
      }
      avisar(req, "ok", `${cfg.nombre} desactivad${terminacion} correctamente.`);
      res.redirect(`/admin/${cfg.ruta}`);
    } catch (err) {
      await fallo(req, res, next, err, "del");
    }
  });

  return router;
}
