document.addEventListener("DOMContentLoaded", () => {

    mostrarEstadisticas();

});

async function mostrarEstadisticas() {
    const listado = document.getElementById("estadisticas");
    if (!listado) {
        return;
    }

    listado.textContent = "Cargando estadísticas...";

    let cursos, usuarios, docentes, aulas, matriculas;
    try {
        [cursos, usuarios, docentes, aulas, matriculas] = await Promise.all([
            obtenerCursosApi(),
            obtenerUsuariosApi(),
            obtenerDocentesApi(),
            obtenerAulasApi(),
            obtenerMatriculasApi({ estado: "activa" })
        ]);
    } catch (error) {
        console.error("No se pudieron cargar las estadísticas.", error);
        listado.textContent = "No se pudieron cargar las estadísticas. Comprueba la conexión con el servidor.";
        return;
    }

    const cursosActivos = cursos.filter(curso => curso.estado === "activo");
    const alumnos = usuarios.filter(usuario => usuario.rol === "alumno").length;
    const docentesActivos = docentes.filter(docente => Number(docente.activo) === 1).length;
    const ocupacion = calcularOcupacionAulas(aulas, cursosActivos);
    const topCursos = cursosConMasMatriculados(cursos, matriculas);

    const filasTopCursos = topCursos.map(curso => `<li>${curso.nombre}: ${curso.total} matriculados</li>`).join("");

    listado.innerHTML = `
        <p>Total de cursos activos: ${cursosActivos.length}</p>
        <p>Total de alumnos registrados: ${alumnos}</p>
        <p>Total de docentes activos: ${docentesActivos}</p>
        <p>Ocupación de aulas: ${ocupacion.ocupadas} / ${ocupacion.total} (${ocupacion.porcentaje}%)</p>
        <ul>${filasTopCursos}</ul>
    `;

}

function calcularOcupacionAulas(aulas, cursosActivos) {
    const aulasActivas = aulas.filter(aula => aula.estado === "activa");

    const ocupadas = aulasActivas.filter(aula =>
        cursosActivos.some(curso => String(curso.aula) === String(aula.id))
    );

    const porcentaje = aulasActivas.length === 0 ? 0 : Math.round((ocupadas.length / aulasActivas.length) * 100);

    return { ocupadas: ocupadas.length, total: aulasActivas.length, porcentaje };
}

function cursosConMasMatriculados(cursos, matriculas) {
    const conteo = cursos.map(curso => ({
        nombre: curso.nombre,
        total: matriculas.filter(m => String(m.id_curso) === String(curso.id_curso)).length
    }));

    const top3 = conteo.sort((a, b) => b.total - a.total).slice(0, 3);

    return top3;
}
