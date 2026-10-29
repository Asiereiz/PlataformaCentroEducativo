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

  const btnDelAula = document.getElementById("del_aula");
  if(btnDelAula){
    btnDelAula.addEventListener("submit", delAula);
  }

  const btnInfoAula = document.getElementById("info_aula");
  if(btnInfoAula){
    btnInfoAula.addEventListener("submit", infoAula);
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

  const selectMod = document.getElementById("id_mod_aula");
  const selectDel = document.getElementById("id_del_aula");
  const selectInfo = document.getElementById("id_info_aula");

  if (selectMod) {
    selectMod.innerHTML = '<option value="">Selecciona un ID</option>';
    aulas.forEach(aula => {
      selectMod.innerHTML += `<option value="${aula.id}">${aula.id} - ${aula.nombre}</option>`;
    });
  }

  if (selectDel) {
    selectDel.innerHTML = '<option value="">Selecciona un ID</option>';
    aulas.forEach(aula => {
      selectDel.innerHTML += `<option value="${aula.id}">${aula.id} - ${aula.nombre}</option>`;
    });
  }

  if (selectInfo) {
    selectInfo.innerHTML = '<option value="">Selecciona un ID</option>';
    aulas.forEach(aula => {
      selectInfo.innerHTML += `<option value="${aula.id}">${aula.id} - ${aula.nombre}</option>`;
    });
  }
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

    window.location.href = "portal.html";
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

function modAula(event){
  event.preventDefault();

  const idMod = document.getElementById("id_mod_aula").value;

  const aulas = leerDatos(DATOS_AULAS);

   const aulaModificada = {
    id: idMod,
    nombre: document.getElementById("nombre_mod_aula").value.trim(),
    edificio: document.getElementById("edificio_mod_aula").value.trim(),
    planta: document.getElementById("planta_mod_aula").value.trim(),
    capacidad: document.getElementById("capacidad_mod_aula").value.trim(),
    equipamiento: document.getElementById("equipamiento_mod_aula").value.trim(),
    estado: document.getElementById("estado_mod_aula").value
  };

  const aulasActualizadas = aulas.map(aula => aula.id === idMod ? aulaModificada : aula);

  guardarDatos(DATOS_AULAS, aulasActualizadas);
  updateSelect();

  alert("Aula modificada correctamente.");

}

function delAula(event){
  event.preventDefault();
  
  const idDel = document.getElementById("id_del_aula");
  const aulas = leerDatos(DATOS_AULAS);
  const encontrado = aulas.find(aula => aula.id === idDel);

  if (!encontrado) {
    alert("Selecciona primero un aula.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar esta aula?")) {
    return;
  }

  const aulasActualizadas = aulas.filter(aula => aula.id !== idDel);
  guardarDatos(DATOS_AULAS, aulasActualizadas);
  updateSelect();

  alert("Aula eliminada correctamente.");

}

function infoAula(event){
  event.preventDefault();

  const idInfo = Number(document.getElementById("id_info_aula").value);

  const aulas = leerDatos(DATOS_AULAS);
  const aula = aulas.find(a => a.id === idInfo);

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