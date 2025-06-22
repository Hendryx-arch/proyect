import { pool } from '../db/conexion.js'
// import {validoUser} from '../schema/userS.JS'
import bcryp from 'bcryptjs'
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id,nombres,apellidos,ci,correo,telefono,contra FROM persona')
    res.json(rows)
  } catch (error) {
    console.error('error al obtener usuarios', error)
    res.status(500).json({
      message: 'error interno del servidos'
    })
  }
}
export const getUserById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await pool.execute('SELECT id ,nombres,apellidos,ci,correo,telefono,contra FROM persona where id=?', [id])
    if (rows.length == 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error al obtener usuario por id', error)
    res.status(500).json({ message: 'error interno del servidor' })
  }
}
export const createUser = async (req, res) => {
  const { nombres, apellidos, ci, correo, telefono, contra } = req.body
  // hay que hashear la contraseña
  // **Paso 1: Validación de Datos (¡Crucial!)**
  // Si usas Zod, sería algo así:
  // const validationResult = validateUserSchema({ nombre, apellido, email, password, telefono, direccion });
  // if (!validationResult.success) {
  //     return res.status(400).json({ error: JSON.parse(validationResult.error.message) });
  // }
  // const userData = validationResult.data;

  // **Paso 2: Hashear la contraseña (¡Obligatorio por seguridad!)**
  const salt = await bcryp.genSalt(10)
  const hashedPassword = await bcryp.hash(contra, salt)
  try {
    const [result] = await pool.execute(
      'INSERT INTO persona(nombres,apellidos,ci,correo,telefono,contra) VALUES (?,?,?,?,?,?)',
      [nombres, apellidos, ci, correo, telefono, hashedPassword]// aqui va el hashesPassword
    )
    res.status(201).json({ id: result.insertId, nombres, correo })
  } catch (error) {
    console.error('error al crear usuario', error)
    res.status(500).json({ message: 'Error al crear usuario' })
  }
}

export const updateUser = async (req, res) => {
  const { id } = req.params
  const { nombres, apellidos, ci, correo, telefono, contra } = req.body

  try {
    const [result] = await pool.execute(
      'UPDATE persona SET nombre = ?,apellidos=?,ci=?,correo=?,telefon=?,contra WHERE ID=?',
      [nombres, apellidos, ci, correo, telefono, contra, id]
    )
    if (result.affectedRows == 0) {
      return res.status(404).json({ message: 'usuario no encontrado' })
    }
    res.json({ message: 'Usuario actualizadomExitosamente' })
  } catch (error) {
    console.error('Error al actualizar el usuario:', error)
    res.status(500).json({ message: 'error interno del servidor' })
  }
}

export const deleteUser = async (req, res) => {
  const { is } = req.params
  try {
    const [result] = await pool.execute('DELETE FROM persona WHERE id = ?', [id])
    if (result.affectedRows == 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.status(204).send()
  } catch (error) {
    console.error('erro al eliminar usuario', error)
    res.status(500).json({ message: 'error interno ' })
  }
}
