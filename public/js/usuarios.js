document.addEventListener("DOMContentLoaded", () => {

    const btnAltaUser = document.getElementById("alta_user");
    if(btnAltaUser){
        btnAltaUser.addEventListener("submit", altaUser);
    }

    const btnModUser = document.getElementById("mod_user");
    if(btnModUser){
        btnModUser.addEventListener("submit", modUser);
    }

    const selectModUser = document.getElementById("id_mod_user");
    if(selectModUser){
        selectModUser.addEventListener("change", rellenarUser);
    }

    const btnDelUser = document.getElementById("del_user");
    if(btnDelUser){
        btnDelUser.addEventListener("submit", delUser);
    }

    const btnInfoUser = document.getElementById("info_user");
    if(btnInfoUser){
        btnInfoUser.addEventListener("submit", infoUser);
    }

});

function datosUsuarioFormulario(sufijo) {
  const datos = {
    nombre: document.getElementById(`nombre_${sufijo}_user`).value.trim(),
    email: document.getElementById(`correo_${sufijo}_user`).value.trim(),
    activo: document.getElementById(`estado_${sufijo}_user`).value
  };

  const contraseña = document.getElementById(`contraseña_${sufijo}_user`).value;
  if (contraseña) {
    datos.password = contraseña;
  }
  return datos;
}

async function refrescarUsuarios() {
  promesaUsuariosApi = null;
  await obtenerUsuariosApi();
  updateSelect();
}

async function altaUser(event) {
  event.preventDefault();

  try {
    await peticionApi("/api/usuarios", "POST", datosUsuarioFormulario("alta"));
    await refrescarUsuarios();
    alert("Usuario registrado correctamente.");
  } catch (error) {
    console.error("No se pudo registrar el usuario.", error);
    alert(`No se pudo registrar el usuario: ${error.message}`);
  }
}

async function modUser(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_user").value;
  if (!idMod) {
    alert("Selecciona primero un usuario.");
    return;
  }

  try {
    await peticionApi(`/api/usuarios/${encodeURIComponent(idMod)}`, "PUT", datosUsuarioFormulario("mod"));
    await refrescarUsuarios();
    alert("Usuario modificado correctamente.");
  } catch (error) {
    console.error("No se pudo modificar el usuario.", error);
    alert(`No se pudo modificar el usuario: ${error.message}`);
  }
}

async function rellenarUser() {
  const idMod = document.getElementById("id_mod_user").value;
  let usuario;
  try {
    usuario = (await obtenerUsuariosApi()).find(u => String(u.id) === idMod);
  } catch (error) {
    alert(`No se pudieron cargar los usuarios: ${error.message}`);
    return;
  }

  if (!usuario) {
    return;
  }

  document.getElementById("nombre_mod_user").value = usuario.nombre;
  document.getElementById("correo_mod_user").value = usuario.email;
  document.getElementById("contraseña_mod_user").value = "";
  document.getElementById("estado_mod_user").value = String(Number(usuario.activo));
}

async function delUser(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_user").value;
  let encontrado;
  try {
    encontrado = (await obtenerUsuariosApi()).find(usuario => String(usuario.id) === idDel);
  } catch (error) {
    alert(`No se pudieron cargar los usuarios: ${error.message}`);
    return;
  }

  if (!encontrado) {
    alert("Selecciona primero un usuario.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este usuario?")) {
    return;
  }

  try {
    await peticionApi(`/api/usuarios/${encodeURIComponent(idDel)}`, "PATCH", { activo: 0 });
    await refrescarUsuarios();
    alert("Usuario desactivado correctamente.");
  } catch (error) {
    console.error("No se pudo desactivar el usuario.", error);
    alert(`No se pudo desactivar el usuario: ${error.message}`);
  }
}

async function infoUser(event) {
  event.preventDefault();

  const idInfo = document.getElementById("id_info_user").value;
  let usuario;
  try {
    usuario = (await obtenerUsuariosApi()).find(u => String(u.id) === idInfo);
  } catch (error) {
    alert(`No se pudieron cargar los usuarios: ${error.message}`);
    return;
  }

  if (!usuario) {
    alert("Selecciona primero un usuario.");
    return;
  }

  document.getElementById("listado_user").innerHTML = `
    <li>Nombre: ${usuario.nombre}</li>
    <li>Correo: ${usuario.email}</li>
    <li>Rol: ${usuario.rol}</li>
    <li>Fecha de registro: ${String(usuario.fecha_registro).slice(0, 10)}</li>
    <li>Estado: ${Number(usuario.activo) === 1 ? "activo" : "inactivo"}</li>
  `;
}
