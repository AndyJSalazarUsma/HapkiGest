exigirSesion();
pintarNav('asistencias');

const selectClase = document.getElementById('idClase');
const inputFecha = document.getElementById('fecha');
inputFecha.value = hoyISO();
inputFecha.max = hoyISO();

function cargarClases() {
    const clases = DB.clases.listar();
    selectClase.innerHTML = clases.length
        ? clases.map(c => `<option value="${c.idClase}">${escaparHtml(c.nombre)} (${escaparHtml(c.diaSemana || '')})</option>`).join('')
        : '<option value="">-- No hay clases creadas --</option>';
}
cargarClases();

function pintarChecklist() {
    const idClase = selectClase.value;
    const btnGuardar = document.getElementById('btnGuardarAsistencia');
    if (!idClase) {
        document.getElementById('listaAsistencia').innerHTML = '<p class="sub-dato">Primero crea una clase en el módulo "Clases".</p>';
        btnGuardar.style.display = 'none';
        return;
    }
    const alumnos = DB.alumnosDeClase(idClase);
    if (!alumnos.length) {
        document.getElementById('listaAsistencia').innerHTML = '<p class="sub-dato">Esta clase todavía no tiene alumnos matriculados (ve a "Clases" → Alumnos).</p>';
        btnGuardar.style.display = 'none';
        return;
    }
    const existentes = DB.asistenciasDeClaseEnFecha(idClase, inputFecha.value);
    const mapaExistentes = {};
    existentes.forEach(e => mapaExistentes[e.idAlumno] = e);

    document.getElementById('listaAsistencia').innerHTML = `
        <table>
            <thead><tr><th>Alumno</th><th>Presente</th><th>Ausente</th><th>Observación</th></tr></thead>
            <tbody>
                ${alumnos.map(a => {
                    const previo = mapaExistentes[a.idAlumno];
                    const presente = previo ? previo.presente : true;
                    return `<tr data-alumno="${a.idAlumno}">
                        <td>${escaparHtml(a.nombre)}</td>
                        <td style="text-align:center;"><input type="radio" name="estado-${a.idAlumno}" value="presente" ${presente ? 'checked' : ''}></td>
                        <td style="text-align:center;"><input type="radio" name="estado-${a.idAlumno}" value="ausente" ${!presente ? 'checked' : ''}></td>
                        <td><input type="text" class="obs-asistencia" maxlength="255" placeholder="Opcional" value="${escaparHtml(previo ? previo.observacion : '')}"></td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;
    btnGuardar.style.display = 'inline-block';
}

selectClase.addEventListener('change', pintarChecklist);
inputFecha.addEventListener('change', pintarChecklist);
pintarChecklist();

document.getElementById('btnGuardarAsistencia').addEventListener('click', function () {
    const idClase = selectClase.value;
    const fecha = inputFecha.value;
    if (!idClase || !fecha) { mostrarError('Selecciona una clase y una fecha.'); return; }

    const filas = document.querySelectorAll('#listaAsistencia tr[data-alumno]');
    const registros = Array.from(filas).map(fila => {
        const idAlumno = fila.getAttribute('data-alumno');
        const presente = fila.querySelector(`input[name="estado-${idAlumno}"]:checked`).value === 'presente';
        const observacion = fila.querySelector('.obs-asistencia').value;
        return { idAlumno, presente, observacion };
    });

    DB.registrarAsistenciaMasiva(idClase, fecha, registros);
    mostrarError(null);
    alert('Asistencia guardada correctamente.');
    pintarUltimas();
});

function pintarUltimas() {
    const todas = cargarDB().asistencias.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 20);
    document.getElementById('tablaUltimas').innerHTML = todas.length
        ? todas.map(a => `<tr>
            <td>${a.fecha}</td>
            <td>${escaparHtml(DB.nombreClase(a.idClase))}</td>
            <td>${escaparHtml(DB.nombreAlumno(a.idAlumno))}</td>
            <td>${a.presente ? '<span class="badge-activo">Presente</span>' : '<span class="badge-inactivo">Ausente</span>'}</td>
          </tr>`).join('')
        : '<tr><td colspan="4">Sin registros todavía.</td></tr>';
}
pintarUltimas();
