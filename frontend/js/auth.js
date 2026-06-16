const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://feel-revenue-tamper.ngrok-free.dev';

// ── Guardar y leer sesión ──────────────────────────
const guardarSesion = (token, usuario) => {
  localStorage.setItem('fm_token', token);
  localStorage.setItem('fm_usuario', JSON.stringify(usuario));
  console.log('Sesión guardada:', { token, usuario });
};

const obtenerSesion = () => {
  const token   = localStorage.getItem('fm_token');
  const usuario = JSON.parse(localStorage.getItem('fm_usuario') || 'null');
  return { token, usuario };
};

// ── Cerrar sesión ──────────────────────────────────
const cerrarSesion = () => {
  localStorage.removeItem('fm_token');
  localStorage.removeItem('fm_usuario');
  window.location.href = 'index.html';   // ✅ ruta relativa
};

// ── Verificar login ────────────────────────────────
const estaLogueado = () => {
  return !!localStorage.getItem('fm_token');
};

// ── Actualizar navbar perfil ───────────────────────
const actualizarNavPerfil = () => {
  const btn = document.querySelector('.profile-btn');
  if (!btn) return;

  if (estaLogueado()) {
    const { usuario } = obtenerSesion();
    const iniciales = usuario.nombre
      .split(' ')
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');

    btn.innerHTML = `<span class="nav-avatar">${iniciales}</span>`;
    btn.title = usuario.nombre;
    btn.onclick = () => {
      window.location.href = 'perfil.html';   // ✅ ruta relativa
    };
  } else {
    btn.onclick = () => {
      window.location.href = 'login.html';    // ✅ ruta relativa
    };
  }
};

// ── REGISTRO ──────────────────────────────────────
const registrar = async (nombre, correo, contrasena, telefono = '', ciudad = '') => {
  try {
    const res = await fetch(`${API}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, contrasena, telefono, ciudad })
    });
    return await res.json();
  } catch (error) {
    return { ok: false, mensaje: 'Error de conexión con el servidor' };
  }
};

// ── LOGIN ─────────────────────────────────────────
const iniciarSesion = async (correo, contrasena) => {
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });
    return await res.json();
  } catch (error) {
    return { ok: false, mensaje: 'Error de conexión con el servidor' };
  }
};

// ── Obtener perfil ─────────────────────────────────
const obtenerPerfil = async () => {
  try {
    const { token } = obtenerSesion();
    const res = await fetch(`${API}/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  } catch (error) {
    return { ok: false, mensaje: 'No se pudo obtener el perfil' };
  }
};

// ── Ejecutar al cargar ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarNavPerfil();
});

// ── Exportar funciones ─────────────────────────────
export {
  guardarSesion,
  obtenerSesion,
  cerrarSesion,
  estaLogueado,
  registrar,
  iniciarSesion,
  obtenerPerfil,
  actualizarNavPerfil
};