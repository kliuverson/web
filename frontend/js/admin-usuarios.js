const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://feel-revenue-tamper.ngrok-free.dev';

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(
    localStorage.getItem('fm_usuario') ||
    sessionStorage.getItem('fm_usuario') || 'null'
  );
  if (!usuario) { window.location.href = `${BASE_URL}/pages/login.html`; return; }
  if (usuario.rol !== 'admin') { window.location.href = `${BASE_URL}/pages/index.html`; return; }

  token = localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');

  const badge = document.getElementById('adminUserBadge');
  if (badge) badge.textContent = usuario.nombre.split(' ')[0].toUpperCase();

  document.querySelector('.admin-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear(); sessionStorage.clear();
    window.location.href = `${BASE_URL}/pages/login.html`;
  });

  document.getElementById('buscar').addEventListener('input', filtrar);
  document.getElementById('filtroRol').addEventListener('change', filtrar);

  cargarUsuarios();
});

async function cargarUsuarios() {
  const wrap = document.getElementById('tablaUsuarios');
  wrap.innerHTML = '<div class="admin-loading">Cargando...</div>';
  try {
    const res = await fetch(`${API_BASE}/admin/usuarios`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al cargar usuarios');
    usuarios = await res.json();
    renderTabla(usuarios);
  } catch (err) {
    wrap.innerHTML = `<div class="admin-loading">Error: ${err.message}</div>`;
  }
}

function renderTabla(data) {
  const wrap = document.getElementById('tablaUsuarios');
  document.getElementById('totalUsuarios').textContent = `Total: ${data.length}`;

  if (!data.length) {
    wrap.innerHTML = '<div class="admin-loading">No hay usuarios.</div>';
    return;
  }

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Documento</th>
          <th>Rol</th>
          <th>Registro</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(u => `
          <tr>
            <td>#${u.id_usuario}</td>
            <td>${u.nombre}</td>
            <td style="color:var(--muted);font-size:12px;">${u.correo}</td>
            <td style="color:var(--muted);font-size:12px;">${u.telefono || '—'}</td>
            <td style="color:var(--muted);font-size:12px;">${u.documento || '—'}</td>
            <td>
              <span class="admin-badge ${u.rol === 'admin' ? 'badge-enviado' : 'badge-pendiente'}">
                ${u.rol}
              </span>
            </td>
            <td style="color:var(--muted);font-size:12px;">
              ${new Date(u.created_at).toLocaleDateString('es-CO')}
            </td>
            <td>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="admin-btn admin-btn-secondary admin-btn-sm"
                  onclick="cambiarRol(${u.id_usuario}, '${u.rol}', '${u.nombre.replace(/'/g,"\\'")}')">
                  👤 Rol
                </button>
                <button class="admin-btn admin-btn-danger admin-btn-sm"
                  onclick="confirmarEliminar(${u.id_usuario}, '${u.nombre.replace(/'/g,"\\'")}')">
                  🗑️ Eliminar
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filtrar() {
  const q = document.getElementById('buscar').value.toLowerCase();
  const rol = document.getElementById('filtroRol').value;
  const filtrados = usuarios.filter(u => {
    const matchQ = !q || u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
    const matchR = !rol || u.rol === rol;
    return matchQ && matchR;
  });
  renderTabla(filtrados);
}

function cambiarRol(id, rolActual, nombre) {
  const nuevoRol = rolActual === 'admin' ? 'cliente' : 'admin';
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);
    display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);`;

  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;
      padding:32px;max-width:420px;width:90%;text-align:center;">
      <div style="font-size:40px;margin-bottom:16px;">👤</div>
      <h3 style="font-family:'Syne',sans-serif;font-size:18px;margin-bottom:8px;color:#fff;">
        Cambiar rol
      </h3>
      <p style="color:#888;font-size:14px;margin-bottom:24px;">
        ¿Cambiar el rol de <strong style="color:#fff;">${nombre}</strong> a
        <strong style="color:#ff6b00;">${nuevoRol}</strong>?
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="btnCancelarRol" style="padding:10px 24px;background:transparent;
          border:1px solid #444;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Syne',sans-serif;font-weight:700;">Cancelar</button>
        <button id="btnConfirmarRol" style="padding:10px 24px;background:#ff6b00;
          border:none;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Syne',sans-serif;font-weight:700;">Confirmar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('btnCancelarRol').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  document.getElementById('btnConfirmarRol').onclick = async () => {
    overlay.remove();
    try {
      const res = await fetch(`${API_BASE}/admin/usuarios/${id}/rol`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rol: nuevoRol })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar rol');
      mostrarToast(`Rol cambiado a ${nuevoRol} ✓`);
      cargarUsuarios();
    } catch (err) {
      mostrarToast(err.message, true);
    }
  };
}

function confirmarEliminar(id, nombre) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);
    display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);`;

  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;
      padding:32px;max-width:420px;width:90%;text-align:center;">
      <div style="font-size:40px;margin-bottom:16px;">🗑️</div>
      <h3 style="font-family:'Syne',sans-serif;font-size:18px;margin-bottom:8px;color:#fff;">
        ¿Eliminar usuario?
      </h3>
      <p style="color:#888;font-size:14px;margin-bottom:24px;">
        Estás a punto de eliminar a <strong style="color:#fff;">${nombre}</strong>.<br>
        Esta acción no se puede deshacer.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="btnCancelarEl" style="padding:10px 24px;background:transparent;
          border:1px solid #444;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Syne',sans-serif;font-weight:700;">Cancelar</button>
        <button id="btnConfirmarEl" style="padding:10px 24px;background:#e53e3e;
          border:none;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Syne',sans-serif;font-weight:700;">Sí, eliminar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('btnCancelarEl').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  document.getElementById('btnConfirmarEl').onclick = async () => {
    overlay.remove();
    try {
      const res = await fetch(`${API_BASE}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      mostrarToast('Usuario eliminado ✓');
      cargarUsuarios();
    } catch (err) {
      mostrarToast(err.message, true);
    }
  };
}

function mostrarToast(msg, error = false) {
  const t = document.createElement('div');
  t.className = 'admin-toast' + (error ? ' error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}