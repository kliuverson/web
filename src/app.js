require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express        = require('express');
const cors           = require('cors');
const path           = require('path');

const authRoutes        = require('./routes/auth.routes');
const productRoutes     = require('./routes/product.routes');
const categoryRoutes    = require('./routes/category.routes');
const cartRoutes        = require('./routes/cart.routes');
const favoriteRoutes    = require('./routes/favorite.routes');
const orderRoutes       = require('./routes/order.routes');
const direccionesRoutes = require('./routes/direcciones.routes');
const wompiRoutes = require('./routes/wompi.routes');

// Rutas admin
const adminRoutes         = require('./routes/admin.router');
const adminCategoryRoutes = require('./routes/admin.category.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Rutas públicas ──
app.use('/api/auth',        authRoutes);
app.use('/productos',       productRoutes);
app.use('/categorias',      categoryRoutes);
app.use('/carrito',         cartRoutes);
app.use('/favoritos',       favoriteRoutes);
app.use('/pedidos',         orderRoutes);
app.use('/api/direcciones', direccionesRoutes);
app.use('/api/wompi', wompiRoutes);


// ── Rutas admin ──
app.use('/admin/categorias', adminCategoryRoutes);
app.use('/admin',            adminRoutes);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});