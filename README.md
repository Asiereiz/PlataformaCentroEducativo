# Portal Centro Educativo

Aplicación web con **Node.js + Express.js**, vistas **EJS**, **sesiones**, base de datos **MariaDB** y una **API REST**.
Sigue la estructura y las técnicas de los temas 5.1 (Node.js), 5.2 (Express.js) y 5.3 (API REST).

## Cómo ponerlo en marcha

1. **Base de datos** (una vez; ¡borra y recrea las tablas!):

   ```
   mariadb -u root -p < db/schema.sql
   ```

2. **Configuración**: copia `.env.example` como `.env` y pon tu usuario y contraseña de MariaDB.
3. **Dependencias**: `npm install`
4. **Arrancar**: `npm start` (o `npm run dev` para que se reinicie solo al guardar cambios) y abrir <http://localhost:3000>.

Usuarios de ejemplo: `admin@centroeducativo.com` / `admin` (administrador) y
`ane.garcia@centroeducativo.com` / `alumno123` (alumna).

## Estructura (como en los apuntes)

```
app.js                 punto de entrada: configura Express, middlewares y monta las rutas
package.json           "type": "module" (import / export), scripts start y dev
.env                   configuración (puerto, MariaDB, secreto de sesión) -> NO se sube a git
db/
  mariadb.js           pool de conexiones a MariaDB
  schema.sql           tablas y datos de ejemplo
routes/                capa de rutas (reciben la petición y responden)
  publico.web.js       /, /login, /registro, /logout
  portal.web.js        /portal, /cursos, /docentes, /mis-matriculas, /perfil, /accesibilidad, /contacto
  admin.web.js         /admin/... (configuración de las páginas de gestión)
  gestion.web.js       fábrica de las rutas de gestión (alta, modificar, eliminar)
  *.api.js             API REST (JSON): cursos, aulas, docentes, usuarios, matriculas, estadisticas
services/              capa de servicio: lógica de negocio y consultas SQL parametrizadas
middlewares/
  sesion.js            express-session, rutas protegidas (requiereLogin, requiereAdmin)
  validaciones.js      reglas de express-validator (formularios y API)
  subida.js            Multer: subida de imágenes a public/uploads
  preferencias.js      tema y tamaño de letra guardados en cookies
  errores.js           404 y 500
views/                 plantillas EJS (partials/header, partials/footer, ...)
public/
  css/ js/ images/     recursos estáticos
  uploads/             imágenes subidas por los usuarios
```

Flujo de una petición: **navegador → ruta → servicio → db/mariadb.js → MariaDB** y de vuelta
(HTML con `res.render()` o JSON con `res.json()`).

## Qué se usa de cada tema

| Tema | En el proyecto |
|------|----------------|
| 5.1 Node.js | módulos ES, `package.json` con scripts `start` y `dev` (`node --watch`), `.env` |
| 5.2 Express | rutas con `Router()`, middlewares, `req.params/query/body`, EJS con `include`, formularios POST |
| 5.2 Cookies y sesiones | `express-session` (login, `req.session.usuario`, logout) y cookies (`tema`, `tamfuente`) |
| 5.2 Validación y errores | `express-validator`, vista con errores sin perder los datos, middlewares 404 y 500 |
| 5.2 MariaDB | pool de conexiones, consultas parametrizadas, CRUD, capas ruta → servicio → datos |
| 5.2 Imágenes | Multer: archivos en `public/uploads`, en la BD solo la ruta; solo jpg/png/webp y máximo 2 MB |
| 5.2 Integración | Morgan (`logs/access.log`), Helmet, dotenv, `.gitignore` |
| 5.3 API REST | recursos en plural, GET/POST/PUT/DELETE, códigos 200/201/204/400/401/403/404/409/500, errores `{ error, details }`, filtros, orden y paginación, uso con Fetch |

## Dos formas de mostrar los datos (tema 5.3)

* **Ruta web** → devuelve HTML: p. ej. `/docentes` consulta MariaDB y `res.render("docentes", { docentes })`.
* **Ruta API** → devuelve JSON: p. ej. `GET /api/cursos`. La página `/cursos` lo pide con **Fetch**,
  recibe el JSON y lo muestra (también se enseña el JSON recibido, desplegable "Respuesta JSON").

## API REST

| Método | URL | Qué hace | Acceso |
|--------|-----|----------|--------|
| GET | `/api/cursos` | lista (`?estado=activo&docente=2&sort=-nombre&page=1&limit=3`) | público |
| GET | `/api/cursos/:id` | un curso | público |
| POST / PUT / DELETE | `/api/cursos[/:id]` | crear (201), reemplazar (200), baja lógica (204) | administrador |
| GET | `/api/docentes[/:id]` | consultar | con sesión |
| POST / PUT / DELETE | `/api/docentes[/:id]` | gestionar | administrador |
| GET / POST / PUT / DELETE | `/api/aulas`, `/api/usuarios` | gestionar | administrador |
| GET | `/api/matriculas` | las matrículas (un alumno solo ve las suyas) | con sesión |
| POST / PUT / DELETE | `/api/matriculas[/:id]` | gestionar | administrador |
| GET | `/api/estadisticas` | indicadores del panel | administrador |
| GET | `/api/estado` | comprueba servidor y base de datos | público |

Errores: `{ "error": "Datos no válidos", "details": ["El campo nombre es obligatorio"] }`.
Las bajas son **lógicas**: el registro pasa a `inactivo`, no se borra.
Para probar la API con sesión de administrador, inicia sesión en el navegador y usa la consola (F12):
`await (await fetch("/api/usuarios")).json()`.

## Notas

* Las contraseñas se guardan con hash (scrypt), nunca en claro.
* El almacén de sesiones es el de memoria (válido para prácticas): al reiniciar el servidor hay que volver a iniciar sesión.
* "Importar fichero JSON" (admin) es una página vacía, como en el proyecto original.
