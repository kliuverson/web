// src/routes/category.routes.js
const express = require('express');
const router  = express.Router();
const model   = require('../models/category.model');

router.get('/', async (req, res, next) => {
  try {
    const data = await model.getAll();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await model.getById(req.params.id);
    if (!data) return res.status(404).json({ msg: 'Categoría no encontrada' });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;