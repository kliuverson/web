const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { enviarCorreoRecuperacion } = require('../config/email');

const registro = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, documento } = req.body;
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }
    const existe = await User.findByEmail(correo);
    if (existe) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await User.create({ nombre, correo, contrasena: hash, telefono, documento });
    const token = jwt.sign({ id: usuario.id, correo }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ mensaje: 'Usuario registrado correctamente', token, usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    const usuario = await User.findByEmail(correo);
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    const token = jwt.sign(
  {
    id: usuario.id_usuario,
    correo: usuario.correo,
    rol: usuario.rol
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
    const { contrasena: _, ...datos } = usuario;
    res.json({ mensaje: 'Login exitoso', token, usuario: datos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const perfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizar = async (req, res) => {
  try {
    const usuario = await User.update(req.userId, req.body);
    res.json({ mensaje: 'Perfil actualizado', usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// ── Solicitar recuperación de contraseña ──
// Recibe el correo, genera un token temporal y envía el enlace por email.
// Siempre responde con el mismo mensaje exista o no el correo, para no revelar
// si una dirección está registrada (medida de seguridad estándar).
const olvidoContrasena = async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) {
      return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    const mensajeGenerico = {
      mensaje: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
    };

    const usuario = await User.findByEmail(correo);
    if (!usuario) {
      // No revelamos que el correo no existe
      return res.json(mensajeGenerico);
    }

    // Token aleatorio que se envía al usuario (no se guarda en texto plano)
    const tokenPlano = crypto.randomBytes(32).toString('hex');
    // Hash del token, esto es lo que se guarda en la base de datos
    const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');
    // Expira en 1 hora
    const expira = new Date(Date.now() + 60 * 60 * 1000);

    await User.setResetToken(correo, tokenHash, expira);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const enlace = `${frontendUrl}/pages/restablecer-contrasena.html?token=${tokenPlano}`;

    await enviarCorreoRecuperacion(usuario.correo, usuario.nombre, enlace);

    res.json(mensajeGenerico);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── Restablecer contraseña con el token recibido por correo ──
const restablecerContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }
    if (nuevaContrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const usuario = await User.findByResetToken(tokenHash);

    if (!usuario) {
      return res.status(400).json({ error: 'El enlace es inválido o ya expiró. Solicita uno nuevo.' });
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);
    await User.updatePassword(usuario.id_usuario, hash);

    res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { registro, login, perfil, actualizar, olvidoContrasena, restablecerContrasena };

