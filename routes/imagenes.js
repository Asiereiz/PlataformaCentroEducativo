import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CARPETA_IMG = path.join(__dirname, "..", "public", "img");

const EXTENSIONES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

function crearUpload(carpeta) {
  const destino = path.join(CARPETA_IMG, carpeta);
  fs.mkdirSync(destino, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, destino),
      filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXTENSIONES[file.mimetype])
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (EXTENSIONES[file.mimetype]) {
        return cb(null, true);
      }
      cb(new Error("Solo se permiten imágenes jpg, png o webp."));
    }
  });
}

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
      res.status(400).json({ error: mensaje });
    });
  };
}

export function rutaFoto(req) {
  return req.file
    ? `img/${path.basename(req.file.destination)}/${req.file.filename}`
    : null;
}

const SUBIDA = /^img\/(cursos|docentes)\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function borrarSubida(ruta) {
  if (typeof ruta === "string" && SUBIDA.test(ruta)) {
    fs.unlink(path.join(CARPETA_IMG, ruta.slice("img/".length)), () => {});
  }
}
