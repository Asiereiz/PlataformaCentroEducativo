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

  const matriculasActualizadas = matriculas.map(m => String(m.id) === idDel ? { ...m, estado: "inactivo" } : m);

  guardarDatos(DATOS_MATRICULAS, matriculasActualizadas);
  updateSelect();
  alert("Matrícula desactivada correctamente.");
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
  const contenedor = document.getElementById("ver_mis_matriculas");
  const select = document.getElementById("cancelarmat_select");
  const correoActual = sessionStorage.getItem("correoActual");
  const nombreActual = sessionStorage.getItem("usuarioActual");
  const usuarioActual = leerDatos(DATOS_USER).find(usuario =>
    correoActual
      ? usuario.Correo === correoActual
      : usuario.Nombre === nombreActual
  );
  const listado = leerDatos(DATOS_MATRICULAS).filter(matricula => {
    const alumno = String(matricula.alumno);
    const perteneceAlUsuario =
      (nombreActual && alumno === nombreActual) ||
      (correoActual && alumno === correoActual) ||
      (usuarioActual && alumno === String(usuarioActual.id));
    return perteneceAlUsuario && matricula.estado === "activo";
  });
  const cursos = leerDatos(DATOS_CURSOS);

  if (!contenedor && !select) {
    return;
  }

  if (contenedor) {
    contenedor.innerHTML = "";

    if (listado.length > 0) {
      listado.forEach(matricula => {
        const tarjeta = document.createElement("article");
        const curso = cursos.find(c =>
          String(c.id) === String(matricula.curso) ||
          c.nombre === String(matricula.curso)
        );

        const nombre = document.createElement("p");
        nombre.textContent = `Curso: ${curso ? curso.nombre : matricula.curso}`;
        tarjeta.appendChild(nombre);

        if (curso && curso.descripcion) {
          const descripcion = document.createElement("p");
          descripcion.textContent = `Descripción: ${curso.descripcion}`;
          tarjeta.appendChild(descripcion);
        }

        const fecha = document.createElement("p");
        fecha.textContent = `Fecha de matrícula: ${matricula.fecha_matricula || "No disponible"}`;
        tarjeta.appendChild(fecha);

        contenedor.appendChild(tarjeta);
      });
    } else {
      contenedor.textContent = "No tienes matrículas.";
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
      const curso = cursos.find(c =>
        String(c.id) === String(matricula.curso) ||
        c.nombre === String(matricula.curso)
      );
      const opcion = document.createElement("option");
      opcion.value = `${matricula.id}|${matricula.curso}|${matricula.alumno}|${matricula.fecha_matricula}`;
      opcion.textContent = curso
        ? `${curso.nombre}`
        : `Curso ${matricula.curso}`;
      select.appendChild(opcion);
    });
  }
}

function matricularme(event){
  event.preventDefault();

  const cursoSeleccionado = document.getElementById("curso_matricula").value;
  const curso = leerDatos(DATOS_CURSOS).find(c =>
    String(c.id) === String(cursoSeleccionado) && c.estado === "activo"
  );
  if (!curso) {
    alert("Selecciona un curso activo.");
    return;
  }

  const matriculas = leerDatos(DATOS_MATRICULAS);

  const nuevaMat = {
    id: matriculas.length + 1,
    alumno: sessionStorage.getItem("usuarioActual"),
    curso: cursoSeleccionado,
    fecha_matricula: new Date().toISOString().split("T")[0],
    estado: "activo"
    };

    const existe = matriculas.some(m =>
      m.estado === "activo" &&
      String(m.curso) === String(nuevaMat.curso) &&
      String(m.alumno) === String(nuevaMat.alumno)
    );

    if(existe){
      alert("Ya te has matriculado en este curso.");
      updateSelect();
      return;
    }

    const plazasMaximas = Number(curso.max_plazas);
    const plazasOcupadas = matriculas.filter(m =>
      String(m.curso) === String(curso.id) && m.estado === "activo"
    ).length;

    if (!String(curso.max_plazas).trim() ||
        !Number.isFinite(plazasMaximas) ||
        plazasOcupadas >= plazasMaximas) {
      alert("El curso ya ha alcanzado el número máximo de plazas.");
      return;
    }

    if(!confirm(`Estás seguro de que quieres matricularte en ${curso.nombre}?`)) {
      return;
    }

    matriculas.push(nuevaMat);
    guardarDatos(DATOS_MATRICULAS, matriculas);

    updateSelect();
    mostrarMatriculas();
}

function cancelarMatriculas(event){
  event.preventDefault();

  const seleccion = document.getElementById("cancelarmat_select").value;
  if (!seleccion) {
    alert("Selecciona una matrícula.");
    return;
  }

  const matriculas = leerDatos(DATOS_MATRICULAS);
  const matricula = matriculas.find(m =>
    m.estado === "activo" &&
    `${m.id}|${m.curso}|${m.alumno}|${m.fecha_matricula}` === seleccion
  );

  if (!matricula) {
    alert("No se encontró una matrícula activa con esa selección.");
    mostrarMatriculas();
    return;
  }

  const matriculasActualizadas = matriculas.map(m =>
    m.estado === "activo" &&
    `${m.id}|${m.curso}|${m.alumno}|${m.fecha_matricula}` === seleccion
      ? { ...m, estado: "inactivo" }
      : m
  );
  guardarDatos(DATOS_MATRICULAS, matriculasActualizadas);
  mostrarMatriculas();
  alert("Matrícula cancelada correctamente.");
}