/* Pagina: Calendario de eventos. Muestra un mes a la vez; los eventos se pueden crear, editar y eliminar. */
exigirSesion();
pintarNav('calendario');

const TIPOS_EVENTO = {
    'Seminario': 'ev-seminario',
    'Examen de grado': 'ev-examen',
    'Torneo': 'ev-torneo',
    'Evento social': 'ev-social',
    'Cierre / Feriado': 'ev-cierre',
    'Otro': 'ev-otro'
};
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const hoy = new Date();
let anioActual = hoy.getFullYear();
let mesActual = hoy.getMonth(); // 0-11

function aISO(anio, mes, dia) {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function formatoFecha(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return `${d} ${MESES[m - 1].slice(0, 3).toLowerCase()} ${a}`;
}

function horarioTexto(e) {
    if (e.horaInicio && e.horaFin) return `${e.horaInicio} - ${e.horaFin}`;
    if (e.horaInicio) return `Desde ${e.horaInicio}`;
    return 'Todo el día';
}

function rangoTexto(e) {
    const fin = e.fechaFin || e.fechaInicio;
    return fin === e.fechaInicio ? formatoFecha(e.fechaInicio) : `${formatoFecha(e.fechaInicio)} → ${formatoFecha(fin)}`;
}

// ---------- Inicializacion de controles ----------
document.getElementById('tipo').innerHTML = Object.keys(TIPOS_EVENTO)
    .map(t => `<option value="${t}">${t}</option>`).join('');
document.getElementById('cabeceraDias').innerHTML = DIAS_CORTOS.map(d => `<div>${d}</div>`).join('');
document.getElementById('leyenda').innerHTML = Object.keys(TIPOS_EVENTO)
    .map(t => `<span class="cal-evento ${TIPOS_EVENTO[t]}">${escaparHtml(t)}</span>`).join('');

// ---------- Calendario ----------
function pintarCalendario() {
    document.getElementById('tituloMes').textContent = `${MESES[mesActual]} ${anioActual}`;
    const mostrarClases = document.getElementById('chkClases').checked;
    const clases = mostrarClases ? DB.clases.listar() : [];

    const primerDia = new Date(anioActual, mesActual, 1);
    const offset = (primerDia.getDay() + 6) % 7; // semana empieza el lunes
    const diasMes = new Date(anioActual, mesActual + 1, 0).getDate();
    const hoyIso = hoyISO();

    let html = '';
    for (let i = 0; i < offset; i++) {
        html += '<div class="cal-dia cal-vacio"></div>';
    }
    for (let dia = 1; dia <= diasMes; dia++) {
        const iso = aISO(anioActual, mesActual, dia);
        const diaSemana = DIAS_NOMBRE[new Date(anioActual, mesActual, dia).getDay()];
        const eventos = DB.eventosDeFecha(iso);

        let chips = eventos.map(e => `
            <div class="cal-evento ${TIPOS_EVENTO[e.tipo] || 'ev-otro'}" data-evento="${e.idEvento}" title="${escaparHtml(e.titulo)}">
                ${e.horaInicio ? escaparHtml(e.horaInicio) + ' ' : ''}${escaparHtml(e.titulo)}
            </div>`).join('');

        chips += clases
            .filter(c => (c.diaSemana || '').includes(diaSemana))
            .map(c => `<div class="cal-clase" title="Clase: ${escaparHtml(c.nombre)}">${escaparHtml(c.horaInicio || '')} ${escaparHtml(c.nombre)}</div>`)
            .join('');

        html += `<div class="cal-dia${iso === hoyIso ? ' cal-hoy' : ''}" data-fecha="${iso}">
            <div class="cal-num">${dia}</div>${chips}
        </div>`;
    }
    document.getElementById('calendario').innerHTML = html;
}

document.getElementById('calendario').addEventListener('click', function (ev) {
    const chip = ev.target.closest('[data-evento]');
    if (chip) {
        cargarParaEditar(Number(chip.dataset.evento));
        return;
    }
    const dia = ev.target.closest('.cal-dia[data-fecha]');
    if (dia) {
        limpiarForm();
        document.getElementById('fechaInicio').value = dia.dataset.fecha;
        document.getElementById('titulo').focus();
        document.getElementById('tarjetaForm').scrollIntoView({ behavior: 'smooth' });
    }
});

document.getElementById('btnMesAnterior').addEventListener('click', () => {
    mesActual--;
    if (mesActual < 0) { mesActual = 11; anioActual--; }
    pintarCalendario();
});
document.getElementById('btnMesSiguiente').addEventListener('click', () => {
    mesActual++;
    if (mesActual > 11) { mesActual = 0; anioActual++; }
    pintarCalendario();
});
document.getElementById('btnHoy').addEventListener('click', () => {
    anioActual = hoy.getFullYear();
    mesActual = hoy.getMonth();
    pintarCalendario();
});
document.getElementById('chkClases').addEventListener('change', pintarCalendario);

// ---------- Formulario ----------
function limpiarForm() {
    document.getElementById('formEvento').reset();
    document.getElementById('idEvento').value = '';
    document.getElementById('tituloForm').textContent = 'Agregar evento';
    document.getElementById('btnGuardar').textContent = 'Guardar evento';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('btnEliminar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    mostrarError(null);
}

function cargarParaEditar(id) {
    const e = DB.eventos.obtener(id);
    if (!e) return;
    document.getElementById('idEvento').value = e.idEvento;
    document.getElementById('titulo').value = e.titulo;
    document.getElementById('tipo').value = e.tipo;
    document.getElementById('fechaInicio').value = e.fechaInicio;
    document.getElementById('fechaFin').value = e.fechaFin && e.fechaFin !== e.fechaInicio ? e.fechaFin : '';
    document.getElementById('horaInicio').value = e.horaInicio || '';
    document.getElementById('horaFin').value = e.horaFin || '';
    document.getElementById('lugar').value = e.lugar || '';
    document.getElementById('descripcion').value = e.descripcion || '';
    document.getElementById('tituloForm').textContent = 'Editar evento';
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('btnEliminar').style.display = 'inline-block';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    mostrarError(null);
    document.getElementById('tarjetaForm').scrollIntoView({ behavior: 'smooth' });
}

function eliminarEvento(id) {
    if (!confirm('¿Eliminar este evento del calendario?')) return;
    DB.eventos.eliminar(id);
    limpiarForm();
    refrescar();
}

document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });
document.getElementById('btnEliminar').addEventListener('click', () => {
    const id = document.getElementById('idEvento').value;
    if (id) eliminarEvento(Number(id));
});

document.getElementById('formEvento').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const titulo = document.getElementById('titulo').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value || fechaInicio;
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;

    const errorHoras = (horaInicio && horaFin && fechaInicio === fechaFin)
        ? Validar.ordenFechas(horaInicio, horaFin, 'hora de inicio', 'hora de fin') : null;
    const error = Validar.primerError(
        Validar.requerido(titulo, 'título'),
        Validar.requerido(fechaInicio, 'fecha de inicio'),
        Validar.ordenFechas(fechaInicio, fechaFin, 'fecha de inicio', 'fecha de fin'),
        (horaFin && !horaInicio) ? 'Indica la hora de inicio si pones hora de fin.' : null,
        errorHoras
    );
    if (error) { mostrarError(error); return; }

    const id = document.getElementById('idEvento').value;
    DB.eventos.guardar({
        idEvento: id ? Number(id) : undefined,
        titulo: titulo.trim(),
        tipo: document.getElementById('tipo').value,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        horaInicio: horaInicio,
        horaFin: horaFin,
        lugar: document.getElementById('lugar').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim()
    });

    // saltar al mes del evento guardado para que se vea el resultado
    const [a, m] = fechaInicio.split('-').map(Number);
    anioActual = a;
    mesActual = m - 1;
    limpiarForm();
    refrescar();
});

// ---------- Lista de proximos eventos ----------
function pintarProximos() {
    const lista = DB.proximosEventos(hoyISO(), 10);
    document.getElementById('tablaProximos').innerHTML = lista.length ? lista.map(e => `
        <tr>
            <td>${rangoTexto(e)}</td>
            <td>${escaparHtml(e.titulo)}${e.descripcion ? `<br><span class="sub-dato">${escaparHtml(e.descripcion)}</span>` : ''}</td>
            <td><span class="cal-evento ${TIPOS_EVENTO[e.tipo] || 'ev-otro'}">${escaparHtml(e.tipo)}</span></td>
            <td>${horarioTexto(e)}</td>
            <td>${escaparHtml(e.lugar || '--')}</td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${e.idEvento}">Editar</a></td>
        </tr>`).join('') : '<tr><td colspan="6">No hay eventos próximos. Haz clic en un día del calendario para agregar uno.</td></tr>';
}

function refrescar() {
    pintarCalendario();
    pintarProximos();
}

refrescar();
