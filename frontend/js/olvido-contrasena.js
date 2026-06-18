const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://feel-revenue-tamper.ngrok-free.dev';

function mostrarError(msg) {
  const el = document.getElementById('msgError');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('msgExito').style.display = 'none';
}

function mostrarExito(msg) {
  const el = document.getElementById('msgExito');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('msgError').style.display = 'none';
}

async function enviarEnlace() {
  const correo = document.getElementById('correo').value.trim();
  const btn = document.getElementById('btnEnviar');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correo || !emailRegex.test(correo)) {
    mostrarError('Ingresa un correo electrónico válido.');
    return;
  }

  btn.classList.add('cargando');
  btn.textContent = 'ENVIANDO...';

  try {
    const res = await fetch(`${API_BASE}/api/auth/olvido-contrasena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo }),
    });

    const data = await res.json();

    if (res.ok) {
      mostrarExito(data.mensaje || 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.');
      document.getElementById('correo').value = '';
    } else {
      mostrarError(data.error || 'No se pudo procesar la solicitud. Intenta de nuevo.');
    }
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    mostrarError('No se pudo conectar con el servidor.');
  } finally {
    btn.classList.remove('cargando');
    btn.innerHTML = `
      ENVIAR ENLACE
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;
  }
}

document.getElementById('btnEnviar').addEventListener('click', enviarEnlace);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    enviarEnlace();
  }
});

