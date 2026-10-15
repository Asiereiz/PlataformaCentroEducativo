document.addEventListener("DOMContentLoaded", () => {
  inicializarUsuarios();
  inicializarAulas();
  actualizarSelects();
  registrarAltaAula();
  registrarModificacionAula();
  registrarEliminacionAula();
  registrarConsultaAula();

const registro = document.getElementById("formregistro").addEventListener("submit", (event) => {
  event.preventDefault();
  const user = {
    id: leerDatos(DATOS_USER).length + 1,
    Nombre: document.getElementById("Nombre").value,
    Primer_apellido: document.getElementById("Primer_apellido").value,
    Segundo_apellido: document.getElementById("Segundo_apellido").value,
    Correo: document.getElementById("Correo").value,
    Contraseña: document.getElementById("Contraseña").value,
    Confirmar_contraseña: document.getElementById("Confirmar_contraseña").value
  }

  guardarDatos(DATOS_USER, user);

})

});

const DATOS_USER = "user";
const DATOS_CURSO = "curso";
const DATOS_AULAS = "aulas";


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