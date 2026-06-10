const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

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

module.exports = { registro, login, perfil, actualizar };