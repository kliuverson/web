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

module.exports = { getAll, getById };