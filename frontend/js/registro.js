const BASE_URL =
  'https://feel-revenue-tamper.ngrok-free.dev';
const API = `${BASE_URL}/api/auth`;
const API_DIR = `${BASE_URL}/api/direcciones`;

let usuarioRegistrado = null;
let tokenRegistrado = null;

document.getElementById('toggleBtn1').addEventListener('click', () => {
  togglePass('contrasena', 'iconoOjo1');
});
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

['nombre', 'apellido', 'correo', 'documento', 'contrasena', 'confirmar'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    el.classList.remove('invalido');
    document.getElementById('msgError').style.display = 'none';
  });
});

document.getElementById('documento').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

function validar(nombre, apellido, correo, documento, contrasena, confirmar, terminos) {
  if (!nombre || !apellido || !correo || !documento || !contrasena || !confirmar) {
    mostrarError('Por favor completa todos los campos obligatorios.');
    return false;
  }
  if (nombre.trim().length < 2) {
    mostrarError('El nombre debe tener al menos 2 caracteres.');
    document.getElementById('nombre').classList.add('invalido');
    return false;
  }
  if (apellido.trim().length < 2) {
    mostrarError('El apellido debe tener al menos 2 caracteres.');
    document.getElementById('apellido').classList.add('invalido');
    return false;
  }
  if (!documento.trim()) {
    mostrarError('El número de documento es obligatorio.');
    document.getElementById('documento').classList.add('invalido');
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

async function registrarUsuario() {
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const documento = document.getElementById('documento').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const confirmar = document.getElementById('confirmar').value;
  const terminos = document.getElementById('terminos').checked;
  const btn = document.getElementById('btnRegistrar');

  if (!validar(nombre, apellido, correo, documento, contrasena, confirmar, terminos)) return;

  const nombreCompleto = `${nombre} ${apellido}`;

  btn.classList.add('cargando');
  btn.textContent = 'CREANDO CUENTA...';

  try {
    const res = await fetch(`${API}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreCompleto, correo, contrasena, documento }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('fm_token', data.token);
      localStorage.setItem('fm_usuario', JSON.stringify(data.usuario));
      usuarioRegistrado = data.usuario;
      tokenRegistrado = data.token;

      document.getElementById('msgError').style.display = 'none';
      document.getElementById('msgExito').style.display = 'none';
      document.getElementById('paso1').style.display = 'none';
      document.getElementById('paso2').style.display = 'block';
      document.getElementById('badgeTexto').textContent = 'Paso 2 de 2';
    } else {
      mostrarError(data.error || 'Error al crear la cuenta. Intenta de nuevo.');
    }

  } catch (e) {
    mostrarError('No se pudo conectar con el servidor.');
  } finally {
    btn.classList.remove('cargando');
    btn.innerHTML = `
      CONTINUAR
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;
  }
}

async function guardarDireccion() {
  const direccion = document.getElementById('dir-direccion').value.trim();
  const ciudad = document.getElementById('dir-ciudad').value.trim();
  const departamento = document.getElementById('dir-departamento').value.trim();
  const codigo = document.getElementById('dir-codigo').value.trim();
  const btn = document.getElementById('btnGuardarDireccion');

  if (!direccion || !ciudad || !departamento) {
    mostrarError('Completa los campos obligatorios de la dirección.');
    return;
  }

  btn.textContent = 'GUARDANDO...';
  btn.disabled = true;

  try {
    const token = tokenRegistrado || localStorage.getItem('fm_token');
    const usuario = usuarioRegistrado || JSON.parse(localStorage.getItem('fm_usuario'));
    const idUsuario = usuario.id_usuario || usuario.id;

    const res = await fetch(API_DIR, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_usuario: idUsuario,
        direccion,
        ciudad,
        departamento,
        codigo_postal: codigo,
        pais: 'Colombia'
      })
    });

    if (!res.ok) throw new Error('Error al guardar dirección');

    mostrarExito(
      'Registro completado. Revisa tu correo electrónico para activar tu cuenta.'
    );

    setTimeout(() => {
      localStorage.removeItem('fm_token');
      localStorage.removeItem('fm_usuario');
      window.location.href = 'login.html';
    }, 3000);

  } catch (e) {
    mostrarError('Error al guardar la dirección.');
    btn.textContent = 'FINALIZAR REGISTRO';
    btn.disabled = false;
  }
}

document.getElementById('btnRegistrar').addEventListener('click', registrarUsuario);
document.getElementById('btnGuardarDireccion').addEventListener('click', guardarDireccion);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const paso2 = document.getElementById('paso2');
    if (paso2.style.display === 'block') {
      guardarDireccion();
    } else {
      registrarUsuario();
    }
  }
});