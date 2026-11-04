document.addEventListener("DOMContentLoaded", () => {

  const registro = document.getElementById("formregistro");
  if(registro){
    registro.addEventListener("submit", registrarUsuario)
  }

  const login = document.getElementById("formlogin");
  if(login){
    login.addEventListener("submit", iniciarSesion)
  }

  mostrarSesion();
  updateSelect();
  aplicarPreferencias();

  const btnCerrarSesion = document.getElementById("cerrarSesion");
  if(btnCerrarSesion){
    btnCerrarSesion.addEventListener("click", cerrarSesion)
  }

  const btnAltaAula = document.getElementById("alta_aula");
  if(btnAltaAula){
    btnAltaAula.addEventListener("submit", altaAula);
  }

  const btnModAula = document.getElementById("mod_aula");
  if(btnModAula){
    btnModAula.addEventListener("submit", modAula);
  }

  const selectModAula = document.getElementById("id_mod_aula");
  if(selectModAula){
    selectModAula.addEventListener("change", rellenarAula);
  }

  const btnDelAula = document.getElementById("del_aula");
  if(btnDelAula){
    btnDelAula.addEventListener("submit", delAula);
  }

  const btnInfoAula = document.getElementById("info_aula");
  if(btnInfoAula){
    btnInfoAula.addEventListener("submit", infoAula);
  }

  const btnAltaCurso = document.getElementById("alta_curso");
  if(btnAltaCurso){
    btnAltaCurso.addEventListener("submit", altaCurso);
  }

  const btnModCurso = document.getElementById("mod_curso");
  if(btnModCurso){
    btnModCurso.addEventListener("submit", modCurso);
  }

  const selectModCurso = document.getElementById("id_mod_curso");
  if(selectModCurso){
    selectModCurso.addEventListener("change", rellenarCurso);
  }

  const btnDelCurso = document.getElementById("del_curso");
  if(btnDelCurso){
    btnDelCurso.addEventListener("submit", delCurso);
  }

  const btnInfoCurso = document.getElementById("info_curso");
  if(btnInfoCurso){
    btnInfoCurso.addEventListener("submit", infoCurso);
  }

  const btnAltaDoc = document.getElementById("alta_doc");
  if(btnAltaDoc){
    btnAltaDoc.addEventListener("submit", altaDoc);
  }

  const btnModDoc = document.getElementById("mod_doc");
  if(btnModDoc){
    btnModDoc.addEventListener("submit", modDoc);
  }

  const selectModDoc = document.getElementById("id_mod_doc");
  if(selectModDoc){
    selectModDoc.addEventListener("change", rellenarDoc);
  }

  const btnDelDoc = document.getElementById("del_doc");
  if(btnDelDoc){
    btnDelDoc.addEventListener("submit", delDoc);
  }

  const btnInfoDoc = document.getElementById("info_doc");
  if(btnInfoDoc){
    btnInfoDoc.addEventListener("submit", infoDoc);
  }

  const btnAltaMat = document.getElementById("alta_mat");
  if(btnAltaMat){
    btnAltaMat.addEventListener("submit", altaMat);
  }

  const btnModMat = document.getElementById("mod_mat");
  if(btnModMat){
    btnModMat.addEventListener("submit", modMat);
  }

  const selectModMat = document.getElementById("id_mod_mat");
  if(selectModMat){
    selectModMat.addEventListener("change", rellenarMat);
  }

  const btnDelMat = document.getElementById("del_mat");
  if(btnDelMat){
    btnDelMat.addEventListener("submit", delMat);
  }

  const btnInfoMat = document.getElementById("info_mat");
  if(btnInfoMat){
    btnInfoMat.addEventListener("submit", infoMat);
  }

  const btnAltaUser = document.getElementById("alta_user");
  if(btnAltaUser){
    btnAltaUser.addEventListener("submit", altaUser);
  }

  const btnModUser = document.getElementById("mod_user");
  if(btnModUser){
    btnModUser.addEventListener("submit", modUser);
  }

  const selectModUser = document.getElementById("id_mod_user");
  if(selectModUser){
    selectModUser.addEventListener("change", rellenarUser);
  }

  const btnDelUser = document.getElementById("del_user");
  if(btnDelUser){
    btnDelUser.addEventListener("submit", delUser);
  }

  const btnInfoUser = document.getElementById("info_user");
  if(btnInfoUser){
    btnInfoUser.addEventListener("submit", infoUser);
  }

  const selectModoPantalla = document.getElementById("modoPantalla");
  if(selectModoPantalla){
    selectModoPantalla.addEventListener("change", cambiarColorPantalla);
  }

  const selectTamLetra = document.getElementById("sizeLetra");
  if(selectTamLetra){
    selectTamLetra.addEventListener("change", cambiarTamañoLetra);
  }

  const btnInicio = document.getElementById("botonInicio");
  if(btnInicio){
    btnInicio.addEventListener("click", irAlInicio);
  }

  const btntitInicio = document.getElementById("tituloInicio");
  if(btntitInicio){
    btntitInicio.addEventListener("click", irAlInicio);
  }

});

const CLAVE_TEMA = "tema";
const CLAVE_TAMFUENTE = "tamfuente";

function cambiarColorPantalla(event){
  event.preventDefault();

  const pantalla = document.querySelector("body");
  const modo = document.getElementById("modoPantalla").value;

  localStorage.setItem(CLAVE_TEMA, modo);

  if(modo === "oscuro"){
    pantalla.classList.add("oscuro");
    pantalla.classList.remove("contraste");
  }else if (modo === "contraste"){
    pantalla.classList.remove("oscuro");
    pantalla.classList.add("contraste");
  }else{
    pantalla.classList.remove("oscuro");
    pantalla.classList.remove("contraste");
  }
}

function cambiarTamañoLetra(event){
  event.preventDefault();

  const letra = document.querySelector("body");
  const modo = document.getElementById("sizeLetra").value;

  localStorage.setItem(CLAVE_TAMFUENTE, modo);

  if(modo === "large"){
    letra.classList.add("large");
    letra.classList.remove("small");
  }else if (modo === "small"){
    letra.classList.remove("large");
    letra.classList.add("small");
  }else{
    letra.classList.remove("large");
    letra.classList.remove("small");
  }
}

function aplicarPreferencias() {
  const pantalla = document.querySelector("body");

  const tema = localStorage.getItem(CLAVE_TEMA);
  if (tema === "oscuro") {
    pantalla.classList.add("oscuro");
    pantalla.classList.remove("contraste");
  } else if (tema === "contraste") {
    pantalla.classList.remove("oscuro");
    pantalla.classList.add("contraste");
  }

  const tamfuente = localStorage.getItem(CLAVE_TAMFUENTE);
  if (tamfuente === "large") {
    pantalla.classList.add("large");
    pantalla.classList.remove("small");
  } else if (tamfuente === "small") {
    pantalla.classList.remove("large");
    pantalla.classList.add("small");
  }

  const selectModoPantalla = document.getElementById("modoPantalla");
  if (selectModoPantalla && tema) {
    selectModoPantalla.value = tema;
  }

  const selectTamLetra = document.getElementById("sizeLetra");
  if (selectTamLetra && tamfuente) {
    selectTamLetra.value = tamfuente;
  }
}

const DATOS_USER = "user";
const DATOS_CURSOS = "cursos";
const DATOS_AULAS = "aulas";
const DATOS_DOCENTES = "docentes";
const DATOS_MATRICULAS = "matriculas";


function guardarDatos(array, datos){
  localStorage.setItem(array, JSON.stringify(datos))
}

function leerDatos(array){
  const datos = JSON.parse(localStorage.getItem(array));
   if (datos === null) {
    return [];
   }
   return datos;
}

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

  const alumnos = usuarios.filter(usuario =>
    usuario.rol === "alumno" ||
    (!usuario.rol && usuario.Correo !== "admin@centroeducativo.com")
  );
  actualizarOpciones("alumno_alta_mat", alumnos, "Nombre", "Selecciona un alumno");
  actualizarOpciones("alumno_mod_mat", alumnos, "Nombre", "Selecciona un alumno");
  actualizarOpciones("alumno_info_mat", alumnos, "Nombre", "Selecciona un alumno");
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

function inicializarUsuarios() {

    let user = leerDatos(DATOS_USER);
    
    if (user === null) {
        user = [
        { id: 1, Nombre: "Admin", Primer_apellido: "Admin", Segundo_apellido: "Admin", Correo: "admin@centroeducativo.com", Contraseña: "Admin", Confirmar_contraseña: "Admin" }
        ];

        guardarDatos(DATOS_USER, user);
    }
}

function irAlInicio(event) {
    event.preventDefault();

    const logged = sessionStorage.getItem("loggeado");

    if(logged === "true"){
      window.location.href = "portal.html";
    }else{
      window.location.href = "index.html";
    }

    
}

function registrarUsuario(event) {
  
  event.preventDefault();
  const user = {
    id: leerDatos(DATOS_USER).length + 1,
    Nombre: document.getElementById("Nombre").value.trim(),
    Primer_apellido: document.getElementById("Primer_apellido").value.trim(),
    Segundo_apellido: document.getElementById("Segundo_apellido").value.trim(),
    Correo: document.getElementById("Correo").value.trim(),
    Contraseña: document.getElementById("Contraseña").value.trim(),
    Confirmar_contraseña: document.getElementById("Confirmar_contraseña").value.trim()
  }

  const usuarios = leerDatos(DATOS_USER);
  usuarios.push(user);
  guardarDatos(DATOS_USER, usuarios);

}


function iniciarSesion(event) {
    event.preventDefault();

    const correo = document.getElementById("Correo").value.trim();
    const contraseña = document.getElementById("Contraseña").value.trim();
    
    const usuarios = leerDatos(DATOS_USER);
    const usuario = usuarios.find(u => u.Correo === correo && u.Contraseña === contraseña);

    if (usuario) {
        if (usuario.Correo == "admin@centroeducativo.com") {
            sessionStorage.setItem("tipoUsuario", "admin");
            window.location.href = "portal.html";
        } else {
            sessionStorage.setItem("tipoUsuario", "alumno");
            window.location.href = "portal.html";
        }
        sessionStorage.setItem("loggeado", "true");
    } else {
        alert("Correo o contraseña incorrectos.");
    }

}

function mostrarSesion() {
  const tipoUsuario = sessionStorage.getItem("tipoUsuario");
  const sesionAdmin = document.querySelectorAll(".sesionAdmin");
  const sesionAlumno = document.querySelectorAll(".sesionAlumno");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  if (tipoUsuario === "admin") {
    header.classList.add("header-admin");
    if (footer) footer.classList.add("footer-admin");
    sesionAdmin.forEach(el => el.hidden = false);
    sesionAlumno.forEach(el => el.hidden = true);
  } else {
    header.classList.remove("header-admin");
    if (footer) footer.classList.remove("footer-admin");
    sesionAdmin.forEach(el => el.hidden = true);
    sesionAlumno.forEach(el => el.hidden = false);
  }
}

function cerrarSesion(){
  sessionStorage.removeItem("tipoUsuario");
  sessionStorage.setItem("loggeado", false);
  window.location.href = "index.html";
}

function altaAula(event) {
  event.preventDefault();

  const aula = {
    id: leerDatos(DATOS_AULAS).length + 1,
    nombre: document.getElementById("nombre_alta_aula").value.trim(),
    edificio: document.getElementById("edificio_alta_aula").value.trim(),
    planta: document.getElementById("planta_alta_aula").value.trim(),
    capacidad: document.getElementById("capacidad_alta_aula").value.trim(),
    equipamiento: document.getElementById("equipamiento_alta_aula").value.trim(),
    estado: document.getElementById("estado_alta_aula").value.trim()
  }

  const aulas = leerDatos(DATOS_AULAS);
  aulas.push(aula);
  guardarDatos(DATOS_AULAS, aulas);

  updateSelect();
}

function altaCurso(event) {
  event.preventDefault();

  const cursos = leerDatos(DATOS_CURSOS);
  const curso = {
    id: cursos.length + 1,
    nombre: document.getElementById("nombre_alta_curso").value.trim(),
    descripcion: document.getElementById("descripcion_alta_curso").value.trim(),
    docente: document.getElementById("docente_alta_curso").value,
    aula: document.getElementById("aula_alta_curso").value.trim(),
    fecha_inicio: document.getElementById("fecha_inicio_alta_curso").value.trim(),
    fecha_fin: document.getElementById("fecha_finalizacion_alta_curso").value.trim(),
    horario: document.getElementById("horario_alta_curso").value.trim(),
    max_plazas: document.getElementById("max_plazas_alta_curso").value.trim(),
    foto: document.getElementById("foto_alta_curso").value.trim(),
    estado: document.getElementById("estado_alta_curso").value.trim()
  };

  cursos.push(curso);
  guardarDatos(DATOS_CURSOS, cursos);

  updateSelect();
  alert("Curso registrado correctamente.");
}

function modAula(event){
  event.preventDefault();

  const idMod = document.getElementById("id_mod_aula").value;

  const aulas = leerDatos(DATOS_AULAS);
  const aulaAnterior = aulas.find(aula => String(aula.id) === idMod);

   const aulaModificada = {
    id: aulaAnterior.id,
    nombre: document.getElementById("nombre_mod_aula").value.trim(),
    edificio: document.getElementById("edificio_mod_aula").value.trim(),
    planta: document.getElementById("planta_mod_aula").value.trim(),
    capacidad: document.getElementById("capacidad_mod_aula").value.trim(),
    equipamiento: document.getElementById("equipamiento_mod_aula").value.trim(),
    estado: document.getElementById("estado_mod_aula").value
  };

  const aulasActualizadas = aulas.map(aula =>
    String(aula.id) === idMod ? aulaModificada : aula
  );

  guardarDatos(DATOS_AULAS, aulasActualizadas);
  updateSelect();

  alert("Aula modificada correctamente.");

}

function rellenarAula() {
  const idMod = document.getElementById("id_mod_aula").value;
  const aulas = leerDatos(DATOS_AULAS);
  const aula = aulas.find(a => String(a.id) === idMod);

  if (!aula) {
    return;
  }

  document.getElementById("nombre_mod_aula").value = aula.nombre;
  document.getElementById("edificio_mod_aula").value = aula.edificio;
  document.getElementById("planta_mod_aula").value = aula.planta;
  document.getElementById("capacidad_mod_aula").value = aula.capacidad;
  document.getElementById("equipamiento_mod_aula").value = aula.equipamiento;
  document.getElementById("estado_mod_aula").value = aula.estado;
}

function modCurso(event){
  event.preventDefault();

  const idMod = document.getElementById("id_mod_curso").value;
  const cursos = leerDatos(DATOS_CURSOS);
  const cursoAnterior = cursos.find(curso => String(curso.id) === idMod);
  const cursoModificado = {
    id: cursoAnterior.id,
    nombre: document.getElementById("nombre_mod_curso").value.trim(),
    descripcion: document.getElementById("descripcion_mod_curso").value.trim(),
    docente: document.getElementById("docente_mod_curso").value,
    aula: document.getElementById("aula_mod_curso").value.trim(),
    fecha_inicio: document.getElementById("fecha_inicio_mod_curso").value.trim(),
    fecha_fin: document.getElementById("fecha_finalizacion_mod_curso").value.trim(),
    horario: document.getElementById("horario_mod_curso").value.trim(),
    max_plazas: document.getElementById("max_plazas_mod_curso").value.trim(),
    foto: document.getElementById("foto_mod_curso").value.trim(),
    estado: document.getElementById("estado_mod_curso").value
  };

  const cursosActualizados = cursos.map(curso =>
    String(curso.id) === idMod ? cursoModificado : curso
  );
  guardarDatos(DATOS_CURSOS, cursosActualizados);
  updateSelect();

  alert("Curso modificado correctamente.");
}

function rellenarCurso() {
  const idMod = document.getElementById("id_mod_curso").value;
  const cursos = leerDatos(DATOS_CURSOS);
  const curso = cursos.find(c => String(c.id) === idMod);

  if (!curso) {
    return;
  }

  document.getElementById("nombre_mod_curso").value = curso.nombre;
  document.getElementById("descripcion_mod_curso").value = curso.descripcion;
  document.getElementById("docente_mod_curso").value = curso.docente;
  document.getElementById("aula_mod_curso").value = curso.aula;
  document.getElementById("fecha_inicio_mod_curso").value = curso.fecha_inicio;
  document.getElementById("fecha_finalizacion_mod_curso").value = curso.fecha_fin;
  document.getElementById("horario_mod_curso").value = curso.horario;
  document.getElementById("max_plazas_mod_curso").value = curso.max_plazas;
  document.getElementById("estado_mod_curso").value = curso.estado;
}

function delAula(event){
  event.preventDefault();
  
  const idDel = document.getElementById("id_del_aula").value;
  const aulas = leerDatos(DATOS_AULAS);
  const encontrado = aulas.find(aula => String(aula.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un aula.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar esta aula?")) {
    return;
  }

  const aulasActualizadas = aulas.filter(aula => String(aula.id) !== idDel);
  guardarDatos(DATOS_AULAS, aulasActualizadas);
  updateSelect();

  alert("Aula eliminada correctamente.");

}

function delCurso(event){
  event.preventDefault();

  const idDel = document.getElementById("id_del_curso").value;
  const cursos = leerDatos(DATOS_CURSOS);
  const encontrado = cursos.find(curso => String(curso.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un curso.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este curso?")) {
    return;
  }

  const cursosActualizados = cursos.filter(curso => String(curso.id) !== idDel);
  guardarDatos(DATOS_CURSOS, cursosActualizados);
  updateSelect();

  alert("Curso eliminado correctamente.");
}

function infoAula(event){
  event.preventDefault();

  const idInfo = document.getElementById("id_info_aula").value;

  const aulas = leerDatos(DATOS_AULAS);
  const aula = aulas.find(a => String(a.id) === idInfo);

  if (!aula) {
    alert("Selecciona primero un aula.");
    return;
  }

  const listado = document.getElementById("listado_aula");
  listado.innerHTML = `
    <li>Nombre: ${aula.nombre}</li>
    <li>Edificio: ${aula.edificio}</li>
    <li>Planta: ${aula.planta}</li>
    <li>Capacidad: ${aula.capacidad}</li>
    <li>Equipamiento: ${aula.equipamiento}</li>
    <li>Estado: ${aula.estado}</li>
  `;
}

function infoCurso(event){
  event.preventDefault();

  const idInfo = document.getElementById("id_info_curso").value;

  const cursos = leerDatos(DATOS_CURSOS);
  const curso = cursos.find(c => String(c.id) === idInfo);

  if (!curso) {
    alert("Selecciona primero un curso.");
    return;
  }

  const listado = document.getElementById("listado_curso");
  listado.innerHTML = `
    <li>Nombre: ${curso.nombre}</li>
    <li>Descripción: ${curso.descripcion}</li>
    <li>Docente: ${curso.docente}</li>
    <li>Aula: ${curso.aula}</li>
    <li>Fecha de inicio: ${curso.fecha_inicio}</li>
    <li>Fecha de fin: ${curso.fecha_fin}</li>
    <li>Horario: ${curso.horario}</li>
    <li>Máximo de plazas: ${curso.max_plazas}</li>
    <li>Foto: ${curso.foto}</li>
    <li>Estado: ${curso.estado}</li>
  `;
}

function altaDoc(event) {
  event.preventDefault();

  const docentes = leerDatos(DATOS_DOCENTES);
  const docente = {
    id: docentes.length + 1,
    Nombre: document.getElementById("nombre_alta_doc").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_alta_doc").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_alta_doc").value.trim(),
    Correo: document.getElementById("correo_alta_doc").value.trim(),
    Especialidad: document.getElementById("especialidad_alta_doc").value.trim(),
    Telefono: document.getElementById("telefono_alta_doc").value.trim(),
    Fotografia: document.getElementById("foto_alta_doc").value.trim(),
    estado: document.getElementById("estado_alta_doc").value
  };

  docentes.push(docente);
  guardarDatos(DATOS_DOCENTES, docentes);
  updateSelect();
  alert("Docente registrado correctamente.");
}

function modDoc(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const docenteAnterior = docentes.find(docente => String(docente.id) === idMod);
  const docenteModificado = {
    id: docenteAnterior.id,
    Nombre: document.getElementById("nombre_mod_doc").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_mod_doc").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_mod_doc").value.trim(),
    Correo: document.getElementById("correo_mod_doc").value.trim(),
    Especialidad: document.getElementById("especialidad_mod_doc").value.trim(),
    Telefono: document.getElementById("telefono_mod_doc").value.trim(),
    Fotografia: document.getElementById("foto_mod_doc").value.trim(),
    estado: document.getElementById("estado_mod_doc").value
  };

  const docentesActualizados = docentes.map(docente =>
    String(docente.id) === idMod ? docenteModificado : docente
  );
  guardarDatos(DATOS_DOCENTES, docentesActualizados);
  updateSelect();
  alert("Docente modificado correctamente.");
}

function rellenarDoc() {
  const idMod = document.getElementById("id_mod_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const docente = docentes.find(d => String(d.id) === idMod);

  if (!docente) {
    return;
  }

  document.getElementById("nombre_mod_doc").value = docente.Nombre;
  document.getElementById("primer_apellido_mod_doc").value = docente.Primer_apellido;
  document.getElementById("segundo_apellido_mod_doc").value = docente.Segundo_apellido;
  document.getElementById("correo_mod_doc").value = docente.Correo;
  document.getElementById("especialidad_mod_doc").value = docente.Especialidad;
  document.getElementById("telefono_mod_doc").value = docente.Telefono;
  document.getElementById("estado_mod_doc").value = docente.estado;
}

function delDoc(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const encontrado = docentes.find(docente => String(docente.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un docente.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este docente?")) {
    return;
  }

  guardarDatos(DATOS_DOCENTES, docentes.filter(docente => String(docente.id) !== idDel));
  updateSelect();
  alert("Docente eliminado correctamente.");
}

function infoDoc(event) {
  event.preventDefault();

  const idInfo = document.getElementById("id_info_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const docente = docentes.find(d => String(d.id) === idInfo);

  if (!docente) {
    alert("Selecciona primero un docente.");
    return;
  }

  document.getElementById("listado_doc").innerHTML = `
    <li>Nombre: ${docente.Nombre}</li>
    <li>Primer apellido: ${docente.Primer_apellido}</li>
    <li>Segundo apellido: ${docente.Segundo_apellido}</li>
    <li>Correo: ${docente.Correo}</li>
    <li>Especialidad: ${docente.Especialidad}</li>
    <li>Teléfono: ${docente.Telefono}</li>
    <li>Fotografía: ${docente.Fotografia}</li>
    <li>Estado: ${docente.estado}</li>
  `;
}

function altaMat(event) {
  event.preventDefault();

  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = {
    id: matriculas.length + 1,
    alumno: document.getElementById("alumno_alta_mat").value,
    curso: document.getElementById("curso_alta_mat").value.trim(),
    fecha_matricula: document.getElementById("fecha_matricula_alta_mat").value,
    estado: document.getElementById("estado_alta_mat").value
  };

  matriculas.push(matricula);
  guardarDatos(DATOS_MATRICULAS, matriculas);
  updateSelect();
  alert("Matrícula registrada correctamente.");
}

function modMat(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_mat").value;
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = {
    id: idMod,
    alumno: document.getElementById("alumno_mod_mat").value,
    curso: document.getElementById("curso_mod_mat").value.trim(),
    fecha_matricula: document.getElementById("fecha_matricula_mod_mat").value,
    estado: document.getElementById("estado_mod_mat").value
  };

  const matriculasActualizadas = matriculas.map(m =>
    String(m.id) === idMod ? matricula : m
  );
  guardarDatos(DATOS_MATRICULAS, matriculasActualizadas);
  updateSelect();
  alert("Matrícula modificada correctamente.");
}

function rellenarMat() {
  const idMod = document.getElementById("id_mod_mat").value;
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = matriculas.find(m => String(m.id) === idMod);

  if (!matricula) {
    return;
  }

  document.getElementById("alumno_mod_mat").value = matricula.alumno;
  document.getElementById("curso_mod_mat").value = matricula.curso;
  document.getElementById("fecha_matricula_mod_mat").value = matricula.fecha_matricula;
  document.getElementById("estado_mod_mat").value = matricula.estado;
}

function delMat(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_mat").value;
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const encontrada = matriculas.find(m => String(m.id) === idDel);

  if (!encontrada) {
    alert("Selecciona primero una matrícula.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar esta matrícula?")) {
    return;
  }

  guardarDatos(DATOS_MATRICULAS, matriculas.filter(m => String(m.id) !== idDel));
  updateSelect();
  alert("Matrícula eliminada correctamente.");
}

function infoMat(event) {
  event.preventDefault();

  const alumno = document.getElementById("alumno_info_mat").value;
  const curso = document.getElementById("curso_info_mat").value.trim();
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = matriculas.find(m =>
    String(m.alumno) === alumno && String(m.curso) === curso
  );

  if (!matricula) {
    alert("No se encontró una matrícula para ese alumno y curso.");
    return;
  }

  document.getElementById("listado_mat").innerHTML = `
    <li>Identificador: ${matricula.id}</li>
    <li>Alumno: ${matricula.alumno}</li>
    <li>Curso: ${matricula.curso}</li>
    <li>Fecha de matrícula: ${matricula.fecha_matricula}</li>
    <li>Estado: ${matricula.estado}</li>
  `;
}

function altaUser(event) {
  event.preventDefault();

  const usuarios = leerDatos(DATOS_USER);
  const contraseña = document.getElementById("contraseña_alta_user").value.trim();
  const usuario = {
    id: usuarios.length + 1,
    Nombre: document.getElementById("nombre_alta_user").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_alta_user").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_alta_user").value.trim(),
    Correo: document.getElementById("correo_alta_user").value.trim(),
    Contraseña: contraseña,
    Confirmar_contraseña: contraseña,
    rol: document.getElementById("rol_alta_user").value,
    estado: document.getElementById("estado_alta_user").value
  };

  usuarios.push(usuario);
  guardarDatos(DATOS_USER, usuarios);
  updateSelect();
  alert("Usuario registrado correctamente.");
}

function modUser(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const usuarioModificado = {
    id: idMod,
    Nombre: document.getElementById("nombre_mod_user").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_mod_user").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_mod_user").value.trim(),
    Correo: document.getElementById("correo_mod_user").value.trim(),
    Contraseña: document.getElementById("contraseña_mod_user").value.trim(),
    Confirmar_contraseña: document.getElementById("contraseña_mod_user").value.trim(),
    rol: document.getElementById("rol_mod_user").value,
    estado: document.getElementById("estado_mod_user").value
  };

  const usuariosActualizados = usuarios.map(usuario =>
    String(usuario.id) === idMod ? usuarioModificado : usuario
  );
  guardarDatos(DATOS_USER, usuariosActualizados);
  updateSelect();
  alert("Usuario modificado correctamente.");
}

function rellenarUser() {
  const idMod = document.getElementById("id_mod_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const usuario = usuarios.find(u => String(u.id) === idMod);

  if (!usuario) {
    return;
  }

  document.getElementById("nombre_mod_user").value = usuario.Nombre;
  document.getElementById("primer_apellido_mod_user").value = usuario.Primer_apellido;
  document.getElementById("segundo_apellido_mod_user").value = usuario.Segundo_apellido;
  document.getElementById("correo_mod_user").value = usuario.Correo;
  document.getElementById("contraseña_mod_user").value = usuario.Contraseña;
  document.getElementById("rol_mod_user").value = usuario.rol;
  document.getElementById("estado_mod_user").value = usuario.estado;
}

function delUser(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const encontrado = usuarios.find(usuario => String(usuario.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un usuario.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este usuario?")) {
    return;
  }

  guardarDatos(DATOS_USER, usuarios.filter(usuario => String(usuario.id) !== idDel));
  updateSelect();
  alert("Usuario eliminado correctamente.");
}

function infoUser(event) {
  event.preventDefault();

  const idInfo = document.getElementById("id_info_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const usuario = usuarios.find(u => String(u.id) === idInfo);

  if (!usuario) {
    alert("Selecciona primero un usuario.");
    return;
  }

  document.getElementById("listado_user").innerHTML = `
    <li>Nombre: ${usuario.Nombre}</li>
    <li>Primer apellido: ${usuario.Primer_apellido}</li>
    <li>Segundo apellido: ${usuario.Segundo_apellido}</li>
    <li>Correo: ${usuario.Correo}</li>
    <li>Rol: ${usuario.rol}</li>
    <li>Estado: ${usuario.estado}</li>
  `;
}