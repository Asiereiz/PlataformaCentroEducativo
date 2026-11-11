document.addEventListener("DOMContentLoaded", () => {

    mostrarPerfil();

    const formulario = document.getElementById("editProfile");
    if (formulario) {
      formulario.addEventListener("submit", editarPerfil);
    }

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

function editarPerfil(event) {
  event.preventDefault();

  const correoActual = sessionStorage.getItem("correoActual");
  const nombreActual = sessionStorage.getItem("usuarioActual");
  const usuarios = leerDatos(DATOS_USER);
  const usuarioActual = usuarios.find(usuario =>
    correoActual
      ? usuario.Correo === correoActual
      : usuario.Nombre === nombreActual
  );

  if (!usuarioActual) {
    alert("No se encontró el usuario actual. Cierra sesión y vuelve a iniciar sesión.");
    return;
  }

  const formulario = document.getElementById("editProfile");
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  const nuevoCorreo = document.getElementById("correo_editar").value.trim();
  const nuevaContraseña = document.getElementById("contraseña_editar").value.trim();
  const confirmarContraseña = document.getElementById("confirmarContraseña_editar").value.trim();

  if (nuevaContraseña !== confirmarContraseña) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const correoEnUso = usuarios.some(usuario =>
    usuario !== usuarioActual && usuario.Correo === nuevoCorreo
  );
  if (correoEnUso) {
    alert("Ya existe un usuario con ese correo.");
    return;
  }

  const usuarioActualizado = {
    ...usuarioActual,
    Nombre: document.getElementById("nombre_editar").value.trim(),
    Primer_apellido: document.getElementById("primerApellido_editar").value.trim(),
    Segundo_apellido: document.getElementById("segundoApellido_editar").value.trim(),
    Correo: nuevoCorreo,
    Contraseña: nuevaContraseña,
    Confirmar_contraseña: confirmarContraseña,
    Telefono: document.getElementById("telefono_editar").value.trim()
  };

  const usuariosActualizados = usuarios.map(usuario =>
    usuario === usuarioActual ? usuarioActualizado : usuario
  );

  guardarDatos(DATOS_USER, usuariosActualizados);
  sessionStorage.setItem("usuarioActual", usuarioActualizado.Nombre);
  sessionStorage.setItem("correoActual", nuevoCorreo);
  mostrarPerfil();
  alert("Perfil actualizado correctamente.");
}