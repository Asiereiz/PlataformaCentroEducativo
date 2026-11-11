document.addEventListener("DOMContentLoaded", () => {
    
    inicializarUsuarios();
    mostrarSesion();
    saludo();

    const registro = document.getElementById("formregistro");
    if(registro){
        registro.addEventListener("submit", registrarUsuario)
    }

    const login = document.getElementById("formlogin");
    if(login){
        login.addEventListener("submit", iniciarSesion)
    }

    const btnCerrarSesion = document.getElementById("cerrarSesion");
    if(btnCerrarSesion){
        btnCerrarSesion.addEventListener("click", cerrarSesion)
    }

    document.querySelectorAll(".logout").forEach(enlace => {
        enlace.addEventListener("click", () => {
        sessionStorage.removeItem("tipoUsuario");
        sessionStorage.removeItem("loggeado");
        sessionStorage.removeItem("usuarioActual");
        sessionStorage.removeItem("correoActual");
        });
    });

    const btnInicio = document.getElementById("botonInicio");
    if(btnInicio){
        btnInicio.addEventListener("click", irAlInicio);
    }

    const btntitInicio = document.getElementById("tituloInicio");
    if(btntitInicio){
        btntitInicio.addEventListener("click", irAlInicio);
    }
    
});

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

function inicializarUsuarios() {

    let user = leerDatos(DATOS_USER);
    
    if (user.length === 0) {
        user = [{
          id: 1, 
          Nombre: "Admin", 
          Primer_apellido: "Admin", 
          Segundo_apellido: "Admin", 
          Correo: "admin@centroeducativo.com", 
          Contraseña: "admin", 
          rol: "admin", 
          estado: "activo" }
        ];
        guardarDatos(DATOS_USER, user);
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

    if (!usuario) {
      alert("Correo o contraseña incorrectos.");
      return;
    }

    if(usuario.estado === "inactivo") {
      alert("Tu cuenta está inactiva. Por favor, contacta con el administrador.");
      return;
    }

    sessionStorage.setItem("usuarioActual", usuario.Nombre);
    sessionStorage.setItem("correoActual", usuario.Correo);

    if (usuario.Correo === "admin@centroeducativo.com" || usuario.rol === "admin") {
      sessionStorage.setItem("tipoUsuario", "admin");
    } else {
      sessionStorage.setItem("tipoUsuario", "alumno");
    }
    sessionStorage.setItem("loggeado", "true");
    window.location.href = "portal.html";

}

function mostrarSesion() {
  const tipoUsuario = sessionStorage.getItem("tipoUsuario");
  const sesionAdmin = document.querySelectorAll(".sesionAdmin");
  const sesionAlumno = document.querySelectorAll(".sesionAlumno");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const panelAdmin = document.getElementById("panel-administracion");

  document.querySelectorAll(".estado-sesion").forEach(el => {
    const visible = (tipoUsuario === "admin" && el.classList.contains("sesionAdmin")) ||
      (tipoUsuario === "alumno" && el.classList.contains("sesionAlumno"));
    el.classList.toggle("estado-sesion-visible", visible);
  });

  if (panelAdmin) {
    panelAdmin.classList.toggle("panel-administracion-oculto", tipoUsuario !== "admin");
  }

  if (tipoUsuario === "admin") {
    header.classList.add("header-admin");
    if (footer) footer.classList.add("footer-admin");
    sesionAdmin.forEach(el => el.hidden = false);
    sesionAlumno.forEach(el => el.hidden = true);
  } else if (tipoUsuario === "alumno") {
    header.classList.remove("header-admin");
    if (footer) footer.classList.remove("footer-admin");
    sesionAdmin.forEach(el => el.hidden = true);
    sesionAlumno.forEach(el => el.hidden = false);
  } else {
    header.classList.remove("header-admin");
    if (footer) footer.classList.remove("footer-admin");
    sesionAdmin.forEach(el => el.hidden = true);
    sesionAlumno.forEach(el => el.hidden = true);
  }
}

function cerrarSesion(){
  sessionStorage.removeItem("tipoUsuario");
  sessionStorage.removeItem("loggeado");
  sessionStorage.removeItem("usuarioActual");
  sessionStorage.removeItem("correoActual");
  window.location.href = "index.html";
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

function saludo(){
  const saludo = document.getElementById("saludo");
  const usuarioActual = sessionStorage.getItem("usuarioActual");

  if(saludo && usuarioActual){
    saludo.innerHTML = usuarioActual;
  }
}