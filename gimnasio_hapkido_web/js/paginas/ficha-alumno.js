const sesion = exigirSesion();
pintarNav('alumnos');

const idAlumno = Number(obtenerParametroUrl('id'));
const alumno = DB.alumnos.obtener(idAlumno);

if (!alumno) {
    document.querySelector('.contenido').innerHTML = '<div class="aviso" style="display:block;">Ese alumno no existe o fue eliminado.</div><p><a href="alumnos.html">← Volver</a></p>';
} else {
    document.getElementById('nombreAlumno').textContent = alumno.nombre;
    const edad = calcularEdad(alumno.fechaNacimiento);
    document.getElementById('datosAlumno').innerHTML = `
        Teléfono: ${escaparHtml(alumno.telefono || '--')} &nbsp;|&nbsp;
        Edad: ${edad >= 0 ? edad + ' años' : '--'} &nbsp;|&nbsp;
        Cinturón actual: <strong>${escaparHtml(alumno.cinturon)}</strong> &nbsp;|&nbsp;
        Estado: ${alumno.activo ? '<span class="badge-activo">Activo</span>' : '<span class="badge-inactivo">Inactivo</span>'}
    `;

    const grados = DB.examenesDeAlumno(idAlumno);
    document.getElementById('tablaGrados').innerHTML = grados.length
        ? grados.map(g => `<tr><td>${g.fechaPago}</td><td>${escaparHtml(g.cinturonNuevo)}</td><td>${formatoMoneda(g.monto)}</td></tr>`).join('')
        : '<tr><td colspan="3">Sin exámenes de cinturón registrados todavía.</td></tr>';

    const asistencias = DB.asistenciasDeAlumno(idAlumno);
    document.getElementById('tablaAsistencia').innerHTML = asistencias.length
        ? asistencias.map(a => `<tr>
            <td>${a.fecha}</td>
            <td>${escaparHtml(DB.nombreClase(a.idClase))}</td>
            <td>${a.presente ? '<span class="badge-activo">Presente</span>' : '<span class="badge-inactivo">Ausente</span>'}</td>
            <td>${escaparHtml(a.observacion || '--')}</td>
          </tr>`).join('')
        : '<tr><td colspan="4">Sin asistencias registradas todavía.</td></tr>';

    function pintarObservaciones() {
        const observaciones = DB.observacionesDeAlumno(idAlumno);
        document.getElementById('listaObservaciones').innerHTML = observaciones.length
            ? observaciones.map(o => `<li>
                <strong>${o.fecha}</strong> — ${escaparHtml(DB.nombreInstructor(o.idInstructor))}
                <button class="btn-eliminar" style="float:right;" data-accion="eliminarObservacion" data-id="${o.idObservacion}">Eliminar</button>
                <br>${escaparHtml(o.texto)}
              </li>`).join('')
            : '<li>Sin observaciones registradas todavía.</li>';
    }
    pintarObservaciones();

    window.eliminarObservacion = function (idObservacion) {
        if (!confirm('¿Eliminar esta observación?')) return;
        DB.observaciones.eliminar(idObservacion);
        pintarObservaciones();
    };

    document.getElementById('formObservacion').addEventListener('submit', function (ev) {
        ev.preventDefault();
        const texto = document.getElementById('textoObservacion').value.trim();
        if (!texto) return;
        DB.observaciones.guardar({
            idAlumno: idAlumno,
            fecha: hoyISO(),
            idInstructor: sesion.idInstructor,
            texto: texto
        });
        document.getElementById('textoObservacion').value = '';
        pintarObservaciones();
    });
}
