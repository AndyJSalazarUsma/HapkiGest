exigirSesion();
pintarNav('pagos');

function cargarSelectAlumnos(id) {
    const alumnos = DB.alumnos.listar().filter(a => a.activo).sort((a, b) => a.nombre.localeCompare(b.nombre));
    document.getElementById(id).innerHTML = alumnos.map(a => `<option value="${a.idAlumno}">${escaparHtml(a.nombre)}</option>`).join('');
}
cargarSelectAlumnos('idAlumno');
cargarSelectAlumnos('filtroAlumnoHistorial');

function limpiarForm() {
    document.getElementById('formPago').reset();
    document.getElementById('idPago').value = '';
    document.getElementById('tituloForm').textContent = 'Registrar pago de mensualidad';
    document.getElementById('btnGuardar').textContent = 'Registrar pago';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    document.getElementById('bloqueAlumno').style.display = 'block';
    document.getElementById('bloqueFechas').style.display = 'none';
    document.getElementById('idAlumno').disabled = false;
    mostrarError(null);
}

function cargarParaEditar(idPago) {
    const p = DB.pagos.obtener(idPago);
    if (!p) return;
    document.getElementById('idPago').value = p.idPago;
    document.getElementById('monto').value = p.monto;
    document.getElementById('bloqueFechas').style.display = 'block';
    document.getElementById('fechaPago').value = p.fechaPago;
    document.getElementById('fechaVencimiento').value = p.fechaVencimiento;
    document.getElementById('tituloForm').textContent = `Editar pago de ${DB.nombreAlumno(p.idAlumno)}`;
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    document.getElementById('bloqueAlumno').style.display = 'none';
    window.scrollTo(0, 0);
}
document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });

document.getElementById('formPago').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const idPago = document.getElementById('idPago').value;
    const monto = document.getElementById('monto').value;

    if (idPago) {
        const fechaPago = document.getElementById('fechaPago').value;
        const fechaVencimiento = document.getElementById('fechaVencimiento').value;
        const error = Validar.primerError(
            Validar.montoPositivo(monto, 'monto'),
            Validar.requerido(fechaPago, 'fecha de pago'),
            Validar.requerido(fechaVencimiento, 'fecha de vencimiento'),
            Validar.fechaNoFutura(fechaPago, 'fecha de pago'),
            Validar.ordenFechas(fechaPago, fechaVencimiento, 'fecha de pago', 'fecha de vencimiento')
        );
        if (error) { mostrarError(error); return; }
        const original = DB.pagos.obtener(idPago);
        DB.pagos.guardar({ ...original, monto: Number(monto), fechaPago, fechaVencimiento });
    } else {
        const idAlumno = document.getElementById('idAlumno').value;
        const error = Validar.montoPositivo(monto, 'monto');
        if (error) { mostrarError(error); return; }
        const fechaPago = hoyISO();
        const fechaVenc = new Date();
        fechaVenc.setMonth(fechaVenc.getMonth() + 1);
        DB.pagos.guardar({
            idAlumno: Number(idAlumno),
            monto: Number(monto),
            fechaPago: fechaPago,
            fechaVencimiento: fechaVenc.toISOString().slice(0, 10)
        });
    }
    limpiarForm();
    pintarEstado();
    pintarHistorial();
});

function pintarEstado() {
    const estado = DB.estadoPagosAlumnos();
    document.getElementById('tablaEstado').innerHTML = estado.length ? estado.map(p => `
        <tr>
            <td>${escaparHtml(p.nombreAlumno)}</td>
            <td>${p.fechaPago}</td>
            <td>${p.fechaVencimiento}</td>
            <td>${p.estado === 'Al día' ? '<span class="estado-aldia">Al día</span>' : '<span class="estado-vencido">Vencido</span>'}</td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${p.idPago}">Editar</a></td>
            <td><button class="btn-eliminar" data-accion="eliminarPago" data-id="${p.idPago}">Eliminar</button></td>
        </tr>
    `).join('') : '<tr><td colspan="6">Todavía no hay pagos registrados.</td></tr>';
}

function eliminarPago(idPago) {
    if (!confirm('¿Eliminar este pago?')) return;
    DB.pagos.eliminar(idPago);
    pintarEstado();
    pintarHistorial();
}

function pintarHistorial() {
    const idAlumno = document.getElementById('filtroAlumnoHistorial').value;
    const pagos = idAlumno ? DB.pagosDeAlumno(idAlumno) : [];
    document.getElementById('tablaHistorial').innerHTML = pagos.length ? pagos.map(p => `
        <tr>
            <td>${p.fechaPago}</td>
            <td>${p.fechaVencimiento}</td>
            <td>${formatoMoneda(p.monto)}</td>
            <td><button class="btn-editar" data-accion="verComprobante" data-id="${p.idPago}">Ver comprobante</button></td>
        </tr>
    `).join('') : '<tr><td colspan="4">Este alumno no tiene pagos registrados.</td></tr>';
}
document.getElementById('filtroAlumnoHistorial').addEventListener('change', pintarHistorial);

window.verComprobante = function (idPago) {
    const p = DB.pagos.obtener(idPago);
    const alumno = DB.alumnos.obtener(p.idAlumno);
    const ventana = window.open('', '_blank', 'width=420,height=500');
    ventana.document.write(`
        <html><head><title>Comprobante de pago</title>
        <style>body{font-family:Arial,sans-serif;padding:24px;} h2{margin-top:0;} table{width:100%;border-collapse:collapse;} td{padding:6px 0;border-bottom:1px solid #eee;}</style>
        </head><body>
        <h2>🥋 Gimnasio de Hapkido</h2>
        <p>Comprobante de pago de mensualidad</p>
        <table>
            <tr><td><strong>Alumno</strong></td><td>${escaparHtml(alumno ? alumno.nombre : '--')}</td></tr>
            <tr><td><strong>Fecha de pago</strong></td><td>${p.fechaPago}</td></tr>
            <tr><td><strong>Vence</strong></td><td>${p.fechaVencimiento}</td></tr>
            <tr><td><strong>Monto</strong></td><td>${formatoMoneda(p.monto)}</td></tr>
            <tr><td><strong>N° de comprobante</strong></td><td>#${p.idPago}</td></tr>
        </table>
        <p style="margin-top:20px;"><button data-accion="imprimirPagina">Imprimir</button></p>
        </body></html>
    `);
};

pintarEstado();
pintarHistorial();
