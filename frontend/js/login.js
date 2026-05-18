const API = 'http://localhost:5502';

// ── Toggle contraseña ──
document.getElementById('toggleBtn').addEventListener('click', () => {
  const input = document.getElementById('contrasena');
  const icono = document.getElementById('iconoOjo');

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
});

// ── Mostrar mensajes ──
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

// ── Iniciar sesión ──
async function iniciarSesion() {
  const correo    = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const recordar  = document.getElementById('recordar').checked;
  const btn       = document.getElementById('btnIngresar');

  if (!correo || !contrasena) {
    mostrarError('Por favor completa todos los campos.');
    return;
  }

  // Estado cargando
  btn.classList.add('cargando');
  btn.textContent = 'VERIFICANDO...';

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar según "recordar sesión"
      const storage = recordar ? localStorage : sessionStorage;
      storage.setItem('usuario', JSON.stringify(data.usuario));

      mostrarExito('¡Bienvenido! Redirigiendo...');
      setTimeout(() => { window.location.href = 'perfil.html'; }, 1200);
    } else {
      mostrarError(data.mensaje || 'Correo o contraseña incorrectos.');
    }

  } catch (e) {
    mostrarError('No se pudo conectar con el servidor. Verifica que esté corriendo en el puerto 5502.');
  } finally {
    btn.classList.remove('cargando');
    btn.innerHTML = `
      ENTRAR A MI CUENTA
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;
  }
}

// ── Eventos ──
document.getElementById('btnIngresar').addEventListener('click', iniciarSesion);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') iniciarSesion();
});