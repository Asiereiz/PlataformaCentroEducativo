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

// Las preferencias de un usuario con sesión viven en la base de datos (tabla preferencias).
// Para no pedirlas en cada página, al iniciar sesión se guarda una copia en sessionStorage.
// Quien no ha iniciado sesión no tiene usuario: sus preferencias se quedan en este navegador.
const CLAVE_PREFERENCIAS = "preferencias";
const CLAVE_PREFERENCIAS_INVITADO = "preferencias_invitado";

// La API usa { tema, tamano_letra }; en la página se usa { tema, tamfuente }
function desdeApi(preferencias) {
  return { tema: preferencias.tema, tamfuente: preferencias.tamano_letra };
}

// Pide a la API las preferencias del usuario y las guarda en sessionStorage
async function cargarPreferenciasDeBD(idUsuario) {
  try {
    const preferencias = desdeApi(await peticionApi(`/api/preferencias/${encodeURIComponent(idUsuario)}`));
    sessionStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias));
    return preferencias;
  } catch (error) {
    console.error("No se pudieron cargar las preferencias de accesibilidad.", error);
    return {};
  }
}

function leerPreferencias() {
  try {
    const guardadas = sessionStorage.getItem("idUsuario")
      ? sessionStorage.getItem(CLAVE_PREFERENCIAS)
      : localStorage.getItem(CLAVE_PREFERENCIAS_INVITADO);
    return guardadas ? JSON.parse(guardadas) : {};
  } catch (error) {
    return {};
  }
}

async function guardarPreferencias(cambios) {
  const preferencias = { ...leerPreferencias(), ...cambios };
  const idUsuario = sessionStorage.getItem("idUsuario");

  if (!idUsuario) {
    localStorage.setItem(CLAVE_PREFERENCIAS_INVITADO, JSON.stringify(preferencias));
    return;
  }

  sessionStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias));
  try {
    await peticionApi(`/api/preferencias/${encodeURIComponent(idUsuario)}`, "PUT", {
      tema: preferencias.tema || "claro",
      tamano_letra: preferencias.tamfuente || "medium"
    });
  } catch (error) {
    console.error("No se pudieron guardar las preferencias de accesibilidad.", error);
    alert(`No se pudieron guardar tus preferencias: ${error.message}`);
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

async function aplicarPreferencias() {
  let preferencias = leerPreferencias();

  // Hay sesión pero no hay copia (por ejemplo, otra pestaña): se piden a la base de datos
  const idUsuario = sessionStorage.getItem("idUsuario");
  if (idUsuario && !sessionStorage.getItem(CLAVE_PREFERENCIAS)) {
    preferencias = await cargarPreferenciasDeBD(idUsuario);
  }

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
