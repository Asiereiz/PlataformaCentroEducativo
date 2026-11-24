import { query } from "../db/mariadb.js";
import { ErrorApi } from "./errores.js";
import { hashear, comprobar } from "./contrasenas.js";
import { borrarSubida } from "./archivos.js";

// Nunca se devuelve la columna contrasena
const COLUMNAS = "id, nombre, primer_apellido, segundo_apellido, correo, rol, telefono, fecha_alta, fotografia, estado";

function controlarCorreoRepetido(error) {
  if (error.code === "ER_DUP_ENTRY") {
    throw new ErrorApi(409, "Ya existe un usuario con ese correo.");
  }
  throw error;
}

export async function listar() {
  return await query(`SELECT ${COLUMNAS} FROM usuarios ORDER BY id`);
}

export async function obtener(id) {
  const filas = await query(`SELECT ${COLUMNAS} FROM usuarios WHERE id = ?`, [id]);
  return filas[0];
}

export async function crear(d) {
  try {
    const resultado = await query(
      `INSERT INTO usuarios (nombre, primer_apellido, segundo_apellido, correo, contrasena, rol, telefono, fecha_alta, fotografia, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), COALESCE(?, '/images/usuario-predeterminado.jpg'), ?)`,
      [d.nombre, d.primer_apellido, d.segundo_apellido, d.correo, await hashear(d.contrasena),
       d.rol, d.telefono || null, d.fotografia || null, d.estado]
    );
    return await obtener(resultado.insertId);
  } catch (error) {
    controlarCorreoRepetido(error);
  }
}

// Registro público: siempre alumno y activo
export async function registrar(d) {
  return await crear({ ...d, rol: "alumno", estado: "activo" });
}

// Modificación hecha por el administrador. Si no llega contraseña, se conserva.
export async function modificar(id, d) {
  if (!(await obtener(id))) {
    return undefined;
  }
  try {
    await query(
      `UPDATE usuarios SET nombre = ?, primer_apellido = ?, segundo_apellido = ?, correo = ?,
              contrasena = COALESCE(?, contrasena), rol = ?, estado = ?
       WHERE id = ?`,
      [d.nombre, d.primer_apellido, d.segundo_apellido, d.correo,
       d.contrasena ? await hashear(d.contrasena) : null, d.rol, d.estado, id]
    );
  } catch (error) {
    controlarCorreoRepetido(error);
  }
  return await obtener(id);
}

// Edición del perfil por el propio usuario: solo cambia lo que llega,
// y nunca el rol ni el estado.
export async function actualizarPerfil(id, d) {
  const anterior = await obtener(id);
  if (!anterior) {
    return undefined;
  }
  try {
    await query(
      `UPDATE usuarios SET nombre = COALESCE(?, nombre), primer_apellido = COALESCE(?, primer_apellido),
              segundo_apellido = COALESCE(?, segundo_apellido), correo = COALESCE(?, correo),
              contrasena = COALESCE(?, contrasena), telefono = COALESCE(?, telefono),
              fotografia = COALESCE(?, fotografia)
       WHERE id = ?`,
      [d.nombre || null, d.primer_apellido || null, d.segundo_apellido || null, d.correo || null,
       d.contrasena ? await hashear(d.contrasena) : null, d.telefono || null, d.fotografia || null, id]
    );
  } catch (error) {
    controlarCorreoRepetido(error);
  }
  if (d.fotografia) await borrarSubida(anterior.fotografia);
  return await obtener(id);
}

export async function desactivar(id) {
  if (!(await obtener(id))) {
    return false;
  }
  await query("UPDATE usuarios SET estado = 'inactivo' WHERE id = ?", [id]);
  return true;
}

// Comprueba correo y contraseña. Devuelve los datos que se guardan en la sesión.
export async function iniciarSesion(correo, contrasena) {
  const filas = await query(
    "SELECT id, nombre, correo, rol, estado, contrasena FROM usuarios WHERE correo = ?",
    [correo]
  );
  const usuario = filas[0];

  if (!usuario || !(await comprobar(contrasena, usuario.contrasena))) {
    throw new ErrorApi(401, "Correo o contraseña incorrectos.");
  }
  if (usuario.estado === "inactivo") {
    throw new ErrorApi(403, "Tu cuenta está inactiva. Por favor, contacta con el administrador.");
  }
  return { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
}
