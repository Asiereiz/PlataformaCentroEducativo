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

function datosAulaFormulario(sufijo) {
  return {
    nombre: document.getElementById(`nombre_${sufijo}_aula`).value.trim(),
    edificio: document.getElementById(`edificio_${sufijo}_aula`).value.trim(),
    planta: document.getElementById(`planta_${sufijo}_aula`).value.trim(),
    capacidad: document.getElementById(`capacidad_${sufijo}_aula`).value.trim(),
    equipamiento: document.getElementById(`equipamiento_${sufijo}_aula`).value.trim(),
    estado: document.getElementById(`estado_${sufijo}_aula`).value
  };
}

async function refrescarAulas() {
  promesaAulasApi = null;
  await obtenerAulasApi();
  updateSelect();
}

async function altaAula(event) {
  event.preventDefault();

  try {
    await peticionApi("/api/aulas", "POST", datosAulaFormulario("alta"));
    await refrescarAulas();
    alert("Aula registrada correctamente.");
  } catch (error) {
    console.error("No se pudo registrar el aula.", error);
    alert(`No se pudo registrar el aula: ${error.message}`);
  }
}

async function modAula(event){
  event.preventDefault();

  const idMod = document.getElementById("id_mod_aula").value;
  if (!idMod) {
    alert("Selecciona primero un aula.");
    return;
  }

  try {
    await peticionApi(`/api/aulas/${encodeURIComponent(idMod)}`, "PUT", datosAulaFormulario("mod"));
    await refrescarAulas();
    alert("Aula modificada correctamente.");
  } catch (error) {
    console.error("No se pudo modificar el aula.", error);
    alert(`No se pudo modificar el aula: ${error.message}`);
  }
}

async function rellenarAula() {
  const idMod = document.getElementById("id_mod_aula").value;
  let aula;
  try {
    aula = (await obtenerAulasApi()).find(a => String(a.id) === idMod);
  } catch (error) {
    alert(`No se pudieron cargar las aulas: ${error.message}`);
    return;
  }

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

async function delAula(event){
  event.preventDefault();

  const idDel = document.getElementById("id_del_aula").value;
  let encontrado;
  try {
    encontrado = (await obtenerAulasApi()).find(aula => String(aula.id) === idDel);
  } catch (error) {
    alert(`No se pudieron cargar las aulas: ${error.message}`);
    return;
  }

  if (!encontrado) {
    alert("Selecciona primero un aula.");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar esta aula?")) {
    return;
  }

  try {
    await peticionApi(`/api/aulas/${encodeURIComponent(idDel)}`, "PATCH", { estado: "inactiva" });
    await refrescarAulas();
    alert("Aula desactivada correctamente.");
  } catch (error) {
    console.error("No se pudo desactivar el aula.", error);
    alert(`No se pudo desactivar el aula: ${error.message}`);
  }
}

async function infoAula(event){
  event.preventDefault();

  const idInfo = document.getElementById("id_info_aula").value;

  let aula;
  try {
    aula = (await obtenerAulasApi()).find(a => String(a.id) === idInfo);
  } catch (error) {
    alert(`No se pudieron cargar las aulas: ${error.message}`);
    return;
  }

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
