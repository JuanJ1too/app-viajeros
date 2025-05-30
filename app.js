// Listas para almacenar los datos
let pasajeros = [];
let ciudades = [];

// Validaciones
function validarNombre(nombre) {
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(nombre.trim());
}

function validarCC(cc) {
    const regex = /^\d{4,10}$/;
    return regex.test(cc.trim());
}

function validarCiudad(ciudad) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(ciudad.trim());
}

function limpiarTexto(texto) {
    return texto.trim().replace(/\s+/g, ' ');
}

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'success') {
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = `
        <div class="alert alert-${tipo}" role="alert">
            ${mensaje}
        </div>
    `;
}

function mostrarResultados(items) {
    const resultadosDiv = document.getElementById('resultados');
    if (items.length === 0) {
        mostrarMensaje('No se encontraron resultados', 'warning');
        return;
    }

    const lista = items.map(item => `
        <div class="resultado-item">
            ${item}
        </div>
    `).join('');

    resultadosDiv.innerHTML = lista;
}

// Actualizar selects
function actualizarSelectoresCiudades() {
    const origenSelect = document.getElementById('origen');
    const destinoSelect = document.getElementById('destino');
    const consultaCiudadSelect = document.getElementById('consultaCiudad');

    const origenActual = origenSelect.value;
    const destinoActual = destinoSelect.value;
    const consultaActual = consultaCiudadSelect.value;

    origenSelect.innerHTML = '<option value="">Seleccione ciudad de origen</option>';
    destinoSelect.innerHTML = '<option value="">Seleccione ciudad de destino</option>';
    consultaCiudadSelect.innerHTML = '<option value="">Seleccione una ciudad</option>';

    ciudades.forEach(([ciudad]) => {
        origenSelect.add(new Option(ciudad, ciudad));
        destinoSelect.add(new Option(ciudad, ciudad));
        consultaCiudadSelect.add(new Option(ciudad, ciudad));
    });

    if (origenActual) origenSelect.value = origenActual;
    if (destinoActual) destinoSelect.value = destinoActual;
    if (consultaActual) consultaCiudadSelect.value = consultaActual;
}

// Agregar pasajero
document.getElementById('pasajeroForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = limpiarTexto(document.getElementById('nombre').value);
    const cc = document.getElementById('cc').value;
    const origen = document.getElementById('origen').value;
    const destino = document.getElementById('destino').value;

    if (!validarNombre(nombre)) {
        mostrarMensaje('Error: El nombre no puede contener caracteres especiales', 'danger');
        return;
    }

    if (!validarCC(cc)) {
        mostrarMensaje('Error: La CC debe contener entre 4 y 10 dígitos numéricos', 'danger');
        return;
    }

    if (!origen) {
        mostrarMensaje('Error: Debe seleccionar una ciudad de origen', 'danger');
        return;
    }

    if (!destino) {
        mostrarMensaje('Error: Debe seleccionar una ciudad de destino', 'danger');
        return;
    }

    if (origen === destino) {
        mostrarMensaje('Error: La ciudad de origen y destino no pueden ser la misma', 'danger');
        return;
    }

    const ccExiste = pasajeros.some(([, ccPasajero]) => ccPasajero === cc);
    if (ccExiste) {
        mostrarMensaje('Error: Ya existe un pasajero con esa CC', 'danger');
        return;
    }

    pasajeros.push([nombre, cc, origen, destino]);
    mostrarMensaje('Pasajero agregado exitosamente');
    this.reset();
});

// Agregar ciudad
document.getElementById('ciudadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const ciudad = limpiarTexto(document.getElementById('ciudad').value);
    const pais = document.getElementById('pais').value;

    if (!validarCiudad(ciudad)) {
        mostrarMensaje('Error: La ciudad solo debe contener letras y espacios', 'danger');
        return;
    }

    if (!pais) {
        mostrarMensaje('Error: Debe seleccionar un país', 'danger');
        return;
    }

    const ciudadExiste = ciudades.some(([nombreCiudad]) => nombreCiudad.toLowerCase() === ciudad.toLowerCase());
    if (ciudadExiste) {
        mostrarMensaje('Error: Esta ciudad ya está registrada', 'danger');
        return;
    }

    ciudades.push([ciudad, pais]);
    actualizarSelectoresCiudades();
    mostrarMensaje('Ciudad agregada exitosamente');
    this.reset();
});

// Consultar por CC → Ciudad
function consultarPorCC() {
    const cc = document.getElementById('consultaCC').value;

    if (!validarCC(cc)) {
        mostrarMensaje('Error: Formato de CC inválido', 'danger');
        return;
    }

    const pasajero = pasajeros.find(([, ccPasajero]) => ccPasajero === cc);

    if (pasajero) {
        const [nombre, , origen, destino] = pasajero;
        const paisOrigen = ciudades.find(([ciudad]) => ciudad === origen)?.[1] || 'País no encontrado';
        const paisDestino = ciudades.find(([ciudad]) => ciudad === destino)?.[1] || 'País no encontrado';
        mostrarResultados([
            `Pasajero: ${nombre}`,
            `Ciudad de origen: ${origen} (${paisOrigen})`,
            `Ciudad de destino: ${destino} (${paisDestino})`
        ]);
    } else {
        mostrarMensaje('No se encontró ningún pasajero con esa CC', 'warning');
    }
}

// NUEVA: Consultar país por CC
function consultarPaisPorCC() {
    const cc = document.getElementById('consultaCC').value;

    if (!validarCC(cc)) {
        mostrarMensaje('Error: Formato de CC inválido', 'danger');
        return;
    }

    const pasajero = pasajeros.find(([, ccPasajero]) => ccPasajero === cc);
    if (!pasajero) {
        mostrarMensaje('Pasajero no encontrado', 'warning');
        return;
    }

    const [, , , destino] = pasajero;
    const paisDestino = ciudades.find(([ciudad]) => ciudad === destino)?.[1] || 'País no encontrado';

    mostrarResultados([`El pasajero viaja al país: ${paisDestino}`]);
}

// Consultar por Ciudad (con conteo agregado)
function consultarPorCiudad() {
    const ciudad = document.getElementById('consultaCiudad').value;

    if (!ciudad) {
        mostrarMensaje('Error: Debe seleccionar una ciudad', 'danger');
        return;
    }

    const pasajerosOrigen = pasajeros.filter(([, , origen]) => origen === ciudad);
    const pasajerosDestino = pasajeros.filter(([, , , destino]) => destino === ciudad);

    const resultados = [];

    if (pasajerosOrigen.length > 0) {
        resultados.push(`Pasajeros que salen de ${ciudad} (${pasajerosOrigen.length}):`);
        resultados.push(...pasajerosOrigen.map(([nombre, cc, , destino]) =>
            `- ${nombre} (CC: ${cc}) → ${destino}`
        ));
    }

    if (pasajerosDestino.length > 0) {
        if (resultados.length > 0) resultados.push('');
        resultados.push(`Pasajeros que llegan a ${ciudad} (${pasajerosDestino.length}):`);
        resultados.push(...pasajerosDestino.map(([nombre, cc, origen]) =>
            `- ${nombre} (CC: ${cc}) ← ${origen}`
        ));
    }

    if (resultados.length === 0) {
        mostrarMensaje(`No hay pasajeros que viajen desde o hacia ${ciudad}`, 'warning');
    } else {
        mostrarResultados(resultados);
    }
}

// Consultar por País
function consultarPorPais() {
    const pais = document.getElementById('consultaPais').value;

    if (!pais) {
        mostrarMensaje('Error: Debe seleccionar un país', 'danger');
        return;
    }

    const ciudadesPais = ciudades.filter(([, nombrePais]) => 
        nombrePais === pais
    ).map(([ciudad]) => ciudad);

    const pasajerosOrigen = pasajeros.filter(([, , origen]) => 
        ciudadesPais.includes(origen)
    );

    const pasajerosDestino = pasajeros.filter(([, , , destino]) => 
        ciudadesPais.includes(destino)
    );

    const resultados = [];

    if (pasajerosOrigen.length > 0) {
        resultados.push(`Pasajeros que salen de ${pais} (${pasajerosOrigen.length}):`);
        resultados.push(...pasajerosOrigen.map(([nombre, cc, origen, destino]) =>
            `- ${nombre} (CC: ${cc}) - De: ${origen} → ${destino}`
        ));
    }

    if (pasajerosDestino.length > 0) {
        if (resultados.length > 0) resultados.push('');
        resultados.push(`Pasajeros que llegan a ${pais} (${pasajerosDestino.length}):`);
        resultados.push(...pasajerosDestino.map(([nombre, cc, origen, destino]) =>
            `- ${nombre} (CC: ${cc}) - De: ${origen} → ${destino}`
        ));
    }

    if (resultados.length === 0) {
        mostrarMensaje('No hay pasajeros que viajen desde o hacia este país', 'warning');
    } else {
        mostrarResultados(resultados);
    }
}

// Salir
function salirPrograma() {
    if (confirm('¿Está seguro que desea salir del programa?')) {
        window.close();
        mostrarMensaje('Para salir, cierre esta pestaña del navegador', 'info');
    }
}

// Datos de ejemplo
ciudades.push(['Boston', 'USA'], ['Barcelona', 'España'], ['Bogotá', 'Colombia']);
pasajeros.push(
    ['Juan Jose Hurtado', '705345652', 'Bogotá', 'Boston'],
    ['Juan Jaramillo', '8152612', 'Boston', 'Barcelona'],
    ['Juan Estrada', '68822915', 'Barcelona', 'Bogotá']
);

// Inicialización
actualizarSelectoresCiudades();
