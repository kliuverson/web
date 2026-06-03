const API = 'http://localhost:3000/api/direcciones';

let direccionEditando = null;

document.addEventListener('DOMContentLoaded', () => {

    cargarUsuarioPerfil();
    cargarDirecciones();

    document
        .getElementById('btnNuevaDireccion')
        ?.addEventListener('click', mostrarFormulario);

    document
        .getElementById('btnNuevaDireccionVacio')
        ?.addEventListener('click', mostrarFormulario);

    document
        .getElementById('btnCancelarDireccion')
        ?.addEventListener('click', ocultarFormulario);

    document
        .getElementById('btnGuardarDireccion')
        ?.addEventListener('click', guardarDireccion);

    document
        .querySelector('.snav-logout')
        ?.addEventListener('click', cerrarSesion);

});

function obtenerUsuario() {

    return JSON.parse(
        localStorage.getItem('fm_usuario') ||
        sessionStorage.getItem('fm_usuario') ||
        'null'
    );

}

function cargarUsuarioPerfil() {

    const usuario = obtenerUsuario();

    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    const avatar =
        document.querySelector('.avatar');

    const nombre =
        document.querySelector('.perfil-name');

    const correo =
        document.getElementById('meta-correo');

    const telefono =
        document.getElementById('meta-telefono');

    if (avatar) {

        const iniciales = usuario.nombre
            ? usuario.nombre
                .split(' ')
                .slice(0, 2)
                .map(p => p[0].toUpperCase())
                .join('')
            : '?';

        avatar.textContent = iniciales;
    }

    if (nombre) {
        nombre.textContent =
            (usuario.nombre || 'Usuario').toUpperCase();
    }

    if (correo) {
        correo.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            ${usuario.correo || 'No registrado'}
        `;
    }

    if (telefono) {
        telefono.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 5.73 5.73l1.75-1.75a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/>
            </svg>
            ${usuario.telefono || 'No registrado'}
        `;
    }

}

async function cargarDirecciones() {

    try {

        const usuario = obtenerUsuario();

        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }

        const idUsuario =
            usuario.id_usuario || usuario.id;

        const loading =
            document.getElementById('dirLoading');

        loading.style.display = 'block';

        const res = await fetch(
            `${API}/${idUsuario}`
        );

        const direcciones = await res.json();

        loading.style.display = 'none';

        renderizarDirecciones(direcciones);

    } catch (error) {

        console.error(error);

        document.getElementById('dirLoading').style.display = 'none';

    }

}

function renderizarDirecciones(direcciones) {

    const lista =
        document.getElementById('dirLista');

    const vacio =
        document.getElementById('dirVacio');

    lista.innerHTML = '';

    if (!direcciones || direcciones.length === 0) {

        lista.style.display = 'none';
        vacio.style.display = 'block';

        return;
    }

    vacio.style.display = 'none';
    lista.style.display = 'flex';
    lista.style.flexDirection = 'column';
    lista.style.gap = '15px';

    direcciones.forEach(dir => {

        lista.innerHTML += `
        <div class="dir-card">

            <div class="dir-header">
                <h3>${dir.ciudad}</h3>
            </div>

            <div class="dir-body">
                <p>${dir.direccion}</p>
                <p>${dir.departamento}</p>
                <p>${dir.codigo_postal || ''}</p>
                <p>${dir.pais}</p>
            </div>

            <div class="dir-actions">

                <button
                    class="btn-dir btn-edit"
                    onclick='editarDireccion(${JSON.stringify(dir)})'>
                    Editar
                </button>

                <button
                    class="btn-dir btn-delete"
                    onclick="eliminarDireccion(${dir.id_direccion})">
                    Eliminar
                </button>

            </div>

        </div>
        `;
    });

}

function mostrarFormulario() {

    direccionEditando = null;

    document.getElementById('dirFormTitulo')
        .textContent = 'Nueva dirección';

    document.getElementById('dirFormWrap')
        .style.display = 'block';

    limpiarFormulario();

}

function ocultarFormulario() {

    document.getElementById('dirFormWrap')
        .style.display = 'none';

    limpiarFormulario();

}

function limpiarFormulario() {

    document.getElementById('inp-id-direccion').value = '';
    document.getElementById('inp-direccion').value = '';
    document.getElementById('inp-ciudad').value = '';
    document.getElementById('inp-departamento').value = '';
    document.getElementById('inp-codigo').value = '';
    document.getElementById('inp-pais').value = 'Colombia';

}

function editarDireccion(dir) {

    direccionEditando = dir.id_direccion;

    document.getElementById('dirFormTitulo')
        .textContent = 'Editar dirección';

    document.getElementById('dirFormWrap')
        .style.display = 'block';

    document.getElementById('inp-id-direccion').value =
        dir.id_direccion;

    document.getElementById('inp-direccion').value =
        dir.direccion;

    document.getElementById('inp-ciudad').value =
        dir.ciudad;

    document.getElementById('inp-departamento').value =
        dir.departamento;

    document.getElementById('inp-codigo').value =
        dir.codigo_postal || '';

    document.getElementById('inp-pais').value =
        dir.pais;

}

async function guardarDireccion() {

    try {

        const usuario = obtenerUsuario();

        const idUsuario =
            usuario.id_usuario || usuario.id;

        const data = {

            id_usuario: idUsuario,

            direccion:
                document.getElementById('inp-direccion').value,

            ciudad:
                document.getElementById('inp-ciudad').value,

            departamento:
                document.getElementById('inp-departamento').value,

            codigo_postal:
                document.getElementById('inp-codigo').value,

            pais:
                document.getElementById('inp-pais').value

        };

        if (!data.direccion ||
            !data.ciudad ||
            !data.departamento) {

            alert('Completa todos los campos obligatorios');
            return;
        }

        if (direccionEditando) {

            await fetch(
                `${API}/${direccionEditando}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

        } else {

            await fetch(
                API,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

        }

        ocultarFormulario();
        cargarDirecciones();

    } catch (error) {

        console.error(error);

    }

}

async function eliminarDireccion(id) {

    if (!confirm('¿Eliminar esta dirección?'))
        return;

    try {

        await fetch(
            `${API}/${id}`,
            {
                method: 'DELETE'
            }
        );

        cargarDirecciones();

    } catch (error) {

        console.error(error);

    }

}

function cerrarSesion(e) {

    e.preventDefault();

    localStorage.removeItem('fm_token');
    localStorage.removeItem('fm_usuario');

    sessionStorage.removeItem('fm_token');
    sessionStorage.removeItem('fm_usuario');

    window.location.href = 'login.html';

}