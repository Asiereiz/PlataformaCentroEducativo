import session from "express-session";

// ---------------------------------------------------------------------------
// Sesiones con express-session (tema 5.2, apartado 4).
// El navegador solo guarda una cookie (connect.sid) con un identificador;
// los datos de la sesión (quién es el usuario) se guardan en el servidor.
// El almacén por defecto (memoria) vale para prácticas: si se reinicia el
// servidor, las sesiones se pierden. En producción se usaría Redis, MariaDB...
// ---------------------------------------------------------------------------
export const configurarSesion = session({
  secret: process.env.SESSION_SECRET || "secreto-solo-para-desarrollo",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,            // la cookie no se puede leer desde JavaScript
    sameSite: "lax",           // el navegador no la envía desde otras webs
    maxAge: 2 * 60 * 60 * 1000 // 2 horas
  }
});

// Pone en res.locals lo que necesitan TODAS las vistas (cabecera, mensajes...)
export function variablesDeVista(req, res, next) {
  res.locals.usuario = req.session.usuario || null;
  res.locals.esAdmin = req.session.usuario?.rol === "admin";

  // Mensaje "flash": se guarda en la sesión antes de redirigir y se muestra una sola vez
  res.locals.mensaje = req.session.mensaje || null;
  delete req.session.mensaje;
  next();
}

// Guarda un mensaje para mostrarlo en la página siguiente
export function avisar(req, tipo, texto) {
  req.session.mensaje = { tipo, texto };
}

// ------------------------------------------------------------ rutas protegidas
// Middleware de protección (tema 5.2, apartado 4): si no hay usuario en la
// sesión, redirige al login; si lo hay, continúa con next().
export function requiereLogin(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  if (req.method === "GET") {
    req.session.destino = req.originalUrl; // para volver aquí después de iniciar sesión
  }
  res.redirect("/login");
}

export function requiereAdmin(req, res, next) {
  if (!req.session.usuario) {
    return requiereLogin(req, res, next);
  }
  if (req.session.usuario.rol !== "admin") {
    return res.status(403).render("error", {
      codigo: 403,
      mensaje: "No tienes permiso para entrar en esta página."
    });
  }
  next();
}

// Versiones para la API: en vez de redirigir, responden con JSON y el código HTTP adecuado
export function requiereLoginApi(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  res.status(401).json({ error: "Debes iniciar sesión" });
}

export function requiereAdminApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }
  if (req.session.usuario.rol !== "admin") {
    return res.status(403).json({ error: "No tienes permiso para esta operación" });
  }
  next();
}
