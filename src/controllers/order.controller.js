// src/controllers/order.controller.js
const model = require('../models/order.model');

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
    res.status(201).json(data);
  } catch (err) { next(err); }
};

module.exports = { getPedidos, getPedidoById, crearPedido };