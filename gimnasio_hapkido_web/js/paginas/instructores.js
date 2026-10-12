exigirSesion();
pintarNav('instructores');

function limpiarForm() {
    document.getElementById('formInstructor').reset();
    document.getElementById('idInstructor').value = '';
    document.getElementById('tituloForm').textContent = 'Registrar instructor';
    document.getElementById('btnGuardar').textContent = 'Guardar instructor';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    document.getElementById('clave').required = true;
    document.getElementById('ayudaClave').textContent = '';
    mostrarError(null);
}

function cargarParaEditar(id) {
    const i = DB.instructores.obtener(id);
    if (!i) return;
    document.getElementById('idInstructor').value = i.idInstructor;
    document.getElementById('nombre').value = i.nombre;
    document.getElementById('telefono').value = i.telefono || '';
    document.getElementById('grado').value = i.grado || '';
    document.getElementById('especialidad').value = i.especialidad || '';
    document.getElementById('usuario').value = i.usuario;
    document.getElementById('clave').value = '';
    document.getElementById('clave').required = false;
    document.getElementById('ayudaClave').textContent = 'Deja la contraseña en blanco para no cambiarla.';
    document.getElementById('activo').value = String(i.activo);
    document.getElementById('tituloForm').textContent = 'Editar instructor';
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    window.scrollTo(0, 0);
}
document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });

document.getElementById('formInstructor').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const idInstructor = document.getElementById('idInstructor').value;
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const usuario = document.getElementById('usuario').value.trim();
    const clave = document.getElementById('clave').value;

    let error = Validar.primerError(
        Validar.nombreValido(nombre, 'nombre'),
        Validar.telefonoOpcional(telefono, 'teléfono'),
        Validar.requerido(usuario, 'usuario')
    );
    if (!error) {
        const usuarioRepetido = DB.instructores.listar().some(i => i.usuario === usuario && String(i.idInstructor) !== idInstructor);
        if (usuarioRepetido) error = `Ya existe otro instructor con el usuario "${usuario}".`;
    }
    if (!error && !idInstructor && !clave) {
        error = 'La contraseña es obligatoria para un instructor nuevo.';
    }
    if (error) { mostrarError(error); return; }

    const registro = {
        idInstructor: idInstructor ? Number(idInstructor) : undefined,
        nombre: nombre.trim(),
        telefono: telefono,
        grado: document.getElementById('grado').value,
        especialidad: document.getElementById('especialidad').value,
        usuario: usuario,
        clave: clave ? clave : DB.instructores.obtener(idInstructor).clave,
        activo: document.getElementById('activo').value === 'true'
    };
    DB.instructores.guardar(registro);
    limpiarForm();
    pintarTabla();
});

function pintarTabla() {
    const lista = DB.instructores.listar().slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
    document.getElementById('tablaInstructores').innerHTML = lista.length ? lista.map(i => {
        const clases = DB.clases.listar().filter(c => c.idInstructor === i.idInstructor);
        const clasesTxt = clases.length
            ? clases.map(c => `${escaparHtml(c.nombre)} <span class="sub-dato">${escaparHtml((c.diaSemana || '') + ', ' + (c.horaInicio || '?') + ' - ' + (c.horaFin || '?'))}</span>`).join('<br>')
            : '<span class="sub-dato">Sin clases asignadas</span>';
        return `<tr>
            <td>${escaparHtml(i.nombre)}</td>
            <td>${escaparHtml(i.telefono || '--')}</td>
            <td>${escaparHtml(i.grado || '--')}</td>
            <td>${escaparHtml(i.especialidad || '--')}</td>
            <td>${clasesTxt}</td>
            <td>${i.activo ? '<span class="badge-activo">Activo</span>' : '<span class="badge-inactivo">Inactivo</span>'}</td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${i.idInstructor}">Editar</a></td>
            <td><button class="btn-eliminar" data-accion="eliminarInstructor" data-id="${i.idInstructor}">Eliminar</button></td>
        </tr>`;
    }).join('') : '<tr><td colspan="8">No hay instructores registrados.</td></tr>';
}

function eliminarInstructor(id) {
    const tieneClases = DB.clases.listar().some(c => c.idInstructor === Number(id));
    if (tieneClases) {
        mostrarError('No se puede eliminar: este instructor tiene clases asignadas. Reasígnalas primero desde el módulo de Clases.');
        window.scrollTo(0, 0);
        return;
    }
    if (!confirm('¿Eliminar a este instructor?')) return;
    DB.instructores.eliminar(id);
    pintarTabla();
}

pintarTabla();
