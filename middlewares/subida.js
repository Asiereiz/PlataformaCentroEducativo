import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { borrarSubida } from "../services/archivos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_UPLOADS = path.join(__dirname, "..", "public", "uploads");

// ---------------------------------------------------------------------------
// Subida de imágenes con Multer (tema 5.2, apartado 7).
// - La imagen se guarda como archivo en public/uploads (almacenamiento en servidor).
// - En la base de datos solo se guarda la ruta (p. ej. /uploads/1700-123456.jpg).
// - Controles mínimos de seguridad: solo jpg/png/webp, máximo 2 MB, nombre
//   generado por nosotros (nunca el que manda el usuario) y comprobación de
//   que el contenido real del archivo es una imagen.
// ---------------------------------------------------------------------------
const EXTENSIONES = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAXIMO = 2 * 1024 * 1024; // 2 MB

// Multer no crea la carpeta de destino: nos aseguramos de que exista
await fs.mkdir(CARPETA_UPLOADS, { recursive: true });

class ErrorSubida extends Error {}

const storage = multer.diskStorage({
  destination: CARPETA_UPLOADS,
  filename: (req, file, cb) => {
    const unico = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unico + EXTENSIONES[file.mimetype]);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAXIMO, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONES[file.mimetype]) {
      return cb(null, true);
    }
    cb(new ErrorSubida("La imagen debe ser jpg, png o webp"));
  }
});

// El tipo MIME lo declara el navegador y se puede falsificar: se mira la "firma"
// (los primeros bytes) del archivo ya guardado.
async function esImagenReal(ruta) {
  const archivo = await fs.open(ruta, "r");
  try {
    const { buffer } = await archivo.read(Buffer.alloc(12), 0, 12, 0);
    const jpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const png = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const webp = buffer.subarray(0, 4).toString("latin1") === "RIFF" && buffer.subarray(8, 12).toString("latin1") === "WEBP";
    return jpg || png || webp;
  } finally {
    await archivo.close();
  }
}

// Middleware: recibe un archivo opcional en el campo indicado (upload.single).
// Si algo falla NO responde con error: deja el mensaje en req.errorSubida para
// que la validación lo muestre junto con el resto de errores del formulario.
// Si la petición no es multipart/form-data (p. ej. JSON), no hace nada.
export function subirFoto(campo = "foto") {
  const recibir = upload.single(campo);
  return (req, res, next) => {
    recibir(req, res, async (error) => {
      if (error) {
        req.errorSubida = error.code === "LIMIT_FILE_SIZE"
          ? "La imagen no puede pesar más de 2 MB"
          : error instanceof ErrorSubida ? error.message : "No se pudo recibir la imagen";
        return next();
      }
      if (req.file && !(await esImagenReal(req.file.path))) {
        await borrarSubida(rutaFoto(req));
        req.file = undefined;
        req.errorSubida = "El archivo no es una imagen válida (jpg, png o webp)";
      }
      next();
    });
  };
}

// Ruta pública de la imagen subida (la que se guarda en la base de datos)
export function rutaFoto(req) {
  return req.file ? `/uploads/${req.file.filename}` : undefined;
}

// Si la petición falla después de subir la imagen, se borra el archivo (no dejar huérfanos)
export async function descartarSubida(req) {
  await borrarSubida(rutaFoto(req));
}
