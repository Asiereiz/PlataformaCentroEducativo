document.addEventListener("DOMContentLoaded", () => {
    updateSelect();
});

let promesaCursosApi;
let promesaDocentesApi;
let promesaUsuariosApi;
let promesaAulasApi;

function updateSelect() {
    actualizarSelectoresUsuarios();
    actualizarSelectoresAulas();
    actualizarSelectoresCursos();
    actualizarSelectoresDocentes();
    actualizarSelectoresMatriculas();
}

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
      })
      .catch(error => {
        promesaCursosApi = null;
        throw error;
      });
  }

  return promesaCursosApi;
}

async function peticionApi(url, metodo = "GET", cuerpo) {
  const opciones = { method: metodo };
  if (cuerpo !== undefined) {
    opciones.headers = { "Content-Type": "application/json" };
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(url, opciones);
  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(resultado.error || `La petición terminó con HTTP ${respuesta.status}.`);
  }
  return resultado;
}

async function obtenerMatriculasApi(filtros = {}) {
  const parametros = new URLSearchParams(filtros).toString();
  const filas = await peticionApi("/api/matriculas" + (parametros ? "?" + parametros : ""));
  return filas.map(matricula => ({
    ...matricula,
    id: matricula.id_matricula,
    etiqueta: `${matricula.nombre_alumno} · ${matricula.nombre_curso}`
  }));
}

function obtenerUsuariosApi() {
  if (!promesaUsuariosApi) {
    promesaUsuariosApi = peticionApi("/api/usuarios")
      .then(filas => filas.map(usuario => ({ ...usuario, id: usuario.id_usuario })))
      .catch(error => {
        promesaUsuariosApi = null;
        throw error;
      });
  }

  return promesaUsuariosApi;
}

async function actualizarSelectoresMatriculas() {
  const selectoresMatriculas = ["id_mod_mat", "id_del_mat"];
  const selectoresAlumnos = ["alumno_alta_mat", "alumno_mod_mat", "alumno_info_mat"];
  const todos = [...selectoresMatriculas, ...selectoresAlumnos];

  if (!todos.some(id => document.getElementById(id))) {
    return;
  }

  try {
    const [matriculas, usuarios] = await Promise.all([
      obtenerMatriculasApi(),
      obtenerUsuariosApi()
    ]);
    const alumnos = usuarios.filter(usuario => usuario.rol === "alumno");

    selectoresMatriculas.forEach(id => actualizarOpciones(id, matriculas, "etiqueta"));
    selectoresAlumnos.forEach(id => actualizarOpciones(id, alumnos, "nombre", "Selecciona un alumno"));
  } catch (error) {
    console.error("No se pudieron cargar las matrículas ni los alumnos.", error);
    todos.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">No se pudieron cargar los datos</option>';
      }
    });
  }
}

function obtenerDocentesApi() {
  if (!promesaDocentesApi) {
    promesaDocentesApi = fetch("/api/docentes")
      .then(async respuesta => {
        if (!respuesta.ok) {
          throw new Error(`La petición terminó con HTTP ${respuesta.status}.`);
        }

        const filas = await respuesta.json();
        if (!Array.isArray(filas)) {
          throw new Error("La respuesta de /api/docentes no es una lista.");
        }

        return filas.map(docente => ({ ...docente, id: docente.id_docente }));
      })
      .catch(error => {
        promesaDocentesApi = null;
        throw error;
      });
  }

  return promesaDocentesApi;
}

async function actualizarSelectoresUsuarios() {
  const selectores = ["id_mod_user", "id_del_user", "id_info_user"];

  if (!selectores.some(id => document.getElementById(id))) {
    return;
  }

  try {
    const usuarios = await obtenerUsuariosApi();
    selectores.forEach(id => actualizarOpciones(id, usuarios, "nombre"));
  } catch (error) {
    console.error("No se pudieron cargar los usuarios para los selectores.", error);
    selectores.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">No se pudieron cargar los usuarios</option>';
      }
    });
  }
}

function obtenerAulasApi() {
  if (!promesaAulasApi) {
    promesaAulasApi = peticionApi("/api/aulas")
      .then(filas => filas.map(aula => ({ ...aula, id: aula.id_aula })))
      .catch(error => {
        promesaAulasApi = null;
        throw error;
      });
  }

  return promesaAulasApi;
}

async function actualizarSelectoresAulas() {
  const selectoresGestion = ["id_mod_aula", "id_del_aula", "id_info_aula"];
  const selectoresCursos = ["aula_alta_curso", "aula_mod_curso"];
  const todos = [...selectoresGestion, ...selectoresCursos];

  if (!todos.some(id => document.getElementById(id))) {
    return;
  }

  try {
    const aulas = await obtenerAulasApi();
    const activas = aulas.filter(aula => aula.estado === "activa");

    selectoresGestion.forEach(id => actualizarOpciones(id, aulas, "nombre"));
    selectoresCursos.forEach(id => actualizarOpciones(id, activas, "nombre", "Selecciona un aula"));
  } catch (error) {
    console.error("No se pudieron cargar las aulas para los selectores.", error);
    todos.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">No se pudieron cargar las aulas</option>';
      }
    });
  }
}

async function actualizarSelectoresDocentes() {
  const selectores = ["id_mod_doc", "id_del_doc", "id_info_doc", "docente_alta_curso", "docente_mod_curso"];

  if (!selectores.some(id => document.getElementById(id))) {
    return;
  }

  try {
    const docentes = await obtenerDocentesApi();
    selectores.forEach(id => actualizarOpciones(id, docentes, "nombre"));
  } catch (error) {
    console.error("No se pudieron cargar los docentes para los selectores.", error);
    selectores.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">No se pudieron cargar los docentes</option>';
      }
    });
  }
}

async function actualizarSelectoresCursos() {
  const selectores = [
    ["id_mod_curso", "nombre", "Selecciona un ID"],
    ["id_del_curso", "nombre", "Selecciona un ID"],
    ["id_info_curso", "nombre", "Selecciona un ID"],
    ["curso_matricula", "nombre", "Selecciona un curso"],
    ["curso_alta_mat", "nombre", "Selecciona un curso"],
    ["curso_mod_mat", "nombre", "Selecciona un curso"],
    ["curso_info_mat", "nombre", "Selecciona un curso"]
  ];

  try {
    const cursos = await obtenerCursosApi();
    selectores.forEach(([id, campo, texto]) => {
      const datos = id === "curso_matricula"
        ? cursos.filter(curso => String(curso.estado).toLowerCase() === "activo")
        : cursos;
      actualizarOpciones(id, datos, campo, texto);
    });
  } catch (error) {
    console.error("No se pudieron cargar los cursos para los selectores.", error);
    selectores.forEach(([id]) => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">No se pudieron cargar los cursos</option>';
      }
    });
  }
}

function actualizarOpciones(id, datos, campo, texto = "Selecciona un ID") {
  const select = document.getElementById(id);
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">${texto}</option>`;
  datos.forEach(dato => {
    select.innerHTML += `<option value="${dato.id}">${dato.id} - ${dato[campo]}</option>`;
  });
}

function rutaImagen(imagen) {
  if (typeof imagen !== "string") {
    return "";
  }
  if (imagen.startsWith("data:image/") || imagen.startsWith("/")) {
    return imagen;
  }
  return "/" + imagen.replace(/^(\.\.\/)+/, "");
}

function agregarImagen(tarjeta, fuenteImagen, textoAlternativo) {
  if (!esImagenValida(fuenteImagen)) {
    return;
  }

  const imagen = document.createElement("img");
  imagen.src = rutaImagen(fuenteImagen);
  imagen.alt = textoAlternativo;
  imagen.loading = "lazy";
  imagen.className = "imagen-tarjeta";
  tarjeta.appendChild(imagen);
}

function esImagenValida(imagen) {
  const ruta = rutaImagen(imagen);
  return ruta.startsWith("data:image/") ||
    /^\/img\/(?:(?:cursos|docentes|aulas|alumnos)\/)?[\w.-]+\.(?:png|jpe?g|webp|gif)$/i.test(ruta);
}
