// frontend/js/pedidos.js
const API_BASE_SCRIPT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://feel-revenue-tamper.ngrok-free.dev';
// ── Cargar info del usuario ──
function cargarUsuario() {
  const usuario = JSON.parse(
    localStorage.getItem('fm_usuario') ||
    sessionStorage.getItem('fm_usuario') || 'null'
  );
  if (!usuario) { window.location.href = 'login.html'; return; }

  const iniciales = usuario.nombre.split(' ').slice(0,2).map(p => p[0].toUpperCase()).join('');
  document.getElementById('avatarEl').textContent  = iniciales;
  document.getElementById('nombreEl').textContent  = usuario.nombre.toUpperCase();
  document.getElementById('correoEl').textContent  = usuario.correo;
}

// ── Cargar pedidos ──
async function cargarPedidos() {
  const token = getToken();
  if (!token) { window.location.href = 'login.html'; return; }

  try {
    const res = await fetch(`${API_BASE}/pedidos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const pedidos = await res.json();
    renderPedidos(pedidos);
  } catch (err) {
    document.getElementById('pedidosContenido').innerHTML =
      `<div class="api-error">⚠️ No se pudieron cargar los pedidos.</div>`;
  }
}

// ── Render pedidos ──
function renderPedidos(pedidos) {
  const contenido = document.getElementById('pedidosContenido');
  const total     = document.getElementById('totalPedidos');

  if (!pedidos || pedidos.length === 0) {
    total.textContent = '';
    contenido.innerHTML = `
      <div class="empty-pedidos">
        <div class="icono">📦</div>
        <h3>No tienes pedidos aún</h3>
        <p>Cuando realices una compra aparecerá aquí.</p>
        <a href="index.html#productos">Ver productos →</a>
      </div>
    `;
    return;
  }

  total.textContent = `${pedidos.length} pedido${pedidos.length > 1 ? 's' : ''}`;
  contenido.innerHTML = '';

  pedidos.forEach(p => {
    const fecha  = new Date(p.fecha_pedido).toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });
    const total  = parseFloat(p.total);
    const card   = document.createElement('div');
    card.className = 'pedido-card';
    card.innerHTML = `
      <div class="pedido-header">
        <div>
          <div class="pedido-id">Pedido #${p.id_pedido}</div>
          <div class="pedido-fecha">${fecha}</div>
        </div>
        <span class="pedido-estado estado-${p.estado}">${p.estado}</span>
      </div>
      <div class="pedido-footer">
        <div class="pedido-items">${p.total_items} producto${p.total_items > 1 ? 's' : ''}</div>
        <div class="pedido-total">$${total.toLocaleString('es-CO')}</div>
      </div>
    `;
    card.addEventListener('click', () => verDetalle(p.id_pedido));
    contenido.appendChild(card);
  });
}

// ── Ver detalle de un pedido ──
async function verDetalle(id_pedido) {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/pedidos/${id_pedido}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const pedido = await res.json();
    mostrarModal(pedido);
  } catch (err) {
    alert('No se pudo cargar el detalle del pedido.');
  }
}

// ── Mostrar modal ──
function mostrarModal(pedido) {
  const CAT_ICONS = {
    'Herramientas Manuales': '🔨', 'Herramientas Eléctricas': '⚡',
    'Tornillería y Fijaciones': '🔩', 'Pinturas y Acabados': '🎨',
    'Plomería': '🔧', 'Seguridad Industrial': '🦺',
    'Eléctrico': '💡', 'Construcción': '🏗️',
  };

  document.getElementById('modalTitulo').textContent = `Pedido #${pedido.id_pedido}`;
  const contenido = document.getElementById('modalContenido');

  const itemsHTML = pedido.items.map(item => {
    const icon    = CAT_ICONS[item.categoria] || '📦';
    const precio  = parseFloat(item.precio_unitario);
    const subtotal = precio * item.cantidad;
    return `
      <div class="modal-item">
        <div class="modal-item-img">
          ${item.imagen_url
            ? `<img src="${item.imagen_url}" alt="${item.nombre}">`
            : icon}
        </div>
        <div class="modal-item-info">
          <div class="modal-item-nombre">${item.nombre}</div>
          <div class="modal-item-sub">${item.categoria} · x${item.cantidad}</div>
        </div>
        <div class="modal-item-precio">$${subtotal.toLocaleString('es-CO')}</div>
      </div>
    `;
  }).join('');

  const fecha  = new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });
  const total  = parseFloat(pedido.total);

  contenido.innerHTML = `
    <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
      <span style="color:#666; font-size:13px;">${fecha}</span>
      <span class="pedido-estado estado-${pedido.estado}">${pedido.estado}</span>
    </div>
    ${itemsHTML}
    <div class="modal-total">
      <span>Total</span>
      <span>$${total.toLocaleString('es-CO')}</span>
    </div>
  `;

  document.getElementById('modalPedido').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('modalPedido').style.display = 'none';
  document.body.style.overflow = '';
}

// Cerrar modal al hacer clic fuera
document.getElementById('modalPedido').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalPedido')) cerrarModal();
});

// Cerrar sesión
document.querySelector('.snav-logout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('fm_token'); localStorage.removeItem('fm_usuario');
  sessionStorage.removeItem('fm_token'); sessionStorage.removeItem('fm_usuario');
  window.location.href = 'login.html';
});

// ── INIT ──
cargarUsuario();
cargarPedidos();