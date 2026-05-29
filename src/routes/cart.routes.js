// src/routes/cart.routes.js
const express        = require('express');
const router         = express.Router();
const controller     = require('../controllers/cart.controller');
const verificarToken = require('../middlewares/auth.middleware');

// Todas las rutas del carrito requieren login
router.use(verificarToken);

router.get('/',                    controller.getCarrito);
router.post('/',                   controller.agregarItem);
router.put('/:id_producto',        controller.actualizarCantidad);
router.delete('/vaciar',           controller.vaciarCarrito);
router.delete('/:id_producto',     controller.eliminarItem);

module.exports = router;
