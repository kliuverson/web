// src/models/category.model.js
const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM categorias WHERE id_categoria = ?', [id]);
  return rows[0];
};

const create = async (nombre, descripcion = '') => {
  const [result] = await db.query(
    'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
    [nombre, descripcion]
  );
  return { id_categoria: result.insertId, nombre, descripcion };
};

const update = async (id, nombre, descripcion = '') => {
  await db.query(
    'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
    [nombre, descripcion, id]
  );
  return getById(id);
};

const remove = async (id) => {
  await db.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
};

module.exports = { getAll, getById, create, update, remove };