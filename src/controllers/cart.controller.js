// src/controllers/cart.controller.js
const model = require('../models/cart.model');

// GET /carrito
const getCarrito = async (req, res, next) => {
  try {
    const data = await model.getCarrito(req.userId);
    res.json(data);
  } catch (err) { next(err); }
};

// POST /carrito
const agregarItem = async (req, res, next) => {
  try {
    const { id_producto, cantidad = 1 } = req.body;
    if (!id_producto) return res.status(400).json({ msg: 'id_producto requerido' });
    const data = await model.agregarItem(req.userId, id_producto, cantidad);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

// PUT /carrito/:id_producto
const actualizarCantidad = async (req, res, next) => {
  try {
    const { cantidad } = req.body;
    const data = await model.actualizarCantidad(req.userId, req.params.id_producto, cantidad);
    res.json(data);
  } catch (err) { next(err); }
};

// DELETE /carrito/:id_producto
const eliminarItem = async (req, res, next) => {
  try {
    const data = await model.eliminarItem(req.userId, req.params.id_producto);
    res.json(data);
  } catch (err) { next(err); }
};

// DELETE /carrito
const vaciarCarrito = async (req, res, next) => {
  try {
    const data = await model.vaciarCarrito(req.userId);
    res.json(data);
  } catch (err) { next(err); }
};

module.exports = { getCarrito, agregarItem, actualizarCantidad, eliminarItem, vaciarCarrito };