document.addEventListener("DOMContentLoaded", () => {
    updateSelect();
});

const DATOS_USER = "datos_usuarios";
const DATOS_CURSOS = "datos_cursos";
const DATOS_AULAS = "datos_aulas";
const DATOS_DOCENTES = "datos_docentes";
const DATOS_MATRICULAS = "datos_matriculas";
const FOTOGRAFIA_PREDETERMINADA = "../img/usuario-predeterminado.jpg";
const IMAGEN_CURSO_PREDETERMINADA = "../img/curso-ucm.png";
let promesaCursosApi;
let promesaDocentesApi;
let promesaUsuariosApi;

function updateSelect() {
    const aulas = leerDatos(DATOS_AULAS);
    const usuarios = leerDatos(DATOS_USER);

    actualizarOpciones("id_mod_aula", aulas, "nombre");
    actualizarOpciones("id_del_aula", aulas, "nombre");
    actualizarOpciones("id_info_aula", aulas, "nombre");
    actualizarOpciones("id_mod_user", usuarios, "Nombre");
    actualizarOpciones("id_del_user", usuarios, "Nombre");
    actualizarOpciones("id_info_user", usuarios, "Nombre");
    actualizarOpciones("aula_alta_curso", aulas.filter(aula => aula.estado === "activo"), "nombre", "Selecciona un aula");
    actualizarOpciones("aula_mod_curso", aulas.filter(aula => aula.estado === "activo"), "nombre", "Selecciona un aula");

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

// Petición a la API con cuerpo JSON. Devuelve el JSON de la respuesta y,
// si el servidor responde con un error, lanza un Error con el texto de { error }.
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

// Matrículas de la API. Filtros opcionales: { usuario, curso, estado }
// No se guardan en memoria: cambian a menudo y se piden cada vez.
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

// Rellena los desplegables de la gestión de matrículas (admin) con datos de la API
async function actualizarSelectoresMatriculas() {
  const selectoresMatriculas = ["id_mod_mat", "id_del_mat"];
  const selectoresAlumnos = ["alumno_alta_mat", "alumno_mod_mat", "alumno_info_mat"];
  const todos = [...selectoresMatriculas, ...selectoresAlumnos];

  // Si la página no tiene ninguno de estos selectores, no hace falta pedir nada
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

async function actualizarSelectoresDocentes() {
  const selectores = ["id_mod_doc", "id_del_doc", "id_info_doc", "docente_alta_curso", "docente_mod_curso"];

  // Si la página no tiene ninguno de estos selectores, no hace falta pedir los docentes
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

function leerImagen(input) {
  const archivo = input.files[0];
  if (!archivo) {
    return Promise.resolve("");
  }

  if (!archivo.type.startsWith("image/")) {
    return Promise.reject(new Error("El archivo seleccionado no es una imagen."));
  }

  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === "string") {
        resolve(lector.result);
      } else {
        reject(new Error("No se pudo leer el contenido de la imagen."));
      }
    };
    lector.onerror = () => reject(lector.error || new Error("Error al leer la imagen."));
    lector.readAsDataURL(archivo);
  });
}

// La base de datos guarda rutas como "img/cursos/curso01.png" (sin "/" inicial).
// Se convierten en "/img/cursos/curso01.png" para que funcionen desde cualquier página,
// también desde las de /admin/ (acepta además "../img/..." y data:image antiguos).
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

function guardarDatosConImagen(clave, datos) {
  try {
    guardarDatos(clave, datos);
    return true;
  } catch (error) {
    if (error && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      alert("No se pudieron guardar los datos porque se ha alcanzado el espacio disponible. Prueba con una imagen de menor tamaño.");
      return false;
    }

    throw error;
  }
}