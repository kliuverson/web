const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://feel-revenue-tamper.ngrok-free.dev';

// ── Tomar el token desde la URL: restablecer-contrasena.html?token=xxxx ──
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  document.getElementById('formContenedor').style.display = 'none';
  mostrarError('Enlace inválido. Solicita uno nuevo desde la página de recuperación.');
}

// ── Toggle mostrar/ocultar contraseña ──
function togglePass(inputId, iconoId) {
  const input = document.getElementById(inputId);
  const icono = document.getElementById(iconoId);
  if (input.type === 'password') {
    input.type = 'text';
    icono.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  } else {
    input.type = 'password';
    icono.innerHTML = `
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}

document.getElementById('toggleBtn1').addEventListener('click', () => togglePass('contrasena', 'iconoOjo1'));
document.getElementById('toggleBtn2').addEventListener('click', () => togglePass('confirmar', 'iconoOjo2'));

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

async function guardarContrasena() {
  const contrasena = document.getElementById('contrasena').value;
  const confirmar = document.getElementById('confirmar').value;
  const btn = document.getElementById('btnGuardar');

  if (!contrasena || !confirmar) {
    mostrarError('Completa ambos campos.');
    return;
  }
  if (contrasena.length < 6) {
    mostrarError('La contraseña debe tener al menos 6 caracteres.');
    return;
  }
  if (contrasena !== confirmar) {
    mostrarError('Las contraseñas no coinciden.');
    return;
  }

  btn.classList.add('cargando');
  btn.textContent = 'GUARDANDO...';

  try {
    const res = await fetch(`${API_BASE}/api/auth/restablecer-contrasena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nuevaContrasena: contrasena }),
    });

    const data = await res.json();

    if (res.ok) {
      mostrarExito(data.mensaje || 'Contraseña actualizada correctamente. Redirigiendo...');
      document.getElementById('formContenedor').style.display = 'none';
      setTimeout(() => {
        window.location.href = '../pages/login.html';
      }, 1800);
    } else {
      mostrarError(data.error || 'El enlace es inválido o ya expiró.');
    }
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    mostrarError('No se pudo conectar con el servidor.');
  } finally {
    btn.classList.remove('cargando');
    btn.innerHTML = `
      GUARDAR CONTRASEÑA
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;
  }
}

document.getElementById('btnGuardar').addEventListener('click', guardarContrasena);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    guardarContrasena();
  }
});

