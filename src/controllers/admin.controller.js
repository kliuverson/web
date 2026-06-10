// src/controllers/admin.controller.js
const model = require('../models/admin.model');
const db    = require('../config/db');

const statsProductos = async (req, res) => {
  try {
    const data = await model.getStatsProductos();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const statsPedidos = async (req, res) => {
  try {
    const data = await model.getStatsPedidos();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const statsUsuarios = async (req, res) => {
  try {
    const data = await model.getStatsUsuarios();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const getPedidos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const data = await model.getPedidosRecientes(limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado } = req.body;
    const estados = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estados.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    await db.query('UPDATE pedidos SET estado = ? WHERE id_pedido = ?', [estado, req.params.id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id_usuario, nombre, correo, telefono, documento, rol, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const cambiarRol = async (req, res) => {
  try {
    const { rol } = req.body;
    if (!['cliente', 'admin'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    await db.query('UPDATE usuarios SET rol = ? WHERE id_usuario = ?', [rol, req.params.id]);
    res.json({ mensaje: 'Rol actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    // Eliminar datos relacionados primero
    await db.query('DELETE FROM carrito_detalle WHERE id_carrito IN (SELECT id_carrito FROM carrito WHERE id_usuario = ?)', [id]);
    await db.query('DELETE FROM carrito WHERE id_usuario = ?', [id]);
    await db.query('DELETE FROM favoritos WHERE id_usuario = ?', [id]);
    await db.query('DELETE FROM pedido_detalle WHERE id_pedido IN (SELECT id_pedido FROM pedidos WHERE id_usuario = ?)', [id]);
    await db.query('DELETE FROM pedidos WHERE id_usuario = ?', [id]);
    await db.query('DELETE FROM direcciones WHERE id_usuario = ?', [id]);
    await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = {
  statsProductos,
  statsPedidos,
  statsUsuarios,
  getPedidos,
  actualizarEstadoPedido,
  getUsuarios,
  cambiarRol,
  eliminarUsuario
};