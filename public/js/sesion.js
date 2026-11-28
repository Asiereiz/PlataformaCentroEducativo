document.addEventListener("DOMContentLoaded", () => {
    
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
        sessionStorage.removeItem("idUsuario");
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

async function enviarJson(url, cuerpo) {
  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  });
  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(resultado.error || `La petición terminó con HTTP ${respuesta.status}.`);
  }
  return resultado;
}

async function registrarUsuario(event) {
  event.preventDefault();

  const contraseña = document.getElementById("Contraseña").value;
  const confirmar = document.getElementById("Confirmar_contraseña").value;
  if (contraseña !== confirmar) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const nombre = [
    document.getElementById("Nombre").value,
    document.getElementById("Primer_apellido").value,
    document.getElementById("Segundo_apellido").value
  ].map(texto => texto.trim()).filter(texto => texto).join(" ");

  try {
    await enviarJson("/api/usuarios", {
      nombre,
      email: document.getElementById("Correo").value.trim(),
      password: contraseña
    });
    alert("Usuario registrado correctamente. Ya puedes iniciar sesión.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("No se pudo registrar el usuario.", error);
    alert(`No se pudo registrar el usuario: ${error.message}`);
  }
}

async function iniciarSesion(event) {
    event.preventDefault();

    const correo = document.getElementById("Correo").value.trim();
    const contraseña = document.getElementById("Contraseña").value;

    let usuario;
    try {
      usuario = await enviarJson("/api/usuarios/login", { email: correo, password: contraseña });
    } catch (error) {
      alert(error.message);
      return;
    }

    sessionStorage.setItem("usuarioActual", usuario.nombre);
    sessionStorage.setItem("correoActual", usuario.email);
    sessionStorage.setItem("idUsuario", usuario.id_usuario);
    sessionStorage.setItem("tipoUsuario", usuario.rol === "admin" ? "admin" : "alumno");
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
  sessionStorage.removeItem("idUsuario");
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