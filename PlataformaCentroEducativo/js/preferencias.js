document.addEventListener("DOMContentLoaded", () => {
  const selectModoPantalla = document.getElementById("modoPantalla");
  if (selectModoPantalla) {
    selectModoPantalla.addEventListener("change", cambiarColorPantalla);
  }

  const selectTamLetra = document.getElementById("sizeLetra");
  if (selectTamLetra) {
    selectTamLetra.addEventListener("change", cambiarTamañoLetra);
  }
});

window.addEventListener("pageshow", aplicarPreferencias);

function obtenerUsuarioPreferencias(usuarios = leerDatos(DATOS_USER)) {
  const correoActual = sessionStorage.getItem("correoActual");
  const nombreActual = sessionStorage.getItem("usuarioActual");
  if (!correoActual && !nombreActual) {
    return null;
  }

  return usuarios.find(usuario =>
    correoActual
      ? usuario.Correo === correoActual
      : usuario.Nombre === nombreActual
  ) || null;
}

function leerPreferencias() {
  const usuario = obtenerUsuarioPreferencias();
  if (usuario) {
    return usuario.Preferencias || {};
  }

  const preferenciasInvitado = localStorage.getItem("preferencias_invitado");
  return preferenciasInvitado ? JSON.parse(preferenciasInvitado) : {};
}

function guardarPreferencias(cambios) {
  const usuarios = leerDatos(DATOS_USER);
  const usuario = obtenerUsuarioPreferencias(usuarios);
  if (!usuario) {
    const preferencias = { ...leerPreferencias(), ...cambios };
    localStorage.setItem("preferencias_invitado", JSON.stringify(preferencias));
    return;
  }

  const usuarioActualizado = {
    ...usuario,
    Preferencias: { ...usuario.Preferencias, ...cambios }
  };
  const usuariosActualizados = usuarios.map(otroUsuario =>
    otroUsuario === usuario ? usuarioActualizado : otroUsuario
  );
  guardarDatos(DATOS_USER, usuariosActualizados);
}

function cambiarColorPantalla() {
  const modo = document.getElementById("modoPantalla").value;
  guardarPreferencias({ tema: modo });
  aplicarTema(modo);
}

function cambiarTamañoLetra() {
  const modo = document.getElementById("sizeLetra").value;
  guardarPreferencias({ tamfuente: modo });
  aplicarTamañoLetra(modo);
}

function aplicarTema(tema) {
  const pantalla = document.body;
  pantalla.classList.toggle("oscuro", tema === "oscuro");
  pantalla.classList.toggle("contraste", tema === "contraste");
}

function aplicarTamañoLetra(tamaño) {
  const pantalla = document.body;
  pantalla.classList.toggle("large", tamaño === "large");
  pantalla.classList.toggle("small", tamaño === "small");
}

function aplicarPreferencias() {
  const preferencias = leerPreferencias();
  const tema = preferencias.tema || "claro";
  const tamfuente = preferencias.tamfuente || "medium";

  aplicarTema(tema);
  aplicarTamañoLetra(tamfuente);

  const selectModoPantalla = document.getElementById("modoPantalla");
  if (selectModoPantalla) {
    selectModoPantalla.value = tema;
  }

  const selectTamLetra = document.getElementById("sizeLetra");
  if (selectTamLetra) {
    selectTamLetra.value = tamfuente;
  }
}
