const express = require('express');
const router  = express.Router();
const { generarCheckout, obtenerToken } = require('../controllers/wompi.controller');

router.post('/checkout', generarCheckout);

router.get('/token/:reference', (req, res) => {
  const token = obtenerToken(req.params.reference);
  if (!token) return res.status(404).json({ error: 'Referencia no encontrada' });
  res.json({ token });
});

module.exports = router;