import { query } from "../db/mariadb.js";

// Los números del panel de administración, calculados con consultas SQL
export async function obtener() {
  const [cursos] = await query("SELECT COUNT(*) AS total FROM cursos WHERE estado = 'activo'");
  const [alumnos] = await query("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'alumno'");
  const [docentes] = await query("SELECT COUNT(*) AS total FROM docentes WHERE estado = 'activo'");
  const [aulas] = await query("SELECT COUNT(*) AS total FROM aulas");
  const [ocupadas] = await query(
    "SELECT COUNT(*) AS total FROM aulas a WHERE EXISTS (SELECT 1 FROM cursos c WHERE c.aula = a.id AND c.estado = 'activo')"
  );
  const topCursos = await query(
    `SELECT c.nombre, COUNT(m.id) AS total
     FROM cursos c
     LEFT JOIN matriculas m ON m.curso = c.id AND m.estado = 'activo'
     GROUP BY c.id, c.nombre
     ORDER BY total DESC, c.id
     LIMIT 3`
  );

  return {
    cursos_activos: cursos.total,
    alumnos: alumnos.total,
    docentes_activos: docentes.total,
    aulas_total: aulas.total,
    aulas_ocupadas: ocupadas.total,
    porcentaje_ocupacion: aulas.total === 0 ? 0 : Math.round((ocupadas.total / aulas.total) * 100),
    top_cursos: [...topCursos]
  };
}
