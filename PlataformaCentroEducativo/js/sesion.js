document.addEventListener("DOMContentLoaded", () => {
    
    inicializarDatos();
    mostrarSesion();
    saludo();

    const registro = document.getElementById("formregistro");
    if(registro){
        registro.addEventListener("submit", registrarUsuario)
    }

    const login = document.getElementById("formlogin");
    if(login){
        login.addEventListener("submit", iniciarSesion)
    }

    const btnCerrarSesion = document.getElementById("cerrarSesion");
    if(btnCerrarSesion){
        btnCerrarSesion.addEventListener("click", cerrarSesion)
    }

    document.querySelectorAll(".logout").forEach(enlace => {
        enlace.addEventListener("click", () => {
        sessionStorage.removeItem("tipoUsuario");
        sessionStorage.removeItem("loggeado");
        sessionStorage.removeItem("usuarioActual");
        sessionStorage.removeItem("correoActual");
        });
    });

    const btnInicio = document.getElementById("botonInicio");
    if(btnInicio){
        btnInicio.addEventListener("click", irAlInicio);
    }

    const btntitInicio = document.getElementById("tituloInicio");
    if(btntitInicio){
        btntitInicio.addEventListener("click", irAlInicio);
    }
    
});

function guardarDatos(array, datos){
  localStorage.setItem(array, JSON.stringify(datos))
}

function leerDatos(array){
  const datos = JSON.parse(localStorage.getItem(array));
   if (datos === null) {
    return [];
   }
   return datos;
}

function inicializarDatos() {
  const usuariosExistentes = leerDatos(DATOS_USER);
  const docentesExistentes = leerDatos(DATOS_DOCENTES);
  const aulasExistentes = leerDatos(DATOS_AULAS);
  const cursosExistentes = leerDatos(DATOS_CURSOS);
  const matriculasExistentes = leerDatos(DATOS_MATRICULAS);
  const hayUsuariosNoIniciales = usuariosExistentes.some(usuario =>
    usuario.Correo !== "admin@centroeducativo.com"
  );

  if (usuariosExistentes.length > 1 || hayUsuariosNoIniciales || docentesExistentes.length > 0 ||
      aulasExistentes.length > 0 || cursosExistentes.length > 0 ||
      matriculasExistentes.length > 0) {
    if (usuariosExistentes.length === 0) {
      guardarDatos(DATOS_USER, [{
        id: 1,
        Nombre: "Admin",
        Primer_apellido: "Admin",
        Segundo_apellido: "Admin",
        Correo: "admin@centroeducativo.com",
        Contraseña: "admin",
        Confirmar_contraseña: "admin",
        rol: "admin",
        estado: "activo"
      }]);
    }
    return;
  }

  const admin = usuariosExistentes.find(usuario =>
    usuario.Correo === "admin@centroeducativo.com"
  ) || {
    id: 1,
    Nombre: "Admin",
    Primer_apellido: "Admin",
    Segundo_apellido: "Admin",
    Correo: "admin@centroeducativo.com",
    Contraseña: "admin",
    Confirmar_contraseña: "admin",
    rol: "admin",
    estado: "activo"
  };
  const fechaAlta = new Date().toLocaleDateString("es-ES");

  const usuarios = [admin,
    {
      id: 2, Nombre: "Ane", Primer_apellido: "Garcia", Segundo_apellido: "Lopez",
      Correo: "ane.garcia@centroeducativo.com", Contraseña: "alumno123",
      Confirmar_contraseña: "alumno123", rol: "alumno", Fecha_de_alta: fechaAlta,
      estado: "activo"
    },
    {
      id: 3, Nombre: "Iker", Primer_apellido: "Martinez", Segundo_apellido: "Ruiz",
      Correo: "iker.martinez@centroeducativo.com", Contraseña: "alumno123",
      Confirmar_contraseña: "alumno123", rol: "alumno", Fecha_de_alta: fechaAlta,
      estado: "activo"
    },
    {
      id: 4, Nombre: "Nerea", Primer_apellido: "Sanchez", Segundo_apellido: "Diaz",
      Correo: "nerea.sanchez@centroeducativo.com", Contraseña: "alumno123",
      Confirmar_contraseña: "alumno123", rol: "alumno", Fecha_de_alta: fechaAlta,
      estado: "activo"
    },
    {
      id: 5, Nombre: "Unai", Primer_apellido: "Perez", Segundo_apellido: "Martin",
      Correo: "unai.perez@centroeducativo.com", Contraseña: "alumno123",
      Confirmar_contraseña: "alumno123", rol: "alumno", Fecha_de_alta: fechaAlta,
      estado: "activo"
    },
    {
      id: 6, Nombre: "Ainhoa", Primer_apellido: "Torres", Segundo_apellido: "Ibarra",
      Correo: "ainhoa.torres@centroeducativo.com", Contraseña: "alumno123",
      Confirmar_contraseña: "alumno123", rol: "alumno", Fecha_de_alta: fechaAlta,
      estado: "activo"
    }
  ];

  const docentes = [
    {
      id: 1, Nombre: "Marta", Primer_apellido: "Lopez", Segundo_apellido: "Sanz",
      Correo: "marta.lopez@centroeducativo.com", Especialidad: "Matematicas",
      Telefono: "600000001", Fotografia: "", estado: "activo"
    },
    {
      id: 2, Nombre: "Jon", Primer_apellido: "Garcia", Segundo_apellido: "Gil",
      Correo: "jon.garcia@centroeducativo.com", Especialidad: "Informatica",
      Telefono: "600000002", Fotografia: "", estado: "activo"
    },
    {
      id: 3, Nombre: "Leire", Primer_apellido: "Martin", Segundo_apellido: "Vega",
      Correo: "leire.martin@centroeducativo.com", Especialidad: "Historia",
      Telefono: "600000003", Fotografia: "", estado: "activo"
    },
    {
      id: 4, Nombre: "Aitor", Primer_apellido: "Ruiz", Segundo_apellido: "Cano",
      Correo: "aitor.ruiz@centroeducativo.com", Especialidad: "Ingles",
      Telefono: "600000004", Fotografia: "", estado: "activo"
    },
    {
      id: 5, Nombre: "June", Primer_apellido: "Diaz", Segundo_apellido: "Mora",
      Correo: "june.diaz@centroeducativo.com", Especialidad: "Biologia",
      Telefono: "600000005", Fotografia: "", estado: "activo"
    }
  ];

  const aulas = [
    { id: 1, nombre: "Aula 1", edificio: "Principal", planta: "0", capacidad: "25", equipamiento: "Proyector", estado: "activo" },
    { id: 2, nombre: "Aula 2", edificio: "Principal", planta: "1", capacidad: "20", equipamiento: "Pizarra digital", estado: "activo" },
    { id: 3, nombre: "Aula 3", edificio: "Anexo", planta: "0", capacidad: "30", equipamiento: "Ordenadores", estado: "activo" },
    { id: 4, nombre: "Aula 4", edificio: "Anexo", planta: "1", capacidad: "24", equipamiento: "Proyector", estado: "activo" },
    { id: 5, nombre: "Aula 5", edificio: "Principal", planta: "2", capacidad: "18", equipamiento: "Pizarra", estado: "activo" }
  ];

  const cursos = [
    {
      id: 1, nombre: "Matematicas basicas", descripcion: "Fundamentos de matematicas.",
      docente: "1", aula: "1", fecha_inicio: "2026-09-01", fecha_fin: "2027-06-30",
      horario: "Lunes 09:00", max_plazas: "25", foto: "", estado: "activo", plazas_ocupadas: 0
    },
    {
      id: 2, nombre: "Introduccion a la informatica", descripcion: "Conceptos iniciales de informatica.",
      docente: "2", aula: "2", fecha_inicio: "2026-09-01", fecha_fin: "2027-06-30",
      horario: "Martes 10:00", max_plazas: "20", foto: "", estado: "activo", plazas_ocupadas: 0
    },
    {
      id: 3, nombre: "Historia contemporanea", descripcion: "Principales procesos historicos contemporaneos.",
      docente: "3", aula: "3", fecha_inicio: "2026-09-01", fecha_fin: "2027-06-30",
      horario: "Miercoles 11:00", max_plazas: "30", foto: "", estado: "activo", plazas_ocupadas: 0
    },
    {
      id: 4, nombre: "Ingles intermedio", descripcion: "Practica de ingles de nivel intermedio.",
      docente: "4", aula: "4", fecha_inicio: "2026-09-01", fecha_fin: "2027-06-30",
      horario: "Jueves 12:00", max_plazas: "24", foto: "", estado: "activo", plazas_ocupadas: 0
    },
    {
      id: 5, nombre: "Biologia general", descripcion: "Conceptos fundamentales de biologia.",
      docente: "5", aula: "5", fecha_inicio: "2026-09-01", fecha_fin: "2027-06-30",
      horario: "Viernes 09:00", max_plazas: "18", foto: "", estado: "activo", plazas_ocupadas: 0
    }
  ];

  const matriculas = [
    { id: 1, alumno: "2", curso: "1", fecha_matricula: "2026-09-01", estado: "activo" },
    { id: 2, alumno: "3", curso: "2", fecha_matricula: "2026-09-01", estado: "activo" },
    { id: 3, alumno: "4", curso: "3", fecha_matricula: "2026-09-01", estado: "activo" },
    { id: 4, alumno: "5", curso: "4", fecha_matricula: "2026-09-01", estado: "activo" },
    { id: 5, alumno: "6", curso: "5", fecha_matricula: "2026-09-02", estado: "activo" }
  ];

  guardarDatos(DATOS_USER, usuarios);
  guardarDatos(DATOS_DOCENTES, docentes);
  guardarDatos(DATOS_AULAS, aulas);
  guardarDatos(DATOS_CURSOS, cursos);
  guardarDatos(DATOS_MATRICULAS, matriculas);
  updateSelect();
}

function registrarUsuario(event) {
  
  event.preventDefault();
  const user = {
    id: leerDatos(DATOS_USER).length + 1,
    Nombre: document.getElementById("Nombre").value.trim(),
    Primer_apellido: document.getElementById("Primer_apellido").value.trim(),
    Segundo_apellido: document.getElementById("Segundo_apellido").value.trim(),
    Correo: document.getElementById("Correo").value.trim(),
    Contraseña: document.getElementById("Contraseña").value.trim(),
    Confirmar_contraseña: document.getElementById("Confirmar_contraseña").value.trim(),
    rol: "alumno",
    estado: "activo"
  }

  const usuarios = leerDatos(DATOS_USER);
  usuarios.push(user);
  guardarDatos(DATOS_USER, usuarios);

}

function iniciarSesion(event) {
    event.preventDefault();

    const correo = document.getElementById("Correo").value.trim();
    const contraseña = document.getElementById("Contraseña").value.trim();
    
    const usuarios = leerDatos(DATOS_USER);
    const usuario = usuarios.find(u => u.Correo === correo && u.Contraseña === contraseña);

    if (!usuario) {
      alert("Correo o contraseña incorrectos.");
      return;
    }

    if(usuario.estado === "inactivo") {
      alert("Tu cuenta está inactiva. Por favor, contacta con el administrador.");
      return;
    }

    sessionStorage.setItem("usuarioActual", usuario.Nombre);
    sessionStorage.setItem("correoActual", usuario.Correo);

    if (usuario.Correo === "admin@centroeducativo.com" || usuario.rol === "admin") {
      sessionStorage.setItem("tipoUsuario", "admin");
    } else {
      sessionStorage.setItem("tipoUsuario", "alumno");
    }
    sessionStorage.setItem("loggeado", "true");
    window.location.href = "portal.html";

}

function mostrarSesion() {
  const tipoUsuario = sessionStorage.getItem("tipoUsuario");
  const sesionAdmin = document.querySelectorAll(".sesionAdmin");
  const sesionAlumno = document.querySelectorAll(".sesionAlumno");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const panelAdmin = document.getElementById("panel-administracion");

  document.querySelectorAll(".estado-sesion").forEach(el => {
    const visible = (tipoUsuario === "admin" && el.classList.contains("sesionAdmin")) ||
      (tipoUsuario === "alumno" && el.classList.contains("sesionAlumno"));
    el.classList.toggle("estado-sesion-visible", visible);
  });

  if (panelAdmin) {
    panelAdmin.classList.toggle("panel-administracion-oculto", tipoUsuario !== "admin");
  }

  if (tipoUsuario === "admin") {
    header.classList.add("header-admin");
    if (footer) footer.classList.add("footer-admin");
    sesionAdmin.forEach(el => el.hidden = false);
    sesionAlumno.forEach(el => el.hidden = true);
  } else if (tipoUsuario === "alumno") {
    header.classList.remove("header-admin");
    if (footer) footer.classList.remove("footer-admin");
    sesionAdmin.forEach(el => el.hidden = true);
    sesionAlumno.forEach(el => el.hidden = false);
  } else {
    header.classList.remove("header-admin");
    if (footer) footer.classList.remove("footer-admin");
    sesionAdmin.forEach(el => el.hidden = true);
    sesionAlumno.forEach(el => el.hidden = true);
  }
}

function cerrarSesion(){
  sessionStorage.removeItem("tipoUsuario");
  sessionStorage.removeItem("loggeado");
  sessionStorage.removeItem("usuarioActual");
  sessionStorage.removeItem("correoActual");
  window.location.href = "index.html";
}

function irAlInicio(event) {
    event.preventDefault();

    const logged = sessionStorage.getItem("loggeado");

    if(logged === "true"){
      window.location.href = "portal.html";
    }else{
      window.location.href = "index.html";
    }
}

function saludo(){
  const saludo = document.getElementById("saludo");
  const usuarioActual = sessionStorage.getItem("usuarioActual");

  if(saludo && usuarioActual){
    saludo.innerHTML = usuarioActual;
  }
}