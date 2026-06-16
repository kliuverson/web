// frontend/js/detalle.js
const API_BASE_SCRIPT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://feel-revenue-tamper.ngrok-free.dev';

const CAT_ICONS = {
  'Herramientas Manuales': '🔨',
  'Herramientas Eléctricas': '⚡',
  'Tornillería y Fijaciones': '🔩',
  'Pinturas y Acabados': '🎨',
  'Plomería': '🔧',
  'Seguridad Industrial': '🦺',
  'Eléctrico': '💡',
  'Construcción': '🏗️',
};

const CAT_IMAGES = {
  'Herramientas Manuales': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
  'Herramientas Eléctricas': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
  'Tornillería y Fijaciones': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',
  'Pinturas y Acabados': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
  'Plomería': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'Seguridad Industrial': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  'Eléctrico': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
  'Construcción': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
};

function getToken() {
  return localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');
}
function estaLogueado() {
  return !!getToken();
}

const params = new URLSearchParams(window.location.search);
const productoId = params.get('id');

async function cargarProducto() {
  const main = document.getElementById('mainContent');
  const skeleton = document.getElementById('skeletonDetalle');

  if (!productoId) {
    skeleton.style.display = 'none';
    main.innerHTML = `<div class="error-detalle">⚠️ No se especificó un producto.<br><a href="index.html" style="color:#e85d04">← Volver al inicio</a></div>`;
    return;
  }

  try {
    console.log('productoId:', productoId);
    console.log('API_BASE_SCRIPT:', API_BASE_SCRIPT);
    console.log('URL:', `${API_BASE_SCRIPT}/productos/${productoId}`);
    const res = await fetch(`${API_BASE_SCRIPT}/productos/${productoId}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    const p = await res.json();

    skeleton.style.display = 'none';

    const catNombre = p.categoria || 'Producto';
    const icon = CAT_ICONS[catNombre] || '📦';
    const imgSrc = CAT_IMAGES[catNombre];
    const precio = parseFloat(p.precio);
    const precioHTML = precio > 0
      ? `$${precio.toLocaleString('es-CO')}`
      : `<span class="consultar">Consultar precio</span>`;

    const detalle = document.createElement('div');
    detalle.className = 'detalle-hero';
    detalle.innerHTML = `
      <a href="index.html#productos" class="detalle-back">← Volver a productos</a>
      <div class="detalle-grid">
        <div class="detalle-galeria">
          <div class="galeria-main">
            ${imgSrc
        ? `<img src="${imgSrc}" alt="${p.nombre}" id="imgPrincipal">`
        : `<div class="galeria-placeholder">${icon}</div>`}
          </div>
          ${imgSrc ? `
          <div class="galeria-thumbs">
            <div class="galeria-thumb active">
              <img src="${imgSrc}" alt="${p.nombre}">
            </div>
          </div>` : ''}
        </div>
        <div class="detalle-info">
          <div class="detalle-cat">${icon} ${catNombre}</div>
          <h1 class="detalle-nombre">${p.nombre}</h1>
          <div class="detalle-precio">${precioHTML}</div>
          <div class="detalle-divider"></div>
          <p class="detalle-descripcion">${p.descripcion || 'Producto de ferretería de alta calidad.'}</p>
          <div class="detalle-meta">
            <div class="detalle-meta-item">
              <span class="label">Ref</span>
              <span class="value">SIN_COD</span>
            </div>
            <div class="detalle-meta-item">
              <span class="label">Código</span>
              <span class="value">#${p.id_producto}</span>
            </div>
            <div class="detalle-meta-item">
              <span class="label">Categoría</span>
              <span class="value">${catNombre}</span>
            </div>
            ${p.talla ? `
            <div class="detalle-meta-item">
              <span class="label">Talla</span>
              <span class="value">${p.talla}</span>
            </div>` : ''}
            <div class="detalle-meta-item">
              <span class="label">Disponibilidad</span>
              <span class="value" style="color:#2ecc71">✓ En stock</span>
            </div>
          </div>
          <div class="detalle-divider"></div>
          <div id="msgCarrito"></div>
          <div class="detalle-acciones">
            <div class="qty-control">
              <button class="qty-btn" id="qtyMenos">−</button>
              <input class="qty-input" type="number" id="qtyInput" value="1" min="1">
              <button class="qty-btn" id="qtyMas">+</button>
            </div>
            <button class="btn-carrito" id="btnCarrito">🛒 Agregar al carrito</button>
          </div>
        </div>
      </div>
    `;
    main.appendChild(detalle);

    document.getElementById('qtyMenos').addEventListener('click', () => {
      const input = document.getElementById('qtyInput');
      if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
    });
    document.getElementById('qtyMas').addEventListener('click', () => {
      const input = document.getElementById('qtyInput');
      input.value = parseInt(input.value) + 1;
    });

    document.getElementById('btnCarrito').addEventListener('click', async () => {
      const btn = document.getElementById('btnCarrito');
      const cantidad = parseInt(document.getElementById('qtyInput').value);
      const msg = document.getElementById('msgCarrito');

      if (!estaLogueado()) {
        msg.innerHTML = `<p style="color:#e8b84b;font-size:13px;margin-bottom:12px">⚠️ Debes <a href="login.html" style="color:#e85d04;font-weight:700">iniciar sesión</a> para agregar al carrito.</p>`;
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Agregando...';

      try {
        const res = await fetch(`${API_BASE_SCRIPT}/carrito`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({ id_producto: p.id_producto, cantidad })
        });

        if (!res.ok) throw new Error();

        btn.textContent = '✓ Agregado';
        btn.classList.add('agregado');
        msg.innerHTML = `<p style="color:#2ecc71;font-size:13px;margin-bottom:12px">✓ Producto agregado al carrito. <a href="carrito.html" style="color:#e85d04;font-weight:700">Ver carrito →</a></p>`;
        actualizarContadorCarrito();

        setTimeout(() => {
          btn.textContent = '🛒 Agregar al carrito';
          btn.classList.remove('agregado');
          btn.disabled = false;
        }, 2000);

      } catch (err) {
        btn.textContent = 'Error, intenta de nuevo';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = '🛒 Agregar al carrito'; }, 2000);
      }
    });

    document.title = `${p.nombre} — FERREMATERIALES`;

  } catch (err) {
    skeleton.style.display = 'none';
    main.innerHTML = `<div class="error-detalle">⚠️ Producto no encontrado.<br><a href="index.html" style="color:#e85d04">← Volver al inicio</a></div>`;
  }
}

cargarProducto();