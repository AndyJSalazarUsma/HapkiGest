exigirSesion();
pintarNav('inventario');

function cargarSelects() {
    const productos = DB.productos.listar();
    document.getElementById('idProductoVenta').innerHTML = productos.map(p => `<option value="${p.idProducto}">${escaparHtml(p.nombre)}${p.marca ? ' - ' + escaparHtml(p.marca) : ''} (stock: ${p.cantidad})</option>`).join('');
    const alumnos = DB.alumnos.listar().filter(a => a.activo);
    document.getElementById('idAlumnoVenta').innerHTML = '<option value="">-- Venta general --</option>' + alumnos.map(a => `<option value="${a.idAlumno}">${escaparHtml(a.nombre)}</option>`).join('');
}

function limpiarForm() {
    document.getElementById('formProducto').reset();
    document.getElementById('idProducto').value = '';
    document.getElementById('tituloForm').textContent = 'Agregar producto al inventario';
    document.getElementById('labelCantidad').textContent = 'Cantidad inicial';
    document.getElementById('btnGuardar').textContent = 'Guardar producto';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('tarjetaForm').classList.remove('tarjeta-editando');
    mostrarError(null);
}

function cargarParaEditar(id) {
    const p = DB.productos.obtener(id);
    if (!p) return;
    document.getElementById('idProducto').value = p.idProducto;
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('marca').value = p.marca || '';
    document.getElementById('tipo').value = p.tipo;
    document.getElementById('cantidad').value = p.cantidad;
    document.getElementById('precio').value = p.precio;
    document.getElementById('labelCantidad').textContent = 'Cantidad en stock';
    document.getElementById('tituloForm').textContent = 'Editar producto';
    document.getElementById('btnGuardar').textContent = 'Guardar cambios';
    document.getElementById('btnCancelar').style.display = 'inline';
    document.getElementById('tarjetaForm').classList.add('tarjeta-editando');
    window.scrollTo(0, 0);
}
document.getElementById('btnCancelar').addEventListener('click', (ev) => { ev.preventDefault(); limpiarForm(); });

document.getElementById('formProducto').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const cantidad = document.getElementById('cantidad').value;
    const precio = document.getElementById('precio').value;
    const error = Validar.primerError(
        Validar.requerido(nombre, 'nombre'),
        Validar.cantidadNoNegativa(cantidad, 'cantidad'),
        Validar.montoPositivo(precio, 'precio')
    );
    if (error) { mostrarError(error); return; }

    const idProducto = document.getElementById('idProducto').value;
    DB.productos.guardar({
        idProducto: idProducto ? Number(idProducto) : undefined,
        nombre: nombre.trim(),
        marca: document.getElementById('marca').value,
        tipo: document.getElementById('tipo').value,
        cantidad: Number(cantidad),
        precio: Number(precio)
    });
    limpiarForm();
    cargarSelects();
    pintarTabla();
});

document.getElementById('formVenta').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const idProducto = Number(document.getElementById('idProductoVenta').value);
    const idAlumnoStr = document.getElementById('idAlumnoVenta').value;
    const cantidadVendida = Number(document.getElementById('cantidadVendida').value);

    const producto = DB.productos.obtener(idProducto);
    if (cantidadVendida <= 0) { mostrarError('La cantidad vendida debe ser mayor que cero.'); return; }
    if (cantidadVendida > producto.cantidad) { mostrarError(`No hay suficiente stock. Disponible: ${producto.cantidad}.`); return; }

    producto.cantidad -= cantidadVendida;
    DB.productos.guardar(producto);
    DB.ventas.guardar({
        idProducto: idProducto,
        idAlumno: idAlumnoStr ? Number(idAlumnoStr) : null,
        cantidad: cantidadVendida,
        fechaVenta: hoyISO(),
        total: producto.precio * cantidadVendida
    });
    document.getElementById('formVenta').reset();
    mostrarError(null);
    cargarSelects();
    pintarTabla();
});

function pintarTabla() {
    const productos = DB.productos.listar();
    document.getElementById('tablaProductos').innerHTML = productos.length ? productos.map(p => `
        <tr>
            <td>${escaparHtml(p.nombre)}</td>
            <td>${escaparHtml(p.marca || '--')}</td>
            <td>${escaparHtml(p.tipo)}</td>
            <td>${p.cantidad}</td>
            <td>${formatoMoneda(p.precio)}</td>
            <td><a class="btn-editar" href="#" data-accion="cargarParaEditar" data-id="${p.idProducto}">Editar</a></td>
            <td><button class="btn-eliminar" data-accion="eliminarProducto" data-id="${p.idProducto}">Eliminar</button></td>
        </tr>
    `).join('') : '<tr><td colspan="7">No hay productos registrados.</td></tr>';
}

function eliminarProducto(id) {
    const tieneVentas = cargarDB().ventas.some(v => v.idProducto === Number(id));
    if (tieneVentas) { mostrarError('No se puede eliminar: el producto ya tiene ventas registradas.'); window.scrollTo(0,0); return; }
    if (!confirm('¿Eliminar este producto?')) return;
    DB.productos.eliminar(id);
    cargarSelects();
    pintarTabla();
}

cargarSelects();
pintarTabla();
