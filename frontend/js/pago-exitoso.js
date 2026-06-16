const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://feel-revenue-tamper.ngrok-free.dev';

async function getTokenDeServidor(referencia) {
  try {
    const res  = await fetch(`${API_BASE}/api/wompi/token/${referencia}`);
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('fm_token', data.token);
      return data.token;
    }
  } catch (e) {
    console.error('No se pudo obtener token:', e);
  }
  return localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');
}

async function getUsuarioDeServidor(token) {
  try {
    const res  = await fetch(`${API_BASE}/api/auth/perfil`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data && data.nombre) {
      localStorage.setItem('fm_usuario', JSON.stringify(data));
      return data;
    }
  } catch (e) {}
  return JSON.parse(localStorage.getItem('fm_usuario') || 'null');
}

async function procesarPago() {
  const params     = new URLSearchParams(window.location.search);
  const txId       = params.get('id');
  const referencia = params.get('ref') || params.get('reference');
  const card       = document.getElementById('pagoCard');

  console.log('Params Wompi:', { txId, referencia });

  if (!txId && !referencia) {
    card.innerHTML = `
      <span class="pago-icono">❌</span>
      <div class="pago-titulo error">Pago no encontrado</div>
      <p class="pago-sub">No se encontró información del pago.</p>
      <div class="pago-btns">
        <a href="carrito.html" class="pago-btn-secondary">Volver al carrito</a>
      </div>
    `;
    return;
  }

  // Obtener token del servidor usando la referencia
  const token = await getTokenDeServidor(referencia);
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Obtener usuario del servidor
  const usuario = await getUsuarioDeServidor(token);

  try {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ referencia, txId })
    });

    if (res.ok) {
      card.innerHTML = `
        <span class="pago-icono">✅</span>
        <div class="pago-titulo">¡Pago aprobado!</div>
        <p class="pago-sub">Tu pedido ha sido registrado exitosamente.</p>
        <div class="pago-ref">
          Referencia de pago:
          <span>${referencia || txId}</span>
        </div>
        <div class="pago-btns">
          <a href="pedidos.html" class="pago-btn-primary">Ver mis pedidos →</a>
          <a href="index.html" class="pago-btn-secondary">Seguir comprando</a>
        </div>
      `;
    } else {
      const err = await res.json();
      console.error('Error creando pedido:', err);
      card.innerHTML = `
        <span class="pago-icono">✅</span>
        <div class="pago-titulo">¡Pago recibido!</div>
        <p class="pago-sub">Tu pago fue procesado. Tu pedido aparecerá en breve.</p>
        <div class="pago-ref">
          Referencia: <span>${referencia || txId}</span>
        </div>
        <div class="pago-btns">
          <a href="pedidos.html" class="pago-btn-primary">Ver mis pedidos →</a>
          <a href="index.html" class="pago-btn-secondary">Seguir comprando</a>
        </div>
      `;
    }

  } catch (err) {
    console.error(err);
    card.innerHTML = `
      <span class="pago-icono">⚠️</span>
      <div class="pago-titulo">Pago recibido</div>
      <p class="pago-sub">Tu pago fue procesado. Tu pedido aparecerá en breve.</p>
      <div class="pago-btns">
        <a href="pedidos.html" class="pago-btn-primary">Ver mis pedidos →</a>
        <a href="index.html" class="pago-btn-secondary">Seguir comprando</a>
      </div>
    `;
  }
}

procesarPago();