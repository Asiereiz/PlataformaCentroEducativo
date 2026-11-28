document.addEventListener("DOMContentLoaded", () => {

    mostrarDocentes();

    const btnAltaDoc = document.getElementById("alta_doc");
    if(btnAltaDoc){
        btnAltaDoc.addEventListener("submit", altaDoc);
    }

    const btnModDoc = document.getElementById("mod_doc");
    if(btnModDoc){
        btnModDoc.addEventListener("submit", modDoc);
    }

    const selectModDoc = document.getElementById("id_mod_doc");
    if(selectModDoc){
        selectModDoc.addEventListener("change", rellenarDoc);
    }

    const btnDelDoc = document.getElementById("del_doc");
    if(btnDelDoc){
        btnDelDoc.addEventListener("submit", delDoc);
    }

    const btnInfoDoc = document.getElementById("info_doc");
    if(btnInfoDoc){
        btnInfoDoc.addEventListener("submit", infoDoc);
    }

});

async function mostrarDocentes() {
  const listado = document.getElementById("lista_docentes");
  if (!listado) {
    return;
  }

  listado.innerHTML = "";

  let docentes;
  try {
    docentes = (await obtenerDocentesApi()).filter(docente => Number(docente.activo) === 1);
  } catch (error) {
    console.error("No se pudieron cargar los docentes desde MariaDB.", error);
    listado.textContent = "No se pudieron cargar los docentes. Comprueba la conexión e inténtalo de nuevo.";
    return;
  }

  if (docentes.length === 0) {
    listado.textContent = "No hay docentes disponibles.";
    return;
  }

  docentes.forEach(d => {
    const tarjeta = document.createElement("article");
    agregarImagen(tarjeta, d.foto, `Fotografía de ${d.nombre}`);
    const nombre = document.createElement("h4");
    nombre.textContent = d.nombre;
    tarjeta.appendChild(nombre);
    listado.appendChild(tarjeta);

    const detalles = [
      `Nombre: ${d.nombre}`,
      `Correo: ${d.email}`,
      `Teléfono: ${d.telefono}`,
      `Especialidad: ${d.especialidad}`,
      `Estado: ${d.activo ? "activo" : "inactivo"}`
    ];

    detalles.forEach(detalle => {
      const parrafo = document.createElement("p");
      parrafo.textContent = detalle;
      tarjeta.appendChild(parrafo);
    });
  });

}

function datosDocenteFormulario(sufijo, inputFoto) {
  const datos = new FormData();
  datos.append("nombre", document.getElementById(`nombre_${sufijo}`).value.trim());
  datos.append("email", document.getElementById(`correo_${sufijo}`).value.trim());
  datos.append("especialidad", document.getElementById(`especialidad_${sufijo}`).value.trim());
  datos.append("telefono", document.getElementById(`telefono_${sufijo}`).value.trim());
  datos.append("activo", document.getElementById(`estado_${sufijo}`).value === "activo" ? 1 : 0);
  if (inputFoto && inputFoto.files[0]) {
    datos.append("foto", inputFoto.files[0]);
  }
  return datos;
}

async function enviarDocente(url, metodo, cuerpo) {
  const opciones = { method: metodo };
  if (cuerpo instanceof FormData) {
    opciones.body = cuerpo;
  } else {
    opciones.headers = { "Content-Type": "application/json" };
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(url, opciones);
  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(resultado.error || `La petición terminó con HTTP ${respuesta.status}.`);
  }
}

async function refrescarDocentes() {
  promesaDocentesApi = null;
  await obtenerDocentesApi();
  updateSelect();
  mostrarDocentes();
}

async function altaDoc(event) {
  event.preventDefault();

  try {
    await enviarDocente(
      "/api/docentes",
      "POST",
      datosDocenteFormulario("alta_doc", document.getElementById("foto_alta_doc"))
    );
    await refrescarDocentes();
    alert("Docente registrado correctamente.");
  } catch (error) {
    console.error("No se pudo registrar el docente.", error);
    alert(`No se pudo registrar el docente: ${error.message}`);
  }
}

async function modDoc(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_doc").value;
  if (!idMod) {
    alert("Selecciona primero un docente.");
    return;
  }

  try {
    await enviarDocente(
      `/api/docentes/${encodeURIComponent(idMod)}`,
      "PUT",
      datosDocenteFormulario("mod_doc", document.getElementById("foto_mod_doc"))
    );
    await refrescarDocentes();
    alert("Docente modificado correctamente.");
  } catch (error) {
    console.error("No se pudo modificar el docente.", error);
    alert(`No se pudo modificar el docente: ${error.message}`);
  }
}

async function rellenarDoc() {
  const idMod = document.getElementById("id_mod_doc").value;
  let docente;
  try {
    docente = (await obtenerDocentesApi()).find(d => String(d.id) === idMod);
  } catch (error) {
    alert(`No se pudieron cargar los docentes: ${error.message}`);
    return;
  }

  if (!docente) {
    return;
  }

  document.getElementById("nombre_mod_doc").value = docente.nombre;
  document.getElementById("correo_mod_doc").value = docente.email;
  document.getElementById("especialidad_mod_doc").value = docente.especialidad;
  document.getElementById("telefono_mod_doc").value = docente.telefono;
  document.getElementById("estado_mod_doc").value = docente.activo ? "activo" : "inactivo";
}

async function delDoc(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_doc").value;
  if (!idDel) {
    alert("Selecciona primero un docente.");
    return;
  }

  try {
    const cursos = await obtenerCursosApi();
    const asignacion = cursos.find(curso =>
      String(curso.docente) === idDel && curso.estado === "activo"
    );
    if (asignacion) {
      alert("No se puede eliminar este docente porque está asignado a un curso. Reasigna o elimina el curso antes de eliminar al docente.");
      return;
    }

    if (!confirm("¿Seguro que quieres eliminar este docente?")) {
      return;
    }

    await enviarDocente(
      `/api/docentes/${encodeURIComponent(idDel)}`,
      "PATCH",
      { activo: 0 }
    );
    await refrescarDocentes();
    alert("Docente desactivado correctamente.");
  } catch (error) {
    console.error("No se pudo desactivar el docente.", error);
    alert(`No se pudo desactivar el docente: ${error.message}`);
  }
}

async function infoDoc(event) {
  event.preventDefault();

  const idInfo = document.getElementById("id_info_doc").value;
  let docente;
  try {
    docente = (await obtenerDocentesApi()).find(d => String(d.id) === idInfo);
  } catch (error) {
    alert(`No se pudieron cargar los docentes: ${error.message}`);
    return;
  }

  if (!docente) {
    alert("Selecciona primero un docente.");
    return;
  }

  document.getElementById("listado_doc").innerHTML = `
    <li>Nombre: ${docente.nombre}</li>
    <li>Correo: ${docente.email}</li>
    <li>Especialidad: ${docente.especialidad}</li>
    <li>Teléfono: ${docente.telefono}</li>
    <li>Fotografía: ${docente.foto ? "Disponible" : "No disponible"}</li>
    <li>Estado: ${docente.activo ? "activo" : "inactivo"}</li>
  `;
}