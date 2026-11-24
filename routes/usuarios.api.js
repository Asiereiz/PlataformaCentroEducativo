import { Router } from "express";
import * as usuariosService from "../services/usuarios.js";
import { requiereAdminApi } from "../middlewares/sesion.js";
import { validarUsuarioAlta, validarUsuarioMod, validarApi } from "../middlewares/validaciones.js";

// API REST de usuarios (solo administrador). Nunca devuelve la contraseña.
// En app.js se monta con app.use("/api/usuarios", router).
const router = Router();
router.use(requiereAdminApi);

router.param("id", (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Identificador no válido" });
  }
  next();
});

const datosUsuario = req => ({
  nombre: req.body.nombre,
  primer_apellido: req.body.primer_apellido,
  segundo_apellido: req.body.segundo_apellido,
  correo: req.body.correo,
  contrasena: req.body.contrasena,
  rol: req.body.rol,
  estado: req.body.estado
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await usuariosService.listar());
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const usuario = await usuariosService.obtener(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

router.post("/", validarUsuarioAlta, validarApi, async (req, res, next) => {
  try {
    const usuario = await usuariosService.crear({ ...datosUsuario(req), telefono: null });
    res.status(201).location(`/api/usuarios/${usuario.id}`).json(usuario);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validarUsuarioMod, validarApi, async (req, res, next) => {
  try {
    const usuario = await usuariosService.modificar(req.params.id, datosUsuario(req));
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!(await usuariosService.desactivar(req.params.id))) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
