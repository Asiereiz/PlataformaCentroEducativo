document.addEventListener("DOMContentLoaded", () => {

    mostrarMatriculas();

    const btnAltaMat = document.getElementById("alta_mat");
    if(btnAltaMat){
        btnAltaMat.addEventListener("submit", altaMat);
    }

    const btnModMat = document.getElementById("mod_mat");
    if(btnModMat){
        btnModMat.addEventListener("submit", modMat);
    }

    const selectModMat = document.getElementById("id_mod_mat");
    if(selectModMat){
        selectModMat.addEventListener("change", rellenarMat);
    }

    const btnDelMat = document.getElementById("del_mat");
    if(btnDelMat){
        btnDelMat.addEventListener("submit", delMat);
    }

    const btnInfoMat = document.getElementById("info_mat");
    if(btnInfoMat){
        btnInfoMat.addEventListener("submit", infoMat);
    }

    const botonMatricularme = document.getElementById("matricularme_form");
    if(botonMatricularme){
        botonMatricularme.addEventListener("submit", matricularme);
    }

    const btnCancelarMat = document.getElementById("cancelarmat_form");
    if(btnCancelarMat){
        btnCancelarMat.addEventListener("submit", cancelarMatriculas);
    }

});

// La API guarda la fecha como "2026-11-05 10:00:00"; en pantalla solo se enseña el día
function soloFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "";
}

// ---------------------------------------------------- gestión (admin)

// Datos del formulario de alta o de modificación (sufijo: "alta_mat" o "mod_mat")
function datosMatriculaFormulario(sufijo) {
  return {
    id_usuario: Number(document.getElementById(`alumno_${sufijo}`).value),
    id_curso: Number(document.getElementById(`curso_${sufijo}`).value),
    fecha_matricula: document.getElementById(`fecha_matricula_${sufijo}`).value,
    estado: document.getElementById(`estado_${sufijo}`).value
  };
}

async function altaMat(event) {
  event.preventDefault();

  try {
    await peticionApi("/api/matriculas", "POST", datosMatriculaFormulario("alta_mat"));
    updateSelect();
    alert("Matrícula registrada correctamente.");
  } catch (error) {
    console.error("No se pudo registrar la matrícula.", error);
    alert(`No se pudo registrar la matrícula: ${error.message}`);
  }
}

async function modMat(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_mat").value;
  if (!idMod) {
    alert("Selecciona primero una matrícula.");
    return;
  }

  try {
    await peticionApi(
      `/api/matriculas/${encodeURIComponent(idMod)}`,
      "PUT",
      datosMatriculaFormulario("mod_mat")
    );
    updateSelect();
    alert("Matrícula modificada correctamente.");
  } catch (error) {
    console.error("No se pudo modificar la matrícula.", error);
    alert(`No se pudo modificar la matrícula: ${error.message}`);
  }
}

async function rellenarMat() {
  const idMod = document.getElementById("id_mod_mat").value;
  let matricula;
  try {
    matricula = (await obtenerMatriculasApi()).find(m => String(m.id) === idMod);
  } catch (error) {
    alert(`No se pudieron cargar las matrículas: ${error.message}`);
    return;
  }

  if (!matricula) {
    return;
  }

  document.getElementById("alumno_mod_mat").value = matricula.id_usuario;
  document.getElementById("curso_mod_mat").value = matricula.id_curso;
  document.getElementById("fecha_matricula_mod_mat").value = soloFecha(matricula.fecha_matricula);
  document.getElementById("estado_mod_mat").value = matricula.estado;
}

async function delMat(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_mat").value;
  if (!idDel) {
    alert("Selecciona primero una matrícula.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar esta matrícula?")) {
    return;
  }

  try {
    // No se borra: se marca como cancelada
    await peticionApi(`/api/matriculas/${encodeURIComponent(idDel)}`, "PATCH", { estado: "cancelada" });
    updateSelect();
    alert("Matrícula cancelada correctamente.");
  } catch (error) {
    console.error("No se pudo cancelar la matrícula.", error);
    alert(`No se pudo cancelar la matrícula: ${error.message}`);
  }
}

async function infoMat(event) {
  event.preventDefault();

  const alumno = document.getElementById("alumno_info_mat").value;
  const curso = document.getElementById("curso_info_mat").value;
  if (!alumno || !curso) {
    alert("Selecciona un alumno y un curso.");
    return;
  }

  let encontradas;
  try {
    // La API filtra por alumno y curso: GET /api/matriculas?usuario=..&curso=..
    encontradas = await obtenerMatriculasApi({ usuario: alumno, curso });
  } catch (error) {
    alert(`No se pudo consultar la matrícula: ${error.message}`);
    return;
  }

  // Si el alumno se matriculó varias veces (canceló y volvió), se enseña la activa
  const matricula = encontradas.find(m => m.estado === "activa") || encontradas[0];
  if (!matricula) {
    alert("No se encontró una matrícula para ese alumno y curso.");
    return;
  }

  document.getElementById("listado_mat").innerHTML = `
    <li>Identificador: ${matricula.id_matricula}</li>
    <li>Alumno: ${matricula.nombre_alumno}</li>
    <li>Curso: ${matricula.nombre_curso}</li>
    <li>Fecha de matrícula: ${soloFecha(matricula.fecha_matricula)}</li>
    <li>Estado: ${matricula.estado}</li>
  `;
}

// ------------------------------------------------ zona del alumno

async function mostrarMatriculas(){
  const contenedor = document.getElementById("ver_mis_matriculas");
  const select = document.getElementById("cancelarmat_select");

  if (!contenedor && !select) {
    return;
  }

  const idUsuario = sessionStorage.getItem("idUsuario");
  let listado = [];
  let mensaje = "No tienes matrículas.";

  if (!idUsuario) {
    mensaje = "No se encontró el usuario. Cierra sesión y vuelve a iniciar sesión.";
  } else {
    try {
      // Solo las matrículas activas del usuario que ha iniciado sesión
      listado = await obtenerMatriculasApi({ usuario: idUsuario, estado: "activa" });
    } catch (error) {
      console.error("No se pudieron cargar las matrículas.", error);
      mensaje = "No se pudieron cargar tus matrículas. Inténtalo de nuevo más tarde.";
    }
  }

  if (contenedor) {
    contenedor.innerHTML = "";

    if (listado.length > 0) {
      listado.forEach(matricula => {
        const tarjeta = document.createElement("article");

        const nombre = document.createElement("p");
        nombre.textContent = `Curso: ${matricula.nombre_curso}`;
        tarjeta.appendChild(nombre);

        if (matricula.descripcion_curso) {
          const descripcion = document.createElement("p");
          descripcion.textContent = `Descripción: ${matricula.descripcion_curso}`;
          tarjeta.appendChild(descripcion);
        }

        const fecha = document.createElement("p");
        fecha.textContent = `Fecha de matrícula: ${soloFecha(matricula.fecha_matricula) || "No disponible"}`;
        tarjeta.appendChild(fecha);

        contenedor.appendChild(tarjeta);
      });
    } else {
      contenedor.textContent = mensaje;
    }
  }

  if (select) {
    select.innerHTML = "";
    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.disabled = true;
    opcionInicial.selected = true;
    opcionInicial.textContent = "Selecciona una matrícula";
    select.appendChild(opcionInicial);

    listado.forEach(matricula => {
      const opcion = document.createElement("option");
      opcion.value = matricula.id_matricula;
      opcion.textContent = matricula.nombre_curso;
      select.appendChild(opcion);
    });
  }
}

async function matricularme(event){
  event.preventDefault();

  const idUsuario = sessionStorage.getItem("idUsuario");
  if (!idUsuario) {
    alert("No se encontró el usuario. Cierra sesión y vuelve a iniciar sesión.");
    return;
  }

  const cursoSeleccionado = document.getElementById("curso_matricula").value;
  if (!cursoSeleccionado) {
    alert("Selecciona un curso activo.");
    return;
  }

  try {
    const curso = (await obtenerCursosApi()).find(c => String(c.id) === String(cursoSeleccionado));
    if (!curso || String(curso.estado).toLowerCase() !== "activo") {
      alert("Selecciona un curso activo.");
      return;
    }

    if(!confirm(`Estás seguro de que quieres matricularte en ${curso.nombre}?`)) {
      return;
    }

    // Sin fecha: el servidor pone la de hoy. Él también comprueba duplicados y plazas.
    await peticionApi("/api/matriculas", "POST", {
      id_usuario: Number(idUsuario),
      id_curso: Number(cursoSeleccionado)
    });
    updateSelect();
    mostrarMatriculas();
  } catch (error) {
    console.error("No se pudo realizar la matrícula.", error);
    alert(error.message);
  }
}

async function cancelarMatriculas(event){
  event.preventDefault();

  const seleccion = document.getElementById("cancelarmat_select").value;
  if (!seleccion) {
    alert("Selecciona una matrícula.");
    return;
  }

  try {
    await peticionApi(`/api/matriculas/${encodeURIComponent(seleccion)}`, "PATCH", { estado: "cancelada" });
    await mostrarMatriculas();
    alert("Matrícula cancelada correctamente.");
  } catch (error) {
    console.error("No se pudo cancelar la matrícula.", error);
    alert(`No se pudo cancelar la matrícula: ${error.message}`);
    mostrarMatriculas();
  }
}
