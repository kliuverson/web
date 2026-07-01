const API_BASE =
  window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://feel-revenue-tamper.ngrok-free.dev';

document.addEventListener('DOMContentLoaded', () => {

  // ── Verificar que es admin ──
  const usuario = JSON.parse(
    localStorage.getItem('fm_usuario') ||
    sessionStorage.getItem('fm_usuario') ||
    'null'
  );

  if (!usuario) {
    window.location.href = '../login.html';
    return;
  }

  if (!['admin', 'super_admin'].includes(usuario.rol)) {
    window.location.href = '../index.html';
    return;
  }

  const token = localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');

  // Mostrar nombre admin
  const badge = document.getElementById('adminUserBadge');
  if (badge) badge.textContent = usuario.nombre.split(' ')[0].toUpperCase();

  // Cerrar sesión
  document.querySelector('.admin-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '../login.html';
  });

  // Cargar stats y pedidos
  cargarStats(token);
  cargarPedidosRecientes(token);
});

// ============================================================
//  STATS
// ============================================================
async function cargarStats(token) {
  try {
    const headers = { 'Authorization': `Bearer ${token}` };

    const [resP, resPed, resU] = await Promise.all([
      fetch(`${API_BASE}/admin/stats/productos`, { headers }),
      fetch(`${API_BASE}/admin/stats/pedidos`, { headers }),
      fetch(`${API_BASE}/admin/stats/usuarios`, { headers }),
    ]);

    if (resP.ok) {
      const d = await resP.json();
      document.getElementById('statProductos').textContent = d.total ?? '—';
    }

    if (resPed.ok) {
      const d = await resPed.json();
      document.getElementById('statPedidos').textContent = d.total ?? '—';
      document.getElementById('statVentas').textContent =
        d.ventas ? `$${parseFloat(d.ventas).toLocaleString('es-CO')}` : '—';
    }

    if (resU.ok) {
      const d = await resU.json();
      document.getElementById('statUsuarios').textContent = d.total ?? '—';
    }

  } catch (err) {
    console.error('Error cargando stats:', err);
  }
}

// ============================================================
//  PEDIDOS RECIENTES
// ============================================================
async function cargarPedidosRecientes(token) {
  const wrap = document.getElementById('tablaPedidos');

  try {
    const res = await fetch(`${API_BASE}/admin/pedidos?limit=8`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error();

    const pedidos = await res.json();

    if (!pedidos.length) {
      wrap.innerHTML = '<div class="admin-loading">No hay pedidos aún.</div>';
      return;
    }

    const badgeClass = {
      pendiente: 'badge-pendiente',
      procesando: 'badge-procesando',
      enviado: 'badge-enviado',
      entregado: 'badge-entregado',
      cancelado: 'badge-cancelado',
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
          </tr>
        </thead>
        <tbody>
          ${pedidos.map(p => `
            <tr>
              <td>#${p.id_pedido}</td>
              <td>${p.nombre || '—'}</td>
              <td>${new Date(p.fecha_pedido).toLocaleDateString('es-CO')}</td>
              <td>$${parseFloat(p.total).toLocaleString('es-CO')}</td>
              <td><span class="admin-badge ${badgeClass[p.estado] || ''}">${p.estado}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (err) {
    wrap.innerHTML = '<div class="admin-loading">Error al cargar pedidos.</div>';
    console.error(err);
  }
}