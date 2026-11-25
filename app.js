const express = require("express");
const path = require("path");
const { obtenerPool, verificarConexionMariaDB } = require("./database");

const app = express();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const VIEWS_DIR = path.join(__dirname, "views");

app.use(express.json());

app.get("/api/estado", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Conexión con el servidor establecida."
  });
});

app.get("/api/db/estado", async (req, res, next) => {
  try {
    await verificarConexionMariaDB();
    res.json({
      ok: true,
      mensaje: "Conexión con MariaDB establecida."
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/cursos", async (req, res, next) => {
  try {
    const cursos = await obtenerPool().query("SELECT * FROM cursos");
    res.json(cursos);
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.use(express.static(PUBLIC_DIR));
app.use(express.static(VIEWS_DIR));

app.use((req, res) => {
  const esRutaApi = req.path === "/api" || req.path.startsWith("/api/");
  if (esRutaApi) {
    return res.status(404).json({
      ok: false,
      error: "Ruta de API no encontrada."
    });
  }

  res.status(404).type("html").send(
    "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><title>404 - Página no encontrada</title></head><body><h1>404</h1><p>Página no encontrada.</p><a href=\"/\">Volver al inicio</a></body></html>"
  );
});

app.use((error, req, res, next) => {
  console.error("Error interno del servidor:", error);
  if (res.headersSent) {
    return next(error);
  }

  const esRutaApi = req.path === "/api" || req.path.startsWith("/api/");
  if (req.path === "/api/db/estado") {
    return res.status(503).json({
      ok: false,
      error: "No se pudo conectar con MariaDB. Comprueba la configuración local."
    });
  }

  if (esRutaApi) {
    return res.status(500).json({
      ok: false,
      error: "Error interno del servidor."
    });
  }

  res.status(500).type("html").send(
    "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><title>500 - Error interno</title></head><body><h1>500</h1><p>Se ha producido un error interno. Inténtalo de nuevo más tarde.</p><a href=\"/\">Volver al inicio</a></body></html>"
  );
});

app.listen(PORT, () => {
  console.log("Servidor en http://localhost:" + PORT);
});