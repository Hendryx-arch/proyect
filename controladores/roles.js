import { pool } from '../db/conexion.js'

export const getRol = async (req, res) => {
  try {
    const result = await pool.execute('SELECT id , nombre_rol FROM Roles  ')
    const rows = result[0]
    res.json(rows)
  } catch (error) {
    console.error('Error al obtener roles', error)
    res.status(50).json({ message: 'Error interno del servidor' })
  }
}

export const assigRol = async (req, res) => {
  const { userId } = req.params
  const { roleIds } = req.body
  if (!Array.isArray(roleIds)) {
    return res.status(400).json({ message: 'rolesId debe ser una array' })
  }
  try {
    await pool.execute('DELETE FROM user_rol WHERE persona_id = ?',[userId])

    if (roleIds.length > 0) {
      const values = roleIds.map(rolId => [userId, rolId])
      const flatValues = values.flat()
      const placeholders = values.map(() => '(?,?)').join(',')

      await pool.execute(
                `INSERT INTO user_rol( persona_id,rol_id) VALUES ${placeholders}`,
                flatValues
      )
    }
    res.json({ message: 'Roles asignados exitosamente.' })
  } catch (error) {
    console.error('Error al asignar roles.')
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
