import { pool } from '../db/conexion.js'

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
