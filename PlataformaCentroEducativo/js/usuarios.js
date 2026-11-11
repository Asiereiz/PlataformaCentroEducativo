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

function altaUser(event) {
  event.preventDefault();

  const usuarios = leerDatos(DATOS_USER);
  const contraseña = document.getElementById("contraseña_alta_user").value.trim();
  const usuario = {
    id: usuarios.length + 1,
    Nombre: document.getElementById("nombre_alta_user").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_alta_user").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_alta_user").value.trim(),
    Correo: document.getElementById("correo_alta_user").value.trim(),
    Contraseña: contraseña,
    Confirmar_contraseña: contraseña,
    rol: document.getElementById("rol_alta_user").value,
    estado: document.getElementById("estado_alta_user").value
  };

  const existente = usuarios.find(u => u.Correo === usuario.Correo);
  if (existente) {
    alert("Ya existe un usuario con ese correo.");
    return;
  }

  usuarios.push(usuario);
  guardarDatos(DATOS_USER, usuarios);
  updateSelect();
  alert("Usuario registrado correctamente.");
}

function modUser(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const usuarioModificado = {
    id: idMod,
    Nombre: document.getElementById("nombre_mod_user").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_mod_user").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_mod_user").value.trim(),
    Correo: document.getElementById("correo_mod_user").value.trim(),
    Contraseña: document.getElementById("contraseña_mod_user").value.trim(),
    Confirmar_contraseña: document.getElementById("contraseña_mod_user").value.trim(),
    rol: document.getElementById("rol_mod_user").value,
    estado: document.getElementById("estado_mod_user").value
  };

  const usuariosActualizados = usuarios.map(usuario =>
    String(usuario.id) === idMod ? usuarioModificado : usuario
  );
  guardarDatos(DATOS_USER, usuariosActualizados);
  updateSelect();
  alert("Usuario modificado correctamente.");
}

function rellenarUser() {
  const idMod = document.getElementById("id_mod_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const usuario = usuarios.find(u => String(u.id) === idMod);

  if (!usuario) {
    return;
  }

  document.getElementById("nombre_mod_user").value = usuario.Nombre;
  document.getElementById("primer_apellido_mod_user").value = usuario.Primer_apellido;
  document.getElementById("segundo_apellido_mod_user").value = usuario.Segundo_apellido;
  document.getElementById("correo_mod_user").value = usuario.Correo;
  document.getElementById("contraseña_mod_user").value = usuario.Contraseña;
  document.getElementById("rol_mod_user").value = usuario.rol;
  document.getElementById("estado_mod_user").value = usuario.estado;
}

function delUser(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const encontrado = usuarios.find(usuario => String(usuario.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un usuario.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este usuario?")) {
    return;
  }

  guardarDatos(DATOS_USER, usuarios.filter(usuario => String(usuario.id) !== idDel));
  updateSelect();
  alert("Usuario eliminado correctamente.");
}

function infoUser(event) {
  event.preventDefault();

  const idInfo = document.getElementById("id_info_user").value;
  const usuarios = leerDatos(DATOS_USER);
  const usuario = usuarios.find(u => String(u.id) === idInfo);

  if (!usuario) {
    alert("Selecciona primero un usuario.");
    return;
  }

  document.getElementById("listado_user").innerHTML = `
    <li>Nombre: ${usuario.Nombre}</li>
    <li>Primer apellido: ${usuario.Primer_apellido}</li>
    <li>Segundo apellido: ${usuario.Segundo_apellido}</li>
    <li>Correo: ${usuario.Correo}</li>
    <li>Rol: ${usuario.rol}</li>
    <li>Estado: ${usuario.estado}</li>
  `;
}