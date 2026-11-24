// Páginas de gestión del administrador: usan Fetch contra la API REST (tema 5.3).
//   - Modificar: al elegir un identificador se pide GET /api/<recurso>/<id> y se rellena el formulario.
//   - Consultar: se pide GET /api/<recurso>/<id> y se muestran los datos recibidos.

// GET a la API. Si el servidor responde con un error, se lanza con el mensaje del JSON.
async function pedir(url) {
  const respuesta = await fetch(url, { headers: { Accept: "application/json" } });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || `Error ${respuesta.status}`);
  }
  return datos;
}

// ------------------------------------------------------------- modificar
document.querySelectorAll("form[id^='mod_']").forEach(formulario => {
  const selectId = formulario.querySelector("select[name='id']");

  selectId.addEventListener("change", async () => {
    if (!selectId.value) {
      return;
    }
    try {
      const datos = await pedir(`/api/${formulario.dataset.recurso}/${selectId.value}`);
      formulario.querySelectorAll("[data-campo]").forEach(campo => {
        const valor = datos[campo.dataset.campo];
        if (valor !== undefined) {
          campo.value = valor;
        }
      });
    } catch (error) {
      alert(error.message);
    }
  });
});

// -------------------------------------------------------------- consultar
document.querySelectorAll("form[id^='info_']").forEach(formulario => {
  const lista = formulario.parentElement.querySelector("ul");
  const etiquetas = JSON.parse(lista.dataset.etiquetas);

  formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    lista.textContent = "";

    try {
      let datos;
      const selectAlumno = formulario.querySelector("select[name='alumno']");

      if (selectAlumno) {
        // Matrículas: se consulta por alumno y curso
        const curso = formulario.querySelector("select[name='curso']").value;
        const matriculas = await pedir(`/api/matriculas?alumno=${selectAlumno.value}&curso=${curso}`);
        datos = matriculas.find(m => m.estado === "activo") || matriculas[0];
        if (!datos) {
          throw new Error("No se encontró una matrícula para ese alumno y curso.");
        }
      } else {
        datos = await pedir(`/api/${formulario.dataset.recurso}/${formulario.querySelector("select[name='id']").value}`);
      }

      Object.entries(etiquetas).forEach(([campo, etiqueta]) => {
        const elemento = document.createElement("li");
        elemento.textContent = `${etiqueta}: ${datos[campo]}`;
        lista.appendChild(elemento);
      });
    } catch (error) {
      const elemento = document.createElement("li");
      elemento.textContent = error.message;
      lista.appendChild(elemento);
    }
  });
});
