const db = require('../config/db');

class DireccionesModel {

    static async obtenerPorUsuario(id_usuario) {

        const [rows] = await db.query(
            `SELECT *
             FROM direcciones
             WHERE id_usuario = ?
             ORDER BY id_direccion DESC`,
            [id_usuario]
        );

        return rows;
    }

    static async crear(data) {

        const {
            id_usuario,
            direccion,
            ciudad,
            departamento,
            codigo_postal,
            pais
        } = data;

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
                codigo_postal,
                pais
            ]
        );

        return result;
    }

    static async actualizar(id_direccion, data) {

        const {
            direccion,
            ciudad,
            departamento,
            codigo_postal,
            pais
        } = data;

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
                id_direccion
            ]
        );

        return result;
    }

    static async eliminar(id_direccion) {

        const [result] = await db.query(
            `DELETE FROM direcciones
             WHERE id_direccion = ?`,
            [id_direccion]
        );

        return result;
    }

    static async obtenerPorId(id_direccion) {

        const [rows] = await db.query(
            `SELECT *
             FROM direcciones
             WHERE id_direccion = ?`,
            [id_direccion]
        );

        return rows[0];
    }
}

module.exports = DireccionesModel;