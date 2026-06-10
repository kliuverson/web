// models/admin.model.js
const db = require('../config/db');

const getStatsProductos = async () => {
  const [[row]] = await db.query('SELECT COUNT(*) AS total FROM productos');
  return row;
};

const getStatsPedidos = async () => {
  const [[row]] = await db.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(total), 0) AS ventas FROM pedidos`
  );
  return row;
};

const getStatsUsuarios = async () => {
  const [[row]] = await db.query('SELECT COUNT(*) AS total FROM usuarios');
  return row;
};

const getPedidosRecientes = async (limit = 8) => {
  const [rows] = await db.query(
    `SELECT p.id_pedido, p.fecha_pedido, p.total, p.estado, u.nombre
     FROM pedidos p
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     ORDER BY p.fecha_pedido DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

module.exports = { getStatsProductos, getStatsPedidos, getStatsUsuarios, getPedidosRecientes };