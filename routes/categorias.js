import { Router } from "express"
import { getAllCategories } from "../controladores/categorias.js"
import { authentification,authorizeRoles } from "../server/middlewares/auth.js"

const router = Router()

router.get('/',authentification,authorizeRoles(['Administrador']),getAllCategories)

export default router