exigirSesion();
pintarNav('alumnos');

const inputFecha = document.getElementById('fechaNacimiento');
const bloqueAcudiente = document.getElementById('bloqueAcudiente');
const inputAcudienteNombre = document.getElementById('acudienteNombre');
const inputAcudienteTelefono = document.getElementById('acudienteTelefono');

function actualizarBloqueAcudiente() {
    const esMenor = inputFecha.value && esMenorDeEdad(inputFecha.value);
    bloqueAcudiente.classList.toggle('acudiente-oculto', !esMenor);
    inputAcudienteNombre.required = !!esMenor;
    inputAcudienteTelefono.required = !!esMenor;
}
inputFecha.addEventListener('change', actualizarBloqueAcudiente);

function limpiarForm() {
    document.getElementById('formAlumno').reset();
    document.getElementById('idAlumno').value = '';
    document.getElementById('tituloForm').textContent = 'Registrar alumno nuevo';
    document.getElementById('btnGuardar').textContent = 'Guardar alumno';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    actualizarBloqueAcudiente();
    mostrarError(null);
}

function cargarParaEditar(id) {
    const a = DB.alumnos.obtener(id);
    if (!a) return;
    document.getElementById('idAlumno').value = a.idAlumno;
    document.getElementById('nombre').value = a.nombre;
    document.getElementById('telefono').value = a.telefono || '';
    document.getElementById('fechaNacimiento').value = a.fechaNacimiento || '';
    document.getElementById('cinturon').value = a.cinturon;
    document.getElementById('activo').value = String(a.activo);
    document.getElementById('acudienteNombre').value = a.acudienteNombre || '';
    document.getElementById('acudienteTelefono').value = a.acudienteTelefono || '';
    if (a.acudienteParentesco) document.getElementById('acudienteParentesco').value = a.acudienteParentesco;
    actualizarBloqueAcudiente();
    document.getElementById('tituloForm').textContent = 'Editar alumno';
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    window.scrollTo(0, 0);
}

document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });

document.getElementById('formAlumno').addEventListener('submit', function (ev) {
    ev.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value || null;
    const acudienteNombre = document.getElementById('acudienteNombre').value;
    const acudienteTelefono = document.getElementById('acudienteTelefono').value;

    let error = Validar.primerError(
        Validar.nombreValido(nombre, 'nombre'),
        Validar.telefonoOpcional(telefono, 'teléfono'),
        Validar.fechaNoFutura(fechaNacimiento, 'fecha de nacimiento'),
        Validar.telefonoOpcional(acudienteTelefono, 'teléfono del acudiente')
    );
    if (!error && esMenorDeEdad(fechaNacimiento) && (!acudienteNombre || !acudienteTelefono)) {
        error = 'El alumno es menor de edad: el nombre y teléfono del acudiente son obligatorios.';
    }
    if (error) { mostrarError(error); return; }

    const idAlumno = document.getElementById('idAlumno').value;
    const alumno = {
        idAlumno: idAlumno ? Number(idAlumno) : undefined,
        nombre: nombre.trim(),
        telefono: telefono,
        fechaNacimiento: fechaNacimiento,
        fechaIngreso: idAlumno ? DB.alumnos.obtener(idAlumno).fechaIngreso : hoyISO(),
        cinturon: document.getElementById('cinturon').value,
        activo: document.getElementById('activo').value === 'true',
        acudienteNombre: acudienteNombre || null,
        acudienteTelefono: acudienteTelefono || null,
        acudienteParentesco: document.getElementById('acudienteParentesco').value || null
    };
    DB.alumnos.guardar(alumno);
    limpiarForm();
    pintarTabla();
});

function pintarTabla() {
    const texto = document.getElementById('buscar').value.trim().toLowerCase();
    const filtroEstado = document.getElementById('filtroEstado').value;

    let lista = DB.alumnos.listar();
    if (texto) lista = lista.filter(a => a.nombre.toLowerCase().includes(texto));
    if (filtroEstado !== 'todos') lista = lista.filter(a => String(a.activo) === filtroEstado);
    lista = lista.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));

    document.getElementById('tablaAlumnos').innerHTML = lista.length ? lista.map(a => {
        const edad = calcularEdad(a.fechaNacimiento);
        const edadTxt = edad >= 0 ? `${edad} años ${esMenorDeEdad(a.fechaNacimiento) ? '<span class="badge-menor">Menor</span>' : '<span class="badge-mayor">Mayor</span>'}` : '--';
        return `<tr>
            <td>${escaparHtml(a.nombre)}</td>
            <td>${escaparHtml(a.telefono || '--')}</td>
            <td>${edadTxt}</td>
            <td>${escaparHtml(a.cinturon)}</td>
            <td>${a.activo ? '<span class="badge-activo">Activo</span>' : '<span class="badge-inactivo">Inactivo</span>'}</td>
            <td><a class="btn-ver" href="ficha-alumno.html?id=${a.idAlumno}">Ver ficha</a></td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${a.idAlumno}">Editar</a></td>
            <td><button class="btn-eliminar" data-accion="eliminarAlumno" data-id="${a.idAlumno}">Eliminar</button></td>
        </tr>`;
    }).join('') : '<tr><td colspan="8">No hay alumnos que coincidan con el filtro.</td></tr>';
}

function eliminarAlumno(id) {
    if (!confirm('¿Eliminar a este alumno? Esto también borrará sus pagos, exámenes, asistencias y observaciones asociadas.')) return;
    const db = cargarDB();
    db.pagos = db.pagos.filter(p => p.idAlumno !== Number(id));
    db.examenes = db.examenes.filter(e => e.idAlumno !== Number(id));
    db.asistencias = db.asistencias.filter(a => a.idAlumno !== Number(id));
    db.observaciones = db.observaciones.filter(o => o.idAlumno !== Number(id));
    db.matriculas = db.matriculas.filter(m => m.idAlumno !== Number(id));
    db.ventas = db.ventas.filter(v => v.idAlumno !== Number(id));
    guardarDB(db);
    DB.alumnos.eliminar(id);
    pintarTabla();
}

document.getElementById('formBuscar').addEventListener('submit', (ev) => { ev.preventDefault(); pintarTabla(); });
document.getElementById('filtroEstado').addEventListener('change', pintarTabla);

pintarTabla();
