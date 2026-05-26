// src/models/product.model.js
const db = require('../config/db');

// Todos los productos con nombre de categoría
const getAll = async () => {
  const [rows] = await db.query(`
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    ORDER BY c.nombre, p.nombre
  `);
  return rows;
};

// 20 productos por categoría
const getByCategoria = async (id_categoria) => {
  const [rows] = await db.query(`
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.id_categoria = ?
    LIMIT 20
  `, [id_categoria]);
  return rows;
};

// Un producto por ID
const getById = async (id) => {
  const [rows] = await db.query(`
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.id_producto = ?
  `, [id]);
  return rows[0];
};

// Crear producto
const create = async (product) => {
  const { id_categoria, nombre, descripcion, precio, stock_minimo } = product;
  const [result] = await db.query(
    `INSERT INTO productos (id_categoria, nombre, descripcion, precio, stock_minimo)
     VALUES (?, ?, ?, ?, ?)`,
    [id_categoria, nombre, descripcion, precio, stock_minimo]
  );
  return { id_producto: result.insertId, ...product };
};

// Actualizar producto
const update = async (id, product) => {
  const { id_categoria, nombre, descripcion, precio, stock_minimo } = product;
  await db.query(
    `UPDATE productos
     SET id_categoria=?, nombre=?, descripcion=?, precio=?, stock_minimo=?
     WHERE id_producto=?`,
    [id_categoria, nombre, descripcion, precio, stock_minimo, id]
  );
  return { id_producto: id, ...product };
};

// Eliminar producto
const remove = async (id) => {
  await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
};

module.exports = { getAll, getByCategoria, getById, create, update, remove };