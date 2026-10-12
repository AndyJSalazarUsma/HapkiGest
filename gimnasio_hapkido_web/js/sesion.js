/* Sesion del instructor logueado. Usa sessionStorage: se borra al cerrar la pestaña/navegador,
   o cuando el usuario hace click en "Cerrar sesion". Cada pagina (excepto login.html) llama a
   exigirSesion() apenas carga. */

const SESION_KEY = 'gimnasioHapkidoSesion';

function iniciarSesion(instructor) {
    sessionStorage.setItem(SESION_KEY, JSON.stringify({
        idInstructor: instructor.idInstructor,
        nombre: instructor.nombre
    }));
}

function obtenerSesion() {
    const crudo = sessionStorage.getItem(SESION_KEY);
    return crudo ? JSON.parse(crudo) : null;
}

function cerrarSesion() {
    sessionStorage.removeItem(SESION_KEY);
    window.location.href = 'login.html';
}

/** Llamar al inicio de cada pagina protegida. Si no hay sesion, redirige al login. */
function exigirSesion() {
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'login.html';
        return null;
    }
    return sesion;
}
