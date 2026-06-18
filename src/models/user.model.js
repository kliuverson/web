const db = require('../config/db');

const findByEmail = async (correo) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT id_usuario AS id, nombre, correo, telefono, documento, fecha_nacimiento, rol, created_at FROM usuarios WHERE id_usuario = ?',
    [id]
  );
  return rows[0];
};

const create = async ({ nombre, correo, contrasena, telefono = null, documento = null }) => {
  const [result] = await db.query(
    'INSERT INTO usuarios (nombre, correo, contrasena, telefono, documento) VALUES (?, ?, ?, ?, ?)',
    [nombre, correo, contrasena, telefono, documento]
  );
  return { id: result.insertId, nombre, correo };
};

const update = async (id, datos) => {
  const { nombre, telefono, documento, fecha_nacimiento } = datos;
  await db.query(
    'UPDATE usuarios SET nombre=?, telefono=?, documento=?, fecha_nacimiento=? WHERE id_usuario=?',
    [nombre, telefono, documento, fecha_nacimiento, id]
  );
  return findById(id);
};

// ── Recuperación de contraseña ──

// Guarda el hash del token de recuperación y su fecha de expiración para el usuario con ese correo
const setResetToken = async (correo, tokenHash, expira) => {
  await db.query(
    'UPDATE usuarios SET reset_token = ?, reset_token_expira = ? WHERE correo = ?',
    [tokenHash, expira, correo]
  );
};

// Busca un usuario por el hash del token, solo si aún no ha expirado
const findByResetToken = async (tokenHash) => {
  const [rows] = await db.query(
    'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expira > NOW()',
    [tokenHash]
  );
  return rows[0];
};

// Actualiza la contraseña (ya hasheada) y limpia el token usado
const updatePassword = async (id, contrasenaHash) => {
  await db.query(
    'UPDATE usuarios SET contrasena = ?, reset_token = NULL, reset_token_expira = NULL WHERE id_usuario = ?',
    [contrasenaHash, id]
  );
};

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  setResetToken,
  findByResetToken,
  updatePassword,
};

