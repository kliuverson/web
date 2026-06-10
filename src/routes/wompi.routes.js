const express = require('express');
const router = express.Router();
const { generarCheckout } = require('../controllers/wompi.controller');

router.post('/checkout', generarCheckout);

module.exports = router;