document.addEventListener("DOMContentLoaded", () => {

  mostrarSesion();

const registro = document.getElementById("formregistro");
if(registro){
  registro.addEventListener("submit", registrarUsuario)
}

const login = document.getElementById("formlogin");
if(login){
  login.addEventListener("submit", iniciarSesion)
}

});

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

function updateSelect(){
    
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

    const tipoUsuario = sessionStorage.getItem("tipoUsuario");

    if (tipoUsuario === "admin") {
        window.location.href = "admin.html";
    } else if (tipoUsuario === "alumno") {
        window.location.href = "alumno.html";
    } else {
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
            window.location.href = "admin.html";
        } else {
            sessionStorage.setItem("tipoUsuario", "alumno");
            window.location.href = "adlumno.html";
        }
    } else {
        alert("Correo o contraseña incorrectos.");
    }

}

function mostrarSesion() {
  const tipoUsuario = sessionStorage.getItem("tipoUsuario");

  const sesionAdmin = document.getElementById("sesionAdmin");
  const sesionAlumno = document.getElementById("sesionAlumno");

  if (sesionAdmin) {
    sesionAdmin.hidden = (tipoUsuario !== "admin");
  }
  if (sesionAlumno) {
    sesionAlumno.hidden = (tipoUsuario !== "alumno");
  }
}