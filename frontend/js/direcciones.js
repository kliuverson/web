const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://feel-revenue-tamper.ngrok-free.dev';

let direccionEditando = null;

document.addEventListener('DOMContentLoaded', () => {

  cargarUsuarioPerfil();
  cargarDirecciones();

  document.getElementById('btnNuevaDireccion')?.addEventListener('click', mostrarFormulario);
  document.getElementById('btnNuevaDireccionVacio')?.addEventListener('click', mostrarFormulario);
  document.getElementById('btnCancelarDireccion')?.addEventListener('click', ocultarFormulario);
  document.getElementById('btnGuardarDireccion')?.addEventListener('click', guardarDireccion);
  document.querySelector('.snav-logout')?.addEventListener('click', cerrarSesion);

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
  if (!usuario) { window.location.href = 'login.html'; return; }

  const avatar   = document.querySelector('.avatar');
  const nombre   = document.querySelector('.perfil-name');
  const correo   = document.getElementById('meta-correo');
  const telefono = document.getElementById('meta-telefono');

  if (avatar) {
    const iniciales = usuario.nombre
      ? usuario.nombre.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
      : '?';
    avatar.textContent = iniciales;
  }
  if (nombre) nombre.textContent = (usuario.nombre || 'Usuario').toUpperCase();
  if (correo) correo.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
    ${usuario.correo || 'No registrado'}`;
  if (telefono) telefono.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 5.73 5.73l1.75-1.75a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/>
    </svg>
    ${usuario.telefono || 'No registrado'}`;
}

async function cargarDirecciones() {
  try {
    const usuario = obtenerUsuario();
    if (!usuario) { window.location.href = 'login.html'; return; }

    const idUsuario = usuario.id_usuario || usuario.id;
    const loading = document.getElementById('dirLoading');
    loading.style.display = 'block';

    const res = await fetch(`${API}/${idUsuario}`);
    const direcciones = await res.json();

    loading.style.display = 'none';
    renderizarDirecciones(direcciones);
  } catch (error) {
    console.error(error);
    document.getElementById('dirLoading').style.display = 'none';
  }
}

function renderizarDirecciones(direcciones) {
  const lista = document.getElementById('dirLista');
  const vacio = document.getElementById('dirVacio');
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
        <div class="dir-header"><h3>${dir.ciudad}</h3></div>
        <div class="dir-body">
          <p>${dir.direccion}</p>
          <p>${dir.departamento}</p>
          <p>${dir.codigo_postal || ''}</p>
          <p>${dir.pais}</p>
        </div>
        <div class="dir-actions">
          <button class="btn-dir btn-edit" onclick='editarDireccion(${JSON.stringify(dir)})'>Editar</button>
          <button class="btn-dir btn-delete" onclick="confirmarEliminar(${dir.id_direccion})">Eliminar</button>
        </div>
      </div>
    `;
  });
}

function mostrarFormulario() {
  direccionEditando = null;
  document.getElementById('dirFormTitulo').textContent = 'Nueva dirección';
  document.getElementById('dirFormWrap').style.display = 'block';
  limpiarFormulario();
}

function ocultarFormulario() {
  document.getElementById('dirFormWrap').style.display = 'none';
  limpiarFormulario();
}

function limpiarFormulario() {
  document.getElementById('inp-id-direccion').value = '';
  document.getElementById('inp-direccion').value    = '';
  document.getElementById('inp-ciudad').value       = '';
  document.getElementById('inp-departamento').value = '';
  document.getElementById('inp-codigo').value       = '';
  document.getElementById('inp-pais').value         = 'Colombia';
}

function editarDireccion(dir) {
  direccionEditando = dir.id_direccion;
  document.getElementById('dirFormTitulo').textContent  = 'Editar dirección';
  document.getElementById('dirFormWrap').style.display  = 'block';
  document.getElementById('inp-id-direccion').value     = dir.id_direccion;
  document.getElementById('inp-direccion').value        = dir.direccion;
  document.getElementById('inp-ciudad').value           = dir.ciudad;
  document.getElementById('inp-departamento').value     = dir.departamento;
  document.getElementById('inp-codigo').value           = dir.codigo_postal || '';
  document.getElementById('inp-pais').value             = dir.pais;
}

async function guardarDireccion() {
  const usuario   = obtenerUsuario();
  const idUsuario = usuario.id_usuario || usuario.id;

  const data = {
    id_usuario:    idUsuario,
    direccion:     document.getElementById('inp-direccion').value.trim(),
    ciudad:        document.getElementById('inp-ciudad').value.trim(),
    departamento:  document.getElementById('inp-departamento').value.trim(),
    codigo_postal: document.getElementById('inp-codigo').value.trim(),
    pais:          document.getElementById('inp-pais').value.trim()
  };

  if (!data.direccion || !data.ciudad || !data.departamento) {
    mostrarToast('Completa todos los campos obligatorios', true);
    return;
  }

  try {
    if (direccionEditando) {
      await fetch(`${API}/${direccionEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      mostrarToast('Dirección actualizada ✓');
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      mostrarToast('Dirección guardada ✓');
    }
    ocultarFormulario();
    cargarDirecciones();
  } catch (error) {
    console.error(error);
    mostrarToast('Error al guardar la dirección', true);
  }
}

function confirmarEliminar(id) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);
    display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);`;

  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;
      padding:32px;max-width:420px;width:90%;text-align:center;">
      <div style="font-size:40px;margin-bottom:16px;">📍</div>
      <h3 style="font-family:'Barlow Condensed',sans-serif;font-size:22px;
        font-weight:900;margin-bottom:8px;color:#fff;text-transform:uppercase;">
        ¿Eliminar dirección?
      </h3>
      <p style="color:#888;font-size:14px;margin-bottom:24px;">
        Esta acción no se puede deshacer.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="btnCancelarEl" style="padding:12px 28px;background:transparent;
          border:2px solid #444;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;
          text-transform:uppercase;">Cancelar</button>
        <button id="btnConfirmarEl" style="padding:12px 28px;background:#e53e3e;
          border:none;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;
          text-transform:uppercase;">Sí, eliminar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('btnCancelarEl').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  document.getElementById('btnConfirmarEl').onclick = async () => {
    overlay.remove();
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      mostrarToast('Dirección eliminada ✓');
      cargarDirecciones();
    } catch (error) {
      mostrarToast('Error al eliminar', true);
    }
  };
}

function mostrarToast(msg, error = false) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:14px 20px;
    background:${error ? '#e53e3e' : '#ff6b00'};color:#fff;border-radius:4px;
    font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:15px;
    z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function cerrarSesion(e) {
  e.preventDefault();
  localStorage.removeItem('fm_token');
  localStorage.removeItem('fm_usuario');
  sessionStorage.removeItem('fm_token');
  sessionStorage.removeItem('fm_usuario');
  window.location.href = 'login.html';
}