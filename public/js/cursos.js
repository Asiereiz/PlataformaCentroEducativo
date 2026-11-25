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

let promesaCursosApi;

function obtenerCursosApi() {
  if (!promesaCursosApi) {
    promesaCursosApi = fetch("/api/cursos")
      .then(async respuesta => {
        if (!respuesta.ok) {
          throw new Error(`La petición terminó con HTTP ${respuesta.status}.`);
        }

        const filas = await respuesta.json();
        if (!Array.isArray(filas)) {
          throw new Error("La respuesta de /api/cursos no es una lista.");
        }

        return filas.map(curso => ({
          ...curso,
          id: curso.id_curso,
          docente: curso.id_docente,
          aula: curso.id_aula,
          max_plazas: curso.plazas,
          foto: curso.imagen
        }));
      });
  }

  return promesaCursosApi;
}

function mostrarErrorCargaCursos(listado, error) {
  console.error("No se pudieron cargar los cursos desde MariaDB.", error);
  listado.textContent = "No se pudieron cargar los cursos. Comprueba la conexión e inténtalo de nuevo.";
}

async function altaCurso(event) {
  event.preventDefault();

  let foto;
  try {
    foto = await leerImagen(document.getElementById("foto_alta_curso"));
  } catch (error) {
    alert(`No se pudo leer la imagen: ${error.message}`);
    return;
  }

  const cursos = leerDatos(DATOS_CURSOS);
  const curso = {
    id: cursos.length + 1,
    nombre: document.getElementById("nombre_alta_curso").value.trim(),
    descripcion: document.getElementById("descripcion_alta_curso").value.trim(),
    docente: document.getElementById("docente_alta_curso").value,
    aula: document.getElementById("aula_alta_curso").value.trim(),
    fecha_inicio: document.getElementById("fecha_inicio_alta_curso").value.trim(),
    fecha_fin: document.getElementById("fecha_finalizacion_alta_curso").value.trim(),
    horario: document.getElementById("horario_alta_curso").value.trim(),
    max_plazas: document.getElementById("max_plazas_alta_curso").value.trim(),
    foto,
    estado: document.getElementById("estado_alta_curso").value.trim(),
    plazas_ocupadas: 0
  };

  cursos.push(curso);
  if (!guardarDatosConImagen(DATOS_CURSOS, cursos)) {
    return;
  }

  updateSelect();
  alert("Curso registrado correctamente.");
}


async function modCurso(event){
  event.preventDefault();

  const idMod = document.getElementById("id_mod_curso").value;
  const cursos = leerDatos(DATOS_CURSOS);
  const cursoAnterior = cursos.find(curso => String(curso.id) === idMod);
  if (!cursoAnterior) {
    alert("Selecciona primero un curso.");
    return;
  }

  let fotoNueva;
  try {
    fotoNueva = await leerImagen(document.getElementById("foto_mod_curso"));
  } catch (error) {
    alert(`No se pudo leer la imagen: ${error.message}`);
    return;
  }

  const cursoModificado = {
    id: cursoAnterior.id,
    nombre: document.getElementById("nombre_mod_curso").value.trim(),
    descripcion: document.getElementById("descripcion_mod_curso").value.trim(),
    docente: document.getElementById("docente_mod_curso").value,
    aula: document.getElementById("aula_mod_curso").value.trim(),
    fecha_inicio: document.getElementById("fecha_inicio_mod_curso").value.trim(),
    fecha_fin: document.getElementById("fecha_finalizacion_mod_curso").value.trim(),
    horario: document.getElementById("horario_mod_curso").value.trim(),
    max_plazas: document.getElementById("max_plazas_mod_curso").value.trim(),
    foto: fotoNueva || cursoAnterior.foto || "",
    estado: document.getElementById("estado_mod_curso").value
  };

  const cursosActualizados = cursos.map(curso =>
    String(curso.id) === idMod ? cursoModificado : curso
  );
  if (!guardarDatosConImagen(DATOS_CURSOS, cursosActualizados)) {
    return;
  }
  updateSelect();

  alert("Curso modificado correctamente.");
}

function rellenarCurso() {
  const idMod = document.getElementById("id_mod_curso").value;
  const cursos = leerDatos(DATOS_CURSOS);
  const curso = cursos.find(c => String(c.id) === idMod);

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



function delCurso(event){
  event.preventDefault();

  const idDel = document.getElementById("id_del_curso").value;
  const cursos = leerDatos(DATOS_CURSOS);
  const encontrado = cursos.find(curso => String(curso.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un curso.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este curso?")) {
    return;
  }

  const datosActualizados = cursos.map(m => String(m.id) === idDel ? { ...m, estado: "inactivo" } : m);

  guardarDatos(DATOS_CURSOS, datosActualizados);
  updateSelect();

  alert("Curso desactivado correctamente.");
}



function infoCurso(event){
  event.preventDefault();

  const idInfo = document.getElementById("id_info_curso").value;

  const cursos = leerDatos(DATOS_CURSOS);
  const curso = cursos.find(c => String(c.id) === idInfo);

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