document.addEventListener("DOMContentLoaded", () => {

    mostrarCatalogo();
    mostrarHistorial();

    const campoBusqueda = document.getElementById("busqueda_curso");
    if(campoBusqueda){
        campoBusqueda.addEventListener("input", buscarCursos);
    }

    const campoDetalles = document.getElementById("detalles_curso");
    if(campoDetalles){
        campoDetalles.addEventListener("input", mostrarDetallesCurso);
    }

    const btnAltaCurso = document.getElementById("alta_curso");
    if(btnAltaCurso){
        btnAltaCurso.addEventListener("submit", altaCurso);
    }

    const btnModCurso = document.getElementById("mod_curso");
    if(btnModCurso){
        btnModCurso.addEventListener("submit", modCurso);
    }

    const selectModCurso = document.getElementById("id_mod_curso");
    if(selectModCurso){
        selectModCurso.addEventListener("change", rellenarCurso);
    }

    const btnDelCurso = document.getElementById("del_curso");
    if(btnDelCurso){
        btnDelCurso.addEventListener("submit", delCurso);
    }

    const btnInfoCurso = document.getElementById("info_curso");
    if(btnInfoCurso){
        btnInfoCurso.addEventListener("submit", infoCurso);
    }

});

function mostrarErrorCargaCursos(listado, error) {
  console.error("No se pudieron cargar los cursos desde MariaDB.", error);
  listado.textContent = "No se pudieron cargar los cursos. Comprueba la conexión e inténtalo de nuevo.";
}

function datosCursoFormulario(sufijo, inputFoto) {
  // La imagen viaja como archivo (multipart/form-data): la guarda Multer en el servidor
  const datos = new FormData();
  datos.append("nombre", document.getElementById(`nombre_${sufijo}`).value.trim());
  datos.append("descripcion", document.getElementById(`descripcion_${sufijo}`).value.trim());
  datos.append("docente", document.getElementById(`docente_${sufijo}`).value);
  datos.append("aula", document.getElementById(`aula_${sufijo}`).value.trim());
  datos.append("fecha_inicio", document.getElementById(`fecha_inicio_${sufijo}`).value);
  datos.append("fecha_fin", document.getElementById(`fecha_finalizacion_${sufijo}`).value);
  datos.append("horario", document.getElementById(`horario_${sufijo}`).value.trim());
  datos.append("max_plazas", document.getElementById(`max_plazas_${sufijo}`).value);
  datos.append("estado", document.getElementById(`estado_${sufijo}`).value);
  if (inputFoto && inputFoto.files[0]) {
    datos.append("foto", inputFoto.files[0]);
  }
  return datos;
}

async function enviarCurso(url, metodo, cuerpo) {
  const opciones = { method: metodo };
  if (cuerpo instanceof FormData) {
    // Sin Content-Type: el navegador lo añade solo, con el "boundary" del multipart
    opciones.body = cuerpo;
  } else {
    opciones.headers = { "Content-Type": "application/json" };
    opciones.body = JSON.stringify(cuerpo); // por ejemplo, el PATCH de desactivar
  }

  const respuesta = await fetch(url, opciones);
  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(resultado.error || `La petición terminó con HTTP ${respuesta.status}.`);
  }
}

async function refrescarCursos() {
  promesaCursosApi = null;
  await obtenerCursosApi();
  updateSelect();
}

async function altaCurso(event) {
  event.preventDefault();

  try {
    await enviarCurso(
      "/api/cursos",
      "POST",
      datosCursoFormulario("alta_curso", document.getElementById("foto_alta_curso"))
    );
    await refrescarCursos();
    alert("Curso registrado correctamente.");
  } catch (error) {
    console.error("No se pudo registrar el curso.", error);
    alert(`No se pudo registrar el curso: ${error.message}`);
  }
}


async function modCurso(event){
  event.preventDefault();

  const idMod = document.getElementById("id_mod_curso").value;
  if (!idMod) {
    alert("Selecciona primero un curso.");
    return;
  }

  try {
    await enviarCurso(
      `/api/cursos/${encodeURIComponent(idMod)}`,
      "PUT",
      datosCursoFormulario("mod_curso", document.getElementById("foto_mod_curso"))
    );
    await refrescarCursos();
    alert("Curso modificado correctamente.");
  } catch (error) {
    console.error("No se pudo modificar el curso.", error);
    alert(`No se pudo modificar el curso: ${error.message}`);
  }
}

async function rellenarCurso() {
  const idMod = document.getElementById("id_mod_curso").value;
  let curso;
  try {
    curso = (await obtenerCursosApi()).find(c => String(c.id) === idMod);
  } catch (error) {
    alert(`No se pudieron cargar los cursos: ${error.message}`);
    return;
  }

  if (!curso) {
    return;
  }

  document.getElementById("nombre_mod_curso").value = curso.nombre;
  document.getElementById("descripcion_mod_curso").value = curso.descripcion;
  document.getElementById("docente_mod_curso").value = curso.docente;
  document.getElementById("aula_mod_curso").value = curso.aula;
  document.getElementById("fecha_inicio_mod_curso").value = curso.fecha_inicio;
  document.getElementById("fecha_finalizacion_mod_curso").value = curso.fecha_fin;
  document.getElementById("horario_mod_curso").value = curso.horario;
  document.getElementById("max_plazas_mod_curso").value = curso.max_plazas;
  document.getElementById("estado_mod_curso").value = curso.estado;
}



async function delCurso(event){
  event.preventDefault();

  const idDel = document.getElementById("id_del_curso").value;
  let encontrado;
  try {
    encontrado = (await obtenerCursosApi()).find(curso => String(curso.id) === idDel);
  } catch (error) {
    alert(`No se pudieron cargar los cursos: ${error.message}`);
    return;
  }

  if (!encontrado) {
    alert("Selecciona primero un curso.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este curso?")) {
    return;
  }

  try {
    await enviarCurso(`/api/cursos/${encodeURIComponent(idDel)}`, "PATCH", { estado: "inactivo" });
    await refrescarCursos();
    alert("Curso desactivado correctamente.");
  } catch (error) {
    console.error("No se pudo desactivar el curso.", error);
    alert(`No se pudo desactivar el curso: ${error.message}`);
  }
}



async function infoCurso(event){
  event.preventDefault();

  const idInfo = document.getElementById("id_info_curso").value;

  let curso;
  try {
    curso = (await obtenerCursosApi()).find(c => String(c.id) === idInfo);
  } catch (error) {
    alert(`No se pudieron cargar los cursos: ${error.message}`);
    return;
  }

  if (!curso) {
    alert("Selecciona primero un curso.");
    return;
  }

  const listado = document.getElementById("listado_curso");
  listado.innerHTML = `
    <li>Nombre: ${curso.nombre}</li>
    <li>Descripción: ${curso.descripcion}</li>
    <li>Docente: ${curso.docente}</li>
    <li>Aula: ${curso.aula}</li>
    <li>Fecha de inicio: ${curso.fecha_inicio}</li>
    <li>Fecha de fin: ${curso.fecha_fin}</li>
    <li>Horario: ${curso.horario}</li>
    <li>Máximo de plazas: ${curso.max_plazas}</li>
    <li>Imagen: ${curso.foto ? "Disponible" : "No disponible"}</li>
    <li>Estado: ${curso.estado}</li>
  `;
}

async function mostrarCatalogo() {
  const listado = document.getElementById("lista_cursos");
  if (!listado) {
    return;
  }

  listado.textContent = "Cargando cursos...";
  let cursos;
  try {
    cursos = (await obtenerCursosApi()).filter(curso =>
      String(curso.estado).toLowerCase() === "activo"
    );
  } catch (error) {
    mostrarErrorCargaCursos(listado, error);
    return;
  }

  listado.innerHTML = "";

  if (cursos.length === 0) {
    listado.textContent = "No hay cursos disponibles.";
    return;
  }

  cursos.forEach(curso => {
    const tarjeta = document.createElement("article");
    agregarImagen(tarjeta, curso.foto, `Imagen del curso ${curso.nombre}`);
    const nombre = document.createElement("h4");
    nombre.textContent = curso.nombre;
    tarjeta.appendChild(nombre);

    const detalles = [
      `Descripción: ${curso.descripcion}`,
      `Docente: ${curso.docente}`,
      `Fecha de inicio: ${curso.fecha_inicio}`,
      `Fecha de finalización: ${curso.fecha_fin}`,
      `Horario: ${curso.horario}`,
      `Plazas máximas: ${curso.max_plazas}`
    ];

    detalles.forEach(detalle => {
      const parrafo = document.createElement("p");
      parrafo.textContent = detalle;
      tarjeta.appendChild(parrafo);
    });

    listado.appendChild(tarjeta);
  });
}

async function buscarCursos() {
  const texto = document.getElementById("busqueda_curso").value.trim().toLowerCase();
  const listado = document.getElementById("resultados_busqueda");

  listado.innerHTML = "";
  if (texto === "") {
    return;
  }

  let cursos;
  try {
    cursos = (await obtenerCursosApi()).filter(curso =>
      String(curso.estado).toLowerCase() === "activo" &&
      `${curso.nombre || ""}`.toLowerCase().includes(texto)
    );
  } catch (error) {
    mostrarErrorCargaCursos(listado, error);
    return;
  }

  if (cursos.length === 0) {
    listado.textContent = "No se encontraron cursos.";
    return;
  }

  cursos.forEach(curso => {
    const tarjeta = document.createElement("article");
    agregarImagen(tarjeta, curso.foto, `Imagen del curso ${curso.nombre}`);
    const nombre = document.createElement("h4");
    nombre.textContent = curso.nombre;
    tarjeta.appendChild(nombre);

    const descripcion = document.createElement("p");
    descripcion.textContent = `Descripción: ${curso.descripcion || ""}`;
    tarjeta.appendChild(descripcion);

    listado.appendChild(tarjeta);
  });
}

async function mostrarDetallesCurso() {
  const busqueda = document.getElementById("detalles_curso").value.toLowerCase().trim();
  const listado = document.getElementById("detalles_busqueda");
  listado.innerHTML = "";

  if (busqueda === "") {
    return;
  }

  let cursos;
  try {
    cursos = (await obtenerCursosApi()).filter(curso =>
      String(curso.estado).toLowerCase() === "activo" &&
      `${curso.nombre || ""}`.toLowerCase().includes(busqueda)
    );
  } catch (error) {
    mostrarErrorCargaCursos(listado, error);
    return;
  }

  if (cursos.length > 0) {
    cursos.forEach(curso => {
      const tarjeta = document.createElement("article");
      agregarImagen(tarjeta, curso.foto, `Imagen del curso ${curso.nombre}`);
      const nombre = document.createElement("h4");
      nombre.textContent = curso.nombre;
      tarjeta.appendChild(nombre);

      const detalles = [
        `Descripción: ${curso.descripcion}`,
        `Docente: ${curso.docente}`,
        `Fecha de inicio: ${curso.fecha_inicio}`,
        `Fecha de finalización: ${curso.fecha_fin}`,
        `Horario: ${curso.horario}`,
        `Plazas máximas: ${curso.max_plazas}`
      ];

      detalles.forEach(detalle => {
        const parrafo = document.createElement("p");
        parrafo.textContent = detalle;
        tarjeta.appendChild(parrafo);
      });

      listado.appendChild(tarjeta);
    });
  } else {
    listado.innerHTML = "No se ha encontrado el curso.";
    return;
  }



}

async function mostrarHistorial() {
  const listado = document.getElementById("historial_cursos");
  if (!listado) {
    return;
  }

  listado.textContent = "Cargando cursos...";
  let cursos;
  try {
    cursos = await obtenerCursosApi();
  } catch (error) {
    mostrarErrorCargaCursos(listado, error);
    return;
  }

  listado.innerHTML = "";

  if (cursos.length > 0) {
    cursos.forEach(curso => {
    const tarjeta = document.createElement("article");
    agregarImagen(tarjeta, curso.foto, `Imagen del curso ${curso.nombre}`);
    const nombre = document.createElement("h4");
    nombre.textContent = curso.nombre;
    tarjeta.appendChild(nombre);

    const detalles = [
      `Descripción: ${curso.descripcion}`,
      `Docente: ${curso.docente}`,
      `Fecha de inicio: ${curso.fecha_inicio}`,
      `Fecha de finalización: ${curso.fecha_fin}`,
      `Horario: ${curso.horario}`,
      `Plazas máximas: ${curso.max_plazas}`
    ];

    detalles.forEach(detalle => {
      const parrafo = document.createElement("p");
      parrafo.textContent = detalle;
      tarjeta.appendChild(parrafo);
    });

    listado.appendChild(tarjeta);
  });
  }else{
    listado.textContent = "No hay cursos en el historial.";
    return;
  }
}