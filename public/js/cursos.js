// Página de cursos: el navegador pide los datos a la API REST con Fetch,
// recibe JSON y lo muestra en la página (tema 5.3, apartado 3).
//
//   fetch("/api/cursos")  ->  servidor Express  ->  MariaDB  ->  JSON  ->  esta página

document.addEventListener("DOMContentLoaded", () => {
  mostrarCatalogo();

  document.getElementById("busqueda_curso").addEventListener("input", buscarCursos);
  document.getElementById("detalles_curso").addEventListener("input", mostrarDetallesCurso);
});

// Los cursos se piden una sola vez a la API y se reutilizan en todas las secciones
let cursosPedidos = null;

function obtenerCursos() {
  if (!cursosPedidos) {
    cursosPedidos = cargarCursos().catch(error => {
      cursosPedidos = null; // si falla, se podrá volver a intentar
      throw error;
    });
  }
  return cursosPedidos;
}

// GET /api/cursos
async function cargarCursos() {
  const respuesta = await fetch("/api/cursos", { headers: { Accept: "application/json" } });
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}`);
  }
  return await respuesta.json();
}

// Construye la tarjeta de un curso. Con "completa" añade todos los detalles.
function crearTarjeta(curso, completa) {
  const tarjeta = document.createElement("article");

  if (curso.foto) {
    const imagen = document.createElement("img");
    imagen.src = curso.foto;
    imagen.alt = `Imagen del curso ${curso.nombre}`;
    imagen.loading = "lazy";
    imagen.className = "imagen-tarjeta";
    tarjeta.appendChild(imagen);
  }

  const nombre = document.createElement("h4");
  nombre.textContent = curso.nombre;
  tarjeta.appendChild(nombre);

  const detalles = completa
    ? [
        `Descripción: ${curso.descripcion}`,
        `Docente: ${curso.docente_nombre}`,
        `Fecha de inicio: ${curso.fecha_inicio}`,
        `Fecha de finalización: ${curso.fecha_fin}`,
        `Horario: ${curso.horario}`,
        `Plazas máximas: ${curso.max_plazas}`
      ]
    : [`Descripción: ${curso.descripcion}`];

  detalles.forEach(detalle => {
    const parrafo = document.createElement("p");
    parrafo.textContent = detalle;
    tarjeta.appendChild(parrafo);
  });

  return tarjeta;
}

async function mostrarCatalogo() {
  const listado = document.getElementById("lista_cursos");
  const json = document.getElementById("json_cursos_texto");
  const historial = document.getElementById("historial_cursos");

  listado.textContent = "Cargando cursos...";

  let cursos;
  try {
    cursos = await obtenerCursos();
  } catch (error) {
    listado.textContent = `No se pudieron cargar los cursos: ${error.message}`;
    historial.textContent = "No se pudo cargar el historial de cursos.";
    return;
  }

  // El JSON tal cual lo ha devuelto la API
  json.textContent = JSON.stringify(cursos, null, 2);

  listado.textContent = "";
  const activos = cursos.filter(curso => curso.estado === "activo");
  if (activos.length === 0) {
    listado.textContent = "No hay cursos disponibles.";
  }
  activos.forEach(curso => listado.appendChild(crearTarjeta(curso, true)));

  // Historial: todos los cursos, también los inactivos
  historial.textContent = "";
  if (cursos.length === 0) {
    historial.textContent = "No hay cursos en el historial.";
  }
  cursos.forEach(curso => historial.appendChild(crearTarjeta(curso, true)));
}

async function buscarCursos() {
  const texto = document.getElementById("busqueda_curso").value.trim().toLowerCase();
  const listado = document.getElementById("resultados_busqueda");

  listado.textContent = "";
  if (texto === "") {
    return;
  }

  let cursos;
  try {
    cursos = await obtenerCursos();
  } catch (error) {
    listado.textContent = "No se pudieron cargar los cursos.";
    return;
  }

  const encontrados = cursos.filter(curso => curso.estado === "activo" && curso.nombre.toLowerCase().includes(texto));
  if (encontrados.length === 0) {
    listado.textContent = "No se encontraron cursos.";
    return;
  }
  encontrados.forEach(curso => listado.appendChild(crearTarjeta(curso, false)));
}

async function mostrarDetallesCurso() {
  const texto = document.getElementById("detalles_curso").value.trim().toLowerCase();
  const listado = document.getElementById("detalles_busqueda");

  listado.textContent = "";
  if (texto === "") {
    return;
  }

  let cursos;
  try {
    cursos = await obtenerCursos();
  } catch (error) {
    listado.textContent = "No se pudieron cargar los cursos.";
    return;
  }

  const encontrados = cursos.filter(curso => curso.estado === "activo" && curso.nombre.toLowerCase().includes(texto));
  if (encontrados.length === 0) {
    listado.textContent = "No se ha encontrado el curso.";
    return;
  }
  encontrados.forEach(curso => listado.appendChild(crearTarjeta(curso, true)));
}
