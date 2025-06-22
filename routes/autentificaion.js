import {Router} from 'express'
import { loginAdmin } from '../controladores/autentificacion.js'

const router = Router()

router.post('/admin/login', loginAdmin)

export default router
