import { Router } from "express"
import { getRol,assigRol } from "../controladores/roles.js"
import { authentification,authorizeRoles } from "../server/middlewares/auth.js"

const router= Router()

router.get('/',authentification,authorizeRoles(['Administrador']),getRol)

router.put('/:userId/roles',authentification,authorizeRoles(['Administrador']),assigRol)

export default router