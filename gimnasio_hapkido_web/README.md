# Gimnasio de Hapkido (HTML + CSS + JavaScript)

Sistema de gestión de un gimnasio de Hapkido hecho solo con **HTML, CSS y JavaScript**.
No necesita Java, Tomcat, MySQL ni Maven.

## Cómo abrirlo en Visual Studio Code
1. Extrae el zip (clic derecho → *Extraer todo...*).
2. En VS Code: **File → Open Folder...** y elige la carpeta `gimnasio_hapkido_web`.
3. Instala la extensión **Live Server** (Ritwick Dey).
4. Clic derecho sobre `login.html` → **Open with Live Server**.

(También funciona haciendo doble clic en `login.html`, sin Live Server.)

**Usuario:** `instructor` — **Clave:** `hapkido123`

## Dónde se guardan los datos
En el `localStorage` del navegador. Esto significa:
- No hay que instalar ni configurar nada.
- Los datos son **por navegador y por computador**: si abres el sistema en otro equipo, verás los datos de ejemplo.
- Para reiniciar todo: F12 → Application → Local Storage → borrar `gimnasioHapkidoDB`.
- Las contraseñas están sin cifrar (no hay servidor). Es válido para una demo/proyecto académico, no para producción.

## Módulos incluidos (Fase 1)
| Módulo | Qué hace |
|---|---|
| Login | Inicio de sesión de instructor; protege todas las páginas |
| Alumnos | Alta/edición/eliminación, **activos/inactivos** con filtro, acudiente si es menor de edad |
| Ficha del alumno | **Historial de grados**, **historial de asistencia**, **observaciones** |
| Instructores | Datos, especialidad/grado, clases asignadas y horarios |
| Clases | Crear clases con nivel, instructor, horario y **lista de alumnos** (matrícula) |
| Asistencia | Registrar presente/ausente por clase y fecha |
| Mensualidades | Registrar pagos, estado al día/vencido, historial y **comprobante imprimible** |
| **Calendario** | Calendario mensual editable: agrega, edita y elimina eventos (seminarios, exámenes de grado, torneos, cierres…), con eventos de varios días y opción de mostrar las clases |
| Exámenes | Registro de exámenes; sube el cinturón del alumno |
| Inventario | Productos con marca, ventas y stock |
| Emergencias | Directorio de hospital, policía, bomberos, etc. |

## Pendiente (Fase 2)
Inscripción de alumnos y resultados en eventos, Reportes y estadísticas, Usuarios y permisos por rol
(Administrador/Instructor/Recepción/Alumno) y Configuración de la academia.

## Estructura
```
gimnasio_hapkido_web/
├── *.html          (solo estructura: NO contienen JavaScript, ni <script> incrustados ni onclick)
├── css/estilos.css
└── js/
    ├── db.js       (capa de datos sobre localStorage + datos de ejemplo)
    ├── sesion.js   (login/logout)
    ├── ui.js       (menú, formatos, utilidades, delegación de clics con data-accion)
    ├── validar.js  (validaciones de formularios)
    └── paginas/    (un archivo por página: index.js, alumnos.js, calendario.js, ...)
```
