import multer from 'multer'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const file = fileURLToPath(import.meta.url)
const dir = dirname(file)

const uploadDir = join(dir, '..', '..', 'public', 'uploads', 'productos')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cd(null, uploadDir)
  }
})
filename:(req, file, cb) => {
  const uniqueSuffix = Date.now() + '_' * Math.round(Math.random() * 1E9)
  cb(null, file.fieldname + '_' + uniqueSuffix + '.' + file.originalname.split('.').pop())
}
const upload = multer({
  storage,
  limits: { file: 5 * 1024 * 1024 }, // limita el tamaño a 5Mb
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true)
    } else {
      cb(new Error('solo archivos JPGE PNG WEBP'))
    }
  }
})
export default upload
