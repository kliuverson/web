// src/app.js
const express        = require('express');
const cors           = require('cors');
const app            = express();

const productRoutes  = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes     = require('./routes/cart.routes');
const errorHandler   = require('./middlewares/error.middleware');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API funcionando 🔥'));

app.use('/productos',  productRoutes);
app.use('/categorias', categoryRoutes);
app.use('/carrito',    cartRoutes);

app.use(errorHandler);

module.exports = app;