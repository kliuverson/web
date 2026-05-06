const model = require('../models/product.model');

const getProducts = async (req, res, next) => {
  try {
    const data = await model.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const data = await model.getById(req.params.id);
    if (!data) return res.status(404).json({ msg: 'Producto no encontrado' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const data = await model.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = await model.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await model.remove(req.params.id);
    res.json({ msg: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};