import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import estadoRouter from "./routes/estados.api.js";
import cursosRouter from "./routes/cursos.api.js";
import docentesRouter from "./routes/docentes.api.js";
import usuariosRouter from "./routes/usuarios.api.js";
import matriculasRouter from "./routes/matriculas.api.js";
import preferenciasRouter from "./routes/preferencias.api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const VIEWS_DIR = path.join(__dirname, "views");

app.use(express.json());

// Routers de la API
app.use("/api", estadoRouter);          // /api/estado y /api/db/estado
app.use("/api/cursos", cursosRouter);   // /api/cursos y /api/cursos/:id
app.use("/api/docentes", docentesRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/matriculas", matriculasRouter);
app.use("/api/preferencias", preferenciasRouter);

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.use(express.static(PUBLIC_DIR));
app.use(express.static(VIEWS_DIR));

// 404 (igual que el tuyo)
app.use((req, res) => {
  const esRutaApi = req.path === "/api" || req.path.startsWith("/api/");
  if (esRutaApi) {
    return res.status(404).json({ ok: false, error: "Ruta de API no encontrada." });
  }
  res.status(404).type("html").send(
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>404 - Página no encontrada</title></head><body><h1>404</h1><p>Página no encontrada.</p><a href="/">Volver al inicio</a></body></html>'
  );
});

// Manejador de errores (igual que el tuyo)
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
    return res.status(500).json({ ok: false, error: "Error interno del servidor." });
  }
  res.status(500).type("html").send(
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>500 - Error interno</title></head><body><h1>500</h1><p>Se ha producido un error interno. Inténtalo de nuevo más tarde.</p><a href="/">Volver al inicio</a></body></html>'
  );
});

app.listen(PORT, () => {
  console.log("Servidor en http://localhost:" + PORT);
});