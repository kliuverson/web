import pool from "../config/db.js";

export const getProductos = async (req,res)=>{

    const [productos] =
    await pool.query("SELECT * FROM productos");

    res.json(productos);
};

export const eliminarProducto = async(req,res)=>{

    const {id}=req.params;

    await pool.query(
        "DELETE FROM productos WHERE id_producto=?",
        [id]
    );

    res.json({
        message:"Producto eliminado"
    });
};