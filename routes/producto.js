import { Router } from 'express'
import {createProd,getProd,getProdById,updateProd,delProd} from '../controladores/producto.js'
import upload from '../server/middlewares/upload.js'
import { authentification,authorizeRoles } from '../server/middlewares/auth.js'

const router = Router()

router.get('/', getProd)
router.get('/:id',getProdById)
router.post('/',authentification,authorizeRoles(['Administrador']), upload.single('imagenproducto'), createProd)
router.put('/:id', authentification,authorizeRoles(['Administrador']),upload.single('imagenproducto'), updateProd)
router.delete('/:id', authentification,authorizeRoles(['Administrador']),delProd)

export default router
