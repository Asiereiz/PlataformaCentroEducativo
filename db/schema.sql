-- Base de datos de la Plataforma Centro Educativo
--
-- Ejecutar una vez (desde la raíz del repositorio):
--     mariadb -u root -p < db/schema.sql
--
-- ATENCIÓN: este script BORRA las tablas y las vuelve a crear con los datos
-- de ejemplo. Si lo ejecutas otra vez, se pierde lo que hubiera en ellas.
--
-- Usuarios de ejemplo:
--     admin@centroeducativo.com        contraseña: admin
--     ane.garcia@centroeducativo.com   contraseña: alumno123   (y los demás alumnos)

CREATE DATABASE IF NOT EXISTS centro_educativo
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE centro_educativo;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS aulas;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------- aulas
CREATE TABLE aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  edificio VARCHAR(100) NOT NULL,
  planta VARCHAR(20) NOT NULL,
  capacidad INT NOT NULL,
  equipamiento TEXT NOT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'
);

-- ------------------------------------------------------------- docentes
CREATE TABLE docentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  primer_apellido VARCHAR(100) NOT NULL,
  segundo_apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  especialidad VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  fotografia VARCHAR(255) NOT NULL DEFAULT '/images/usuario-predeterminado.jpg',
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'
);

-- ------------------------------------------------------------- usuarios
-- contrasena guarda un hash (scrypt), nunca la contraseña en claro.
-- fotografia / foto guardan solo la RUTA de la imagen (p. ej. /uploads/1700-foto.jpg);
-- el archivo está en public/uploads (tema 5.2, apartado 7).
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  primer_apellido VARCHAR(100) NOT NULL,
  segundo_apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'alumno') NOT NULL DEFAULT 'alumno',
  telefono VARCHAR(20),
  fecha_alta DATE NOT NULL,
  fotografia VARCHAR(255) NOT NULL DEFAULT '/images/usuario-predeterminado.jpg',
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'
);

-- --------------------------------------------------------------- cursos
CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  docente INT NOT NULL,
  aula INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  horario VARCHAR(50) NOT NULL,
  max_plazas INT NOT NULL,
  foto VARCHAR(255) NOT NULL DEFAULT '/images/curso-ucm.png',
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  FOREIGN KEY (docente) REFERENCES docentes(id),
  FOREIGN KEY (aula) REFERENCES aulas(id)
);

-- ----------------------------------------------------------- matriculas
CREATE TABLE matriculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno INT NOT NULL,
  curso INT NOT NULL,
  fecha_matricula DATE NOT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  FOREIGN KEY (alumno) REFERENCES usuarios(id),
  FOREIGN KEY (curso) REFERENCES cursos(id)
);

-- ------------------------------------------------------- datos de ejemplo
INSERT INTO aulas (id, nombre, edificio, planta, capacidad, equipamiento, estado) VALUES
  (1, 'Aula 1', 'Principal', '0', 25, 'Proyector', 'activo'),
  (2, 'Aula 2', 'Principal', '1', 20, 'Pizarra digital', 'activo'),
  (3, 'Aula 3', 'Anexo', '0', 30, 'Ordenadores', 'activo'),
  (4, 'Aula 4', 'Anexo', '1', 24, 'Proyector', 'activo'),
  (5, 'Aula 5', 'Principal', '2', 18, 'Pizarra', 'activo');

INSERT INTO docentes (id, nombre, primer_apellido, segundo_apellido, correo, especialidad, telefono, fotografia, estado) VALUES
  (1, 'Marta', 'Lopez', 'Sanz', 'marta.lopez@centroeducativo.com', 'Matematicas', '600000001', '/images/usuario-predeterminado.jpg', 'activo'),
  (2, 'Jon', 'Garcia', 'Gil', 'jon.garcia@centroeducativo.com', 'Informatica', '600000002', '/images/usuario-predeterminado.jpg', 'activo'),
  (3, 'Leire', 'Martin', 'Vega', 'leire.martin@centroeducativo.com', 'Historia', '600000003', '/images/usuario-predeterminado.jpg', 'activo'),
  (4, 'Aitor', 'Ruiz', 'Cano', 'aitor.ruiz@centroeducativo.com', 'Ingles', '600000004', '/images/usuario-predeterminado.jpg', 'activo'),
  (5, 'June', 'Diaz', 'Mora', 'june.diaz@centroeducativo.com', 'Biologia', '600000005', '/images/usuario-predeterminado.jpg', 'activo');

INSERT INTO usuarios (id, nombre, primer_apellido, segundo_apellido, correo, contrasena, rol, fecha_alta, fotografia, estado) VALUES
  (1, 'Admin', 'Admin', 'Admin', 'admin@centroeducativo.com', 'scrypt$116f0f30268e4176110fb326e3d30fb5$15ef6c31e7d35e8df1079891f897e222518b6153bca0e7fe697cda1045c31b772b0e14326b79d32865c2b91b36b84c87f1bd45345ffae2be63434322e3d5941f', 'admin', CURDATE(), '/images/usuario-predeterminado.jpg', 'activo'),
  (2, 'Ane', 'Garcia', 'Lopez', 'ane.garcia@centroeducativo.com', 'scrypt$d0e98b142deca27797c39c60e8a2df56$bee9b31043bcf9f8701b96205137ecafc61f7300e4657d445af71840b92dca3f39751a3a5d652cc15ef0229474697e35a5c43f9e4662c9bfd0a6c6777b110438', 'alumno', CURDATE(), '/images/usuario-predeterminado.jpg', 'activo'),
  (3, 'Iker', 'Martinez', 'Ruiz', 'iker.martinez@centroeducativo.com', 'scrypt$d0e98b142deca27797c39c60e8a2df56$bee9b31043bcf9f8701b96205137ecafc61f7300e4657d445af71840b92dca3f39751a3a5d652cc15ef0229474697e35a5c43f9e4662c9bfd0a6c6777b110438', 'alumno', CURDATE(), '/images/usuario-predeterminado.jpg', 'activo'),
  (4, 'Nerea', 'Sanchez', 'Diaz', 'nerea.sanchez@centroeducativo.com', 'scrypt$d0e98b142deca27797c39c60e8a2df56$bee9b31043bcf9f8701b96205137ecafc61f7300e4657d445af71840b92dca3f39751a3a5d652cc15ef0229474697e35a5c43f9e4662c9bfd0a6c6777b110438', 'alumno', CURDATE(), '/images/usuario-predeterminado.jpg', 'activo'),
  (5, 'Unai', 'Perez', 'Martin', 'unai.perez@centroeducativo.com', 'scrypt$d0e98b142deca27797c39c60e8a2df56$bee9b31043bcf9f8701b96205137ecafc61f7300e4657d445af71840b92dca3f39751a3a5d652cc15ef0229474697e35a5c43f9e4662c9bfd0a6c6777b110438', 'alumno', CURDATE(), '/images/usuario-predeterminado.jpg', 'activo'),
  (6, 'Ainhoa', 'Torres', 'Ibarra', 'ainhoa.torres@centroeducativo.com', 'scrypt$d0e98b142deca27797c39c60e8a2df56$bee9b31043bcf9f8701b96205137ecafc61f7300e4657d445af71840b92dca3f39751a3a5d652cc15ef0229474697e35a5c43f9e4662c9bfd0a6c6777b110438', 'alumno', CURDATE(), '/images/usuario-predeterminado.jpg', 'activo');

INSERT INTO cursos (id, nombre, descripcion, docente, aula, fecha_inicio, fecha_fin, horario, max_plazas, foto, estado) VALUES
  (1, 'Matematicas basicas', 'Fundamentos de matematicas.', 1, 1, '2026-09-01', '2027-06-30', 'Lunes 09:00', 25, '/images/curso-ucm.png', 'activo'),
  (2, 'Introduccion a la informatica', 'Conceptos iniciales de informatica.', 2, 2, '2026-09-01', '2027-06-30', 'Martes 10:00', 20, '/images/curso-ucm.png', 'activo'),
  (3, 'Historia contemporanea', 'Principales procesos historicos contemporaneos.', 3, 3, '2026-09-01', '2027-06-30', 'Miercoles 11:00', 30, '/images/curso-ucm.png', 'activo'),
  (4, 'Ingles intermedio', 'Practica de ingles de nivel intermedio.', 4, 4, '2026-09-01', '2027-06-30', 'Jueves 12:00', 24, '/images/curso-ucm.png', 'activo'),
  (5, 'Biologia general', 'Conceptos fundamentales de biologia.', 5, 5, '2026-09-01', '2027-06-30', 'Viernes 09:00', 18, '/images/curso-ucm.png', 'activo');

INSERT INTO matriculas (id, alumno, curso, fecha_matricula, estado) VALUES
  (1, 2, 1, '2026-09-01', 'activo'),
  (2, 3, 2, '2026-09-01', 'activo'),
  (3, 4, 3, '2026-09-01', 'activo'),
  (4, 5, 4, '2026-09-01', 'activo'),
  (5, 6, 5, '2026-09-02', 'activo');
