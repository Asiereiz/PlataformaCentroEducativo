console.log("JavaScript funcionando");

document.addEventListener("DOMContentLoaded", () => {

    inicializarCursos();

});


function inicializarCursos() {

    // Buscamos el formulario de alta de cursos
    const formularioAlta = document.getElementById("alta_curso");

    // Si no existe, significa que esta página no tiene
    // el formulario de alta de cursos.
    if (!formularioAlta) {
        return;
    }

    console.log("Formulario de cursos encontrado");

    formularioAlta.addEventListener("submit", registrarCurso);

}


function registrarCurso(event) {

    // Evita que el formulario recargue la página
    event.preventDefault();

    console.log("Registrando curso...");

}

