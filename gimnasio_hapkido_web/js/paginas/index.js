exigirSesion();
pintarNav('inicio');

const alumnos = DB.alumnos.listar();
const activos = alumnos.filter(a => a.activo);
const clases = DB.clases.listar();
const vencidos = DB.estadoPagosAlumnos().filter(p => p.estado === 'Vencido');

document.getElementById('resumen').innerHTML = `
    <div class="caja"><div class="numero">${activos.length}</div>Alumnos activos</div>
    <div class="caja"><div class="numero">${alumnos.length - activos.length}</div>Alumnos inactivos</div>
    <div class="caja"><div class="numero">${clases.length}</div>Clases activas</div>
    <div class="caja"><div class="numero">${vencidos.length}</div>Mensualidades vencidas</div>
`;

document.getElementById('tablaVencidos').innerHTML = vencidos.length
    ? vencidos.map(p => `<tr><td>${escaparHtml(p.nombreAlumno)}</td><td>${p.fechaVencimiento}</td><td>${formatoMoneda(p.monto)}</td></tr>`).join('')
    : '<tr><td colspan="3">No hay mensualidades vencidas. 🎉</td></tr>';

// dia de la semana actual en español, para resaltar clases de "hoy" (comparacion simple por texto)
const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const diaHoy = diasSemana[new Date().getDay()];
const clasesHoy = clases.filter(c => (c.diaSemana || '').includes(diaHoy));

document.getElementById('tablaClasesHoy').innerHTML = clasesHoy.length
    ? clasesHoy.map(c => `<tr><td>${escaparHtml(c.nombre)}</td><td>${escaparHtml(c.nivel || '--')}</td><td>${escaparHtml(DB.nombreInstructor(c.idInstructor))}</td><td>${c.horaInicio} - ${c.horaFin}</td></tr>`).join('')
    : `<tr><td colspan="4">No hay clases programadas para hoy (${diaHoy}).</td></tr>`;

const proximosEventos = DB.proximosEventos(hoyISO(), 5);
document.getElementById('tablaEventos').innerHTML = proximosEventos.length
    ? proximosEventos.map(e => {
        const fin = e.fechaFin || e.fechaInicio;
        const fecha = fin === e.fechaInicio ? e.fechaInicio : `${e.fechaInicio} a ${fin}`;
        const hora = e.horaInicio ? (e.horaFin ? `${e.horaInicio} - ${e.horaFin}` : `Desde ${e.horaInicio}`) : 'Todo el día';
        return `<tr><td>${fecha}</td><td>${escaparHtml(e.titulo)}</td><td>${escaparHtml(e.tipo)}</td><td>${hora}</td></tr>`;
    }).join('')
    : '<tr><td colspan="4">No hay eventos próximos.</td></tr>';
