exigirSesion();
pintarNav('emergencias');

function limpiarForm() {
    document.getElementById('formContacto').reset();
    document.getElementById('idContacto').value = '';
    document.getElementById('tituloForm').textContent = 'Agregar contacto de emergencia';
    document.getElementById('btnGuardar').textContent = 'Guardar contacto';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    mostrarError(null);
}

function cargarParaEditar(id) {
    const c = DB.contactos.obtener(id);
    if (!c) return;
    document.getElementById('idContacto').value = c.idContacto;
    document.getElementById('tipo').value = c.tipo;
    document.getElementById('nombre').value = c.nombre;
    document.getElementById('direccion').value = c.direccion || '';
    document.getElementById('telefono').value = c.telefono || '';
    document.getElementById('referencia').value = c.referencia || '';
    document.getElementById('notas').value = c.notas || '';
    document.getElementById('tituloForm').textContent = 'Editar contacto de emergencia';
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    window.scrollTo(0, 0);
}
document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });

document.getElementById('formContacto').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const error = Validar.primerError(Validar.requerido(nombre, 'nombre'), Validar.telefonoOpcional(telefono, 'teléfono'));
    if (error) { mostrarError(error); return; }

    const idContacto = document.getElementById('idContacto').value;
    DB.contactos.guardar({
        idContacto: idContacto ? Number(idContacto) : undefined,
        tipo: document.getElementById('tipo').value,
        nombre: nombre.trim(),
        direccion: document.getElementById('direccion').value,
        telefono: telefono,
        referencia: document.getElementById('referencia').value,
        notas: document.getElementById('notas').value
    });
    limpiarForm();
    pintarTabla();
});

function pintarTabla() {
    const contactos = DB.contactos.listar().slice().sort((a, b) => a.tipo.localeCompare(b.tipo));
    document.getElementById('tablaContactos').innerHTML = contactos.length ? contactos.map(c => `
        <tr>
            <td><span class="tipo-contacto">${escaparHtml(c.tipo)}</span></td>
            <td>${escaparHtml(c.nombre)}</td>
            <td>${escaparHtml(c.direccion || '--')}</td>
            <td><strong>${escaparHtml(c.telefono || '--')}</strong></td>
            <td>${escaparHtml(c.referencia || '--')}${c.notas ? '<span class="sub-dato">' + escaparHtml(c.notas) + '</span>' : ''}</td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${c.idContacto}">Editar</a></td>
            <td><button class="btn-eliminar" data-accion="eliminarContacto" data-id="${c.idContacto}">Eliminar</button></td>
        </tr>
    `).join('') : '<tr><td colspan="7">No hay contactos registrados todavía.</td></tr>';
}

function eliminarContacto(id) {
    if (!confirm('¿Eliminar este contacto?')) return;
    DB.contactos.eliminar(id);
    pintarTabla();
}

pintarTabla();
