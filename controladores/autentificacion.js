import { pool } from '../db/conexion.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const loginAdmin = async (req, res) => {
  const { correo, contra } = req.body

  if (!correo || !contra) {
    return res.status(400).json({ message: 'email y contraseña son requeridos' })
  }
  try {
    // buscamo al user por email
    const [rows] = await pool.execute(
           `SELECT p.id, p.nombres, p.apellidos, p.correo, p.contra, r.nombre_rol AS rol
            FROM persona p
            JOIN user_rol pr ON p.id = pr.persona_id
            JOIN Roles r ON pr.rol_id = r.id
            WHERE p.correo = ?`,
           [correo]
    )
    if (rows.length === 0) {
      return res.status(401).json({ message: 'credenciales invalidas' })
    }
    const user = rows[0]
    const userRol = rows.map(row => row.rol)
    // verificamos que el user sea administrador
    if (user.rol !== 'Administrador') {
      return res.status(403).json({ message: ' Acceso denegado no eres admin' })
    }

    // comparamos la contraseña hasheada
    const isMath = await bcrypt.compare(contra, user.contra)
    if (!isMath) {
      return res.status(401).json({ message: 'credenciales invalidas' })
    }
    // generamos un token con el jwt
    const token = jwt.sign(
      {
        id: user.id,
        correo: user.correo,
        rol: user.rol // con token para futura autorizacion
      },
      JWT_SECRET,
      { expiresIn: '1h' }// el tiempo en que expira el token

    )
    // enviamos el token y la info del user
    res.json({
      message: 'login de adminisrado exitoso',
      token,
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        rol: user.rol
      }
    })
  } catch (error) {
    console.log('Error en el login del admin', error)
    res.status(500).json({ message: ' Erro inter del servidos' })
  }
}
