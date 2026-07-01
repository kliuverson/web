// src/controllers/order.controller.js
const model = require('../models/order.model');
const {
  enviarCorreoEstadoPedido
} = require('../config/email');
const db = require('../config/db');

// GET /pedidos
const getPedidos = async (req, res, next) => {
  try {
    const data = await model.getPedidos(req.userId);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /pedidos/:id
const getPedidoById = async (req, res, next) => {
  try {
    const data = await model.getPedidoById(req.params.id, req.userId);
    if (!data) return res.status(404).json({ msg: 'Pedido no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
};

// POST /pedidos
const crearPedido = async (req, res, next) => {
  try {

    const data = await model.crearPedido(req.userId);

    // Buscar datos del usuario para enviar el correo
    const [rows] = await db.query(`
      SELECT
        u.nombre,
        u.correo
      FROM usuarios u
      INNER JOIN pedidos p
        ON u.id_usuario = p.id_usuario
      WHERE p.id_pedido = ?
    `, [data.id_pedido]);

    if (rows.length) {
      try {
        await enviarCorreoEstadoPedido(
          rows[0].correo,
          rows[0].nombre,
          data.id_pedido,
          'procesando'
        );
      } catch (err) {
        console.error(
          'Error enviando correo del pedido:',
          err
        );
      }
    }

    res.status(201).json(data);

  } catch (err) {
    next(err);
  }
};

module.exports = { getPedidos, getPedidoById, crearPedido };