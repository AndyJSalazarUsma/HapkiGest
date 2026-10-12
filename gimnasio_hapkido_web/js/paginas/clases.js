exigirSesion();
pintarNav('clases');

const selectInstructor = document.getElementById('idInstructor');
function cargarInstructores() {
    const instructores = DB.instructores.listar().filter(i => i.activo);
    selectInstructor.innerHTML = instructores.map(i => `<option value="${i.idInstructor}">${escaparHtml(i.nombre)}</option>`).join('');
}
cargarInstructores();

function limpiarForm() {
    document.getElementById('formClase').reset();
    document.getElementById('idClase').value = '';
    document.getElementById('tituloForm').textContent = 'Crear clase';
    document.getElementById('btnGuardar').textContent = 'Guardar clase';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    mostrarError(null);
}

function cargarParaEditar(id) {
    const c = DB.clases.obtener(id);
    if (!c) return;
    document.getElementById('idClase').value = c.idClase;
    document.getElementById('nombre').value = c.nombre;
    document.getElementById('nivel').value = c.nivel || 'Principiantes';
    document.getElementById('idInstructor').value = c.idInstructor;
    document.getElementById('diaSemana').value = c.diaSemana || '';
    document.getElementById('horaInicio').value = c.horaInicio || '';
    document.getElementById('horaFin').value = c.horaFin || '';
    document.getElementById('tituloForm').textContent = 'Editar clase';
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    window.scrollTo(0, 0);
}
document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });

document.getElementById('formClase').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;

    const error = Validar.primerError(
        Validar.requerido(nombre, 'nombre'),
        Validar.ordenFechas(horaInicio, horaFin, 'hora de inicio', 'hora de fin')
    );
    if (error) { mostrarError(error); return; }

    const idClase = document.getElementById('idClase').value;
    DB.clases.guardar({
        idClase: idClase ? Number(idClase) : undefined,
        nombre: nombre.trim(),
        nivel: document.getElementById('nivel').value,
        idInstructor: Number(document.getElementById('idInstructor').value),
        diaSemana: document.getElementById('diaSemana').value,
        horaInicio: horaInicio,
        horaFin: horaFin
    });
    limpiarForm();
    pintarTabla();
});

function pintarTabla() {
    const lista = DB.clases.listar();
    document.getElementById('tablaClases').innerHTML = lista.length ? lista.map(c => {
        const alumnos = DB.alumnosDeClase(c.idClase);
        return `<tr>
            <td>${escaparHtml(c.nombre)}</td>
            <td>${escaparHtml(c.nivel || '--')}</td>
            <td>${escaparHtml(DB.nombreInstructor(c.idInstructor))}</td>
            <td>${escaparHtml(c.diaSemana || '')}<br><span class="sub-dato">${c.horaInicio} - ${c.horaFin}</span></td>
            <td>${alumnos.length} matriculado(s)</td>
            <td><a class="btn-ver" href="#" data-accion="abrirMatricula" data-id="${c.idClase}">Alumnos</a></td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${c.idClase}">Editar</a></td>
            <td><button class="btn-eliminar" data-accion="eliminarClase" data-id="${c.idClase}">Eliminar</button></td>
        </tr>`;
    }).join('') : '<tr><td colspan="8">No hay clases creadas todavía.</td></tr>';
}

function eliminarClase(id) {
    if (!confirm('¿Eliminar esta clase? También se borrará su matrícula y las asistencias registradas para ella.')) return;
    const db = cargarDB();
    db.matriculas = db.matriculas.filter(m => m.idClase !== Number(id));
    db.asistencias = db.asistencias.filter(a => a.idClase !== Number(id));
    guardarDB(db);
    DB.clases.eliminar(id);
    pintarTabla();
}

let claseMatriculaActual = null;
function abrirMatricula(idClase) {
    claseMatriculaActual = idClase;
    const clase = DB.clases.obtener(idClase);
    document.getElementById('tituloMatricula').textContent = `Alumnos de "${clase.nombre}"`;
    const idsMatriculados = DB.alumnosDeClase(idClase).map(a => a.idAlumno);
    const alumnosActivos = DB.alumnos.listar().filter(a => a.activo).sort((a, b) => a.nombre.localeCompare(b.nombre));
    document.getElementById('checklistAlumnos').innerHTML = alumnosActivos.map(a => `
        <label>
            <input type="checkbox" value="${a.idAlumno}" ${idsMatriculados.includes(a.idAlumno) ? 'checked' : ''}>
            ${escaparHtml(a.nombre)} <span class="sub-dato">(${escaparHtml(a.cinturon)})</span>
        </label>
    `).join('') || '<p class="sub-dato">No hay alumnos activos para matricular.</p>';
    document.getElementById('tarjetaMatricula').style.display = 'block';
    document.getElementById('tarjetaMatricula').scrollIntoView({ behavior: 'smooth' });
}
function cerrarMatricula() {
    document.getElementById('tarjetaMatricula').style.display = 'none';
    claseMatriculaActual = null;
}
document.getElementById('btnCerrarMatricula').addEventListener('click', function (ev) { ev.preventDefault(); cerrarMatricula(); });
document.getElementById('btnGuardarMatricula').addEventListener('click', function () {
    if (!claseMatriculaActual) return;
    const seleccionados = Array.from(document.querySelectorAll('#checklistAlumnos input[type=checkbox]:checked')).map(cb => Number(cb.value));
    const db = cargarDB();
    db.matriculas = db.matriculas.filter(m => m.idClase !== claseMatriculaActual);
    seleccionados.forEach(idAlumno => db.matriculas.push({ idClase: claseMatriculaActual, idAlumno }));
    guardarDB(db);
    cerrarMatricula();
    pintarTabla();
});

pintarTabla();
