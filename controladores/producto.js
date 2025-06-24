import { pool } from '../db/conexion.js'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const createProd = async (req, res) => {
  const { nombre, descripcion, categoria, precio, cantidad } = req.body
  const image_file = req.file

  // validacion

  let image_url = null
  if (image_file) {
    image_url = `/uploads/productos/${image_file.filename}`
  } else {
    // si la imagen es obligatoria
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO producto (nombre,descripcion,categoria,precio,cantidad,imagen) VALUES (?,?,?,?,?,?)',
      [nombre, descripcion, categoria, precio, cantidad, image_url]
    )
    res.status(201).json({
      message: 'producto Creado exitosamente',
      id: result.insertId,
      nombre,
      precio,
      image_url
    })
  } catch (error) {
    console.error('Error al crear producto:', error)
    if (image_file) {
      const fs = await import('node:fs/promises')
      await fs.unlink(image_file.path)
    }
    res.status(500).json({ message: 'Error interno del servidor al crear producto' })
  }
}
export const getProd = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id,nombre,descripcion,categoria,precio,cantidad,imagen FROM producto')
    res.json(rows)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
export const getProdById = async (req, res) => {
  try {
    const { id } = req.params // Captura el ID de la URL (ej. /api/prod/1, '1' es el id)

    // Ejecuta la consulta para seleccionar un producto por su ID
    const [rows] = await pool.execute('SELECT id, nombre, descripcion, categoria, precio, cantidad, imagen FROM producto WHERE id = ?', [id])

    // Si no se encuentra ningún producto con ese ID, devuelve un 404
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }

    // Si se encuentra, devuelve el primer (y único) resultado
    res.json(rows[0])
  } catch (error) {
    console.error('Error al obtener producto por ID:', error)
    res.status(500).json({ message: 'Error interno del servidor al obtener producto.' })
  }
}
export const updateProd = async (req, res) => {
  const { id } = req.params
  const { nombre, descripcion, categoria, precio, cantidad } = req.body
  const image_file = req.file

  let image_url_upd = null
  const updateFileds = []
  const queryParams = []

  if (nombre !== undefined) {
    updateFileds.push('nombre = ?')
    queryParams.push(nombre)
  }
  if (descripcion !== undefined) {
    updateFileds.push('descripcion = ?')
    queryParams.push(descripcion)
  }
  if (categoria !== undefined) {
    updateFileds.push('categoria = ?')
    queryParams.push(categoria)
  }
  if (precio !== undefined) {
    updateFileds.push('precio = ?')
    queryParams.push(precio)
  }
  if (cantidad !== undefined) {
    updateFileds.push('cantidad = ?')
    queryParams.push(cantidad)
  }
  if (image_file) {
    image_url_upd = `/uploads/productos/${image_file.filename}`
    updateFileds.push('imagen = ?')
    queryParams.push(image_url_upd)

    // Opcional: Lógica para eliminar la imagen antigua si existía
    // Primero, consulta la URL de la imagen existente para el producto.
    // Si es diferente y existe un archivo, elimínalo del sistema de archivos.
    // Esto es más complejo y requeriría una consulta adicional o un manejo cuidadoso.
    // Por simplicidad, se omite aquí, pero tenlo en cuenta para producción.
  }
  if (updateFileds.length === 0) {
    return res.status(400).json({ message: 'no se proporcionaron datos para actualizar' })
  }
  try {
    const query = `UPDATE producto SET ${updateFileds.join(', ')} WHERE id= ? `
    queryParams.push(id)

    const [result] = await pool.execute(query, queryParams)

    if (result.affectedRows === 0) {
      // Si se subió una nueva imagen pero no se actualizó el producto (por ejemplo, ID no encontrado),
      // elimina la imagen recién subida para evitar archivos huérfanos.
      if (image_file) {
        const fs = await import('node:fs/promises')
        await fs.unlink(image_file.path)
      }
      return res.status(404).json({ message: 'producto no encontrado para actualizar' })
    }
    res.json({ message: 'producto actualizado exitosamente', image_url: image_url_upd })
  } catch (error) {
    console.error('error al actualizar producto:', error)
    if (image_file) {
      const fs = await import('node:fs/promises')
      await fs.unlink(image_file.path)
    }
    res.status(500).json({ message: 'error interno del servidor' })
  }
}
export const delProd = async (req, res) => {
  const { id } = req.params // ID del producto a eliminar

  let imagePathToDelete = null // Variable para almacenar la ruta guardada en la DB

  try {
    // PASO 1: Obtener la ruta de la imagen del producto ANTES de eliminar el producto
    // ¡CORRECCIÓN! Usar 'imagen' como nombre de columna y 'producto' como nombre de tabla
    const [productRows] = await pool.execute(
      'SELECT imagen FROM producto WHERE id = ?',
      [id]
    )

    if (productRows.length > 0 && productRows[0].imagen) {
      imagePathToDelete = productRows[0].imagen // Esto es '/uploads/productos/nombre_del_archivo.jpg'
    }

    // PASO 2: Eliminar el producto de la base de datos
    // ¡CORRECCIÓN! Usar 'producto' como nombre de tabla
    const [result] = await pool.execute('DELETE FROM producto WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }

    // PASO 3: Si se encontró una imagen, intentar eliminar el archivo físico
    if (imagePathToDelete) {
      // Construye la ruta absoluta al archivo.
      // La ruta guardada en la DB es algo como '/uploads/productos/imagen.jpg'
      // Necesitamos la ruta física en el servidor: `project_root/public/uploads/productos/imagen.jpg`

      // path.join(__dirname, '..', '..', 'public', imagePathToDelete)
      // __dirname apunta a controladores/
      // '..' sale de controladores/ (a server/)
      // '..' sale de server/ (a project_root/)
      // 'public' entra en public/
      // imagePathToDelete es '/uploads/productos/nombre_del_archivo.jpg'
      // path.join lo unirá correctamente ignorando la barra inicial de imagePathToDelete
      const absoluteImagePath = path.join(__dirname, '..', '..', 'proyect','public', imagePathToDelete)

      fs.unlink(absoluteImagePath, (err) => {
        if (err) {
          console.error(`Error al eliminar el archivo de imagen del producto ${absoluteImagePath}:`, err)
        } else {
          console.log(`Archivo de imagen del producto ${absoluteImagePath} eliminado exitosamente.`)
        }
      })
    }

    res.status(200).json({ message: 'Producto y su imagen asociados eliminados exitosamente.' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    res.status(500).json({ message: 'Error interno del servidor al eliminar producto.' })
  }
}
