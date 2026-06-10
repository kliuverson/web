// src/models/product.model.js
const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query(`
    SELECT p.*, c.nombre AS categoria, d.imagen_url
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN detalle_producto d ON p.id_producto = d.id_producto
    ORDER BY c.nombre, p.nombre
  `);
  return rows;
};

const getByCategoria = async (id_categoria) => {
  const [rows] = await db.query(`
    SELECT p.*, c.nombre AS categoria, d.imagen_url
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN detalle_producto d ON p.id_producto = d.id_producto
    WHERE p.id_categoria = ?
    LIMIT 20
  `, [id_categoria]);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query(`
    SELECT p.*, c.nombre AS categoria, d.imagen_url
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN detalle_producto d ON p.id_producto = d.id_producto
    WHERE p.id_producto = ?
  `, [id]);
  return rows[0];
};

const create = async (product) => {
  const { id_categoria, nombre, descripcion, precio, stock_minimo, talla = null } = product;
  const [result] = await db.query(
    `INSERT INTO productos (id_categoria, nombre, descripcion, talla, precio, stock_minimo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id_categoria, nombre, descripcion, talla, precio, stock_minimo]
  );
  return { id_producto: result.insertId, ...product };
};

const update = async (id, product) => {
  const { id_categoria, nombre, descripcion, precio, stock_minimo, talla = null } = product;
  await db.query(
    `UPDATE productos
     SET id_categoria=?, nombre=?, descripcion=?, talla=?, precio=?, stock_minimo=?
     WHERE id_producto=?`,
    [id_categoria, nombre, descripcion, talla, precio, stock_minimo, id]
  );
  return { id_producto: id, ...product };
};

const remove = async (id) => {
  await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
};

module.exports = { getAll, getByCategoria, getById, create, update, remove };