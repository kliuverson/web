// src/routes/favorite.routes.js
const express        = require('express');
const router         = express.Router();
const controller     = require('../controllers/favorite.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',                      controller.getFavoritos);
router.get('/check/:id_producto',    controller.check);
router.post('/',                     controller.agregar);
router.delete('/:id_producto',       controller.eliminar);

module.exports = router;