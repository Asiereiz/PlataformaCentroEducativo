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

function mostrarDocentes() {
  const listado = document.getElementById("lista_docentes");
  if (!listado) {
    return;
  }

  listado.innerHTML = "";
  const docentes = leerDatos(DATOS_DOCENTES).filter(docente => docente.estado === "activo");

  if (docentes.length === 0) {
    listado.textContent = "No hay docentes disponibles.";
    return;
  }

  docentes.forEach(d => {
    const tarjeta = document.createElement("article");
    const nombre = document.createElement("h4");
    nombre.textContent = d.Nombre;
    tarjeta.appendChild(nombre);
    listado.appendChild(tarjeta);

    const detalles = [
      `Nombre: ${d.Nombre}`,
      `Primer apellido: ${d.Primer_apellido}`,
      `Segundo apellido: ${d.Segundo_apellido}`,
      `Correo: ${d.Correo}`,
      `Teléfono: ${d.Telefono}`,
      `Especialidad: ${d.Especialidad}`,
      `Estado: ${d.estado}`,
      `Fotografía: ${d.Fotografia}`
    ];

    detalles.forEach(detalle => {
      const parrafo = document.createElement("p");
      parrafo.textContent = detalle;
      tarjeta.appendChild(parrafo);
    });
  });

}

function altaDoc(event) {
  event.preventDefault();

  const docentes = leerDatos(DATOS_DOCENTES);
  const docente = {
    id: docentes.length + 1,
    Nombre: document.getElementById("nombre_alta_doc").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_alta_doc").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_alta_doc").value.trim(),
    Correo: document.getElementById("correo_alta_doc").value.trim(),
    Especialidad: document.getElementById("especialidad_alta_doc").value.trim(),
    Telefono: document.getElementById("telefono_alta_doc").value.trim(),
    Fotografia: document.getElementById("foto_alta_doc").value.trim(),
    estado: document.getElementById("estado_alta_doc").value
  };

  docentes.push(docente);
  guardarDatos(DATOS_DOCENTES, docentes);
  updateSelect();
  alert("Docente registrado correctamente.");
}

function modDoc(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const docenteAnterior = docentes.find(docente => String(docente.id) === idMod);
  const docenteModificado = {
    id: docenteAnterior.id,
    Nombre: document.getElementById("nombre_mod_doc").value.trim(),
    Primer_apellido: document.getElementById("primer_apellido_mod_doc").value.trim(),
    Segundo_apellido: document.getElementById("segundo_apellido_mod_doc").value.trim(),
    Correo: document.getElementById("correo_mod_doc").value.trim(),
    Especialidad: document.getElementById("especialidad_mod_doc").value.trim(),
    Telefono: document.getElementById("telefono_mod_doc").value.trim(),
    Fotografia: document.getElementById("foto_mod_doc").value.trim(),
    estado: document.getElementById("estado_mod_doc").value
  };

  const docentesActualizados = docentes.map(docente =>
    String(docente.id) === idMod ? docenteModificado : docente
  );
  guardarDatos(DATOS_DOCENTES, docentesActualizados);
  updateSelect();
  alert("Docente modificado correctamente.");
}

function rellenarDoc() {
  const idMod = document.getElementById("id_mod_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const docente = docentes.find(d => String(d.id) === idMod);

  if (!docente) {
    return;
  }

  document.getElementById("nombre_mod_doc").value = docente.Nombre;
  document.getElementById("primer_apellido_mod_doc").value = docente.Primer_apellido;
  document.getElementById("segundo_apellido_mod_doc").value = docente.Segundo_apellido;
  document.getElementById("correo_mod_doc").value = docente.Correo;
  document.getElementById("especialidad_mod_doc").value = docente.Especialidad;
  document.getElementById("telefono_mod_doc").value = docente.Telefono;
  document.getElementById("estado_mod_doc").value = docente.estado;
}

function delDoc(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const encontrado = docentes.find(docente => String(docente.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un docente.");
    return;
  }

  const asignacion = leerDatos(DATOS_CURSOS).find(curso => String(curso.docente) === idDel);
  if (asignacion) {
    alert("No se puede eliminar este docente porque está asignado a un curso. Reasigna o elimina el curso antes de eliminar al docente.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar este docente?")) {
    return;
  }

  guardarDatos(DATOS_DOCENTES, docentes.filter(docente => String(docente.id) !== idDel));
  updateSelect();
  alert("Docente eliminado correctamente.");
}

function infoDoc(event) {
  event.preventDefault();

  const idInfo = document.getElementById("id_info_doc").value;
  const docentes = leerDatos(DATOS_DOCENTES);
  const docente = docentes.find(d => String(d.id) === idInfo);

  if (!docente) {
    alert("Selecciona primero un docente.");
    return;
  }

  document.getElementById("listado_doc").innerHTML = `
    <li>Nombre: ${docente.Nombre}</li>
    <li>Primer apellido: ${docente.Primer_apellido}</li>
    <li>Segundo apellido: ${docente.Segundo_apellido}</li>
    <li>Correo: ${docente.Correo}</li>
    <li>Especialidad: ${docente.Especialidad}</li>
    <li>Teléfono: ${docente.Telefono}</li>
    <li>Fotografía: ${docente.Fotografia}</li>
    <li>Estado: ${docente.estado}</li>
  `;
}