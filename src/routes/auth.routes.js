const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/olvido-contrasena', authController.olvidoContrasena);
router.post('/restablecer-contrasena', authController.restablecerContrasena);
router.get('/perfil', verificarToken, authController.perfil);
router.put('/actualizar', verificarToken, authController.actualizar);

module.exports = router;

