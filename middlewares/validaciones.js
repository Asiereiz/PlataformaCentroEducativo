import { body, validationResult } from "express-validator";
import { TEMAS, TAMANOS } from "./preferencias.js";

// ---------------------------------------------------------------------------
// Validación en el servidor con express-validator (tema 5.2, apartado 5).
// Las reglas se definen UNA vez y sirven para los formularios web (se vuelve a
// pintar la vista con los errores) y para la API (se responde 400 con JSON).
// ---------------------------------------------------------------------------

const texto = (campo, etiqueta, max = 100) =>
  body(campo).trim()
    .notEmpty().withMessage(`El campo ${etiqueta} es obligatorio`).bail()
    .isLength({ max }).withMessage(`El campo ${etiqueta} no puede tener más de ${max} caracteres`);

const correo = (campo = "correo") =>
  body(campo).trim()
    .notEmpty().withMessage("El correo es obligatorio").bail()
    .isEmail().withMessage("El correo no es válido");

const entero = (campo, mensaje) => body(campo).isInt({ min: 1 }).withMessage(mensaje).toInt();

const fecha = (campo, etiqueta) =>
  body(campo).isDate({ format: "YYYY-MM-DD", strictMode: true }).withMessage(`La ${etiqueta} no es válida`);

const estado = body("estado").isIn(["activo", "inactivo"]).withMessage("El estado debe ser activo o inactivo");

const TELEFONO = /^[0-9 +()-]{6,20}$/;
const MINIMO_CONTRASENA = 5;

const contrasena = (campo = "contrasena", { obligatoria = true } = {}) => {
  const regla = body(campo);
  if (!obligatoria) regla.optional({ values: "falsy" });
  return regla.trim()
    .notEmpty().withMessage("La contraseña es obligatoria").bail()
    .isLength({ min: MINIMO_CONTRASENA }).withMessage(`La contraseña debe tener al menos ${MINIMO_CONTRASENA} caracteres`);
};

const confirmar = body("confirmar_contrasena").trim()
  .custom((valor, { req }) => valor === req.body.contrasena)
  .withMessage("Las contraseñas no coinciden");

// ------------------------------------------------------------------ reglas
export const validarLogin = [
  correo(),
  body("contrasena").trim().notEmpty().withMessage("La contraseña es obligatoria")
];

export const validarRegistro = [
  texto("nombre", "nombre"),
  texto("primer_apellido", "primer apellido"),
  texto("segundo_apellido", "segundo apellido"),
  correo(),
  contrasena(),
  confirmar
];

// Perfil: todo es opcional (solo se cambia lo que se rellena)
export const validarPerfil = [
  body("nombre").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("El nombre es demasiado largo"),
  body("primer_apellido").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("El primer apellido es demasiado largo"),
  body("segundo_apellido").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("El segundo apellido es demasiado largo"),
  body("correo").optional({ values: "falsy" }).trim().isEmail().withMessage("El correo no es válido"),
  contrasena("contrasena", { obligatoria: false }),
  body("confirmar_contrasena").trim()
    .custom((valor, { req }) => (req.body.contrasena || "") === valor)
    .withMessage("Las contraseñas no coinciden"),
  body("telefono").optional({ values: "falsy" }).trim().matches(TELEFONO).withMessage("El teléfono no es válido")
];

export const validarContacto = [
  correo(),
  texto("mensaje_contacto", "mensaje", 2000)
];

export const validarPreferencias = [
  body("tema").isIn(TEMAS).withMessage("Tema no válido"),
  body("tamfuente").isIn(TAMANOS).withMessage("Tamaño de letra no válido")
];

export const validarAula = [
  texto("nombre", "nombre"),
  texto("edificio", "edificio", 100),
  texto("planta", "planta", 20),
  entero("capacidad", "La capacidad debe ser un entero mayor que 0"),
  texto("equipamiento", "equipamiento", 500),
  estado
];

export const validarDocente = [
  texto("nombre", "nombre"),
  texto("primer_apellido", "primer apellido"),
  texto("segundo_apellido", "segundo apellido"),
  correo(),
  texto("especialidad", "especialidad"),
  body("telefono").trim().notEmpty().withMessage("El campo teléfono es obligatorio").bail()
    .matches(TELEFONO).withMessage("El teléfono no es válido"),
  estado
];

export const validarCurso = [
  texto("nombre", "nombre"),
  texto("descripcion", "descripción", 1000),
  entero("docente", "Selecciona un docente"),
  entero("aula", "Selecciona un aula"),
  fecha("fecha_inicio", "fecha de inicio"),
  fecha("fecha_fin", "fecha de finalización"),
  body("fecha_fin").custom((valor, { req }) => !valor || !req.body.fecha_inicio || valor >= req.body.fecha_inicio)
    .withMessage("La fecha de finalización no puede ser anterior a la de inicio"),
  texto("horario", "horario", 50),
  entero("max_plazas", "El número máximo de plazas debe ser un entero mayor que 0"),
  estado
];

// Usuario creado por el administrador (la contraseña es obligatoria)
export const validarUsuarioAlta = [
  texto("nombre", "nombre"),
  texto("primer_apellido", "primer apellido"),
  texto("segundo_apellido", "segundo apellido"),
  correo(),
  contrasena(),
  body("rol").isIn(["admin", "alumno"]).withMessage("El rol debe ser admin o alumno"),
  estado
];

// Al modificar, la contraseña solo se cambia si se escribe una nueva
export const validarUsuarioMod = [
  texto("nombre", "nombre"),
  texto("primer_apellido", "primer apellido"),
  texto("segundo_apellido", "segundo apellido"),
  correo(),
  contrasena("contrasena", { obligatoria: false }),
  body("rol").isIn(["admin", "alumno"]).withMessage("El rol debe ser admin o alumno"),
  estado
];

export const validarMatricula = [
  entero("alumno", "Selecciona un alumno"),
  entero("curso", "Selecciona un curso"),
  fecha("fecha_matricula", "fecha de matrícula"),
  estado
];

export const validarId = [entero("id", "Selecciona un identificador")];
export const validarCursoMatricula = [entero("curso", "Selecciona un curso")];
export const validarMatriculaCancelar = [entero("matricula", "Selecciona una matrícula")];

// -------------------------------------------------------------- resultado
// Lista de mensajes de error de una petición (incluye el error de la imagen, si lo hay)
export function erroresDe(req) {
  const errores = validationResult(req).array().map(e => e.msg);
  if (req.errorSubida) errores.push(req.errorSubida);
  return errores;
}

// Para la API: si hay errores, 400 con { error, details } (tema 5.3, apartado 3)
export function validarApi(req, res, next) {
  const errores = erroresDe(req);
  if (errores.length > 0) {
    return res.status(400).json({ error: "Datos no válidos", details: errores });
  }
  next();
}
