import { Router } from 'express'
import { getAllUsers, createUser, deleteUser, getUserById, updateUser } from '../controladores/usuario.js'
import { authentification,authorizeRoles } from '../server/middlewares/auth.js'

const router = Router()


router.get('/',getAllUsers)
router.get('/:id', getUserById)
router.post('/',createUser)
router.put('/:id',updateUser)
router.delete('/:id',deleteUser)

export default router
