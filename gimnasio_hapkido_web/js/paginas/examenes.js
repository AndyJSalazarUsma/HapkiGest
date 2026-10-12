exigirSesion();
pintarNav('examenes');

function cargarAlumnos() {
    const alumnos = DB.alumnos.listar().filter(a => a.activo).sort((a, b) => a.nombre.localeCompare(b.nombre));
    document.getElementById('idAlumno').innerHTML = alumnos.map(a => `<option value="${a.idAlumno}">${escaparHtml(a.nombre)} (actual: ${escaparHtml(a.cinturon)})</option>`).join('');
}
cargarAlumnos();

function limpiarForm() {
    document.getElementById('formExamen').reset();
    document.getElementById('idExamen').value = '';
    document.getElementById('tituloForm').textContent = 'Registrar derecho de examen';
    document.getElementById('btnGuardar').textContent = 'Registrar pago de examen';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    document.getElementById('idAlumno').disabled = false;
    mostrarError(null);
}

function cargarParaEditar(id) {
    const e = DB.examenes.obtener(id);
    if (!e) return;
    document.getElementById('idExamen').value = e.idExamen;
    document.getElementById('idAlumno').value = e.idAlumno;
    document.getElementById('idAlumno').disabled = true;
    document.getElementById('cinturonNuevo').value = e.cinturonNuevo;
    document.getElementById('monto').value = e.monto;
    document.getElementById('tituloForm').textContent = `Editar examen de ${DB.nombreAlumno(e.idAlumno)}`;
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    window.scrollTo(0, 0);
}
document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });

document.getElementById('formExamen').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const monto = document.getElementById('monto').value;
    const cinturonNuevo = document.getElementById('cinturonNuevo').value;
    const error = Validar.primerError(Validar.montoPositivo(monto, 'monto'), Validar.requerido(cinturonNuevo, 'cinturón'));
    if (error) { mostrarError(error); return; }

    const idExamen = document.getElementById('idExamen').value;
    const idAlumno = Number(document.getElementById('idAlumno').value);

    if (idExamen) {
        const original = DB.examenes.obtener(idExamen);
        DB.examenes.guardar({ ...original, cinturonNuevo, monto: Number(monto) });
    } else {
        DB.examenes.guardar({ idAlumno, cinturonNuevo, monto: Number(monto), fechaPago: hoyISO() });
    }
    // Sube el cinturon actual del alumno para que quede consistente
    const alumno = DB.alumnos.obtener(idAlumno);
    alumno.cinturon = cinturonNuevo;
    DB.alumnos.guardar(alumno);

    limpiarForm();
    pintarTabla();
});

function pintarTabla() {
    const examenes = cargarDB().examenes.slice().sort((a, b) => b.fechaPago.localeCompare(a.fechaPago));
    document.getElementById('tablaExamenes').innerHTML = examenes.length ? examenes.map(e => `
        <tr>
            <td>${escaparHtml(DB.nombreAlumno(e.idAlumno))}</td>
            <td>${escaparHtml(e.cinturonNuevo)}</td>
            <td>${e.fechaPago}</td>
            <td>${formatoMoneda(e.monto)}</td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${e.idExamen}">Editar</a></td>
            <td><button class="btn-eliminar" data-accion="eliminarExamen" data-id="${e.idExamen}">Eliminar</button></td>
        </tr>
    `).join('') : '<tr><td colspan="6">Todavía no hay exámenes registrados.</td></tr>';
}

function eliminarExamen(id) {
    if (!confirm('¿Eliminar este examen? El cinturón actual del alumno no se revertirá automáticamente.')) return;
    DB.examenes.eliminar(id);
    pintarTabla();
}

pintarTabla();
