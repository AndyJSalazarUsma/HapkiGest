/* Utilidades compartidas por todas las paginas. */

/** Pinta el header + barra de sesion + menu de navegacion dentro de #layout-nav. */
function pintarNav(paginaActiva) {
    const sesion = obtenerSesion();
    const contenedor = document.getElementById('layout-nav');
    if (!contenedor) return;

    const enlaces = [
        { href: 'index.html', texto: 'Inicio', id: 'inicio' },
        { href: 'alumnos.html', texto: 'Alumnos', id: 'alumnos' },
        { href: 'instructores.html', texto: 'Instructores', id: 'instructores' },
        { href: 'clases.html', texto: 'Clases', id: 'clases' },
        { href: 'calendario.html', texto: 'Calendario', id: 'calendario' },
        { href: 'asistencias.html', texto: 'Asistencia', id: 'asistencias' },
        { href: 'pagos.html', texto: 'Mensualidades', id: 'pagos' },
        { href: 'examenes.html', texto: 'Exámenes', id: 'examenes' },
        { href: 'inventario.html', texto: 'Inventario', id: 'inventario' },
        { href: 'emergencias.html', texto: 'Emergencias', id: 'emergencias' }
    ];

    let html = '';
    if (sesion) {
        html += `<div class="barra-sesion">
            <span>👤 ${escaparHtml(sesion.nombre)}</span>
            <a href="#" data-accion="cerrarSesion">Cerrar sesión</a>
        </div>`;
    }
    html += '<nav>';
    enlaces.forEach(e => {
        const claseActiva = e.id === paginaActiva ? ' class="activo"' : '';
        html += `<a href="${e.href}"${claseActiva}>${e.texto}</a>`;
    });
    html += '</nav>';

    contenedor.innerHTML = html;
}

function escaparHtml(texto) {
    if (texto === null || texto === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(texto);
    return div.innerHTML;
}

function formatoMoneda(valor) {
    const numero = Number(valor) || 0;
    return '$' + numero.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

function hoyISO() {
    // Fecha local (toISOString devolveria la fecha UTC, que en la noche ya es "mañana")
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Calcula la edad en años a partir de una fecha de nacimiento en formato ISO (yyyy-mm-dd). */
function calcularEdad(fechaNacimientoISO) {
    if (!fechaNacimientoISO) return -1;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimientoISO + 'T00:00:00');
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

function esMenorDeEdad(fechaNacimientoISO) {
    const edad = calcularEdad(fechaNacimientoISO);
    return edad >= 0 && edad < 18;
}

/** Muestra un mensaje de error/aviso dentro del contenedor con id "mensaje-error". */
function mostrarError(texto) {
    const el = document.getElementById('mensaje-error');
    if (!el) {
        alert(texto);
        return;
    }
    if (!texto) {
        el.style.display = 'none';
        el.textContent = '';
        return;
    }
    el.style.display = 'block';
    el.textContent = '⚠ ' + texto;
}

function obtenerParametroUrl(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
}

function imprimirPagina() {
    window.print();
}

/* Delegacion de eventos: los botones/enlaces generados por JS llevan data-accion="nombreFuncion"
   y opcionalmente data-id="123". Asi el HTML no contiene JavaScript incrustado (onclick). */
document.addEventListener('click', function (ev) {
    const el = ev.target.closest('[data-accion]');
    if (!el) return;
    const fn = window[el.dataset.accion];
    if (typeof fn !== 'function') return;
    ev.preventDefault();
    if (el.dataset.id !== undefined) {
        fn(Number(el.dataset.id));
    } else {
        fn();
    }
});
