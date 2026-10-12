/* ============================================================
   Gimnasio de Hapkido - capa de datos (localStorage)
   ------------------------------------------------------------
   Como esta version NO tiene servidor ni base de datos real,
   todos los datos se guardan en el navegador (localStorage).
   Esto significa:
     - No necesitas instalar nada: abres index.html y funciona.
     - Los datos son POR NAVEGADOR/COMPUTADOR. Si lo abres en otro
       equipo, no vas a ver los mismos datos (no hay servidor
       central compartido).
     - No es apto para produccion real (cualquiera con acceso al
       navegador puede ver los datos desde las herramientas de
       desarrollador). Sirve perfecto para una demo/proyecto academico.
   ============================================================ */

const DB_KEY = 'gimnasioHapkidoDB';

/** Fecha ISO local (yyyy-mm-dd) desplazada N dias desde hoy. */
function fechaRelativaISO(dias) {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Datos de ejemplo con los que arranca la app la primera vez que se abre. */
function datosSemilla() {
    return {
        alumnos: [
            { idAlumno: 1, nombre: 'Juan Perez', telefono: '3001234567', fechaNacimiento: '1995-03-10', fechaIngreso: '2025-01-15', cinturon: 'Blanco', activo: true, acudienteNombre: null, acudienteTelefono: null, acudienteParentesco: null },
            { idAlumno: 2, nombre: 'Maria Gomez', telefono: '3007654321', fechaNacimiento: '2012-06-22', fechaIngreso: '2024-11-01', cinturon: 'Amarillo', activo: true, acudienteNombre: 'Carlos Gomez', acudienteTelefono: '3009998888', acudienteParentesco: 'Padre' }
        ],
        instructores: [
            { idInstructor: 1, nombre: 'Instructor Principal', telefono: '3000000000', grado: 'Cinturón Negro 3er Dan', especialidad: 'Hapkido tradicional', usuario: 'instructor', clave: 'hapkido123', activo: true }
        ],
        clases: [
            { idClase: 1, nombre: 'Hapkido Infantil', nivel: 'Principiantes', idInstructor: 1, diaSemana: 'Lunes y Miércoles', horaInicio: '16:00', horaFin: '17:00' },
            { idClase: 2, nombre: 'Hapkido Avanzado', nivel: 'Avanzado', idInstructor: 1, diaSemana: 'Martes y Jueves', horaInicio: '18:00', horaFin: '19:30' }
        ],
        matriculas: [
            { idClase: 1, idAlumno: 2 },
            { idClase: 2, idAlumno: 1 }
        ],
        asistencias: [],
        observaciones: [],
        examenes: [],
        pagos: [],
        productos: [
            { idProducto: 1, nombre: 'Uniforme (Dobok) Talla M', marca: 'Daedo', tipo: 'Uniforme', cantidad: 10, precio: 85000 },
            { idProducto: 2, nombre: 'Protector Bucal', marca: 'Fuji', tipo: 'Proteccion', cantidad: 20, precio: 12000 },
            { idProducto: 3, nombre: 'Espinillera par', marca: 'Daedo', tipo: 'Proteccion', cantidad: 8, precio: 45000 }
        ],
        ventas: [],
        eventos: [
            { idEvento: 1, titulo: 'Seminario de Hapkido', tipo: 'Seminario', fechaInicio: fechaRelativaISO(9), fechaFin: fechaRelativaISO(9), horaInicio: '09:00', horaFin: '13:00', lugar: 'Sede principal', descripcion: 'Seminario abierto para todos los niveles.' },
            { idEvento: 2, titulo: 'Examen de cinturones', tipo: 'Examen de grado', fechaInicio: fechaRelativaISO(21), fechaFin: fechaRelativaISO(21), horaInicio: '16:00', horaFin: '19:00', lugar: 'Sede principal', descripcion: 'Presentarse 30 minutos antes con el uniforme completo.' }
        ],
        contactos: [
            { idContacto: 1, tipo: 'Hospital', nombre: 'Hospital más cercano (editar)', direccion: 'Dirección pendiente de actualizar', telefono: '123', referencia: 'Cerca del estadio / sede principal', notas: 'Actualizar con el hospital real más cercano al gimnasio' },
            { idContacto: 2, tipo: 'Policia', nombre: 'CAI / Estación de Policía más cercana (editar)', direccion: 'Dirección pendiente de actualizar', telefono: '123', referencia: '', notas: 'Línea de emergencias nacional: 123' },
            { idContacto: 3, tipo: 'Bomberos', nombre: 'Estación de Bomberos (editar)', direccion: 'Dirección pendiente de actualizar', telefono: '119', referencia: '', notas: '' },
            { idContacto: 4, tipo: 'Ambulancia', nombre: 'Cruz Roja / Ambulancias (editar)', direccion: '', telefono: '132', referencia: '', notas: 'Línea nacional de ambulancias' }
        ],
        nextIds: { alumnos: 3, instructores: 2, clases: 3, asistencias: 1, observaciones: 1, examenes: 1, pagos: 1, productos: 4, ventas: 1, eventos: 3, contactos: 5 }
    };
}

function cargarDB() {
    const crudo = localStorage.getItem(DB_KEY);
    if (!crudo) {
        const semilla = datosSemilla();
        localStorage.setItem(DB_KEY, JSON.stringify(semilla));
        return semilla;
    }
    try {
        const db = JSON.parse(crudo);
        // Datos guardados por una version anterior: agregar lo que falte sin perder nada
        if (!Array.isArray(db.eventos)) {
            db.eventos = datosSemilla().eventos;
            db.nextIds.eventos = 3;
            localStorage.setItem(DB_KEY, JSON.stringify(db));
        }
        return db;
    } catch (e) {
        console.error('DB corrupta, reiniciando con datos de ejemplo', e);
        const semilla = datosSemilla();
        localStorage.setItem(DB_KEY, JSON.stringify(semilla));
        return semilla;
    }
}

function guardarDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function siguienteId(db, coleccion) {
    const id = db.nextIds[coleccion];
    db.nextIds[coleccion] = id + 1;
    return id;
}

/** Crea un helper CRUD generico para una coleccion identificada por su campo "id". */
function crearRepositorio(coleccion, campoId) {
    return {
        listar() {
            return cargarDB()[coleccion];
        },
        obtener(id) {
            return cargarDB()[coleccion].find(r => r[campoId] === Number(id)) || null;
        },
        guardar(registro) {
            const db = cargarDB();
            if (registro[campoId]) {
                const idx = db[coleccion].findIndex(r => r[campoId] === registro[campoId]);
                if (idx >= 0) {
                    db[coleccion][idx] = registro;
                }
            } else {
                registro[campoId] = siguienteId(db, coleccion);
                db[coleccion].push(registro);
            }
            guardarDB(db);
            return registro;
        },
        eliminar(id) {
            const db = cargarDB();
            db[coleccion] = db[coleccion].filter(r => r[campoId] !== Number(id));
            guardarDB(db);
        }
    };
}

const DB = {
    alumnos: crearRepositorio('alumnos', 'idAlumno'),
    instructores: crearRepositorio('instructores', 'idInstructor'),
    clases: crearRepositorio('clases', 'idClase'),
    asistencias: crearRepositorio('asistencias', 'idAsistencia'),
    observaciones: crearRepositorio('observaciones', 'idObservacion'),
    examenes: crearRepositorio('examenes', 'idExamen'),
    pagos: crearRepositorio('pagos', 'idPago'),
    productos: crearRepositorio('productos', 'idProducto'),
    ventas: crearRepositorio('ventas', 'idVenta'),
    contactos: crearRepositorio('contactos', 'idContacto'),
    eventos: crearRepositorio('eventos', 'idEvento'),

    // ---------- Consultas especiales ----------

    /** Eventos que ocurren en una fecha ISO (incluye eventos de varios dias), ordenados por hora. */
    eventosDeFecha(fechaISO) {
        return cargarDB().eventos
            .filter(e => e.fechaInicio <= fechaISO && (e.fechaFin || e.fechaInicio) >= fechaISO)
            .sort((a, b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));
    },
    /** Eventos que empiezan hoy o despues, del mas cercano al mas lejano. */
    proximosEventos(desdeISO, limite) {
        return cargarDB().eventos
            .filter(e => (e.fechaFin || e.fechaInicio) >= desdeISO)
            .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
            .slice(0, limite || 5);
    },

    matricularAlumno(idClase, idAlumno) {
        const db = cargarDB();
        const yaExiste = db.matriculas.some(m => m.idClase === Number(idClase) && m.idAlumno === Number(idAlumno));
        if (!yaExiste) {
            db.matriculas.push({ idClase: Number(idClase), idAlumno: Number(idAlumno) });
            guardarDB(db);
        }
    },
    desmatricularAlumno(idClase, idAlumno) {
        const db = cargarDB();
        db.matriculas = db.matriculas.filter(m => !(m.idClase === Number(idClase) && m.idAlumno === Number(idAlumno)));
        guardarDB(db);
    },
    alumnosDeClase(idClase) {
        const db = cargarDB();
        const idsAlumnos = db.matriculas.filter(m => m.idClase === Number(idClase)).map(m => m.idAlumno);
        return db.alumnos.filter(a => idsAlumnos.includes(a.idAlumno));
    },
    clasesDeAlumno(idAlumno) {
        const db = cargarDB();
        const idsClases = db.matriculas.filter(m => m.idAlumno === Number(idAlumno)).map(m => m.idClase);
        return db.clases.filter(c => idsClases.includes(c.idClase));
    },

    examenesDeAlumno(idAlumno) {
        return cargarDB().examenes
            .filter(e => e.idAlumno === Number(idAlumno))
            .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago));
    },

    asistenciasDeAlumno(idAlumno) {
        return cargarDB().asistencias
            .filter(a => a.idAlumno === Number(idAlumno))
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
    asistenciasDeClaseEnFecha(idClase, fecha) {
        return cargarDB().asistencias.filter(a => a.idClase === Number(idClase) && a.fecha === fecha);
    },
    registrarAsistenciaMasiva(idClase, fecha, registros) {
        // registros: [{idAlumno, presente, observacion}]
        const db = cargarDB();
        registros.forEach(r => {
            const idx = db.asistencias.findIndex(a => a.idClase === Number(idClase) && a.idAlumno === Number(r.idAlumno) && a.fecha === fecha);
            if (idx >= 0) {
                db.asistencias[idx].presente = r.presente;
                db.asistencias[idx].observacion = r.observacion || '';
            } else {
                db.asistencias.push({
                    idAsistencia: siguienteId(db, 'asistencias'),
                    idClase: Number(idClase),
                    idAlumno: Number(r.idAlumno),
                    fecha: fecha,
                    presente: r.presente,
                    observacion: r.observacion || ''
                });
            }
        });
        guardarDB(db);
    },

    observacionesDeAlumno(idAlumno) {
        return cargarDB().observaciones
            .filter(o => o.idAlumno === Number(idAlumno))
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    },

    /** Ultimo pago de cada alumno, con su estado (pagado al dia / vencido). */
    estadoPagosAlumnos() {
        const db = cargarDB();
        const hoy = new Date().toISOString().slice(0, 10);
        const resultado = [];
        db.alumnos.forEach(alumno => {
            const pagosAlumno = db.pagos.filter(p => p.idAlumno === alumno.idAlumno);
            if (pagosAlumno.length === 0) {
                return;
            }
            const ultimo = pagosAlumno.reduce((a, b) => (a.fechaPago > b.fechaPago ? a : b));
            let estado = 'Al día';
            if (ultimo.fechaVencimiento < hoy) {
                estado = 'Vencido';
            }
            resultado.push({ ...ultimo, nombreAlumno: alumno.nombre, estado });
        });
        return resultado.sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    },

    pagosDeAlumno(idAlumno) {
        return cargarDB().pagos
            .filter(p => p.idAlumno === Number(idAlumno))
            .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago));
    },

    nombreAlumno(idAlumno) {
        const a = this.alumnos.obtener(idAlumno);
        return a ? a.nombre : '(alumno eliminado)';
    },
    nombreInstructor(idInstructor) {
        const i = this.instructores.obtener(idInstructor);
        return i ? i.nombre : '--';
    },
    nombreClase(idClase) {
        const c = this.clases.obtener(idClase);
        return c ? c.nombre : '(clase eliminada)';
    }
};
