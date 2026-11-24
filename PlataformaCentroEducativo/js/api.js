async function api(url, metodo = "GET", datos) {
  const respuesta = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: datos ? JSON.stringify(datos) : undefined
  });
  if (respuesta.status === 204) return null;
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error || "Error del servidor");
  return cuerpo;
}