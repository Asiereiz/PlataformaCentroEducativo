
document.addEventListener("DOMContentLoaded", () => {
    console.log("JavaScript funcionando");

    // Inicializar las funcionalidades de cada página.
    inicializarCursos();
    inicializarDocentes();
    inicializarAulas();
    inicializarUsuarios();
    inicializarMatriculas();
});

function inicializarCursos() {
    const paginaCursos = document.getElementById("alta_curso");

    // Si no estamos en la página de cursos, no hacemos nada.
    if (!paginaCursos) {
        return;
    }

    console.log("Página de gestión de cursos detectada");

    validarFormularioCursos();
}

function validarFormularioCursos() {
    const formulario = document.querySelector("#alta_curso form");

    if (!formulario) {
        return;
    }

    const fechaInicio = formulario.querySelector(
        '[name="Fecha_inicio"]'
    );

    const fechaFin = formulario.querySelector(
        '[name="Fecha_finalizacion"]'
    );

    const plazas = formulario.querySelector(
        '[name="Max_plazas"]'
    );

    // La fecha final no puede ser anterior a la inicial.
    function validarFechas() {
        if (fechaInicio.value && fechaFin.value) {
            fechaFin.setCustomValidity(
                fechaFin.value < fechaInicio.value
                    ? "La fecha final no puede ser anterior a la inicial."
                    : ""
            );
        }
    }

    fechaInicio.addEventListener("change", validarFechas);
    fechaFin.addEventListener("change", validarFechas);

    // Debe existir al menos una plaza.
    plazas.min = "1";
}

function inicializarDocentes() {
    // Aquí añadiremos la gestión de docentes.
}

function inicializarAulas() {
    // Aquí añadiremos la gestión de aulas.
}

function inicializarUsuarios() {
    // Aquí añadiremos la gestión de usuarios.
}

function inicializarMatriculas() {
    // Aquí añadiremos la gestión de matrículas.
}