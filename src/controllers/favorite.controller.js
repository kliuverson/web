// src/controllers/favorite.controller.js
const model = require('../models/favorite.model');

// GET /favoritos
const getFavoritos = async (req, res, next) => {
  try {
    const data = await model.getFavoritos(req.userId);
    res.json(data);
  } catch (err) { next(err); }
};

// POST /favoritos
const agregar = async (req, res, next) => {
  try {
    const { id_producto } = req.body;
    if (!id_producto) return res.status(400).json({ msg: 'id_producto requerido' });
    const data = await model.agregar(req.userId, id_producto);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

// DELETE /favoritos/:id_producto
const eliminar = async (req, res, next) => {
  try {
    const data = await model.eliminar(req.userId, req.params.id_producto);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /favoritos/check/:id_producto
const check = async (req, res, next) => {
  try {
    const es = await model.esFavorito(req.userId, req.params.id_producto);
    res.json({ esFavorito: es });
  } catch (err) { next(err); }
};

module.exports = { getFavoritos, agregar, eliminar, check };