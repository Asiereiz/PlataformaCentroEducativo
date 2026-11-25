document.addEventListener("DOMContentLoaded", () => {

    mostrarEstadisticas();

});

function mostrarEstadisticas() {
    const cursos = leerDatos(DATOS_CURSOS).filter(curso => curso.estado === "activo").length;
    const usuarios = leerDatos(DATOS_USER).filter(usuario => usuario.rol === "alumno").length;
    const docentes = leerDatos(DATOS_DOCENTES).filter(docente => docente.estado === "activo").length;
    const ocupacion = calcularOcupacionAulas();
    const topCursos = cursosConMasMatriculados();

    const listado = document.getElementById("estadisticas");
    if (!listado) {
        return;
    }

    const filasTopCursos = topCursos.map(curso => `<li>${curso.nombre}: ${curso.total} matriculados</li>`).join("");

    listado.innerHTML = `
        <p>Total de cursos activos: ${cursos}</p>
        <p>Total de alumnos registrados: ${usuarios}</p>
        <p>Total de docentes activos: ${docentes}</p>
        <p>Ocupación de aulas: ${ocupacion.ocupadas} / ${ocupacion.total} (${ocupacion.porcentaje}%)</p>
        <ul>${filasTopCursos}</ul>
    `;

}

function calcularOcupacionAulas() {
    const aulas = leerDatos(DATOS_AULAS);
    const cursos = leerDatos(DATOS_CURSOS).filter(curso => curso.estado === "activo");

    const ocupadas = aulas.filter(aula =>
        cursos.some(curso => String(curso.aula) === String(aula.id))
    );

    const porcentaje = aulas.length === 0 ? 0 : Math.round((ocupadas.length / aulas.length) * 100);

    return { ocupadas: ocupadas.length, total: aulas.length, porcentaje };
}

function cursosConMasMatriculados() {
    const cursos = leerDatos(DATOS_CURSOS);
    const matriculas = leerDatos(DATOS_MATRICULAS).filter(m => m.estado === "activo");

    const conteo = cursos.map(curso => ({
        nombre: curso.nombre,
        total: matriculas.filter(m => String(m.curso) === String(curso.id)).length
    }));

    const top3 = conteo.sort((a, b) => b.total - a.total).slice(0, 3);

    return top3;
}