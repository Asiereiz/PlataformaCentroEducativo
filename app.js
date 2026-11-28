import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import estadoRouter from "./routes/estados.api.js";
import cursosRouter from "./routes/cursos.api.js";
import docentesRouter from "./routes/docentes.api.js";
import usuariosRouter from "./routes/usuarios.api.js";
import matriculasRouter from "./routes/matriculas.api.js";
import aulasRouter from "./routes/aulas.api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const VIEWS_DIR = path.join(__dirname, "views");

app.use(express.json());

app.use("/api", estadoRouter);
app.use("/api/cursos", cursosRouter);
app.use("/api/docentes", docentesRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/matriculas", matriculasRouter);
app.use("/api/aulas", aulasRouter);

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.use(express.static(PUBLIC_DIR));
app.use(express.static(VIEWS_DIR));

app.use((req, res) => {
  const esRutaApi = req.path === "/api" || req.path.startsWith("/api/");
  if (esRutaApi) {
    return res.status(404).json({ ok: false, error: "Ruta de API no encontrada." });
  }
  res.status(404).type("html").send(
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>404 - Página no encontrada</title></head><body><h1>404</h1><p>Página no encontrada.</p><a href="/">Volver al inicio</a></body></html>'
  );
});

app.use((error, req, res, next) => {
  console.error("Error interno del servidor:", error);
  if (res.headersSent) {
    return next(error);
  }

  const esRutaApi = req.path === "/api" || req.path.startsWith("/api/");
  if (esRutaApi && error.type === "entity.parse.failed") {
    return res.status(400).json({ ok: false, error: "El cuerpo de la petición no es un JSON válido." });
  }
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