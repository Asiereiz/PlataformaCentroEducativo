import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import pool from "./db/mariadb.js";
import { configurarSesion, variablesDeVista } from "./middlewares/sesion.js";
import { leerPreferencias } from "./middlewares/preferencias.js";
import { noEncontrado, manejarErrores } from "./middlewares/errores.js";

import publicoRouter from "./routes/publico.web.js";
import portalRouter from "./routes/portal.web.js";
import adminRouter from "./routes/admin.web.js";
import cursosApi from "./routes/cursos.api.js";
import aulasApi from "./routes/aulas.api.js";
import docentesApi from "./routes/docentes.api.js";
import usuariosApi from "./routes/usuarios.api.js";
import matriculasApi from "./routes/matriculas.api.js";
import estadisticasApi from "./routes/estadisticas.api.js";

// ---------------------------------------------------------------------------
// app.js: punto de entrada. Configura la aplicación, registra los middlewares
// y monta las rutas (tema 5.2: "app.js actúa como punto de entrada; desde ahí
// se montan las rutas y se conecta toda la aplicación").
// ---------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Con módulos ES no existe __dirname: se calcula así
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.SESSION_SECRET) {
  console.warn("Aviso: no hay SESSION_SECRET en el archivo .env (se usa uno de prueba).");
}

// Motor de vistas EJS y carpeta donde están las plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Seguridad: Helmet añade cabeceras HTTP de protección (tema 5.2, apartado 8).
// Se quita "upgrade-insecure-requests" porque en desarrollo se usa http://localhost.
app.use(helmet({
  contentSecurityPolicy: { useDefaults: true, directives: { "upgrade-insecure-requests": null } }
}));

// Logging con Morgan: en la consola (formato "dev") y en logs/access.log (formato "combined")
fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
app.use(morgan("dev"));
app.use(morgan("combined", { stream: fs.createWriteStream(path.join(__dirname, "logs", "access.log"), { flags: "a" }) }));

// Las páginas ahora son vistas EJS (views/), no archivos .html. Si en public/ quedara algún
// .html antiguo del proyecto anterior, no se sirve (así nunca se ve una página vieja y rota).
app.use((req, res, next) => (req.path.endsWith(".html") ? noEncontrado(req, res) : next()));

// Recursos estáticos (css, js, images, uploads) desde la carpeta public/
app.use(express.static(path.join(__dirname, "public")));

// Datos de formularios HTML (req.body) y cuerpos JSON (Fetch y API REST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cookies y sesiones (después de los estáticos: las imágenes y el CSS no necesitan sesión)
app.use(cookieParser());
app.use(configurarSesion);
app.use(leerPreferencias);   // tema y tamaño de letra guardados en cookies
app.use(variablesDeVista);   // usuario, mensajes... disponibles en todas las vistas

// Comprueba que el servidor y la base de datos responden
app.get("/api/estado", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, baseDatos: "conectada" });
  } catch (err) {
    next(err);
  }
});

// API REST (devuelve JSON)
app.use("/api/cursos", cursosApi);
app.use("/api/aulas", aulasApi);
app.use("/api/docentes", docentesApi);
app.use("/api/usuarios", usuariosApi);
app.use("/api/matriculas", matriculasApi);
app.use("/api/estadisticas", estadisticasApi);

// Páginas web (devuelven HTML generado con EJS)
app.use("/", publicoRouter);
app.use("/", portalRouter);
app.use("/admin", adminRouter);

// Estos dos van siempre al final: 404 (nada ha respondido) y 500 (ha ocurrido un error)
app.use(noEncontrado);
app.use(manejarErrores);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  pool.query("SELECT 1")
    .then(() => console.log("Conectado a MariaDB"))
    .catch(err => console.error("No se pudo conectar a MariaDB:", err.message));
});
