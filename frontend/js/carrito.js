const API_BASE = 'http://localhost:3000';

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
  'Herramientas Manuales':    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200&q=80',
  'Herramientas Eléctricas':  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&q=80',
  'Tornillería y Fijaciones': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&q=80',
  'Pinturas y Acabados':      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&q=80',
  'Plomería':                 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
  'Seguridad Industrial':     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80',
  'Eléctrico':                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&q=80',
  'Construcción':             'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80',
};

function getToken() {
  return localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');
}

function estaLogueado() {
  return !!getToken();
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

async function cargarCarrito() {
  const contenido = document.getElementById('carritoContenido');
  const subtitulo = document.getElementById('carritoSubtitulo');

  if (!estaLogueado()) {
    subtitulo.textContent = '';
    contenido.innerHTML = `
      <div class="no-auth">
        <h3>Inicia sesión para ver tu carrito</h3>
        <p>Necesitas una cuenta para guardar tus productos.</p>
        <a href="login.html">Iniciar sesión →</a>
      </div>
    `;
    return;
  }

  contenido.innerHTML = `
    <div class="carrito-grid">
      <div class="carrito-items">
        <div class="item-skeleton"></div>
        <div class="item-skeleton"></div>
        <div class="item-skeleton"></div>
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/carrito`, { headers: authHeaders() });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderCarrito(data);
  } catch (err) {
    contenido.innerHTML = `<div class="no-auth"><h3>Error cargando el carrito</h3><p>Verifica que el servidor esté corriendo.</p></div>`;
  }
}

function renderCarrito(data) {
  const contenido = document.getElementById('carritoContenido');
  const subtitulo = document.getElementById('carritoSubtitulo');
  const items     = data.items || [];

  if (items.length === 0) {
    subtitulo.textContent = 'No tienes productos aún';
    contenido.innerHTML = `
      <div class="carrito-vacio">
        <div class="icono">🛒</div>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde la tienda</p>
        <a href="index.html#productos">Ver productos →</a>
      </div>
    `;
    document.getElementById('cartBadge').textContent = '0';
    return;
  }

  subtitulo.textContent = `${items.length} producto${items.length > 1 ? 's' : ''} en tu carrito`;

  const subtotal = items.reduce((acc, i) => acc + (parseFloat(i.precio) * i.cantidad), 0);
  const envio    = subtotal >= 200000 ? 0 : 15000;
  const total    = subtotal + envio;
  window.totalCarritoActual = total;

  document.getElementById('cartBadge').textContent = items.length;

  const itemsHTML = items.map(item => {
    const icon   = CAT_ICONS[item.categoria] || '📦';
    const imgSrc = item.imagen_url || CAT_IMAGES[item.categoria];
    const precio = parseFloat(item.precio);

    return `
      <div class="carrito-item" id="item-${item.id_producto}">
        <div class="item-img">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="${item.nombre}">`
            : icon}
        </div>
        <div class="item-info">
          <div class="item-cat">${item.categoria || 'Producto'}</div>
          <div class="item-nombre">${item.nombre}</div>
          <div class="item-precio">
            ${precio > 0
              ? `$${precio.toLocaleString('es-CO')}`
              : 'Consultar precio'}
          </div>
        </div>
        <div class="item-acciones">
          <div class="qty-control">
            <button class="qty-btn" onclick="cambiarCantidad(${item.id_producto}, ${item.cantidad - 1})"
              ${item.cantidad <= 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>−</button>
            <span class="qty-num">${item.cantidad}</span>
            <button class="qty-btn" onclick="cambiarCantidad(${item.id_producto}, ${item.cantidad + 1})">+</button>
          </div>
          <button class="btn-eliminar" onclick="eliminarItem(${item.id_producto})">✕ Eliminar</button>
        </div>
      </div>
    `;
  }).join('');

  contenido.innerHTML = `
    <div class="carrito-grid">
      <div class="carrito-items">
        ${itemsHTML}
      </div>
      <div class="carrito-resumen">
        <div class="resumen-titulo">Resumen del pedido</div>
        <div class="resumen-linea">
          <span>Subtotal (${items.length} items)</span>
          <span>$${subtotal.toLocaleString('es-CO')}</span>
        </div>
        <div class="resumen-linea">
          <span>Envío</span>
          <span>${envio === 0
            ? '<span style="color:#2ecc71">Gratis</span>'
            : '$' + envio.toLocaleString('es-CO')}</span>
        </div>
        <div class="resumen-linea total">
          <span>Total</span>
          <span>$${total.toLocaleString('es-CO')}</span>
        </div>
        <button class="btn-pagar" onclick="procederPago()">
          Proceder al pago →
        </button>
        <button class="btn-vaciar" onclick="vaciarCarrito()">
          Vaciar carrito
        </button>
      </div>
    </div>
  `;
}

async function cambiarCantidad(id_producto, cantidad) {
  if (cantidad < 1) return;
  try {
    const res = await fetch(`${API_BASE}/carrito/${id_producto}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ cantidad })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderCarrito(data);
  } catch (err) {
    console.error('Error actualizando cantidad');
  }
}

async function eliminarItem(id_producto) {
  try {
    const res = await fetch(`${API_BASE}/carrito/${id_producto}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderCarrito(data);
  } catch (err) {
    console.error('Error eliminando item');
  }
}

function vaciarCarrito() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);
    display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);`;

  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;
      padding:32px;max-width:420px;width:90%;text-align:center;">
      <div style="font-size:40px;margin-bottom:16px;">🛒</div>
      <h3 style="font-family:'Barlow Condensed',sans-serif;font-size:22px;
        font-weight:900;margin-bottom:8px;color:#fff;text-transform:uppercase;">
        ¿Vaciar carrito?
      </h3>
      <p style="color:#888;font-size:14px;margin-bottom:24px;">
        Se eliminarán todos los productos de tu carrito.<br>
        Esta acción no se puede deshacer.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="btnCancelarVaciar" style="padding:12px 28px;background:transparent;
          border:2px solid #444;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;
          text-transform:uppercase;">Cancelar</button>
        <button id="btnConfirmarVaciar" style="padding:12px 28px;background:#e53e3e;
          border:none;color:#fff;border-radius:4px;cursor:pointer;
          font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;
          text-transform:uppercase;">Sí, vaciar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('btnCancelarVaciar').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  document.getElementById('btnConfirmarVaciar').onclick = async () => {
    overlay.remove();
    try {
      const res = await fetch(`${API_BASE}/carrito/vaciar`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error();
      cargarCarrito();
    } catch (err) {
      console.error('Error vaciando carrito');
    }
  };
}

async function procederPago() {
  try {
    const response = await fetch(`${API_BASE}/api/wompi/checkout`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ total: window.totalCarritoActual })
    });

    const data  = await response.json();
    const token = getToken();

    const redirectUrl = `${data.redirectUrl}?token=${encodeURIComponent(token)}`;

    const checkoutUrl =
      `https://checkout.wompi.co/p/?public-key=${data.publicKey}` +
      `&currency=COP` +
      `&amount-in-cents=${data.amountInCents}` +
      `&reference=${data.reference}` +
      `&redirect-url=${encodeURIComponent(redirectUrl)}` +
      `&signature:integrity=${data.signature}`;

    window.location.href = checkoutUrl;

  } catch (error) {
    console.error(error);
    alert('No fue posible iniciar el pago.');
  }
}

cargarCarrito();