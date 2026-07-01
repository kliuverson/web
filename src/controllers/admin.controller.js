// src/controllers/admin.controller.js
const model = require('../models/admin.model');
const db = require('../config/db');
const {
  enviarCorreoEstadoPedido
} = require('../config/email');


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

    const estados = [
      'pendiente',
      'procesando',
      'enviado',
      'entregado',
      'cancelado'
    ];

    if (!estados.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido'
      });
    }

    await db.query(
      'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
      [estado, req.params.id]
    );

    const [pedido] = await db.query(`
      SELECT
        p.id_pedido,
        p.estado,
        u.nombre,
        u.correo
      FROM pedidos p
      INNER JOIN usuarios u
        ON p.id_usuario = u.id_usuario
      WHERE p.id_pedido = ?
    `, [req.params.id]);

    if (pedido.length) {
      try {
        await enviarCorreoEstadoPedido(
          pedido[0].correo,
          pedido[0].nombre,
          pedido[0].id_pedido,
          estado
        );
      } catch (error) {
        console.error(
          'Error enviando correo de estado:',
          error
        );
      }
    }

    return res.json({
      mensaje: 'Estado actualizado'
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Error al actualizar estado'
    });
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
    const idUsuario = req.params.id;

    if (Number(req.userId) === Number(idUsuario)) {
      return res.status(403).json({
        error: 'No puedes modificar tu propio rol'
      });
    }

    if (!['cliente', 'admin', 'super_admin'].includes(rol)) {
      return res.status(400).json({
        error: 'Rol inválido'
      });
    }

    const [rows] = await db.query(
      'SELECT rol FROM usuarios WHERE id_usuario = ?',
      [idUsuario]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const rolActual = rows[0].rol;

    if (
      req.userRol === 'admin' &&
      rolActual === 'super_admin'
    ) {
      return res.status(403).json({
        error: 'No puedes modificar un Super Administrador'
      });
    }

    await db.query(
      'UPDATE usuarios SET rol = ? WHERE id_usuario = ?',
      [rol, idUsuario]
    );

    res.json({
      mensaje: 'Rol actualizado'
    });

  } catch (err) {
    res.status(500).json({
      error: 'Error al cambiar rol'
    });
  }
};

const eliminarUsuario = async (req, res) => {

  try {
    const id = req.params.id;

    if (Number(req.userId) === Number(id)) {
      return res.status(403).json({
        error: 'No puedes eliminar tu propia cuenta'
      });
    }
    // Eliminar datos relacionados primero
    const [rows] = await db.query(
      'SELECT rol FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const rolObjetivo = rows[0].rol;

    if (
      req.userRol === 'admin' &&
      rolObjetivo === 'super_admin'
    ) {
      return res.status(403).json({
        error: 'No puedes eliminar un Super Administrador'
      });
    }

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