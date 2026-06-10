import pool from "../config/db.js";

export const getPedidos = async(req,res)=>{

    const [pedidos] =
    await pool.query(
        "SELECT * FROM pedidos"
    );

    res.json(pedidos);
};

export const actualizarEstado = async(req,res)=>{

    const {id}=req.params;
    const {estado}=req.body;

    await pool.query(
        "UPDATE pedidos SET estado=? WHERE id_pedido=?",
        [estado,id]
    );

    res.json({
        message:"Estado actualizado"
    });
};