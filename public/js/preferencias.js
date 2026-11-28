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

const CLAVE_PREFERENCIAS_INVITADO = "preferencias_invitado";
const PREFIJO_PREFERENCIAS_USUARIO = "preferencias_usuario_";

function clavePreferencias() {
  const idUsuario = sessionStorage.getItem("idUsuario");
  return idUsuario ? PREFIJO_PREFERENCIAS_USUARIO + idUsuario : CLAVE_PREFERENCIAS_INVITADO;
}

function leerPreferencias() {
  try {
    const guardadas = localStorage.getItem(clavePreferencias());
    return guardadas ? JSON.parse(guardadas) : {};
  } catch (error) {
    return {};
  }
}

function guardarPreferencias(cambios) {
  const preferencias = { ...leerPreferencias(), ...cambios };
  try {
    localStorage.setItem(clavePreferencias(), JSON.stringify(preferencias));
  } catch (error) {
    console.error("No se pudieron guardar las preferencias de accesibilidad.", error);
  }
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
