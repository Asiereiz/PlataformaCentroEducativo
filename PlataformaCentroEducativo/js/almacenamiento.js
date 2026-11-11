document.addEventListener("DOMContentLoaded", () => {
    updateSelect();
});

const DATOS_USER = "datos_usuarios";
const DATOS_CURSOS = "datos_cursos";
const DATOS_AULAS = "datos_aulas";
const DATOS_DOCENTES = "datos_docentes";
const DATOS_MATRICULAS = "datos_matriculas";

function updateSelect() {
  const aulas = leerDatos(DATOS_AULAS);
  const cursos = leerDatos(DATOS_CURSOS);
  const docentes = leerDatos(DATOS_DOCENTES);
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const usuarios = leerDatos(DATOS_USER);

  actualizarOpciones("id_mod_aula", aulas, "nombre");
  actualizarOpciones("id_del_aula", aulas, "nombre");
  actualizarOpciones("id_info_aula", aulas, "nombre");
  actualizarOpciones("id_mod_curso", cursos, "nombre");
  actualizarOpciones("id_del_curso", cursos, "nombre");
  actualizarOpciones("id_info_curso", cursos, "nombre");
  actualizarOpciones("id_mod_doc", docentes, "Nombre");
  actualizarOpciones("id_del_doc", docentes, "Nombre");
  actualizarOpciones("id_info_doc", docentes, "Nombre");
  actualizarOpciones("id_mod_mat", matriculas, "alumno");
  actualizarOpciones("id_del_mat", matriculas, "alumno");
  actualizarOpciones("id_mod_user", usuarios, "Nombre");
  actualizarOpciones("id_del_user", usuarios, "Nombre");
  actualizarOpciones("id_info_user", usuarios, "Nombre");
  actualizarOpciones("docente_alta_curso", docentes, "Nombre");
  actualizarOpciones("docente_mod_curso", docentes, "Nombre");
  actualizarOpciones("curso_matricula", cursos.filter(curso => curso.estado === "activo"), "nombre","Selecciona un curso");

  const alumnos = usuarios.filter(usuario =>
    usuario.rol === "alumno" ||
    (!usuario.rol && usuario.Correo !== "admin@centroeducativo.com")
  );
  actualizarOpciones("alumno_alta_mat", alumnos, "Nombre", "Selecciona un alumno");
  actualizarOpciones("alumno_mod_mat", alumnos, "Nombre", "Selecciona un alumno");
  actualizarOpciones("alumno_info_mat", alumnos, "Nombre", "Selecciona un alumno");
  actualizarOpciones("curso_alta_mat", cursos, "nombre", "Selecciona un curso");
  actualizarOpciones("curso_mod_mat", cursos, "nombre", "Selecciona un curso");
  actualizarOpciones("curso_info_mat", cursos, "nombre", "Selecciona un curso");
}

function actualizarOpciones(id, datos, campo, texto = "Selecciona un ID") {
  const select = document.getElementById(id);
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">${texto}</option>`;
  datos.forEach(dato => {
    select.innerHTML += `<option value="${dato.id}">${dato.id} - ${dato[campo]}</option>`;
  });
}