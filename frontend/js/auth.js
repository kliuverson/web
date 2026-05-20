const API = 'http://10.2.126.248:3000/api/auth';

// ── Guardar y leer sesión ──────────────────────────
const guardarSesion = (token, usuario) => {
  localStorage.setItem('fm_token', token);
  localStorage.setItem('fm_usuario', JSON.stringify(usuario));
};

const obtenerSesion = () => {
  const token = localStorage.getItem('fm_token');
  const usuario = JSON.parse(localStorage.getItem('fm_usuario') || 'null');
  return { token, usuario };
};

const cerrarSesion = () => {
  localStorage.removeItem('fm_token');
  localStorage.removeItem('fm_usuario');
  window.location.href = '../pages/index.html';
};

const estaLogueado = () => !!localStorage.getItem('fm_token');

// ── Actualizar ícono de perfil en navbar ───────────
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
    btn.onclick = () => { window.location.href = '../pages/perfil.html'; };
  } else {
    btn.onclick = () => { window.location.href = '../pages/login.html'; };
  }
};

// ── REGISTRO ──────────────────────────────────────
const registrar = async (nombre, correo, contrasena, telefono = '', ciudad = '') => {
  const res = await fetch(`${API}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, contrasena, telefono, ciudad }),
  });
  return res.json();
};

// ── LOGIN ─────────────────────────────────────────
const iniciarSesion = async (correo, contrasena) => {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  });
  return res.json();
};

// ── Obtener perfil del servidor ───────────────────
const obtenerPerfil = async () => {
  const { token } = obtenerSesion();
  const res = await fetch(`${API}/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// ── Ejecutar al cargar cualquier página ───────────
document.addEventListener('DOMContentLoaded', actualizarNavPerfil);

export {
  guardarSesion, obtenerSesion, cerrarSesion,
  estaLogueado, registrar, iniciarSesion, obtenerPerfil,
  actualizarNavPerfil
};