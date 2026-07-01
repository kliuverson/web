const express = require('express');
const router = express.Router();
const model = require('../models/product.model');
const db = require('../config/db');
const verificarToken = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(verificarToken, verificarRol('admin', 'super_admin'));

// GET todos los productos
router.get('/', async (req, res, next) => {
  try {
    const data = await model.getAll();
    res.json(data);
  } catch (err) { next(err); }
});

// POST crear producto con imagen
router.post('/', upload.single('imagen'), async (req, res, next) => {
  try {
    const { id_categoria, nombre, descripcion, precio, stock_minimo, talla } = req.body;
    if (!nombre?.trim() || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    }
    const producto = await model.create({
      id_categoria, nombre, descripcion, precio, stock_minimo,
      talla: talla?.trim() || null
    });

    const imagen_url = req.file ? `/assets/productos/${req.file.filename}` : null;
    await db.query(
      'INSERT INTO detalle_producto (id_producto, imagen_url) VALUES (?, ?)',
      [producto.id_producto, imagen_url]
    );

    res.status(201).json({ mensaje: 'Producto creado', producto: { ...producto, imagen_url } });
  } catch (err) { next(err); }
});

// PUT actualizar producto con imagen
router.put('/:id', upload.single('imagen'), async (req, res, next) => {
  try {
    const { id_categoria, nombre, descripcion, precio, stock_minimo, talla } = req.body;
    if (!nombre?.trim() || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    }
    await model.update(req.params.id, {
      id_categoria, nombre, descripcion, precio, stock_minimo,
      talla: talla?.trim() || null
    });

    if (req.file) {
      const imagen_url = `/assets/productos/${req.file.filename}`;
      const [existing] = await db.query(
        'SELECT id_detalle FROM detalle_producto WHERE id_producto = ?', [req.params.id]
      );
      if (existing.length) {
        await db.query(
          'UPDATE detalle_producto SET imagen_url = ? WHERE id_producto = ?',
          [imagen_url, req.params.id]
        );
      } else {
        await db.query(
          'INSERT INTO detalle_producto (id_producto, imagen_url) VALUES (?, ?)',
          [req.params.id, imagen_url]
        );
      }
    }

    const actualizado = await model.getById(req.params.id);
    res.json({ mensaje: 'Producto actualizado', producto: actualizado });
  } catch (err) { next(err); }
});

// DELETE eliminar producto
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM detalle_producto WHERE id_producto = ?', [req.params.id]);
    await model.remove(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) { next(err); }
});

module.exports = router;