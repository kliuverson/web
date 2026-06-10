const API_BASE = 'http://localhost:3000';
let token = '';
let categorias = [];
let editandoId = null;

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(
    localStorage.getItem('fm_usuario') ||
    sessionStorage.getItem('fm_usuario') || 'null'
  );
  if (!usuario) { window.location.href = '../login.html'; return; }
  if (usuario.rol !== 'admin') { window.location.href = '../index.html'; return; }

  token = localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');

  const badge = document.getElementById('adminUserBadge');
  if (badge) badge.textContent = usuario.nombre.split(' ')[0].toUpperCase();

  document.querySelector('.admin-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear(); sessionStorage.clear();
    window.location.href = '../login.html';
  });

  document.getElementById('btnNuevaCategoria').addEventListener('click', abrirModalNueva);
  document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
  document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
  document.getElementById('formCategoria').addEventListener('submit', guardarCategoria);
  document.getElementById('buscar').addEventListener('input', filtrarTabla);

  cargarCategorias();
});

async function cargarCategorias() {
  const wrap = document.getElementById('tablaBody');
  wrap.innerHTML = `<tr><td colspan="4" class="admin-loading">Cargando...</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/admin/categorias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Error ${res.status}`);
    }
    categorias = await res.json();
    renderTabla(categorias);
  } catch (e) {
    wrap.innerHTML = `<tr><td colspan="4" class="admin-loading">Error: ${e.message}</td></tr>`;
  }
}

function renderTabla(data) {
  const wrap = document.getElementById('tablaBody');
  document.getElementById('totalCategorias').textContent = data.length;
  if (!data.length) {
    wrap.innerHTML = `<tr><td colspan="4" class="admin-loading">No hay categorías aún.</td></tr>`;
    return;
  }
  wrap.innerHTML = data.map(c => `
    <tr>
      <td>#${c.id_categoria}</td>
      <td>${c.nombre}</td>
      <td style="color:var(--muted);font-size:12px;">${c.descripcion || '—'}</td>
      <td>
        <div style="display:flex;gap:8px;">
          <button class="admin-btn admin-btn-secondary admin-btn-sm"
            onclick="abrirModalEditar(${c.id_categoria}, '${c.nombre.replace(/'/g,"\\'")}', '${(c.descripcion||'').replace(/'/g,"\\'")}')">
            ✏️ Editar
          </button>
          <button class="admin-btn admin-btn-danger admin-btn-sm"
            onclick="confirmarEliminar(${c.id_categoria}, '${c.nombre.replace(/'/g,"\\'")}')">
            🗑️ Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filtrarTabla() {
  const q = document.getElementById('buscar').value.toLowerCase();
  renderTabla(categorias.filter(c => c.nombre.toLowerCase().includes(q)));
}

function abrirModalNueva() {
  editandoId = null;
  document.getElementById('modalTitulo').textContent = 'NUEVA CATEGORÍA';
  document.getElementById('inputNombre').value = '';
  document.getElementById('inputDescripcion').value = '';
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('inputNombre').focus();
}

function abrirModalEditar(id, nombre, descripcion) {
  editandoId = id;
  document.getElementById('modalTitulo').textContent = 'EDITAR CATEGORÍA';
  document.getElementById('inputNombre').value = nombre;
  document.getElementById('inputDescripcion').value = descripcion;
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('inputNombre').focus();
}

function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
}

async function guardarCategoria(e) {
  e.preventDefault();
  const nombre      = document.getElementById('inputNombre').value.trim();
  const descripcion = document.getElementById('inputDescripcion').value.trim();
  if (!nombre) return;

  const btn = document.getElementById('btnGuardar');
  btn.textContent = 'GUARDANDO...';
  btn.disabled = true;

  try {
    const url    = editandoId ? `${API_BASE}/admin/categorias/${editandoId}` : `${API_BASE}/admin/categorias`;
    const method = editandoId ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nombre, descripcion })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');
    cerrarModal();
    mostrarToast(editandoId ? 'Categoría actualizada ✓' : 'Categoría creada ✓');
    cargarCategorias();
  } catch (err) {
    mostrarToast(err.message, true);
  } finally {
    btn.textContent = 'GUARDAR';
    btn.disabled = false;
  }
}

function mostrarToast(msg, error = false) {
  const t = document.createElement('div');
  t.className = 'admin-toast' + (error ? ' error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
function confirmarEliminar(id, nombre) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.7);
    display:flex; align-items:center; justify-content:center;
    z-index:9999; backdrop-filter:blur(4px);
  `;

  overlay.innerHTML = `
    <div style="
      background:#1a1a1a; border:1px solid #333; border-radius:8px;
      padding:32px; max-width:420px; width:90%; text-align:center;
    ">
      <div style="font-size:40px; margin-bottom:16px;">🗑️</div>
      <h3 style="font-family:'Syne',sans-serif; font-size:18px; margin-bottom:8px; color:#fff;">
        ¿Eliminar categoría?
      </h3>
      <p style="color:#888; font-size:14px; margin-bottom:24px;">
        Estás a punto de eliminar <strong style="color:#fff;">"${nombre}"</strong>.<br>
        Esta acción no se puede deshacer.
      </p>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="btnCancelarEliminar" style="
          padding:10px 24px; background:transparent; border:1px solid #444;
          color:#fff; border-radius:4px; cursor:pointer; font-size:14px;
          font-family:'Syne',sans-serif; font-weight:700;
        ">Cancelar</button>
        <button id="btnConfirmarEliminar" style="
          padding:10px 24px; background:#e53e3e; border:none;
          color:#fff; border-radius:4px; cursor:pointer; font-size:14px;
          font-family:'Syne',sans-serif; font-weight:700;
        ">Sí, eliminar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btnCancelarEliminar').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  document.getElementById('btnConfirmarEliminar').onclick = async () => {
    overlay.remove();
    try {
      const res = await fetch(`${API_BASE}/admin/categorias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      mostrarToast('Categoría eliminada ✓');
      cargarCategorias();
    } catch (err) {
      mostrarToast(err.message, true);
    }
  };
}