import { pool } from '../db/conexion.js'

export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id,categoria AS name FROM categorias ORDER By categoria')
    res.json(rows)
  } catch (error) {
    console.log('Error al obtener categorias.', error)
    res.status(500).json({ message: 'error interno del servidor' })
  }
}
