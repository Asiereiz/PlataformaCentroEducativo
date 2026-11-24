import { Router } from "express";
import * as usuariosService from "../services/usuarios.js";
import { ErrorApi } from "../services/errores.js";
import { avisar } from "../middlewares/sesion.js";
import { validarLogin, validarRegistro, erroresDe } from "../middlewares/validaciones.js";

// Páginas públicas (sin sesión): inicio, login, registro y cierre de sesión.
// Rutas web: devuelven HTML con res.render() (tema 5.3: "ruta web" frente a "ruta API").
const router = Router();

// GET /  -> página de bienvenida. Si ya hay sesión, se va directamente al portal.
router.get("/", (req, res) => {
  if (req.session.usuario) {
    return res.redirect("/portal");
  }
  res.render("index");
});

// ------------------------------------------------------------------ login
router.get("/login", (req, res) => {
  if (req.session.usuario) {
    return res.redirect("/portal");
  }
  res.render("login");
});

// POST /login: valida los campos y, si el correo y la contraseña son correctos,
// guarda al usuario en la sesión (req.session.usuario) y redirige (tema 5.2, apartado 4).
router.post("/login", validarLogin, async (req, res, next) => {
  const datos = { correo: req.body.correo };
  const errores = erroresDe(req);
  if (errores.length > 0) {
    return res.status(400).render("login", { errores, datos });
  }

  try {
    const usuario = await usuariosService.iniciarSesion(req.body.correo, req.body.contrasena);

    // Página a la que quería ir antes de que le pidiéramos iniciar sesión (solo rutas internas)
    const destino = req.session.destino;
    const destinoSeguro = typeof destino === "string" && /^\/(?!\/)/.test(destino) ? destino : "/portal";

    // Se crea una sesión nueva al iniciar sesión (evita reutilizar un identificador anterior)
    req.session.regenerate(error => {
      if (error) {
        return next(error);
      }
      req.session.usuario = usuario;
      res.redirect(destinoSeguro);
    });
  } catch (err) {
    if (err instanceof ErrorApi) {
      return res.status(err.status).render("login", { errores: [err.message], datos });
    }
    next(err);
  }
});

// --------------------------------------------------------------- registro
router.get("/registro", (req, res) => {
  if (req.session.usuario) {
    return res.redirect("/portal");
  }
  res.render("registro");
});

router.post("/registro", validarRegistro, async (req, res, next) => {
  // Si hay errores se vuelve a pintar la vista con el mensaje y SIN borrar lo escrito (menos las contraseñas)
  const datos = {
    nombre: req.body.nombre,
    primer_apellido: req.body.primer_apellido,
    segundo_apellido: req.body.segundo_apellido,
    correo: req.body.correo
  };
  const errores = erroresDe(req);
  if (errores.length > 0) {
    return res.status(400).render("registro", { errores, datos });
  }

  try {
    await usuariosService.registrar({ ...datos, contrasena: req.body.contrasena });
    avisar(req, "ok", "Usuario registrado correctamente. Ya puedes iniciar sesión.");
    res.redirect("/login");
  } catch (err) {
    if (err instanceof ErrorApi) {
      return res.status(err.status).render("registro", { errores: [err.message], datos });
    }
    next(err);
  }
});

// ----------------------------------------------------------------- logout
// Elimina la sesión del servidor y la cookie del navegador, y vuelve a la portada.
function cerrarSesion(req, res, next) {
  req.session.destroy(error => {
    if (error) {
      return next(error);
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
}
router.post("/logout", cerrarSesion);
router.get("/logout", cerrarSesion); // el enlace "Cerrar sesión" de la cabecera

export default router;
