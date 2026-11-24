// Pequeños comportamientos de formularios (la política de seguridad de la página
// no permite escribir JavaScript dentro del HTML, por eso están aquí).

// <form data-confirmar="¿Seguro?"> pide confirmación antes de enviar.
// Si el texto contiene {opcion}, se sustituye por la opción elegida en el primer desplegable.
document.querySelectorAll("form[data-confirmar]").forEach(formulario => {
  formulario.addEventListener("submit", evento => {
    let mensaje = formulario.dataset.confirmar;
    const select = formulario.querySelector("select");
    if (select && select.selectedIndex >= 0) {
      mensaje = mensaje.replace("{opcion}", select.options[select.selectedIndex].textContent.trim());
    }
    if (!confirm(mensaje)) {
      evento.preventDefault();
    }
  });
});

// <select data-autoenviar> envía su formulario en cuanto cambia el valor
document.querySelectorAll("select[data-autoenviar]").forEach(select => {
  select.addEventListener("change", () => select.form.submit());
});
