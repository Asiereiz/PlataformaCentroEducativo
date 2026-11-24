import { Router } from "express";
import * as cursosService from "../services/cursos.js";
import * as docentesService from "../services/docentes.js";
import * as matriculasService from "../services/matriculas.js";
import * as usuariosService from "../services/usuarios.js";
import { ErrorApi } from "../services/errores.js";
import { requiereLogin, avisar } from "../middlewares/sesion.js";
import { subirFoto, rutaFoto, descartarSubida } from "../middlewares/subida.js";
import {
  validarCursoMatricula, validarMatriculaCancelar, validarPerfil,
  validarContacto, validarPreferencias, erroresDe
} from "../middlewares/validaciones.js";

// Páginas para usuarios con sesión (alumnos y administradores).
// El middleware requiereLogin se coloca ANTES de las rutas que protege (tema 5.2, apartado 4):
// si no hay sesión, redirige al login y la ruta ni siquiera llega a ejecutarse.
const router = Router();
router.use(["/portal", "/cursos", "/docentes", "/mis-matriculas", "/perfil", "/accesibilidad", "/contacto"], requiereLogin);

router.get("/portal", (req, res) => {
  res.render("portal");
});

// ----------------------------------------------------------------- cursos
// La página solo trae la estructura: el catálogo lo pide el navegador a la API
// con Fetch (GET /api/cursos), recibe JSON y lo pinta (public/js/cursos.js).
router.get("/cursos", (req, res) => {
  res.render("cursos");
});

// --------------------------------------------------------------- docentes
// Esta página se genera en el servidor: consulta MariaDB y res.render() rellena la vista.
router.get("/docentes", async (req, res, next) => {
  try {
    res.render("docentes", { docentes: await docentesService.listar({ estado: "activo" }) });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------ matrículas
async function pintarMatriculas(req, res, extra = {}) {
  const [matriculas, cursos] = await Promise.all([
    matriculasService.listar({ alumno: req.session.usuario.id, estado: "activo" }),
    cursosService.listar({ estado: "activo" })
  ]);
  res.status(extra.status || 200).render("mis-matriculas", { matriculas, cursos, ...extra });
}

router.get("/mis-matriculas", async (req, res, next) => {
  try {
    await pintarMatriculas(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /mis-matriculas -> el alumno se matricula en un curso
router.post("/mis-matriculas", validarCursoMatricula, async (req, res, next) => {
  try {
    const errores = erroresDe(req);
    if (errores.length === 0) {
      try {
        await matriculasService.crear({ alumno: req.session.usuario.id, curso: req.body.curso, estado: "activo" });
        avisar(req, "ok", "Matrícula registrada correctamente.");
        return res.redirect("/mis-matriculas");
      } catch (err) {
        if (!(err instanceof ErrorApi)) throw err;
        errores.push(err.message);
      }
    }
    await pintarMatriculas(req, res, { errores, status: 400 });
  } catch (err) {
    next(err);
  }
});

// POST /mis-matriculas/cancelar -> el alumno cancela una de SUS matrículas
router.post("/mis-matriculas/cancelar", validarMatriculaCancelar, async (req, res, next) => {
  try {
    const errores = erroresDe(req);
    if (errores.length === 0) {
      const matricula = await matriculasService.obtener(req.body.matricula);
      if (!matricula || matricula.alumno !== req.session.usuario.id || matricula.estado !== "activo") {
        errores.push("No se encontró una matrícula activa con esa selección.");
      } else {
        await matriculasService.desactivar(matricula.id);
        avisar(req, "ok", "Matrícula cancelada correctamente.");
        return res.redirect("/mis-matriculas");
      }
    }
    await pintarMatriculas(req, res, { errores, status: 400 });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------- perfil
async function pintarPerfil(req, res, extra = {}) {
  const perfil = await usuariosService.obtener(req.session.usuario.id);
  res.status(extra.status || 200).render("perfil", { perfil, ...extra });
}

router.get("/perfil", async (req, res, next) => {
  try {
    await pintarPerfil(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /perfil (multipart/form-data: puede incluir una fotografía nueva en el campo "foto")
router.post("/perfil", subirFoto("foto"), validarPerfil, async (req, res, next) => {
  try {
    const datos = {
      nombre: req.body.nombre,
      primer_apellido: req.body.primer_apellido,
      segundo_apellido: req.body.segundo_apellido,
      correo: req.body.correo,
      telefono: req.body.telefono
    };
    const errores = erroresDe(req);
    if (errores.length === 0) {
      try {
        const perfil = await usuariosService.actualizarPerfil(req.session.usuario.id, {
          ...datos, contrasena: req.body.contrasena, fotografia: rutaFoto(req)
        });
        // La sesión guarda nombre y correo: se actualizan para que la cabecera no se quede desfasada
        req.session.usuario.nombre = perfil.nombre;
        req.session.usuario.correo = perfil.correo;
        avisar(req, "ok", "Perfil actualizado correctamente.");
        return res.redirect("/perfil");
      } catch (err) {
        if (!(err instanceof ErrorApi)) throw err;
        errores.push(err.message);
      }
    }
    await descartarSubida(req);
    await pintarPerfil(req, res, { errores, datos, status: 400 });
  } catch (err) {
    await descartarSubida(req);
    next(err);
  }
});

// -------------------------------------------------------- accesibilidad
router.get("/accesibilidad", (req, res) => {
  res.render("accesibilidad");
});

// POST /accesibilidad -> guarda el tema y el tamaño de letra en cookies (res.cookie)
router.post("/accesibilidad", validarPreferencias, (req, res) => {
  const errores = erroresDe(req);
  if (errores.length > 0) {
    return res.status(400).render("accesibilidad", { errores });
  }
  const opciones = { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax" };
  res.cookie("tema", req.body.tema, opciones);
  res.cookie("tamfuente", req.body.tamfuente, opciones);
  res.redirect("/accesibilidad");
});

// --------------------------------------------------------------- contacto
router.get("/contacto", (req, res) => {
  res.render("contacto");
});

router.post("/contacto", validarContacto, (req, res) => {
  const errores = erroresDe(req);
  if (errores.length > 0) {
    return res.status(400).render("contacto", { errores, datos: req.body });
  }
  // De momento el mensaje solo se registra en la consola del servidor (no hay servicio de correo)
  console.log(`Mensaje de contacto de ${req.body.correo}: ${req.body.mensaje_contacto}`);
  avisar(req, "ok", "Mensaje enviado correctamente. Te responderemos lo antes posible.");
  res.redirect("/contacto");
});

export default router;
