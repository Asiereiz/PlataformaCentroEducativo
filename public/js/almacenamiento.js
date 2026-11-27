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

function updateSelect() {
    const aulas = leerDatos(DATOS_AULAS);
    const docentes = leerDatos(DATOS_DOCENTES);
    const matriculas = leerDatos(DATOS_MATRICULAS);
    const usuarios = leerDatos(DATOS_USER);

    actualizarOpciones("id_mod_aula", aulas, "nombre");
    actualizarOpciones("id_del_aula", aulas, "nombre");
    actualizarOpciones("id_info_aula", aulas, "nombre");
    actualizarOpciones("id_mod_doc", docentes, "Nombre");
    actualizarOpciones("id_del_doc", docentes, "Nombre");
    actualizarOpciones("id_info_doc", docentes, "Nombre");
    actualizarOpciones("id_mod_mat", matriculas, "alumno");
    actualizarOpciones("id_del_mat", matriculas, "alumno");
    actualizarOpciones("id_mod_user", usuarios, "Nombre");
    actualizarOpciones("id_del_user", usuarios, "Nombre");
    actualizarOpciones("id_info_user", usuarios, "Nombre");
    actualizarOpciones("docente_alta_curso", docentes, "Nombre");
    actualizarOpciones("docente_mod_curso", docentes, "Nombre");
    actualizarOpciones("aula_alta_curso", aulas.filter(aula => aula.estado === "activo"), "nombre", "Selecciona un aula");
    actualizarOpciones("aula_mod_curso", aulas.filter(aula => aula.estado === "activo"), "nombre", "Selecciona un aula");

    const alumnos = usuarios.filter(usuario =>
        usuario.rol === "alumno" ||
        (!usuario.rol && usuario.Correo !== "admin@centroeducativo.com")
    );
    actualizarOpciones("alumno_alta_mat", alumnos, "Nombre", "Selecciona un alumno");
    actualizarOpciones("alumno_mod_mat", alumnos, "Nombre", "Selecciona un alumno");
    actualizarOpciones("alumno_info_mat", alumnos, "Nombre", "Selecciona un alumno");
    actualizarSelectoresCursos();
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