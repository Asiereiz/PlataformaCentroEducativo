import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

// En módulos ES no existe __dirname: se construye a partir de import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Las imágenes viven en public/img, igual que las rutas del script SQL:
//   img/cursos/curso01.png, img/docentes/docente01.png...
const CARPETA_IMG = path.join(__dirname, "..", "public", "img");

// Tipos de imagen permitidos y la extensión con la que se guardan
const EXTENSIONES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

// Una instancia de Multer por subcarpeta ("cursos", "docentes"...)
function crearUpload(carpeta) {
  const destino = path.join(CARPETA_IMG, carpeta);
  fs.mkdirSync(destino, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, destino),
      // Nombre aleatorio: no se usa el nombre original del usuario
      filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXTENSIONES[file.mimetype])
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // máximo 2 MB
    fileFilter: (req, file, cb) => {
      if (EXTENSIONES[file.mimetype]) {
        return cb(null, true);
      }
      cb(new Error("Solo se permiten imágenes jpg, png o webp."));
    }
  });
}

// Middleware: se pone ANTES del manejador de la ruta.
// Uso: subirFoto("foto", "cursos")  -> guarda el archivo en public/img/cursos
// Deja el archivo en req.file y el resto de campos del formulario en req.body.
// Si la imagen no es válida, responde con un 400 en JSON.
export function subirFoto(campo, carpeta) {
  const middleware = crearUpload(carpeta).single(campo);
  return (req, res, next) => {
    middleware(req, res, error => {
      if (!error) {
        return next();
      }
      const mensaje = error.code === "LIMIT_FILE_SIZE"
        ? "La imagen supera los 2 MB."
        : error.message;
      res.status(400).json({ ok: false, error: mensaje });
    });
  };
}

// Ruta que se guarda en la base de datos, con el mismo formato que el script SQL:
// "img/cursos/xxxx.png" (o null si no se subió ninguna imagen)
export function rutaFoto(req) {
  return req.file
    ? `img/${path.basename(req.file.destination)}/${req.file.filename}`
    : null;
}

// Solo borra imágenes subidas por la aplicación (nombre aleatorio tipo UUID).
// NUNCA borra curso01.png, docente01.png... que vienen del script SQL.
const SUBIDA = /^img\/(cursos|docentes)\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function borrarSubida(ruta) {
  if (typeof ruta === "string" && SUBIDA.test(ruta)) {
    fs.unlink(path.join(CARPETA_IMG, ruta.slice("img/".length)), () => {});
  }
}
