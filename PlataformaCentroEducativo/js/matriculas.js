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

});


function altaMat(event) {
  event.preventDefault();

  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = {
    id: matriculas.length + 1,
    alumno: document.getElementById("alumno_alta_mat").value,
    curso: document.getElementById("curso_alta_mat").value.trim(),
    fecha_matricula: document.getElementById("fecha_matricula_alta_mat").value,
    estado: document.getElementById("estado_alta_mat").value
  };

  const cursos = leerDatos(DATOS_CURSOS);
  const curso = cursos.find(c => String(c.id) === String(matricula.curso));
  if (!curso) {
    alert("Selecciona un curso válido.");
    return;
  }

  const matriculado = matriculas.find(m => String(m.alumno) === String(matricula.alumno) && String(m.curso) === String(matricula.curso));
  if (matriculado) {
    alert("Este usuario ya está matriculado en este curso.");
    return;
  }

  const plazasMaximas = Number(curso.max_plazas);
  const plazasOcupadas = matriculas.filter(m =>
    String(m.curso) === String(matricula.curso) && m.estado === "activo"
  ).length;

  if (matricula.estado === "activo" &&
      (!String(curso.max_plazas).trim() || !Number.isFinite(plazasMaximas) || plazasOcupadas >= plazasMaximas)) {
    alert("El curso ya ha alcanzado el número máximo de plazas.");
    return;
  }

  matriculas.push(matricula);
  guardarDatos(DATOS_MATRICULAS, matriculas);
  updateSelect();
  alert("Matrícula registrada correctamente.");
}

function modMat(event) {
  event.preventDefault();

  const idMod = document.getElementById("id_mod_mat").value;
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matriculaAnterior = matriculas.find(m => String(m.id) === idMod);
  const matricula = {
    id: matriculaAnterior.id,
    alumno: document.getElementById("alumno_mod_mat").value,
    curso: document.getElementById("curso_mod_mat").value.trim(),
    fecha_matricula: document.getElementById("fecha_matricula_mod_mat").value,
    estado: document.getElementById("estado_mod_mat").value
  };

  const cursos = leerDatos(DATOS_CURSOS);
  const curso = cursos.find(c => String(c.id) === String(matricula.curso));
  if (!curso) {
    alert("Selecciona un curso válido.");
    return;
  }

  const matriculado = matriculas.find(m =>
    String(m.id) !== idMod &&
    String(m.alumno) === String(matricula.alumno) &&
    String(m.curso) === String(matricula.curso)
  );
  if (matriculado) {
    alert("Este usuario ya está matriculado en este curso.");
    return;
  }

  const plazasMaximas = Number(curso.max_plazas);
  const plazasOcupadas = matriculas.filter(m =>
    String(m.id) !== idMod &&
    String(m.curso) === String(matricula.curso) &&
    m.estado === "activo"
  ).length;

  if (matricula.estado === "activo" &&
      (!String(curso.max_plazas).trim() || !Number.isFinite(plazasMaximas) || plazasOcupadas >= plazasMaximas)) {
    alert("El curso ya ha alcanzado el número máximo de plazas.");
    return;
  }

  const matriculasActualizadas = matriculas.map(m =>
    String(m.id) === idMod ? matricula : m
  );
  guardarDatos(DATOS_MATRICULAS, matriculasActualizadas);
  updateSelect();
  alert("Matrícula modificada correctamente.");
}

function rellenarMat() {
  const idMod = document.getElementById("id_mod_mat").value;
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = matriculas.find(m => String(m.id) === idMod);

  if (!matricula) {
    return;
  }

  document.getElementById("alumno_mod_mat").value = matricula.alumno;
  document.getElementById("curso_mod_mat").value = matricula.curso;
  document.getElementById("fecha_matricula_mod_mat").value = matricula.fecha_matricula;
  document.getElementById("estado_mod_mat").value = matricula.estado;
}

function delMat(event) {
  event.preventDefault();

  const idDel = document.getElementById("id_del_mat").value;
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const encontrada = matriculas.find(m => String(m.id) === idDel);

  if (!encontrada) {
    alert("Selecciona primero una matrícula.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar esta matrícula?")) {
    return;
  }

  guardarDatos(DATOS_MATRICULAS, matriculas.filter(m => String(m.id) !== idDel));
  updateSelect();
  alert("Matrícula eliminada correctamente.");
}

function infoMat(event) {
  event.preventDefault();

  const alumno = document.getElementById("alumno_info_mat").value;
  const curso = document.getElementById("curso_info_mat").value.trim();
  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = matriculas.find(m =>
    String(m.alumno) === alumno && String(m.curso) === curso
  );

  if (!matricula) {
    alert("No se encontró una matrícula para ese alumno y curso.");
    return;
  }

  document.getElementById("listado_mat").innerHTML = `
    <li>Identificador: ${matricula.id}</li>
    <li>Alumno: ${matricula.alumno}</li>
    <li>Curso: ${matricula.curso}</li>
    <li>Fecha de matrícula: ${matricula.fecha_matricula}</li>
    <li>Estado: ${matricula.estado}</li>
  `;
}

function mostrarMatriculas(){
  const listado = leerDatos(DATOS_MATRICULAS).filter(m => m.alumno === sessionStorage.getItem("usuarioActual"));
  const contenedor = document.getElementById("ver_mis_matriculas");

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";

  if(listado.length > 0){
    listado.forEach(matricula => {
      const tarjeta = document.createElement("article");
      const nombre = document.createElement("h4");
      nombre.textContent = matricula.curso;
      tarjeta.appendChild(nombre);
      contenedor.appendChild(tarjeta);
    });
  }else{
    contenedor.textContent = "No tienes matrículas activas.";
  }

}

function matricularme(event){
  event.preventDefault();

  const cursos = leerDatos(DATOS_CURSOS).filter(c => c.estado === "activo");
  const form_matricula= document.getElementById("curso_matricula");

  form_matricula.innerHTML = "";

  cursos.forEach(curso => {
    form_matricula.innerHTML += `<option value="${curso.id}">${curso.nombre}</option>`;
  });

  const cursoSeleccionado = document.getElementById("curso_matricula").value;
  const todosCursos = leerDatos(DATOS_CURSOS);

  const nuevaMat = {
    id: todosCursos.length + 1,
    alumno: sessionStorage.getItem("usuarioActual"),
    curso: cursoSeleccionado,
    fecha_matricula: new Date().toISOString().split("T")[0],
    estado: "activo"
    };

    const matriculas = leerDatos(DATOS_MATRICULAS);

    const existe = matriculas.some(m => m.curso === nuevaMat.curso && m.alumno === nuevaMat.alumno);

    if(existe){
      alert("Ya te has matriculado en este curso.");
      updateSelect();
      return;
    }

    if(!confirm(`Estás seguro de que quieres matricularte en ${cursoSeleccionado.nombre}?`)) {
      return;
    }

    matriculas.push(nuevaMat);
    guardarDatos(DATOS_MATRICULAS, matriculas);

    updateSelect();
    mostrarMatriculas();
}