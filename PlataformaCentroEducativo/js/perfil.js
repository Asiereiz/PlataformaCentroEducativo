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

  agregarImagen(tarjeta, usuario.Fotografia, `Fotografía de ${usuario.Nombre}`);
  const imagenPerfil = tarjeta.querySelector(".imagen-tarjeta");
  if (imagenPerfil) {
    imagenPerfil.classList.add("imagen-perfil");
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

async function editarPerfil(event) {
  event.preventDefault();

  const correoActual = sessionStorage.getItem("correoActual");
  const nombreActual = sessionStorage.getItem("usuarioActual");
  const usuarios = leerDatos(DATOS_USER);
  const indiceUsuarioActual = usuarios.findIndex(usuario =>
    correoActual
      ? usuario.Correo === correoActual
      : usuario.Nombre === nombreActual
  );
  const usuarioActual = usuarios[indiceUsuarioActual];

  if (indiceUsuarioActual === -1) {
    alert("No se encontró el usuario actual. Cierra sesión y vuelve a iniciar sesión.");
    return;
  }

  const formulario = document.getElementById("editProfile");
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  const nuevoCorreo = obtenerValor("correo_editar", usuarioActual.Correo);
  const nuevaContraseña = document.getElementById("contraseña_editar").value.trim();
  const confirmarContraseña = document.getElementById("confirmarContraseña_editar").value.trim();

  if (nuevaContraseña !== confirmarContraseña) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const normalizarCorreo = correo => String(correo || "").trim().toLowerCase();
  const correoNormalizado = normalizarCorreo(nuevoCorreo);
  const correoEnUso = usuarios.some((usuario, indice) =>
    indice !== indiceUsuarioActual &&
    normalizarCorreo(usuario.Correo) === correoNormalizado
  );
  if (correoEnUso) {
    alert("Ya existe un usuario con ese correo.");
    return;
  }

  let fotografiaNueva;
  try {
    fotografiaNueva = await leerImagen(document.getElementById("fotografia_editar"));
  } catch (error) {
    alert(`No se pudo leer la fotografía: ${error.message}`);
    return;
  }

  const usuarioActualizado = {
    ...usuarioActual,
    Nombre: obtenerValor("nombre_editar", usuarioActual.Nombre),  Primer_apellido: obtenerValor("primerApellido_editar", usuarioActual.Primer_apellido),
    Segundo_apellido: obtenerValor("segundoApellido_editar",usuarioActual.Segundo_apellido ),
    Correo: nuevoCorreo,
    Contraseña: nuevaContraseña || usuarioActual.Contraseña,
    Confirmar_contraseña:
      confirmarContraseña || usuarioActual.Confirmar_contraseña,
    Telefono: obtenerValor(
      "telefono_editar",
      usuarioActual.Telefono || ""
    ),
    Fotografia:
      fotografiaNueva ||
      usuarioActual.Fotografia ||
      FOTOGRAFIA_PREDETERMINADA
  };

  const usuariosActualizados = usuarios.map(usuario =>
    usuario === usuarioActual ? usuarioActualizado : usuario
  );

  if (!guardarDatosConImagen(DATOS_USER, usuariosActualizados)) {
    return;
  }

  sessionStorage.setItem("usuarioActual", usuarioActualizado.Nombre);
  sessionStorage.setItem("correoActual", nuevoCorreo);
  document.getElementById("fotografia_editar").value = "";
  mostrarPerfil();
  alert("Perfil actualizado correctamente.");
}

const obtenerValor = (id, valorActual) =>
  document.getElementById(id).value.trim() || valorActual;