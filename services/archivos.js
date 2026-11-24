import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_PUBLIC = path.join(__dirname, "..", "public");

// Borra una imagen subida con Multer (tema 5.2, apartado 7: "borrar archivos huérfanos").
// Solo borra archivos de public/uploads; las imágenes de public/images (las que
// vienen con el proyecto) no se tocan nunca.
export async function borrarSubida(rutaPublica) {
  if (typeof rutaPublica !== "string" || !/^\/uploads\/[\w.-]+$/.test(rutaPublica)) {
    return;
  }
  try {
    await fs.unlink(path.join(CARPETA_PUBLIC, rutaPublica));
  } catch (error) {
    if (error.code !== "ENOENT") console.error("No se pudo borrar", rutaPublica, error.message);
  }
}
