const express = require('express');
const router = express.Router();
const controller = require('../controllers/direcciones.controller');

router.get('/:id_usuario', controller.obtenerDirecciones);
router.post('/', controller.crearDireccion);
router.put('/:id', controller.actualizarDireccion);
router.delete('/:id', controller.eliminarDireccion);

module.exports = router;