// src/routes/order.routes.js
const express        = require('express');
const router         = express.Router();
const controller     = require('../controllers/order.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',    controller.getPedidos);
router.get('/:id', controller.getPedidoById);
router.post('/',   controller.crearPedido);

module.exports = router;