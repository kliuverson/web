const API = 'http://localhost:3000/api/auth';

// ── Toggle contraseña 1 ──
document.getElementById('toggleBtn1').addEventListener('click', () => {
  togglePass('contrasena', 'iconoOjo1');
});

// ── Toggle contraseña 2 ──
document.getElementById('toggleBtn2').addEventListener('click', () => {
  togglePass('confirmar', 'iconoOjo2');
});

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

// ── Validaciones ──
function validar(nombre, correo, contrasena, confirmar, terminos) {
  if (!nombre || !correo || !contrasena || !confirmar) {
    mostrarError('Por favor completa todos los campos.');
    return false;
  }

  if (nombre.trim().length < 3) {
    mostrarError('El nombre debe tener al menos 3 caracteres.');
    document.getElementById('nombre').classList.add('invalido');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    mostrarError('Ingresa un correo electrónico válido.');
    document.getElementById('correo').classList.add('invalido');
    return false;
  }

  if (contrasena.length < 6) {
    mostrarError('La contraseña debe tener al menos 6 caracteres.');
    document.getElementById('contrasena').classList.add('invalido');
    return false;
  }

  if (contrasena !== confirmar) {
    mostrarError('Las contraseñas no coinciden.');
    document.getElementById('confirmar').classList.add('invalido');
    return false;
  }

  if (!terminos) {
    mostrarError('Debes aceptar los términos y condiciones.');
    return false;
  }

  return true;
}

// ── Limpiar estado invalido al escribir ──
['nombre', 'correo', 'contrasena', 'confirmar'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('invalido');
    document.getElementById('msgError').style.display = 'none';
  });
});

// ── Registrar usuario ──
async function registrarUsuario() {
  const nombre    = document.getElementById('nombre').value.trim();
  const correo    = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const confirmar = document.getElementById('confirmar').value;
  const terminos  = document.getElementById('terminos').checked;
  const btn       = document.getElementById('btnRegistrar');

  if (!validar(nombre, correo, contrasena, confirmar, terminos)) return;

  // Estado cargando
  btn.classList.add('cargando');
  btn.textContent = 'CREANDO CUENTA...';

  try {
    const res = await fetch(`${API}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, contrasena }),
    });

    const data = await res.text();

    if (res.ok) {
      mostrarExito('¡Cuenta creada! Redirigiendo al login...');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } else {
      mostrarError(data || 'Error al crear la cuenta. Intenta de nuevo.');
    }

  } catch (e) {
    mostrarError('No se pudo conectar con el servidor. Verifica que esté corriendo en el puerto 5502.');
  } finally {
    btn.classList.remove('cargando');
    btn.innerHTML = `
      CREAR MI CUENTA
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;
  }
}

// ── Eventos ──
document.getElementById('btnRegistrar').addEventListener('click', registrarUsuario);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') registrarUsuario();
});