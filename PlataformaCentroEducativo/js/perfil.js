document.addEventListener("DOMContentLoaded", () => {

    mostrarPerfil();
  
});

function mostrarPerfil() {
  const tarjeta = document.getElementById("miperfil");
  if (!tarjeta) {
    return;
  }

  tarjeta.innerHTML = "";

  const correoActual = sessionStorage.getItem("correoActual");
  const nombreActual = sessionStorage.getItem("usuarioActual");
  const usuarios = leerDatos(DATOS_USER);
  const usuario = correoActual
    ? usuarios.find(u => u.Correo === correoActual)
    : usuarios.find(u => u.Nombre === nombreActual);

  if (usuario == null) {
    tarjeta.textContent = "No se encontró el usuario. Cierra sesión y vuelve a iniciar sesión.";
    return;
  }

  const detalles = [
    `Nombre: ${usuario.Nombre || ""}`,
    `Primer apellido: ${usuario.Primer_apellido || ""}`,
    `Segundo apellido: ${usuario.Segundo_apellido || ""}`,
    `Correo: ${usuario.Correo || ""}`
  ];

  detalles.forEach(detalle => {
    const parrafo = document.createElement("p");
    parrafo.textContent = detalle;
    tarjeta.appendChild(parrafo);
  });
}