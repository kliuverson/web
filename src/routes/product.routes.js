// src/routes/product.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/product.controller');

router.get('/',                        ctrl.getProducts);
router.get('/categoria/:id_categoria', ctrl.getProductsByCategoria);
router.get('/:id',                     ctrl.getProduct);
router.post('/',                       ctrl.createProduct);
router.put('/:id',                     ctrl.updateProduct);
router.delete('/:id',                  ctrl.deleteProduct);

module.exports = router;