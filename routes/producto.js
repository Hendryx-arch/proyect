import { Router } from 'express'
import {createProd,getProd,updateProd} from '../controladores/producto.js'
import upload from '../server/middlewares/upload.js'

const router = Router()

router.get('/', getProd)
router.post('/', upload.single('img_prod'), createProd)
router.put('/:id', upload.single('img_prod'), updateProd)

export default router
