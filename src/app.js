// src/app.js
const express = require('express');
const app = express();

const productRoutes = require('./routes/product.routes');
const errorHandler = require('./middlewares/error.middleware');

app.use(express.json());
console.log('productRoutes:', productRoutes);
console.log('errorHandler:', errorHandler);
app.get('/', (req, res) => {
  res.send('API funcionando 🔥');
});

// 👇 ACTIVAR RUTAS
app.use('/api/products', productRoutes);

// 👇 MIDDLEWARE DE ERRORES
app.use(errorHandler);

module.exports = app;
