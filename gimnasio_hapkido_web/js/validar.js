/* Validaciones de negocio. Cada funcion devuelve un mensaje de error (string) si el dato
   no es valido, o null si esta bien. Se usan antes de guardar en DB, en cada pagina. */

const Validar = {
    requerido(valor, campo) {
        if (valor === null || valor === undefined || String(valor).trim() === '') {
            return `El campo "${campo}" es obligatorio.`;
        }
        return null;
    },
    nombreValido(valor, campo) {
        const req = this.requerido(valor, campo);
        if (req) return req;
        if (!/^[A-Za-zÀ-ÿ .'\-]{2,150}$/.test(valor.trim())) {
            return `El campo "${campo}" solo debe contener letras y tener entre 2 y 150 caracteres.`;
        }
        return null;
    },
    telefonoOpcional(valor, campo) {
        if (!valor || String(valor).trim() === '') return null;
        if (!/^[0-9+()\-\s]{7,20}$/.test(valor.trim())) {
            return `El campo "${campo}" debe ser un teléfono válido (solo números, espacios, +, - y paréntesis).`;
        }
        return null;
    },
    montoPositivo(valor, campo) {
        if (Number(valor) <= 0 || isNaN(Number(valor))) {
            return `El campo "${campo}" debe ser mayor que cero.`;
        }
        return null;
    },
    cantidadNoNegativa(valor, campo) {
        if (Number(valor) < 0 || isNaN(Number(valor))) {
            return `El campo "${campo}" no puede ser negativo.`;
        }
        return null;
    },
    fechaNoFutura(valor, campo) {
        if (valor && valor > hoyISO()) {
            return `El campo "${campo}" no puede ser una fecha futura.`;
        }
        return null;
    },
    ordenFechas(inicio, fin, campoInicio, campoFin) {
        if (inicio && fin && fin < inicio) {
            return `"${campoFin}" no puede ser anterior a "${campoInicio}".`;
        }
        return null;
    },
    /** Ejecuta una lista de validaciones (funciones que devuelven string|null) y devuelve el primer error, o null. */
    primerError(...resultados) {
        return resultados.find(r => r) || null;
    }
};
