// src/models/order.model.js
const db = require('../config/db');

const getPedidos = async (id_usuario) => {
  const [rows] = await db.query(`
    SELECT p.id_pedido, p.fecha_pedido, p.estado, p.total,
           COUNT(pd.id_producto) AS total_items
    FROM pedidos p
    LEFT JOIN pedido_detalle pd ON p.id_pedido = pd.id_pedido
    WHERE p.id_usuario = ?
    GROUP BY p.id_pedido
    ORDER BY p.fecha_pedido DESC
  `, [id_usuario]);
  return rows;
};

const getPedidoById = async (id_pedido, id_usuario) => {
  const [pedido] = await db.query(`
    SELECT * FROM pedidos WHERE id_pedido = ? AND id_usuario = ?
  `, [id_pedido, id_usuario]);

  if (!pedido[0]) return null;

  const [items] = await db.query(`
    SELECT pd.cantidad, pd.precio_unitario,
           p.nombre, p.descripcion,
           c.nombre AS categoria,
           d.imagen_url
    FROM pedido_detalle pd
    JOIN productos p ON pd.id_producto = p.id_producto
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN detalle_producto d ON p.id_producto = d.id_producto
    WHERE pd.id_pedido = ?
  `, [id_pedido]);

  return { ...pedido[0], items };
};

const crearPedido = async (id_usuario) => {
  // Obtener carrito del usuario
  const [carritos] = await db.query(
    'SELECT * FROM carrito WHERE id_usuario = ? LIMIT 1', [id_usuario]
  );
  if (!carritos[0]) throw new Error('No tienes carrito activo');

  const carrito = carritos[0];

  // Obtener items del carrito
  const [items] = await db.query(`
    SELECT cd.id_producto, cd.cantidad, p.precio
    FROM carrito_detalle cd
    JOIN productos p ON cd.id_producto = p.id_producto
    WHERE cd.id_carrito = ?
  `, [carrito.id_carrito]);

  if (items.length === 0) throw new Error('El carrito está vacío');

  const total = items.reduce((acc, i) => acc + (parseFloat(i.precio) * i.cantidad), 0);

  // Obtener dirección principal del usuario
  const [direcciones] = await db.query(
    'SELECT id_direccion FROM direcciones WHERE id_usuario = ? LIMIT 1', [id_usuario]
  );
  const id_direccion = direcciones[0]?.id_direccion || null;

  // Crear pedido
  const [result] = await db.query(`
    INSERT INTO pedidos (id_usuario, fecha_pedido, estado, total, id_direccion)
    VALUES (?, NOW(), 'pendiente', ?, ?)
  `, [id_usuario, total, id_direccion]);

  const id_pedido = result.insertId;

  // Insertar items del pedido
  for (const item of items) {
    await db.query(`
      INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, precio_unitario)
      VALUES (?, ?, ?, ?)
    `, [id_pedido, item.id_producto, item.cantidad, item.precio]);
  }

  // Vaciar carrito
  await db.query('DELETE FROM carrito_detalle WHERE id_carrito = ?', [carrito.id_carrito]);

  return getPedidoById(id_pedido, id_usuario);
};

module.exports = { getPedidos, getPedidoById, crearPedido };