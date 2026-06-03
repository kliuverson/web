const db = require('../config/db');

// Obtener direcciones de un usuario
exports.obtenerDirecciones = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM direcciones
       WHERE id_usuario = ?
       ORDER BY id_direccion DESC`,
      [id_usuario]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error obteniendo direcciones:', error);

    return res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener direcciones'
    });
  }
};

// Crear dirección
exports.crearDireccion = async (req, res) => {
  try {

    const {
      id_usuario,
      direccion,
      ciudad,
      departamento,
      codigo_postal,
      pais
    } = req.body;

    if (!id_usuario || !direccion || !ciudad || !departamento) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Faltan campos obligatorios'
      });
    }

    const [result] = await db.query(
      `INSERT INTO direcciones
      (
        id_usuario,
        direccion,
        ciudad,
        departamento,
        codigo_postal,
        pais
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_usuario,
        direccion,
        ciudad,
        departamento,
        codigo_postal || null,
        pais || 'Colombia'
      ]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Dirección creada correctamente',
      id_direccion: result.insertId
    });

  } catch (error) {
    console.error('Error creando dirección:', error);

    return res.status(500).json({
      ok: false,
      mensaje: 'Error al guardar dirección'
    });
  }
};

// Actualizar dirección
exports.actualizarDireccion = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      direccion,
      ciudad,
      departamento,
      codigo_postal,
      pais
    } = req.body;

    const [result] = await db.query(
      `UPDATE direcciones
       SET direccion = ?,
           ciudad = ?,
           departamento = ?,
           codigo_postal = ?,
           pais = ?
       WHERE id_direccion = ?`,
      [
        direccion,
        ciudad,
        departamento,
        codigo_postal,
        pais,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Dirección no encontrada'
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Dirección actualizada correctamente'
    });

  } catch (error) {
    console.error('Error actualizando dirección:', error);

    return res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar dirección'
    });
  }
};

// Eliminar dirección
exports.eliminarDireccion = async (req, res) => {
  try {

    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM direcciones
       WHERE id_direccion = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Dirección no encontrada'
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Dirección eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando dirección:', error);

    return res.status(500).json({
      ok: false,
      mensaje: 'Error al eliminar dirección'
    });
  }
};