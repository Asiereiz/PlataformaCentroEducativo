import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

// Las contraseñas NO se guardan tal cual en la base de datos:
// se guarda un "hash" (huella) que no se puede deshacer.
// Formato guardado:  scrypt$sal$hash

export async function hashear(contrasena) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = (await scrypt(contrasena, sal, 64)).toString("hex");
  return `scrypt$${sal}$${hash}`;
}

export async function comprobar(contrasena, guardada) {
  const partes = String(guardada || "").split("$");
  if (partes.length !== 3 || partes[0] !== "scrypt") {
    return false;
  }
  const esperado = Buffer.from(partes[2], "hex");
  const calculado = await scrypt(contrasena, partes[1], 64);
  return esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}
