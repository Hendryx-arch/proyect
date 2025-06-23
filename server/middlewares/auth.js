import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export const authentification = (req, res, next) => {
  // obtenemos el toke de aut
  const authHeader = req.headers.authorization
  // el token viene en forto "Bearer TOKEN_LARGO"
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.status(401).json({ message: 'Acceso denegado:token no Proporcionado' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Error al verificar token:', err.message)
      return res.status(403).json({ message: 'Acceso denegado: Token invalido o exp' })
    }
    req.user = user
    next()
  })
}

export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: 'Acceso denegado por rol' })
    }
    
    const hasRequiredRole = roles.some(role => req.user.roles.includes(role))
    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Acceso denegado no tiene permisos' })
    }
    next()
  }
}
