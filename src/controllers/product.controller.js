// src/controllers/product.controller.js
const model = require('../models/product.model');

// GET /productos
const getProducts = async (req, res, next) => {
  try {
    const data = await model.getAll();
    res.json(data);
  } catch (err) { next(err); }
};

// GET /productos/categoria/:id_categoria
const getProductsByCategoria = async (req, res, next) => {
  try {
    const data = await model.getByCategoria(req.params.id_categoria);
    res.json(data);
  } catch (err) { next(err); }
};

// GET /productos/:id
const getProduct = async (req, res, next) => {
  try {
    const data = await model.getById(req.params.id);
    if (!data) return res.status(404).json({ msg: 'Producto no encontrado' });
    res.json(data);
  } catch (err) { next(err); }
};

// POST /productos
const createProduct = async (req, res, next) => {
  try {
    const data = await model.create(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

// PUT /productos/:id
const updateProduct = async (req, res, next) => {
  try {
    const data = await model.update(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
};

// DELETE /productos/:id
const deleteProduct = async (req, res, next) => {
  try {
    await model.remove(req.params.id);
    res.json({ msg: 'Producto eliminado' });
  } catch (err) { next(err); }
};

module.exports = {
  getProducts,
  getProductsByCategoria,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};