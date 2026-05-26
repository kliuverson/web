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

module.exports = { findByEmail, findById, create, update };