// src/models/favorite.model.js
const db = require('../config/db');

// Obtener favoritos del usuario
const getFavoritos = async (id_usuario) => {
  const [rows] = await db.query(`
    SELECT f.id_favorito, f.fecha_creacion,
           p.id_producto, p.nombre, p.precio, p.descripcion,
           c.nombre AS categoria,
           d.imagen_url
    FROM favoritos f
    JOIN productos p ON f.id_producto = p.id_producto
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN detalle_producto d ON p.id_producto = d.id_producto
    WHERE f.id_usuario = ?
    ORDER BY f.fecha_creacion DESC
  `, [id_usuario]);
  return rows;
};

// Agregar favorito
const agregar = async (id_usuario, id_producto) => {
  await db.query(
    'INSERT IGNORE INTO favoritos (id_usuario, id_producto) VALUES (?, ?)',
    [id_usuario, id_producto]
  );
  return getFavoritos(id_usuario);
};

// Eliminar favorito
const eliminar = async (id_usuario, id_producto) => {
  await db.query(
    'DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?',
    [id_usuario, id_producto]
  );
  return getFavoritos(id_usuario);
};

// Verificar si un producto es favorito
const esFavorito = async (id_usuario, id_producto) => {
  const [rows] = await db.query(
    'SELECT id_favorito FROM favoritos WHERE id_usuario = ? AND id_producto = ?',
    [id_usuario, id_producto]
  );
  return rows.length > 0;
};

module.exports = { getFavoritos, agregar, eliminar, esFavorito };