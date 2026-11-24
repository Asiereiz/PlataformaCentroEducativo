// Preferencias de accesibilidad guardadas en COOKIES (tema 5.2, apartado 4:
// "recordar preferencias, p. ej. el tema"). Las lee cookie-parser (req.cookies).

export const TEMAS = ["claro", "oscuro", "contraste"];
export const TAMANOS = ["small", "medium", "large"];

// Calcula las clases que se pondrán en <body> (las del CSS: oscuro, contraste, large, small)
export function leerPreferencias(req, res, next) {
  const tema = TEMAS.includes(req.cookies?.tema) ? req.cookies.tema : "claro";
  const tamfuente = TAMANOS.includes(req.cookies?.tamfuente) ? req.cookies.tamfuente : "medium";

  res.locals.tema = tema;
  res.locals.tamfuente = tamfuente;
  res.locals.clasesBody = [
    tema !== "claro" ? tema : "",
    tamfuente !== "medium" ? tamfuente : ""
  ].filter(Boolean).join(" ");
  next();
}
