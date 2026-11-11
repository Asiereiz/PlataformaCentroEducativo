document.addEventListener("DOMContentLoaded", () => {

    const btnAltaAula = document.getElementById("alta_aula");
    if(btnAltaAula){
        btnAltaAula.addEventListener("submit", altaAula);
    }

    const btnModAula = document.getElementById("mod_aula");
    if(btnModAula){
        btnModAula.addEventListener("submit", modAula);
    }

    const selectModAula = document.getElementById("id_mod_aula");
    if(selectModAula){
        selectModAula.addEventListener("change", rellenarAula);
    }

    const btnDelAula = document.getElementById("del_aula");
    if(btnDelAula){
        btnDelAula.addEventListener("submit", delAula);
    }

    const btnInfoAula = document.getElementById("info_aula");
    if(btnInfoAula){
        btnInfoAula.addEventListener("submit", infoAula);
    }

});

function altaAula(event) {
  event.preventDefault();

  const aula = {
    id: leerDatos(DATOS_AULAS).length + 1,
    nombre: document.getElementById("nombre_alta_aula").value.trim(),
    edificio: document.getElementById("edificio_alta_aula").value.trim(),
    planta: document.getElementById("planta_alta_aula").value.trim(),
    capacidad: document.getElementById("capacidad_alta_aula").value.trim(),
    equipamiento: document.getElementById("equipamiento_alta_aula").value.trim(),
    estado: document.getElementById("estado_alta_aula").value.trim()
  }

  const aulas = leerDatos(DATOS_AULAS);
  aulas.push(aula);
  guardarDatos(DATOS_AULAS, aulas);

  updateSelect();
}

function modAula(event){
  event.preventDefault();

  const idMod = document.getElementById("id_mod_aula").value;

  const aulas = leerDatos(DATOS_AULAS);
  const aulaAnterior = aulas.find(aula => String(aula.id) === idMod);

   const aulaModificada = {
    id: aulaAnterior.id,
    nombre: document.getElementById("nombre_mod_aula").value.trim(),
    edificio: document.getElementById("edificio_mod_aula").value.trim(),
    planta: document.getElementById("planta_mod_aula").value.trim(),
    capacidad: document.getElementById("capacidad_mod_aula").value.trim(),
    equipamiento: document.getElementById("equipamiento_mod_aula").value.trim(),
    estado: document.getElementById("estado_mod_aula").value
  };

  const aulasActualizadas = aulas.map(aula =>
    String(aula.id) === idMod ? aulaModificada : aula
  );

  guardarDatos(DATOS_AULAS, aulasActualizadas);
  updateSelect();

  alert("Aula modificada correctamente.");

}

function rellenarAula() {
  const idMod = document.getElementById("id_mod_aula").value;
  const aulas = leerDatos(DATOS_AULAS);
  const aula = aulas.find(a => String(a.id) === idMod);

  if (!aula) {
    return;
  }

  document.getElementById("nombre_mod_aula").value = aula.nombre;
  document.getElementById("edificio_mod_aula").value = aula.edificio;
  document.getElementById("planta_mod_aula").value = aula.planta;
  document.getElementById("capacidad_mod_aula").value = aula.capacidad;
  document.getElementById("equipamiento_mod_aula").value = aula.equipamiento;
  document.getElementById("estado_mod_aula").value = aula.estado;
}

function delAula(event){
  event.preventDefault();
  
  const idDel = document.getElementById("id_del_aula").value;
  const aulas = leerDatos(DATOS_AULAS);
  const encontrado = aulas.find(aula => String(aula.id) === idDel);

  if (!encontrado) {
    alert("Selecciona primero un aula.");
    return;
  }

  const activo = leerDatos(DATOS_CURSOS).find(curso => String(curso.aula) === idDel && curso.estado === "activo");
  if (activo) {
    alert("No se puede eliminar el aula porque está asignada a un curso activo.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar esta aula?")) {
    return;
  }

  const aulasActualizadas = aulas.filter(aula => String(aula.id) !== idDel);
  guardarDatos(DATOS_AULAS, aulasActualizadas);
  updateSelect();

  alert("Aula eliminada correctamente.");

}

function infoAula(event){
  event.preventDefault();

  const idInfo = document.getElementById("id_info_aula").value;

  const aulas = leerDatos(DATOS_AULAS);
  const aula = aulas.find(a => String(a.id) === idInfo);

  if (!aula) {
    alert("Selecciona primero un aula.");
    return;
  }

  const listado = document.getElementById("listado_aula");
  listado.innerHTML = `
    <li>Nombre: ${aula.nombre}</li>
    <li>Edificio: ${aula.edificio}</li>
    <li>Planta: ${aula.planta}</li>
    <li>Capacidad: ${aula.capacidad}</li>
    <li>Equipamiento: ${aula.equipamiento}</li>
    <li>Estado: ${aula.estado}</li>
  `;
}