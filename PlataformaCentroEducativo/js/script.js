document.addEventListener("DOMContentLoaded", () => {
  inicializarUsuarios();
  inicializarAulas();
  actualizarSelects();
  registrarAltaAula();
  registrarModificacionAula();
  registrarEliminacionAula();
  registrarConsultaAula();
});

const DATOS_USER = "user";
const DATOS_CURSO = "curso";
const DATOS_AULAS = "aulas";


function subirform(array, datos){
  localStorage.setItem(array, JSON.stringify(datos))
}

function updateSelect(){
    
}

function inicializarUsuarios() {

    let user = JSON.parse(localStorage.getItem(DATOS_USER));
    
    if (user === 0) {
        user = [
        { id: 1, Nombre: "Admin", Primer_apellido: "Admin", Segundo_apellido: "Admin", Correo: "admin@centroeducativo.com", Contraseña: "Admin", Confirmar_contraseña: "Admin" }
        ];

        subirform(DATOS_USER, user);
    }
}

const registro = document.getElementById("formregistro").addEventListener("submit", (event) => {
  event.preventDefault();
  const user = {
    id: DATOS_USER.length + 1,
    Nombre: document.getElementById("Nombre").value,
    Primer_apellido: document.getElementById("Primer_apellido").value,
    Segundo_apellido: document.getElementById("Segundo_apellido").value,
    Correo: document.getElementById("Correo").value,
    Contraseña: document.getElementById("Contraseña").value,
    Confirmar_contraseña: document.getElementById("Confirmar_contraseña").value
  }

  subirform(DATOS_USER, user);

})