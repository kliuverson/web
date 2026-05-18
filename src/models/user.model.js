const db = require('../config/db');

const findByEmail = async (correo) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT id, nombre, correo, telefono, ciudad, empresa, documento, fecha_nacimiento, nivel, puntos, created_at FROM usuarios WHERE id = ?', [id]);
  return rows[0];
};

const create = async ({ nombre, correo, contrasena, telefono = null, ciudad = null }) => {
  const [result] = await db.query(
    'INSERT INTO usuarios (nombre, correo, contrasena, telefono, ciudad) VALUES (?, ?, ?, ?, ?)',
    [nombre, correo, contrasena, telefono, ciudad]
  );
  return { id: result.insertId, nombre, correo };
};

const update = async (id, datos) => {
  const { nombre, telefono, ciudad, empresa, documento, fecha_nacimiento } = datos;
  await db.query(
    'UPDATE usuarios SET nombre=?, telefono=?, ciudad=?, empresa=?, documento=?, fecha_nacimiento=? WHERE id=?',
    [nombre, telefono, ciudad, empresa, documento, fecha_nacimiento, id]
  );
  return findById(id);
};

module.exports = { findByEmail, findById, create, update };