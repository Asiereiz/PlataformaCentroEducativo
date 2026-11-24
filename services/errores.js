// Error "esperado" de la aplicación: lleva el código HTTP que hay que devolver.
// Ejemplo: throw new ErrorApi(409, "Ya existe un usuario con ese correo");
export class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}
