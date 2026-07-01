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
  if (!usuario) { window.location.href = '../login.html'; return; }
  if (!['admin', 'super_admin'].includes(usuario.rol)) { window.location.href = '../index.html'; return; }

  token = localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');

  const badge = document.getElementById('adminUserBadge');
  if (badge) badge.textContent = usuario.nombre.split(' ')[0].toUpperCase();

  document.querySelector('.admin-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear(); sessionStorage.clear();
    window.location.href = '../login.html';
  });

  document.getElementById('btnNuevoProducto').addEventListener('click', abrirModalNuevo);
  document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
  document.getElementById('formProducto').addEventListener('submit', guardarProducto);
  document.getElementById('buscar').addEventListener('input', filtrar);
  document.getElementById('filtroCategoria').addEventListener('change', filtrar);

  // Preview imagen
  document.getElementById('inpImagen').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = document.getElementById('previewImagen');
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  });

  cargarCategorias();
  cargarProductos();
});

async function cargarCategorias() {
  try {
    const res = await fetch(`${API_BASE}/categorias`);
    categorias = await res.json();

    const selModal = document.getElementById('inpCategoria');
    const selFiltro = document.getElementById('filtroCategoria');

    categorias.forEach(c => {
      selModal.innerHTML += `<option value="${c.id_categoria}">${c.nombre}</option>`;
      selFiltro.innerHTML += `<option value="${c.id_categoria}">${c.nombre}</option>`;
    });
  } catch (err) {
    console.error('Error cargando categorías:', err);
  }
}

async function cargarProductos() {
  const wrap = document.getElementById('tablaProductos');
  wrap.innerHTML = '<div class="admin-loading">Cargando...</div>';
  try {
    const res = await fetch(`${API_BASE}/admin/productos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al cargar productos');
    productos = await res.json();
    renderTabla(productos);
  } catch (err) {
    wrap.innerHTML = `<div class="admin-loading">Error: ${err.message}</div>`;
  }
}

function renderTabla(data) {
  const wrap = document.getElementById('tablaProductos');
  document.getElementById('totalProductos').textContent = data.length;

  if (!data.length) {
    wrap.innerHTML = '<div class="admin-loading">No hay productos.</div>';
    return;
  }

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>#</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock mín.</th>
          <th>Talla</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(p => `
          <tr>
            <td>
              ${p.imagen_url
      ? `<img src="${p.imagen_url}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;">`
      : `<div style="width:48px;height:48px;background:#222;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#555;">📦</div>`
    }
            </td>
            <td>#${p.id_producto}</td>
            <td>${p.nombre}</td>
            <td style="color:var(--muted);font-size:12px;">${p.categoria || '—'}</td>
            <td>$${parseFloat(p.precio).toLocaleString('es-CO')}</td>
            <td>${p.stock_minimo || 0}</td>
            <td style="color:var(--muted);font-size:12px;">${p.talla || '—'}</td>
            <td>
              <div style="display:flex;gap:8px;">
                <button class="admin-btn admin-btn-secondary admin-btn-sm"
                  onclick="abrirModalEditar(${p.id_producto})">✏️ Editar</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm"
                  onclick="confirmarEliminar(${p.id_producto}, '${p.nombre.replace(/'/g, "\\'")}')">🗑️ Eliminar</button>
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
  const cat = document.getElementById('filtroCategoria').value;
  const filtrados = productos.filter(p => {
    const matchQ = !q || p.nombre.toLowerCase().includes(q);
    const matchC = !cat || String(p.id_categoria) === cat;
    return matchQ && matchC;
  });
  renderTabla(filtrados);
}

function abrirModalNuevo() {
  editandoId = null;
  document.getElementById('modalTitulo').textContent = 'Nuevo producto';
  document.getElementById('formProducto').reset();
  document.getElementById('previewImagen').style.display = 'none';
  document.getElementById('modal').style.display = 'flex';
}

function abrirModalEditar(id) {
  const p = productos.find(x => x.id_producto === id);
  if (!p) return;
  editandoId = id;
  document.getElementById('modalTitulo').textContent = 'Editar producto';
  document.getElementById('inpNombre').value = p.nombre;
  document.getElementById('inpCategoria').value = p.id_categoria;
  document.getElementById('inpPrecio').value = p.precio;
  document.getElementById('inpStock').value = p.stock_minimo || 0;
  document.getElementById('inpDescripcion').value = p.descripcion || '';
  document.getElementById('inpTalla').value = p.talla || '';


  const preview = document.getElementById('previewImagen');
  if (p.imagen_url) {
    preview.src = p.imagen_url;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
  editandoId = null;
}

async function guardarProducto(e) {
  e.preventDefault();
  const btn = document.getElementById('btnGuardar');
  btn.textContent = 'GUARDANDO...';
  btn.disabled = true;

  const formData = new FormData();
  formData.append('nombre', document.getElementById('inpNombre').value.trim());
  formData.append('id_categoria', document.getElementById('inpCategoria').value);
  formData.append('precio', document.getElementById('inpPrecio').value);
  formData.append('stock_minimo', document.getElementById('inpStock').value);
  formData.append('descripcion', document.getElementById('inpDescripcion').value.trim());
  formData.append('talla', document.getElementById('inpTalla').value.trim());

  const imagen = document.getElementById('inpImagen').files[0];
  if (imagen) formData.append('imagen', imagen);

  try {
    const url = editandoId ? `${API_BASE}/admin/productos/${editandoId}` : `${API_BASE}/admin/productos`;
    const method = editandoId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');

    cerrarModal();
    mostrarToast(editandoId ? 'Producto actualizado ✓' : 'Producto creado ✓');
    cargarProductos();
  } catch (err) {
    mostrarToast(err.message, true);
  } finally {
    btn.textContent = 'GUARDAR';
    btn.disabled = false;
  }
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
        ¿Eliminar producto?
      </h3>
      <p style="color:#888;font-size:14px;margin-bottom:24px;">
        Estás a punto de eliminar <strong style="color:#fff;">"${nombre}"</strong>.<br>
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
      const res = await fetch(`${API_BASE}/admin/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      mostrarToast('Producto eliminado ✓');
      cargarProductos();
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