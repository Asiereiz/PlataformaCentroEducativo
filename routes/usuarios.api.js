import { Router } from "express";
import * as db from "../db/mariadb.js";

const router = Router();

// POST /api/usuarios  ->  201 Created (registro de un alumno)
// El rol NO se lee de la petición: todo usuario registrado es "alumno".
router.post("/", async (req, res) => {
  const error = validarRegistro(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const email = String(req.body.email).trim().toLowerCase();

  try {
    if (await db.obtenerUsuarioPorEmail(email)) {
      return res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    }

    const id_usuario = await db.altaUsuario({
      nombre: String(req.body.nombre).trim(),
      email,
      password: String(req.body.password),
      rol: "alumno"
    });
    return res.status(201).json({ id_usuario }); // Creado
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    }
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/usuarios/login  ->  200 OK + datos del usuario (sin contraseña)
router.post("/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    return res.status(400).json({ error: "Faltan el correo o la contraseña" });
  }

  try {
    const usuario = await db.obtenerUsuarioPorEmail(email);

    // Mismo mensaje si el correo no existe o la contraseña falla (401)
    if (!usuario || usuario.password !== password) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    // 403: la contraseña es correcta pero la cuenta está desactivada
    if (Number(usuario.activo) !== 1) {
      return res.status(403).json({ error: "Tu cuenta está inactiva. Por favor, contacta con el administrador." });
    }

    return res.json({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    });
  } catch (err) {
    console.error("Error en BD:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/usuarios  ->  200 OK + array JSON (sin contraseñas)
// Filtro opcional: ?rol=alumno
router.get("/", async (req, res) => {
  const { rol } = req.query;
  if (rol !== undefined && !["admin", "alumno"].includes(rol)) {
    return res.status(400).json({ error: "El filtro rol debe ser admin o alumno" });
  }

  try {
    res.json(await db.listarUsuarios(rol));
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/usuarios/:id  ->  200 OK + usuario (sin contraseña)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (validarId(id)) {
    return res.status(400).json({ error: validarId(id) });
  }

  try {
    const usuario = await db.obtenerUsuario(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (err) {
    console.error("Error en BD:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/usuarios/:id  ->  200 OK (editar el perfil)
// Cuerpo JSON: { nombre, email, password? }. Sin password se conserva la actual.
// El rol y el estado NO se pueden cambiar desde aquí.
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const error = validarId(id) || validarPerfil(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const email = String(req.body.email).trim().toLowerCase();

  try {
    if (!(await db.obtenerUsuario(id))) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // El correo no puede ser el de otro usuario
    const otro = await db.obtenerUsuarioPorEmail(email);
    if (otro && otro.id_usuario !== id) {
      return res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    }

    await db.modificarUsuario(id, { nombre: String(req.body.nombre).trim(), email });
    if (req.body.password) {
      await db.actualizarPassword(id, String(req.body.password));
    }
    return res.json({ id_usuario: id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    }
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

// Para editar el perfil: la contraseña es opcional (solo se valida si llega)
function validarPerfil(datos) {
  if (!datos || !String(datos.nombre ?? "").trim() || !String(datos.email ?? "").trim()) {
    return "Faltan datos obligatorios del usuario";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(datos.email).trim())) {
    return "El correo electrónico no es válido";
  }
  if (datos.password && String(datos.password).length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }
  return null;
}

function validarRegistro(datos) {
  if (!datos || !String(datos.nombre ?? "").trim() || !String(datos.email ?? "").trim() || !datos.password) {
    return "Faltan datos obligatorios del usuario";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(datos.email).trim())) {
    return "El correo electrónico no es válido";
  }
  if (String(datos.password).length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }
  return null;
}
