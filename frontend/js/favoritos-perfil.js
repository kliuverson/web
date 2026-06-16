const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://feel-revenue-tamper.ngrok-free.dev';

const CAT_ICONS = {
  'Herramientas Manuales':    '🔨',
  'Herramientas Eléctricas':  '⚡',
  'Tornillería y Fijaciones': '🔩',
  'Pinturas y Acabados':      '🎨',
  'Plomería':                 '🔧',
  'Seguridad Industrial':     '🦺',
  'Eléctrico':                '💡',
  'Construcción':             '🏗️',
};

const CAT_IMAGES = {
  'Herramientas Manuales':    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80',
  'Herramientas Eléctricas':  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
  'Tornillería y Fijaciones': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80',
  'Pinturas y Acabados':      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80',
  'Plomería':                 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'Seguridad Industrial':     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
  'Eléctrico':                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
  'Construcción':             'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
};

document.addEventListener('DOMContentLoaded', () => {

  // ── Verificar sesión ──
  const usuario = JSON.parse(
    localStorage.getItem('fm_usuario') ||
    sessionStorage.getItem('fm_usuario') ||
    'null'
  );

  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const token = localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');

  // ── Llenar hero ──
  const iniciales = usuario.nombre
    .split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
  const avatar = document.querySelector('.avatar');
  if (avatar) avatar.textContent = iniciales;

  const nombreEl = document.querySelector('.perfil-name');
  if (nombreEl) nombreEl.textContent = usuario.nombre.toUpperCase();

  const metas = document.querySelectorAll('.perfil-meta span');
  if (metas[0]) metas[0].innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    ${usuario.correo}`;
  if (metas[1]) metas[1].innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 5.73 5.73l1.75-1.75a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/></svg>
    ${usuario.telefono || 'No registrado'}`;

  // ── Cerrar sesión ──
  const btnLogout = document.querySelector('.snav-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('fm_token');
      localStorage.removeItem('fm_usuario');
      sessionStorage.removeItem('fm_token');
      sessionStorage.removeItem('fm_usuario');
      window.location.href = 'login.html';
    });
  }

  // ── Cargar favoritos ──
  cargarFavoritos(token);
});

// ============================================================
//  CARGAR FAVORITOS
// ============================================================
async function cargarFavoritos(token) {
  const loading  = document.getElementById('favLoading');
  const grid     = document.getElementById('favGrid');
  const vacio    = document.getElementById('favVacio');
  const countEl  = document.getElementById('favCount');

  try {
    const res = await fetch(`${API_BASE}/favoritos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error();

    const favoritos = await res.json();

    loading.style.display = 'none';

    if (!favoritos || favoritos.length === 0) {
      vacio.style.display = 'flex';
      countEl.textContent = '0 productos';
      return;
    }

    countEl.textContent = `${favoritos.length} producto${favoritos.length !== 1 ? 's' : ''}`;
    grid.style.display = 'grid';
    renderFavoritos(favoritos, token);

  } catch (err) {
    loading.style.display = 'none';
    vacio.style.display = 'flex';
    console.error('Error al cargar favoritos:', err);
  }
}

// ============================================================
//  RENDER TARJETAS
// ============================================================
function renderFavoritos(favoritos, token) {
  const grid = document.getElementById('favGrid');
  grid.innerHTML = '';

  favoritos.forEach(f => {
    const icon    = CAT_ICONS[f.categoria] || '📦';
    const imgSrc  = CAT_IMAGES[f.categoria];
    const precio  = parseFloat(f.precio);
    const precioHTML = precio > 0
      ? `<span class="fav-card-price">$${precio.toLocaleString('es-CO')}</span>`
      : `<span class="fav-card-price-na">Consultar precio</span>`;

    const card = document.createElement('div');
    card.className = 'fav-card';
    card.innerHTML = `
      ${imgSrc
        ? `<img class="fav-card-img" src="${imgSrc}" alt="${f.nombre}" loading="lazy">`
        : `<div class="fav-card-img-placeholder">${icon}</div>`
      }
      <div class="fav-card-body">
        <div class="fav-card-cat">${f.categoria || 'Producto'}</div>
        <div class="fav-card-name">${capitalizar(f.nombre)}</div>
        <div class="fav-card-footer">
          ${precioHTML}
          <div style="display:flex; gap:6px;">
            <button class="fav-remove-btn" title="Quitar de favoritos" data-id="${f.id_producto}">🗑️</button>
            <button class="fav-cart-btn" data-id="${f.id_producto}" data-nombre="${f.nombre}">🛒 Agregar</button>
          </div>
        </div>
      </div>
    `;

    // Ir al detalle al hacer click en la card
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-remove-btn') || e.target.closest('.fav-cart-btn')) return;
      window.location.href = `product.html?id=${f.id_producto}`;
    });

    // Quitar de favoritos
    card.querySelector('.fav-remove-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await quitarFavorito(f.id_producto, token, card);
    });

    // Agregar al carrito
    card.querySelector('.fav-cart-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await agregarAlCarrito(f.id_producto, f.nombre, token, e.currentTarget);
    });

    grid.appendChild(card);
  });
}

// ============================================================
//  QUITAR FAVORITO
// ============================================================
async function quitarFavorito(idProducto, token, cardEl) {
  try {
    const res = await fetch(`${API_BASE}/favoritos/${idProducto}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error();

    // Animación de salida
    cardEl.style.transition = 'opacity 0.3s, transform 0.3s';
    cardEl.style.opacity = '0';
    cardEl.style.transform = 'scale(0.9)';
    setTimeout(() => {
      cardEl.remove();

      // Actualizar contador
      const grid    = document.getElementById('favGrid');
      const countEl = document.getElementById('favCount');
      const total   = grid.querySelectorAll('.fav-card').length;

      countEl.textContent = `${total} producto${total !== 1 ? 's' : ''}`;

      // Si no quedan, mostrar estado vacío
      if (total === 0) {
        grid.style.display = 'none';
        document.getElementById('favVacio').style.display = 'flex';
      }
    }, 300);

  } catch (err) {
    console.error('Error al quitar favorito:', err);
  }
}

// ============================================================
//  AGREGAR AL CARRITO DESDE FAVORITOS
// ============================================================
async function agregarAlCarrito(idProducto, nombre, token, btn) {
  const original = btn.innerHTML;
  btn.innerHTML = '✓ Agregado';
  btn.style.background = '#2ecc71';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/carrito`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id_producto: idProducto, cantidad: 1 })
    });

    if (!res.ok) throw new Error();

    // Actualizar badge del carrito si existe
    if (typeof actualizarContadorCarrito === 'function') {
      actualizarContadorCarrito();
    }

  } catch (err) {
    console.error('Error al agregar al carrito:', err);
    btn.innerHTML = '✗ Error';
    btn.style.background = '#e74c3c';
  } finally {
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 1500);
  }
}

// ============================================================
//  HELPER
// ============================================================
function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}