// src/models/product.model.js
const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM products');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
};

const create = async (product) => {
  const { name, price, stock } = product;
  const [result] = await db.query(
    'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)',
    [name, price, stock]
  );
  return { id: result.insertId, ...product };
};

const update = async (id, product) => {
  const { name, price, stock } = product;
  await db.query(
    'UPDATE products SET name=?, price=?, stock=? WHERE id=?',
    [name, price, stock, id]
  );
  return { id, ...product };
};

const remove = async (id) => {
  await db.query('DELETE FROM products WHERE id=?', [id]);
};

module.exports = { getAll, getById, create, update, remove };