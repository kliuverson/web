const express        = require('express');
const router         = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const verificarAdmin = require('../middlewares/admin.middleware');
const adminCtrl      = require('../controllers/admin.controller');

router.use(verificarToken, verificarAdmin);

router.get('/stats/productos', adminCtrl.statsProductos);
router.get('/stats/pedidos',   adminCtrl.statsPedidos);
router.get('/stats/usuarios',  adminCtrl.statsUsuarios);
router.get('/pedidos',         adminCtrl.getPedidos);
router.put('/pedidos/:id/estado', adminCtrl.actualizarEstadoPedido);
router.get('/usuarios', adminCtrl.getUsuarios);
router.put('/usuarios/:id/rol', adminCtrl.cambiarRol);
router.delete('/usuarios/:id', adminCtrl.eliminarUsuario);

module.exports = router;