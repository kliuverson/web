const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/role.middleware');
const adminCtrl = require('../controllers/admin.controller');

router.use(verificarToken, verificarRol('admin', 'super_admin'));

router.get('/stats/productos', adminCtrl.statsProductos);
router.get('/stats/pedidos', adminCtrl.statsPedidos);
router.get('/stats/usuarios', adminCtrl.statsUsuarios);
router.get('/pedidos', adminCtrl.getPedidos);
router.put('/pedidos/:id/estado', adminCtrl.actualizarEstadoPedido);
router.get('/usuarios', adminCtrl.getUsuarios);
router.put('/usuarios/:id/rol', verificarRol('admin', 'super_admin'), adminCtrl.cambiarRol);
router.delete('/usuarios/:id', verificarRol('admin', 'super_admin'), adminCtrl.eliminarUsuario);

module.exports = router;