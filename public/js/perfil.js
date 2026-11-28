document.addEventListener("DOMContentLoaded", () => {

    mostrarPerfil();

    const formulario = document.getElementById("editProfile");
    if (formulario) {
      formulario.addEventListener("submit", editarPerfil);
    }

});

function obtenerUsuarioActual() {
  const idUsuario = sessionStorage.getItem("idUsuario");
  if (!idUsuario) {
    return Promise.reject(new Error("No se encontró el usuario. Cierra sesión y vuelve a iniciar sesión."));
  }
  return peticionApi(`/api/usuarios/${encodeURIComponent(idUsuario)}`);
}

async function mostrarPerfil() {
  const tarjeta = document.getElementById("miperfil");
  if (!tarjeta) {
    return;
  }

  tarjeta.innerHTML = "";

  let usuario;
  try {
    usuario = await obtenerUsuarioActual();
  } catch (error) {
    console.error("No se pudo cargar el perfil.", error);
    tarjeta.textContent = error.message;
    return;
  }

  const detalles = [
    `Nombre: ${usuario.nombre}`,
    `Correo: ${usuario.email}`,
    `Fecha de registro: ${String(usuario.fecha_registro || "").slice(0, 10) || "No disponible"}`
  ];

  detalles.forEach(detalle => {
    const parrafo = document.createElement("p");
    parrafo.textContent = detalle;
    tarjeta.appendChild(parrafo);
  });
}

async function editarPerfil(event) {
  event.preventDefault();

  const formulario = document.getElementById("editProfile");
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  const nuevaContraseña = document.getElementById("contraseña_editar").value;
  const confirmarContraseña = document.getElementById("confirmarContraseña_editar").value;
  if (nuevaContraseña !== confirmarContraseña) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  try {
    const usuarioActual = await obtenerUsuarioActual();

    const cambios = {
      nombre: obtenerValor("nombre_editar", usuarioActual.nombre),
      email: obtenerValor("correo_editar", usuarioActual.email)
    };
    if (nuevaContraseña) {
      cambios.password = nuevaContraseña;
    }

    await peticionApi(`/api/usuarios/${encodeURIComponent(usuarioActual.id_usuario)}`, "PUT", cambios);

    sessionStorage.setItem("usuarioActual", cambios.nombre);
    sessionStorage.setItem("correoActual", cambios.email.toLowerCase());
    formulario.reset();
    await mostrarPerfil();
    alert("Perfil actualizado correctamente.");
  } catch (error) {
    console.error("No se pudo actualizar el perfil.", error);
    alert(`No se pudo actualizar el perfil: ${error.message}`);
  }
}

const obtenerValor = (id, valorActual) =>
  document.getElementById(id).value.trim() || valorActual;
