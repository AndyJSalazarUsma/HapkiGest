// Si ya hay sesion activa, no tiene sentido mostrar el login de nuevo
if (obtenerSesion()) {
    window.location.href = 'index.html';
}

const USUARIO_EJEMPLO = 'instructor';
const CLAVE_EJEMPLO = 'hapkido123';

document.getElementById('formLogin').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const usuario = document.getElementById('usuario').value.trim().toLowerCase();
    const clave = document.getElementById('clave').value;

    const instructor = DB.instructores.listar()
        .find(i => (i.usuario || '').trim().toLowerCase() === usuario);

    if (!instructor || instructor.clave !== clave) {
        mostrarError('Usuario o clave incorrectos.');
        document.getElementById('recuperar').style.display = 'block';
        return;
    }
    if (!instructor.activo) {
        mostrarError('Este instructor está inactivo. Pídele al administrador que lo active.');
        document.getElementById('recuperar').style.display = 'block';
        return;
    }

    iniciarSesion(instructor);
    window.location.href = 'index.html';
});

/* Recuperacion de acceso: deja el usuario de ejemplo funcionando sin tocar alumnos, pagos, etc. */
document.getElementById('btnRestablecer').addEventListener('click', function () {
    if (!confirm('Se restablecerá el usuario "instructor" con la clave "hapkido123". No se borran otros datos. ¿Continuar?')) return;
    const existente = DB.instructores.listar()
        .find(i => (i.usuario || '').trim().toLowerCase() === USUARIO_EJEMPLO);
    if (existente) {
        existente.clave = CLAVE_EJEMPLO;
        existente.activo = true;
        DB.instructores.guardar(existente);
    } else {
        DB.instructores.guardar({
            nombre: 'Instructor Principal', telefono: '', grado: 'Cinturón Negro 3er Dan',
            especialidad: 'Hapkido tradicional', usuario: USUARIO_EJEMPLO, clave: CLAVE_EJEMPLO, activo: true
        });
    }
    document.getElementById('usuario').value = USUARIO_EJEMPLO;
    document.getElementById('clave').value = CLAVE_EJEMPLO;
    mostrarError(null);
    alert('Listo. Ya puedes entrar con instructor / hapkido123.');
});
