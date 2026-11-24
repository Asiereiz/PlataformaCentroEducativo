import { ErrorApi } from "../services/errores.js";

// ---------------------------------------------------------------------------
// Middlewares de errores (tema 5.2, apartado 5). Se registran AL FINAL de app.js:
//   1) 404: ninguna ruta ha respondido.
//   2) 500: algún middleware o ruta ha llamado a next(err) (o ha lanzado un error).
// ---------------------------------------------------------------------------
const esApi = req => req.originalUrl.startsWith("/api");

export function noEncontrado(req, res) {
  if (esApi(req)) {
    return res.status(404).json({ error: "No encontrado" });
  }
  res.status(404).render("error", { codigo: 404, mensaje: "La página que buscas no existe." });
}

export function manejarErrores(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let mensaje = "Error interno del servidor";
  let detalles;

  if (err instanceof ErrorApi) {
    // Errores previstos (reglas de negocio): llevan su propio código y mensaje
    ({ status, message: mensaje, detalles } = err);
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    mensaje = "El JSON enviado no es válido";
  } else if (err.type === "entity.too.large") {
    status = 413;
    mensaje = "Los datos enviados son demasiado grandes";
  } else {
    // Error técnico: se registra para depurar, pero al usuario NO se le enseña (stack, SQL...)
    console.error(err);
    if (["ECONNREFUSED", "ER_GET_CONNECTION_TIMEOUT", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR"].includes(err.code)) {
      status = 503;
      mensaje = "No se pudo conectar con la base de datos";
    }
  }

  if (esApi(req)) {
    return res.status(status).json({ error: mensaje, details: detalles });
  }
  res.status(status).render("error", { codigo: status, mensaje });
}
