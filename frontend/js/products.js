// ============================================================
//  CONFIGURACIÓN API
// ============================================================
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
  'Herramientas Manuales':    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80',
  'Herramientas Eléctricas':  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
  'Tornillería y Fijaciones': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80',
  'Pinturas y Acabados':      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80',
  'Plomería':                 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'Seguridad Industrial':     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
  'Eléctrico':                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
  'Construcción':             'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
};

// ============================================================
//  ESTADO GLOBAL
// ============================================================
let allProducts   = [];
let allCategorias = [];
let cartCount     = 0;

// ============================================================
//  CARGAR CATEGORÍAS DESDE API
// ============================================================
async function cargarCategorias() {
  try {
    const res = await fetch(`${API_BASE}/categorias`);
    if (!res.ok) throw new Error();
    allCategorias = await res.json();
    renderCategoriaCards();
    renderFilterTabs();
  } catch (err) {
    document.getElementById('categoriasGrid').innerHTML =
      `<div class="api-error">⚠️ No se pudieron cargar las categorías. Verifica que el servidor esté corriendo.</div>`;
  }
}

// ============================================================
//  CARGAR PRODUCTOS DESDE API
// ============================================================
async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) throw new Error();
    allProducts = await res.json();
    renderProductos(allProducts);
  } catch (err) {
    document.getElementById('productsGrid').innerHTML =
      `<div class="api-error">⚠️ No se pudieron cargar los productos. Verifica que el servidor esté corriendo.</div>`;
  }
}

// ============================================================
//  RENDER: CARDS DE CATEGORÍAS
// ============================================================
function renderCategoriaCards() {
  const grid = document.getElementById('categoriasGrid');
  grid.innerHTML = '';
  allCategorias.forEach((cat, i) => {
    const icon = CAT_ICONS[cat.nombre] || '📦';
    const num  = String(i + 1).padStart(2, '0');
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.innerHTML = `
      <div class="cat-num">${num}</div>
      <div class="cat-name">${icon} ${cat.nombre}</div>
      <div class="cat-count">20 productos</div>
      <span class="cat-arrow">→</span>
    `;
    card.addEventListener('click', () => {
      document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
      filtrarPorCategoria(cat.id_categoria);
      document.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.catId == cat.id_categoria);
      });
    });
    grid.appendChild(card);
  });
}

// ============================================================
//  RENDER: TABS DE FILTRO
// ============================================================
function renderFilterTabs() {
  const tabs = document.getElementById('filterTabs');
  tabs.innerHTML = '<button class="filter-tab active" data-cat-id="todos">Todos</button>';
  allCategorias.forEach(cat => {
    const icon = CAT_ICONS[cat.nombre] || '📦';
    const btn  = document.createElement('button');
    btn.className     = 'filter-tab';
    btn.dataset.catId = cat.id_categoria;
    btn.textContent   = `${icon} ${cat.nombre}`;
    tabs.appendChild(btn);
  });

  tabs.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const catId = btn.dataset.catId;
      catId === 'todos' ? renderProductos(allProducts) : filtrarPorCategoria(parseInt(catId));
    });
  });
}

// ============================================================
//  RENDER: GRID DE PRODUCTOS
// ============================================================
function renderProductos(productos) {
  const grid    = document.getElementById('productsGrid');
  const noProds = document.getElementById('noProducts');
  grid.innerHTML = '';

  if (!productos || productos.length === 0) {
    noProds.style.display = 'block';
    return;
  }
  noProds.style.display = 'none';

  productos.forEach(p => {
    const catNombre  = p.categoria || getCatNombre(p.id_categoria);
    const icon       = CAT_ICONS[catNombre] || '📦';
    const imgSrc     = CAT_IMAGES[catNombre];
    const precio     = parseFloat(p.precio);
    const precioHTML = precio > 0
      ? `<div class="price-current">$${precio.toLocaleString('es-CO')}</div>`
      : `<div class="price-na">Consultar precio</div>`;

    const card = document.createElement('div');
    card.className = 'product-card';
    // Cursor pointer para indicar que es clickeable
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div class="product-img">
        ${imgSrc ? `<img src="${imgSrc}" alt="${p.nombre}" loading="lazy">` : ''}
        <div class="product-icon" ${imgSrc ? 'style="display:none"' : ''}>${icon}</div>
      </div>
      <div class="product-body">
        <div class="product-cat">${catNombre}</div>
        <div class="product-name">${capitalizarNombre(p.nombre)}</div>
        <div class="product-footer">
          <div class="price-group">${precioHTML}</div>
          <button class="add-cart-btn" title="Agregar al carrito">🛒</button>
        </div>
      </div>
    `;

    // Click en la card → ir a detalle (excepto si es el botón del carrito)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-cart-btn')) return;
      window.location.href = `product.html?id=${p.id_producto}`;
    });

    // Botón carrito — feedback visual + no redirigir
    card.querySelector('.add-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      agregarAlCarrito(p.id_producto, p.nombre);
      const btn = e.currentTarget;
      btn.textContent = '✓';
      btn.style.background = '#2ecc71';
      setTimeout(() => {
        btn.textContent = '🛒';
        btn.style.background = '';
      }, 1000);
    });

    grid.appendChild(card);
  });
}

// ============================================================
//  FILTRAR POR CATEGORÍA
// ============================================================
function filtrarPorCategoria(catId) {
  renderProductos(allProducts.filter(p => p.id_categoria === catId));
}

// ============================================================
//  HELPERS
// ============================================================
function getCatNombre(id) {
  const cat = allCategorias.find(c => c.id_categoria === id);
  return cat ? cat.nombre : 'Producto';
}

function capitalizarNombre(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================
//  CARRITO
// ============================================================
function agregarAlCarrito(id, nombre) {
  cartCount++;
  const badge = document.getElementById('cartBadge');
  badge.textContent     = cartCount;
  badge.style.transform = 'scale(1.5)';
  setTimeout(() => badge.style.transform = 'scale(1)', 200);
  console.log(`Agregado: ${nombre} (id: ${id})`);
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();
  cargarProductos();
});