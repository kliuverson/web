const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://feel-revenue-tamper.ngrok-free.dev';

function getToken() {
  return localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');
}

async function procesarPago() {
  const params     = new URLSearchParams(window.location.search);
  const txId       = params.get('id');
  const referencia = params.get('ref') || params.get('reference');
  const card       = document.getElementById('pagoCard');

  console.log('Params Wompi:', { txId, referencia, all: window.location.search });

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

  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      <p class="pago-sub">Tu pago fue procesado. Tu pedido aparecerá en breve en "Mis pedidos".</p>
      <div class="pago-btns">
        <a href="pedidos.html" class="pago-btn-primary">Ver mis pedidos →</a>
        <a href="index.html" class="pago-btn-secondary">Seguir comprando</a>
      </div>
    `;
  }
}

procesarPago();