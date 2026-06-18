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
  if (usuario.rol !== 'admin') { window.location.href = '../index.html'; return; }

  token = localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');

  const badge = document.getElementById('adminUserBadge');
  if (badge) badge.textContent = usuario.nombre.split(' ')[0].toUpperCase();

  document.querySelector('.admin-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear(); sessionStorage.clear();
    window.location.href = '../login.html';
  });

  document.getElementById('buscar').addEventListener('input', filtrar);
  document.getElementById('filtroEstado').addEventListener('change', filtrar);
  document.getElementById('btnCancelarEstado').addEventListener('click', cerrarModal);
  document.getElementById('btnGuardarEstado').addEventListener('click', guardarEstado);

  cargarPedidos();
});

async function cargarPedidos() {
  const wrap = document.getElementById('tablaPedidos');
  wrap.innerHTML = '<div class="admin-loading">Cargando...</div>';
  try {
    const res = await fetch(`${API_BASE}/admin/pedidos?limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al cargar pedidos');
    pedidos = await res.json();
    renderTabla(pedidos);
  } catch (err) {
    wrap.innerHTML = `<div class="admin-loading">Error: ${err.message}</div>`;
  }
}

function renderTabla(data) {
  const wrap = document.getElementById('tablaPedidos');
  document.getElementById('totalPedidos').textContent = `Total: ${data.length}`;

  if (!data.length) {
    wrap.innerHTML = '<div class="admin-loading">No hay pedidos.</div>';
    return;
  }

  const badgeClass = {
    pendiente:  'badge-pendiente',
    procesando: 'badge-procesando',
    enviado:    'badge-enviado',
    entregado:  'badge-entregado',
    cancelado:  'badge-cancelado',
  };

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(p => `
          <tr>
            <td>#${p.id_pedido}</td>
            <td>${p.nombre || '—'}</td>
            <td>${new Date(p.fecha_pedido).toLocaleDateString('es-CO')}</td>
            <td>$${parseFloat(p.total).toLocaleString('es-CO')}</td>
            <td><span class="admin-badge ${badgeClass[p.estado] || ''}">${p.estado}</span></td>
            <td>
              ${p.estado !== 'cancelado' && p.estado !== 'entregado' ? `
                <button class="admin-btn admin-btn-secondary admin-btn-sm"
                  onclick="abrirModal(${p.id_pedido}, '${(p.nombre||'').replace(/'/g,"\\'")}', '${p.estado}')">
                  ✏️ Estado
                </button>
              ` : `<span style="color:#999; font-size:12px;">${p.estado === 'cancelado' ? 'Cancelado' : 'Finalizado'}</span>`}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filtrar() {
  const q = document.getElementById('buscar').value.toLowerCase();
  const estado = document.getElementById('filtroEstado').value;
  const filtrados = pedidos.filter(p => {
    const matchQ = !q || `#${p.id_pedido}`.includes(q) || (p.nombre||'').toLowerCase().includes(q);
    const matchE = !estado || p.estado === estado;
    return matchQ && matchE;
  });
  renderTabla(filtrados);
}

function abrirModal(id, cliente, estadoActual) {
  pedidoEditando = id;
  document.getElementById('modalPedidoId').textContent = `#${id}`;
  document.getElementById('modalCliente').textContent = cliente;
  document.getElementById('selectEstado').value = estadoActual;
  document.getElementById('modalEstado').style.display = 'flex';
}

function cerrarModal() {
  document.getElementById('modalEstado').style.display = 'none';
  pedidoEditando = null;
}

async function guardarEstado() {
  const nuevoEstado = document.getElementById('selectEstado').value;
  const btn = document.getElementById('btnGuardarEstado');

  btn.textContent = 'Guardando...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/admin/pedidos/${pedidoEditando}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar');
    cerrarModal();
    mostrarToast('Estado actualizado ✓');
    cargarPedidos();
  } catch (err) {
    mostrarToast(err.message, true);
  } finally {
    btn.textContent = 'Guardar';
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