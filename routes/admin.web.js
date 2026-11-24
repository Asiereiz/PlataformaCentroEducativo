import { Router } from "express";
import * as aulasService from "../services/aulas.js";
import * as docentesService from "../services/docentes.js";
import * as usuariosService from "../services/usuarios.js";
import * as cursosService from "../services/cursos.js";
import * as matriculasService from "../services/matriculas.js";
import * as estadisticasService from "../services/estadisticas.js";
import { requiereAdmin } from "../middlewares/sesion.js";
import { crearRouterGestion } from "./gestion.web.js";
import {
  validarAula, validarDocente, validarCurso, validarUsuarioAlta, validarUsuarioMod, validarMatricula
} from "../middlewares/validaciones.js";
import { rutaFoto } from "../middlewares/subida.js";

// Zona de administración. En app.js se monta con app.use("/admin", router).
// router.use(requiereAdmin) protege todas las páginas: sin sesión -> /login; sin ser admin -> 403.
const router = Router();
router.use(requiereAdmin);

const texto = (n, et, ph, tipo = "text") => ({ n, et, tipo, ph });
const opcionesDe = (filas, f) => filas.map(fila => ({ valor: fila.id, texto: f(fila) }));
const NOTA_FOTO = {
  alta: "Opcional: se usará la imagen predeterminada si no eliges una.",
  mod: "Opcional: si no eliges otra, se conserva la imagen actual."
};

// ------------------------------------------------------------------ cursos
router.use("/cursos", crearRouterGestion({
  clave: "curso", ruta: "cursos", nombre: "Curso", titulo: "Gestionar cursos", eliminar: "este curso",
  servicio: cursosService,
  validar: validarCurso,
  foto: "foto",
  listar: () => cursosService.listar(),
  etiquetaId: c => `${c.id} - ${c.nombre}`,
  campos: async () => {
    const [docentes, aulas] = await Promise.all([docentesService.listar({ estado: "activo" }), aulasService.listar()]);
    return [
      texto("nombre", "Nombre", "Inserta el nombre del curso"),
      { n: "descripcion", et: "Descripción", tipo: "textarea", ph: "Inserta la descripción del curso" },
      { n: "docente", et: "Docente responsable", tipo: "select", ph: "Selecciona un docente",
        opciones: opcionesDe(docentes, d => `${d.nombre} ${d.primer_apellido} ${d.segundo_apellido}`) },
      { n: "aula", et: "Aula", tipo: "select", ph: "Selecciona el aula",
        opciones: opcionesDe(aulas.filter(a => a.estado === "activo"), a => a.nombre) },
      texto("fecha_inicio", "Fecha de inicio", "Inserta la fecha de inicio del curso", "date"),
      texto("fecha_fin", "Fecha de finalización", "Inserta la fecha de finalización del curso", "date"),
      texto("horario", "Horario", "Inserta el horario del curso"),
      texto("max_plazas", "Número máximo de plazas", "Inserta el número máximo de plazas", "number"),
      { n: "foto", et: "Imagen representativa", tipo: "file", nota: NOTA_FOTO },
      { n: "estado", et: "Estado", tipo: "estado" }
    ];
  },
  info: {
    nombre: "Nombre", descripcion: "Descripción", docente_nombre: "Docente", aula_nombre: "Aula",
    fecha_inicio: "Fecha de inicio", fecha_fin: "Fecha de fin", horario: "Horario",
    max_plazas: "Máximo de plazas", plazas_ocupadas: "Plazas ocupadas", estado: "Estado"
  },
  datos: req => ({
    nombre: req.body.nombre, descripcion: req.body.descripcion,
    docente: Number(req.body.docente), aula: Number(req.body.aula),
    fecha_inicio: req.body.fecha_inicio, fecha_fin: req.body.fecha_fin,
    horario: req.body.horario, max_plazas: Number(req.body.max_plazas),
    foto: rutaFoto(req), estado: req.body.estado
  })
}));

// --------------------------------------------------------------- docentes
router.use("/docentes", crearRouterGestion({
  clave: "doc", ruta: "docentes", nombre: "Docente", titulo: "Gestionar docentes", eliminar: "este docente",
  servicio: docentesService,
  validar: validarDocente,
  foto: "foto",
  listar: () => docentesService.listar(),
  etiquetaId: d => `${d.id} - ${d.nombre} ${d.primer_apellido}`,
  campos: async () => [
    texto("nombre", "Nombre", "Inserta el nombre"),
    texto("primer_apellido", "Primer apellido", "Inserta el primer apellido"),
    texto("segundo_apellido", "Segundo apellido", "Inserta el segundo apellido"),
    texto("correo", "Correo electrónico", "Inserta el correo electrónico", "email"),
    texto("especialidad", "Especialidad", "Inserta la especialidad"),
    texto("telefono", "Teléfono", "Inserta el teléfono", "tel"),
    { n: "foto", et: "Fotografía", tipo: "file", nota: {
      alta: "Opcional: se usará la fotografía predeterminada si no eliges una.",
      mod: "Opcional: si no eliges otra, se conserva la fotografía actual."
    } },
    { n: "estado", et: "Estado", tipo: "estado" }
  ],
  info: {
    nombre: "Nombre", primer_apellido: "Primer apellido", segundo_apellido: "Segundo apellido",
    correo: "Correo", especialidad: "Especialidad", telefono: "Teléfono", estado: "Estado"
  },
  datos: req => ({
    nombre: req.body.nombre, primer_apellido: req.body.primer_apellido,
    segundo_apellido: req.body.segundo_apellido, correo: req.body.correo,
    especialidad: req.body.especialidad, telefono: req.body.telefono,
    fotografia: rutaFoto(req), estado: req.body.estado
  })
}));

// ------------------------------------------------------------------ aulas
router.use("/aulas", crearRouterGestion({
  clave: "aula", ruta: "aulas", nombre: "Aula", femenino: true, titulo: "Gestionar aulas", eliminar: "esta aula",
  servicio: aulasService,
  validar: validarAula,
  listar: () => aulasService.listar(),
  etiquetaId: a => `${a.id} - ${a.nombre}`,
  campos: async () => [
    texto("nombre", "Nombre", "Inserta el nombre del aula"),
    texto("edificio", "Edificio", "Inserta el edificio del aula"),
    texto("planta", "Planta", "Inserta la planta del aula", "number"),
    texto("capacidad", "Capacidad", "Inserta la capacidad del aula", "number"),
    { n: "equipamiento", et: "Equipamiento disponible", tipo: "textarea", ph: "Inserta el equipamiento disponible en el aula" },
    { n: "estado", et: "Estado", tipo: "estado" }
  ],
  info: {
    nombre: "Nombre", edificio: "Edificio", planta: "Planta", capacidad: "Capacidad",
    equipamiento: "Equipamiento", estado: "Estado"
  },
  datos: req => ({
    nombre: req.body.nombre, edificio: req.body.edificio, planta: req.body.planta,
    capacidad: Number(req.body.capacidad), equipamiento: req.body.equipamiento, estado: req.body.estado
  })
}));

// --------------------------------------------------------------- usuarios
router.use("/usuarios", crearRouterGestion({
  clave: "user", ruta: "usuarios", nombre: "Usuario", titulo: "Gestionar usuarios", eliminar: "este usuario",
  servicio: usuariosService,
  validar: validarUsuarioAlta,
  validarMod: validarUsuarioMod,
  listar: () => usuariosService.listar(),
  etiquetaId: u => `${u.id} - ${u.nombre} ${u.primer_apellido}`,
  campos: async () => [
    texto("nombre", "Nombre", "Inserta el nombre"),
    texto("primer_apellido", "Primer apellido", "Inserta el primer apellido"),
    texto("segundo_apellido", "Segundo apellido", "Inserta el segundo apellido"),
    texto("correo", "Correo electrónico", "Inserta el correo electrónico", "email"),
    { n: "contrasena", et: "Contraseña", tipo: "password", ph: "Inserta la contraseña", opcionalAlModificar: true,
      nota: { alta: "", mod: "Déjala en blanco para no cambiarla." } },
    { n: "rol", et: "Rol", tipo: "select", ph: "Selecciona un rol",
      opciones: [{ valor: "admin", texto: "Admin" }, { valor: "alumno", texto: "Alumno" }] },
    { n: "estado", et: "Estado", tipo: "estado" }
  ],
  info: {
    nombre: "Nombre", primer_apellido: "Primer apellido", segundo_apellido: "Segundo apellido",
    correo: "Correo", rol: "Rol", estado: "Estado", fecha_alta: "Fecha de alta"
  },
  datos: req => ({
    nombre: req.body.nombre, primer_apellido: req.body.primer_apellido,
    segundo_apellido: req.body.segundo_apellido, correo: req.body.correo,
    contrasena: req.body.contrasena || undefined, rol: req.body.rol, estado: req.body.estado
  })
}));

// ------------------------------------------------------------- matrículas
router.use("/matriculas", crearRouterGestion({
  clave: "mat", ruta: "matriculas", nombre: "Matrícula", femenino: true, titulo: "Gestionar matrículas",
  eliminar: "esta matrícula",
  servicio: matriculasService,
  validar: validarMatricula,
  consultaPor: "alumno-curso",
  listar: () => matriculasService.listar(),
  etiquetaId: m => `${m.id} - ${m.alumno_nombre} / ${m.curso_nombre}`,
  campos: async () => {
    const [usuarios, cursos] = await Promise.all([usuariosService.listar(), cursosService.listar()]);
    return [
      { n: "alumno", et: "Alumno", tipo: "select", ph: "Selecciona un alumno",
        opciones: opcionesDe(usuarios.filter(u => u.rol === "alumno"), u => `${u.nombre} ${u.primer_apellido}`) },
      { n: "curso", et: "Curso", tipo: "select", ph: "Selecciona un curso",
        opciones: opcionesDe(cursos, c => c.nombre) },
      texto("fecha_matricula", "Fecha de matrícula", "Inserta la fecha de matrícula", "date"),
      { n: "estado", et: "Estado", tipo: "estado" }
    ];
  },
  info: {
    id: "Identificador", alumno_nombre: "Alumno", curso_nombre: "Curso",
    fecha_matricula: "Fecha de matrícula", estado: "Estado"
  },
  datos: req => ({
    alumno: Number(req.body.alumno), curso: Number(req.body.curso),
    fecha_matricula: req.body.fecha_matricula, estado: req.body.estado
  })
}));

// --------------------------------------------------- estadísticas e importar
router.get("/dashboard", async (req, res, next) => {
  try {
    res.render("admin/dashboard", { estadisticas: await estadisticasService.obtener() });
  } catch (err) {
    next(err);
  }
});

router.get("/importar", (req, res) => {
  res.render("admin/importar");
});

// /admin a secas lleva a la primera página de gestión
router.get("/", (req, res) => {
  res.redirect("/admin/cursos");
});

export default router;
