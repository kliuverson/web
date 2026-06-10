import pool from "../config/db.js";

export const getUsuarios = async (req, res) => {

  const [usuarios] = await pool.query(`
      SELECT
      id_usuario,
      nombre,
      correo,
      rol
      FROM usuarios
  `);

  res.json(usuarios);
};

export const cambiarRol = async (req, res) => {

  const { id } = req.params;
  const { rol } = req.body;

  await pool.query(
    "UPDATE usuarios SET rol=? WHERE id_usuario=?",
    [rol, id]
  );

  res.json({
    message: "Rol actualizado"
  });
};