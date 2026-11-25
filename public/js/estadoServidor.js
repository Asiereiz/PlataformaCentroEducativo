document.addEventListener("DOMContentLoaded", cargarEstadoServidor);

async function cargarEstadoServidor() {
  const estadoServidor = document.getElementById("estado-servidor");

  try {
    const respuesta = await fetch("/api/estado");
    if (!respuesta.ok) {
      throw new Error(`La petición terminó con HTTP ${respuesta.status}.`);
    }

    const datos = await respuesta.json();
    if (typeof datos.ok !== "boolean" || typeof datos.mensaje !== "string") {
      throw new Error("La respuesta del servidor no tiene el formato esperado.");
    }
    if (!datos.ok) {
      throw new Error(datos.mensaje);
    }

    estadoServidor.textContent = datos.mensaje;
    estadoServidor.dataset.estado = "conectado";
  } catch (error) {
    console.error("No se pudo consultar el estado del servidor.", error);
    estadoServidor.textContent = "No se pudo conectar con el servidor.";
    estadoServidor.dataset.estado = "error";
  }
}
