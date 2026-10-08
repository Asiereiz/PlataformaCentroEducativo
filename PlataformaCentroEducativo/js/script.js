function obtenerDatos(clave) {
  const datos = localStorage.getItem(clave);
  if (datos) {
    return JSON.parse(datos);
  }
  return [];
}

function guardarDatos(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function generarId(lista) {
  if (lista.length === 0) {
    return 1;
  }
  let maximo = 0;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id > maximo) {
      maximo = lista[i].id;
    }
  }
  return maximo + 1;
}

const CLAVE_AULAS = "aulas";

document.addEventListener("DOMContentLoaded", () => {
  inicializarAulas();
  actualizarSelects();
  registrarAltaAula();
  registrarModificacionAula();
  registrarEliminacionAula();
  registrarConsultaAula();
});

function inicializarAulas() {
  const aulas = obtenerDatos(CLAVE_AULAS);
  if (aulas.length === 0) {
    const aulasIniciales = [
      { id: 1, nombre: "Aula 101", edificio: "A", planta: 1, capacidad: 30, equipamiento: "Proyector, pizarra digital", estado: "activo" },
      { id: 2, nombre: "Laboratorio 2", edificio: "B", planta: 0, capacidad: 20, equipamiento: "Ordenadores", estado: "activo" }
    ];
    guardarDatos(CLAVE_AULAS, aulasIniciales);
  }
}

function actualizarSelects() {
  const aulas = obtenerDatos(CLAVE_AULAS);
  const selectMod = document.getElementById("id_mod_aula");
  const selectDel = document.getElementById("id_del_aula");

  selectMod.innerHTML = '<option value="">Selecciona un ID</option>';
  selectDel.innerHTML = '<option value="">Selecciona un ID</option>';

  for (let i = 0; i < aulas.length; i++) {
    const aula = aulas[i];
    const opcion = '<option value="' + aula.id + '">' + aula.id + ' - ' + aula.nombre + '</option>';
    selectMod.insertAdjacentHTML("beforeend", opcion);
    selectDel.insertAdjacentHTML("beforeend", opcion);
  }
}

function registrarAltaAula() {
  const formulario = document.querySelector("#alta_aula form");

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const nuevaAula = {
      id: generarId(obtenerDatos(CLAVE_AULAS)),
      nombre: document.getElementById("nombre_alta_aula").value,
      edificio: document.getElementById("edificio_alta_aula").value,
      planta: document.getElementById("planta_alta_aula").value,
      capacidad: Number(document.getElementById("capacidad_alta_aula").value),
      equipamiento: document.getElementById("equipamiento_alta_aula").value,
      estado: document.getElementById("estado_alta_aula").value
    };

    if (!validarAula(nuevaAula)) {
      return;
    }

    const aulas = obtenerDatos(CLAVE_AULAS);
    aulas.push(nuevaAula);
    guardarDatos(CLAVE_AULAS, aulas);

    alert("Aula registrada correctamente.");
    formulario.reset();
    actualizarSelects();
  });
}

function registrarModificacionAula() {
  const selectId = document.getElementById("id_mod_aula");
  const formulario = document.querySelector("#mod_aula form");

  selectId.addEventListener("change", rellenarFormularioModificacion);

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = Number(selectId.value);
    if (!id) {
      alert("Selecciona primero un aula.");
      return;
    }

    if (!confirm("¿Seguro que quieres modificar esta aula?")) {
      return;
    }

    const aulaModificada = {
      id: id,
      nombre: document.getElementById("nombre_mod_aula").value,
      edificio: document.getElementById("edificio_mod_aula").value,
      planta: document.getElementById("planta_mod_aula").value,
      capacidad: Number(document.getElementById("capacidad_mod_aula").value),
      equipamiento: document.getElementById("equipamiento_mod_aula").value,
      estado: document.getElementById("estado_mod_aula").value
    };

    if (!validarAula(aulaModificada)) {
      return;
    }

    const aulas = obtenerDatos(CLAVE_AULAS);
    for (let i = 0; i < aulas.length; i++) {
      if (aulas[i].id === id) {
        aulas[i] = aulaModificada;
      }
    }
    guardarDatos(CLAVE_AULAS, aulas);

    alert("Aula modificada correctamente.");
    formulario.reset();
    actualizarSelects();
  });
}

function rellenarFormularioModificacion(event) {
  const id = Number(event.target.value);
  if (!id) {
    return;
  }

  const aulas = obtenerDatos(CLAVE_AULAS);
  let aulaSeleccionada = null;

  for (let i = 0; i < aulas.length; i++) {
    if (aulas[i].id === id) {
      aulaSeleccionada = aulas[i];
    }
  }

  if (!aulaSeleccionada) {
    return;
  }

  document.getElementById("nombre_mod_aula").value = aulaSeleccionada.nombre;
  document.getElementById("edificio_mod_aula").value = aulaSeleccionada.edificio;
  document.getElementById("planta_mod_aula").value = aulaSeleccionada.planta;
  document.getElementById("capacidad_mod_aula").value = aulaSeleccionada.capacidad;
  document.getElementById("equipamiento_mod_aula").value = aulaSeleccionada.equipamiento;
  document.getElementById("estado_mod_aula").value = aulaSeleccionada.estado;
}

function registrarEliminacionAula() {
  const selectId = document.getElementById("id_del_aula");
  const formulario = document.querySelector("#del_aula form");

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = Number(selectId.value);
    if (!id) {
      alert("Selecciona primero un aula.");
      return;
    }

    if (!confirm("¿Seguro que quieres eliminar esta aula? Esta acción no se puede deshacer.")) {
      return;
    }

    const aulas = obtenerDatos(CLAVE_AULAS);
    const aulasRestantes = [];

    for (let i = 0; i < aulas.length; i++) {
      if (aulas[i].id !== id) {
        aulasRestantes.push(aulas[i]);
      }
    }

    guardarDatos(CLAVE_AULAS, aulasRestantes);

    alert("Aula eliminada correctamente.");
    formulario.reset();
    actualizarSelects();
  });
}

function registrarConsultaAula() {
  const formulario = document.querySelector("#info_aula form");

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombreBuscado = document.getElementById("nombre_info_aula").value.toLowerCase();
    const edificioBuscado = document.getElementById("edificio_info_aula").value.toLowerCase();
    const plantaBuscada = document.getElementById("planta_info_aula").value;

    const aulas = obtenerDatos(CLAVE_AULAS);
    const resultados = [];

    for (let i = 0; i < aulas.length; i++) {
      const aula = aulas[i];
      const coincideNombre = nombreBuscado === "" || aula.nombre.toLowerCase().includes(nombreBuscado);
      const coincideEdificio = edificioBuscado === "" || aula.edificio.toLowerCase().includes(edificioBuscado);
      const coincidePlanta = plantaBuscada === "" || String(aula.planta) === plantaBuscada;

      if (coincideNombre && coincideEdificio && coincidePlanta) {
        resultados.push(aula);
      }
    }

    mostrarResultadosConsulta(resultados);
  });
}

function mostrarResultadosConsulta(aulas) {
  const contenedor = document.getElementById("resultados_info_aula");
  if (!contenedor) {
    return;
  }

  if (aulas.length === 0) {
    contenedor.innerHTML = "<p>No se han encontrado aulas con esos criterios.</p>";
    return;
  }

  let filas = "";
  for (let i = 0; i < aulas.length; i++) {
    const aula = aulas[i];
    filas += "<tr><td>" + aula.id + "</td><td>" + aula.nombre + "</td><td>" + aula.edificio + "</td><td>" + aula.planta + "</td><td>" + aula.capacidad + "</td><td>" + aula.estado + "</td></tr>";
  }

  contenedor.innerHTML = "<table><thead><tr><th>ID</th><th>Nombre</th><th>Edificio</th><th>Planta</th><th>Capacidad</th><th>Estado</th></tr></thead><tbody>" + filas + "</tbody></table>";
}

function validarAula(aula) {
  if (!aula.nombre || !aula.edificio || !aula.planta || !aula.capacidad || !aula.equipamiento || !aula.estado) {
    alert("Todos los campos son obligatorios.");
    return false;
  }
  if (aula.capacidad <= 0) {
    alert("La capacidad debe ser mayor que 0.");
    return false;
  }
  return true;
}