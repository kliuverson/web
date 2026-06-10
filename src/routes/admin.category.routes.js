const express        = require('express');
const router         = express.Router();
const model          = require('../models/category.model');
const verificarToken = require('../middlewares/auth.middleware');
const verificarAdmin = require('../middlewares/admin.middleware');

router.use(verificarToken, verificarAdmin);

router.get('/', async (req, res, next) => {
  try {
    const data = await model.getAll();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await model.getById(req.params.id);
    if (!data) return res.status(404).json({ error: 'No encontrada' });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const nueva = await model.create(nombre.trim(), descripcion?.trim() || '');
    res.status(201).json({ mensaje: 'Categoría creada', categoria: nueva });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const existe = await model.getById(req.params.id);
    if (!existe) return res.status(404).json({ error: 'No encontrada' });
    const actualizada = await model.update(req.params.id, nombre.trim(), descripcion?.trim() || '');
    res.json({ mensaje: 'Categoría actualizada', categoria: actualizada });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existe = await model.getById(req.params.id);
    if (!existe) return res.status(404).json({ error: 'No encontrada' });
    await model.remove(req.params.id);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) { next(err); }
});

module.exports = router;