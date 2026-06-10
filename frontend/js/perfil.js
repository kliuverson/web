const API = 'http://localhost:3000/api/auth';
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {

  const usuario = JSON.parse(
    localStorage.getItem('fm_usuario') ||
    sessionStorage.getItem('fm_usuario') ||
    'null'
  );

  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const token = localStorage.getItem('fm_token') || sessionStorage.getItem('fm_token');

  usuario.documento = (usuario.documento || '').replace(/\D/g, '');
  usuario.telefono  = (usuario.telefono  || '').replace(/\D/g, '');
  if (localStorage.getItem('fm_usuario')) {
    localStorage.setItem('fm_usuario', JSON.stringify(usuario));
  } else {
    sessionStorage.setItem('fm_usuario', JSON.stringify(usuario));
  }

  const iniciales = usuario.nombre
    .split(' ')
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  const avatar = document.querySelector('.avatar');
  if (avatar) avatar.textContent = iniciales;

  const nombreEl = document.querySelector('.perfil-name');
  if (nombreEl) nombreEl.textContent = usuario.nombre.toUpperCase();

  const metas = document.querySelectorAll('.perfil-meta span');
  if (metas[0]) metas[0].innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    ${usuario.correo}`;
  if (metas[1]) metas[1].innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 5.73 5.73l1.75-1.75a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/></svg>
    ${usuario.telefono || 'No registrado'}`;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || 'No registrado';
  };

  const formatFecha = (f) => f ? f.split('T')[0] : null;

  setVal('val-nombre',    usuario.nombre);
  setVal('val-documento', usuario.documento);
  setVal('val-telefono',  usuario.telefono);
  setVal('val-fecha',     formatFecha(usuario.fecha_nacimiento));
  setVal('val-correo',    usuario.correo);

  // ── Badge carrito ──
  const cargarBadgeCarrito = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/carrito`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const badge = document.querySelector('.cart-badge');
      if (badge) badge.textContent = data.items?.length || 0;
    } catch (err) {
      console.error('Error cargando carrito');
    }
  };

  cargarBadgeCarrito();

  const btnEditar   = document.getElementById('btnEditar');
  const btnCancelar = document.getElementById('btnCancelar');
  const btnGuardar  = document.getElementById('btnGuardar');
  const vistaInfo   = document.getElementById('vistaInfo');
  const formEdit    = document.getElementById('formEdit');

  const inpTelefono = document.getElementById('inp-telefono');
  if (inpTelefono) {
    inpTelefono.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  const inpDocumento = document.getElementById('inp-documento');
  if (inpDocumento) {
    inpDocumento.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      document.getElementById('inp-nombre').value    = usuario.nombre || '';
      document.getElementById('inp-documento').value = usuario.documento || '';
      document.getElementById('inp-telefono').value  = usuario.telefono || '';
      document.getElementById('inp-fecha').value     = usuario.fecha_nacimiento
        ? usuario.fecha_nacimiento.split('T')[0]
        : '';

      vistaInfo.style.display = 'none';
      formEdit.style.display  = 'block';
      btnEditar.style.display = 'none';
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      vistaInfo.style.display = 'block';
      formEdit.style.display  = 'none';
      btnEditar.style.display = 'inline-flex';
    });
  }

  if (btnGuardar) {
    btnGuardar.addEventListener('click', async () => {
      const datos = {
        nombre:           document.getElementById('inp-nombre').value.trim(),
        documento:        document.getElementById('inp-documento').value.trim(),
        telefono:         document.getElementById('inp-telefono').value.trim(),
        fecha_nacimiento: document.getElementById('inp-fecha').value || null,
      };

      if (!datos.nombre) {
        alert('El nombre es obligatorio.');
        return;
      }

      btnGuardar.textContent = 'Guardando...';
      btnGuardar.disabled    = true;

      try {
        const res = await fetch(`${API}/actualizar`, {
          method: 'PUT',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(datos)
        });

        const data = await res.json();

        if (res.ok) {
          const usuarioActualizado = { ...usuario, ...datos };
          if (localStorage.getItem('fm_usuario')) {
            localStorage.setItem('fm_usuario', JSON.stringify(usuarioActualizado));
          } else {
            sessionStorage.setItem('fm_usuario', JSON.stringify(usuarioActualizado));
          }

          setVal('val-nombre',    datos.nombre);
          setVal('val-documento', datos.documento);
          setVal('val-telefono',  datos.telefono);
          setVal('val-fecha',     formatFecha(datos.fecha_nacimiento));

          if (nombreEl) nombreEl.textContent = datos.nombre.toUpperCase();

          const nuevasIniciales = datos.nombre
            .split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
          if (avatar) avatar.textContent = nuevasIniciales;

          vistaInfo.style.display = 'block';
          formEdit.style.display  = 'none';
          btnEditar.style.display = 'inline-flex';
        } else {
          alert(data.error || 'Error al guardar.');
        }
      } catch (e) {
        alert('No se pudo conectar con el servidor.');
      } finally {
        btnGuardar.textContent = 'Guardar cambios';
        btnGuardar.disabled    = false;
      }
    });
  }

  const btnLogout = document.querySelector('.snav-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('fm_token');
      localStorage.removeItem('fm_usuario');
      sessionStorage.removeItem('fm_token');
      sessionStorage.removeItem('fm_usuario');
      window.location.href = 'login.html';
    });
  }

});