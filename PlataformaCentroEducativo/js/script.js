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

    // Obtenemos el formulario
    const formulario = event.target;

    // Creamos un objeto con los datos del curso
    const curso = {

        nombre: formulario.nombre_alta.value,

        descripcion: formulario.descripcion_alta.value,

        docente: formulario.docente_alta.value,

        aula: formulario.aula_alta.value,

        fechaInicio: formulario.fecha_inicio_alta.value,

        fechaFinalizacion: formulario.fecha_finalizacion_alta.value,

        horario: formulario.horario_alta.value,

        maxPlazas: formulario.max_plazas_alta.value,

        estado: formulario.estado_alta.value

    };

    console.log("Curso creado:");
    console.log(curso);

}



