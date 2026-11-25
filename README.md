# PlataformaWebCentroEducativo

## Iniciar la aplicación

En Windows PowerShell, desde la carpeta raíz del proyecto, crea `.env` a partir de `.env.example`, completa los datos de conexión a MariaDB e instala las dependencias:

```powershell
Copy-Item .env.example .env
npm.cmd install
```

Inicia el servidor:

```powershell
npm.cmd start
```

Abre `http://localhost:3000`. La ruta principal redirige a `index.html`; la página consulta `/api/estado` mediante Fetch y muestra el mensaje recibido en JSON.

Las páginas HTML están en `views` (incluidas las páginas de administración en `views/admin`). Los recursos estáticos, como CSS, JavaScript e imágenes, están en `public`.

Las rutas no encontradas muestran un error 404. Los errores internos muestran un error 500; las respuestas de `/api` se envían en JSON y los errores internos se registran en la consola del servidor.

La ruta `GET /api/db/estado` comprueba la conexión a MariaDB con `SELECT 1`.

La API `/api/cursos` lee y administra cursos en MariaDB: `GET` lista, `POST` crea, `PUT /api/cursos/:id` modifica y `PATCH /api/cursos/:id` desactiva un curso (`estado: "inactivo"`). Las operaciones de alta, modificación, consulta y desactivación de cursos usan la base de datos; los selectores de cursos también cargan sus opciones desde la API.

El catálogo y las búsquedas de `cursos.html` consultan esa ruta mediante Fetch. Las peticiones JSON admiten cuerpos de hasta 10 MB, incluida la imagen codificada.
