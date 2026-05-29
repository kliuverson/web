// src/models/cart.model.js
const db = require('../config/db');

// Obtener o crear carrito del usuario
const obtenerOCrearCarrito = async (id_usuario) => {
  let [rows] = await db.query(
    'SELECT * FROM carrito WHERE id_usuario = ?', [id_usuario]
  );
  if (rows.length === 0) {
    const [result] = await db.query(
      'INSERT INTO carrito (id_usuario) VALUES (?)', [id_usuario]
    );
    return { id_carrito: result.insertId, id_usuario };
  }
  return rows[0];
};

// Obtener items del carrito con info del producto
const getCarrito = async (id_usuario) => {
  const carrito = await obtenerOCrearCarrito(id_usuario);
  const [rows] = await db.query(`
    SELECT 
      cd.id_carrito,
      cd.id_producto,
      cd.cantidad,
      p.nombre,
      p.precio,
      p.descripcion,
      c.nombre AS categoria
    FROM carrito_detalle cd
    JOIN productos p ON cd.id_producto = p.id_producto
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE cd.id_carrito = ?
  `, [carrito.id_carrito]);
  return { id_carrito: carrito.id_carrito, items: rows };
};

// Agregar producto al carrito
const agregarItem = async (id_usuario, id_producto, cantidad) => {
  const carrito = await obtenerOCrearCarrito(id_usuario);
  // Si ya existe el producto, sumar cantidad
  const [existe] = await db.query(
    'SELECT * FROM carrito_detalle WHERE id_carrito = ? AND id_producto = ?',
    [carrito.id_carrito, id_producto]
  );
  if (existe.length > 0) {
    await db.query(
      'UPDATE carrito_detalle SET cantidad = cantidad + ? WHERE id_carrito = ? AND id_producto = ?',
      [cantidad, carrito.id_carrito, id_producto]
    );
  } else {
    await db.query(
      'INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad) VALUES (?, ?, ?)',
      [carrito.id_carrito, id_producto, cantidad]
    );
  }
  return getCarrito(id_usuario);
};

// Actualizar cantidad de un item
const actualizarCantidad = async (id_usuario, id_producto, cantidad) => {
  const carrito = await obtenerOCrearCarrito(id_usuario);
  if (cantidad <= 0) {
    await db.query(
      'DELETE FROM carrito_detalle WHERE id_carrito = ? AND id_producto = ?',
      [carrito.id_carrito, id_producto]
    );
  } else {
    await db.query(
      'UPDATE carrito_detalle SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?',
      [cantidad, carrito.id_carrito, id_producto]
    );
  }
  return getCarrito(id_usuario);
};

// Eliminar un item
const eliminarItem = async (id_usuario, id_producto) => {
  const carrito = await obtenerOCrearCarrito(id_usuario);
  await db.query(
    'DELETE FROM carrito_detalle WHERE id_carrito = ? AND id_producto = ?',
    [carrito.id_carrito, id_producto]
  );
  return getCarrito(id_usuario);
};

// Vaciar carrito completo
const vaciarCarrito = async (id_usuario) => {
  const carrito = await obtenerOCrearCarrito(id_usuario);
  await db.query('DELETE FROM carrito_detalle WHERE id_carrito = ?', [carrito.id_carrito]);
  return { msg: 'Carrito vaciado' };
};

module.exports = { getCarrito, agregarItem, actualizarCantidad, eliminarItem, vaciarCarrito };