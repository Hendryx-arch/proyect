/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', async () => {
  const navLinks = document.querySelectorAll('.main-nav ul li a')
  const contentSections = document.querySelectorAll('.content-section')
  const MensajeBienvenido = document.getElementById('welcomeMessage')
  const backListButtons = document.getElementsByClassName('back-list-btn')
  const logoutContainer = document.getElementById('logout-container')
  // varables para gestion de productos
  const productListView = document.getElementById('product-list-view')
  const productFormView = document.getElementById('product-form-view')
  const addProductBtn = document.getElementById('add-product-btn')
  const productsTableBody = document.querySelector('#products-table tbody')
  const productForm = document.getElementById('product-form')
  const productFormTitle = document.getElementById('product-form-title')
  const productIdInput = document.getElementById('product-id')
  const productNameInput = document.getElementById('product-name')
  const productPriceInput = document.getElementById('product-price')
  const productStockInput = document.getElementById('product-stock')
  const productCategorySelect = document.getElementById('product-category')
  const productDescriptionInput = document.getElementById('product-description')
  const productListMessage = document.getElementById('product-list-message')
  const productFormMessage = document.getElementById('product-form-message')
  const backToProductsListBtn = document.getElementById('back-to-products-list-btn')
// NUEVAS VARIABLES PARA IMAGENES
  const productImageInput = document.getElementById('product-image') // <-- Asegúrate que este ID exista en tu HTML
  const imagenPreview = document.getElementById('image-preview') // <-- Asegúrate que este ID exista en tu HTML
  // FIN NUEVAS VARIABLES

  // --- FUNCIÓN PRINCIPAL DE VERIFICACIÓN AL CARGAR LA PÁGINA ---
  function checkAuthenticationOnInit () {
    const token = localStorage.getItem('auth_token')
    const adminUser = JSON.parse(localStorage.getItem('adminUser'))
    if (!token || !adminUser) {
      if (logoutContainer) {
        logoutContainer.style.display = 'none'
      }
      alert('No has iniciado sesión o tu sesión ha caducado. Por favor, inicia sesión.')
      window.location.href = '/login.html'
      return false
    }

    if (logoutContainer) {
      logoutContainer.style.display = 'block'
    }
    if (MensajeBienvenido) {
      MensajeBienvenido.textContent = `Hola, ${adminUser.nombres}`
    }
    return true
    // Opcional pero recomendado: Llamar a una API para verificar el token si es necesario
    // Esto es útil para tokens de corta duración que pueden expirar sin que la página se recargue
    // Para simplicidad, no lo implementamos aquí, pero es un punto clave para un sistema real.
  }

  // Ejecutar la verificación al cargar la página
  if (!checkAuthenticationOnInit()) {
    return // Detiene la ejecución si no está autenticado y ya redirigió
  }
  // --- FIN FUNCIÓN PRINCIPAL DE VERIFICACIÓN ---

  // --- NUEVA FUNCIÓN PARA HACER LLAMADAS A LA API DE FORMA SEGURA ---
  async function callApiSecured (url, options = {}) {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.error('No hay token de autentificacion disponible.REdirigiendo')
      // Si el token desaparece en medio de una acción, redirige
      alert('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.')
      window.location.href = '/login.html'
      return null // O lanzar un error para que la lógica de la llamada lo capture
    }

    const headers = {
      // 'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Añadir el token a los encabezados
      ...options.headers // Permite añadir otros encabezados personalizados
    }
    if (options.body instanceof FormData) {
      delete headers['Content-Type']
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    }

    try {
      const response = await fetch(url, { ...options, headers })

      if (response.status === 401 || response.status === 403) { // 401 Unauthorized, 403 Forbidden
        localStorage.removeItem('auth_token') // Limpiar el token inválido
        localStorage.removeItem('adminUser')
        if (logoutContainer) logoutContainer.style.display = 'none'
        alert('Tu sesión ha caducado o no estás autorizado. Por favor, inicia sesión de nuevo.')
        window.location.href = '/login.html'
        return null
      }

      if (!response.ok) { // Otros errores HTTP (ej: 400, 404, 500)
        const errorData = await response.json().catch(() => ({ message: 'error desconocido' }))
        throw new Error(errorData.message || 'Error en la petición API')
      }
      if (response.status === 204 || response.headers.get('content-length') === 0) {
        return { message: true, message: 'operacion exitosa sin contenido de resp.' }
      }
      return response.json() // Devuelve los datos de la respuesta
    } catch (error) {
      console.error('Error de red o API:', error)
      // Mensaje genérico para el usuario, el error detallado va a consola
      alert('Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.')
      return null // Indicar que la operación falló
    }
  }
  // --- FIN FUNCIÓN DE LLAMADAS SEGURAS ---

  // --- LÓGICA DE NAVEGACIÓN Y FUNCIONALIDAD DEL PANEL ---
  function showSection (sectionId) {
    contentSections.forEach(section => {
      section.classList.remove('active')
    })
    document.getElementById(sectionId).classList.add('active')

    if (sectionId === 'products-section') {
      showProductListView()
      loadProducts()
    } else {
      document.querySelectorAll('.detail-form-container').forEach(detail => detail.style.display = 'none')
      document.querySelectorAll('div[id$="-list"]').forEach(list => list.style.display = 'block')
    }
  }

  // Manejar clics en la barra de navegación
  navLinks.forEach(link => {
    link.addEventListener('click', async (event) => { // ¡Importante: async para usar await!
      event.preventDefault()
      navLinks.forEach(item => item.classList.remove('active'))
      link.classList.add('active')
      const targetSectionId = link.id.replace('nav-', '') + '-section'
      showSection(targetSectionId)

      // Ejemplo: Al hacer clic en "Gestionar Productos", intenta cargar los datos
      if (targetSectionId === 'products-section') {
        await loadProducts() // Llama a la función que cargará los productos de forma segura
      } else if (targetSectionId === 'clients-section') {
        // aqui deberia haber una funcion similar a loadproductos()
      } else if (targetSectionId === 'oreder-section') {
        // lo mismo pero para ordenes/pedidoss
      }
      // tambien puedes añadir mas funciones si es necesario
    })
  })

  // FUNCIONALIDAD ESPECIFICA DE GESTION DE PRODUCTOS
  // Manejar los botones "Volver a [Lista]" (sin cambios significativos)
  // Función para mostrar la vista de lista de productos
  function showProductListView () {
    productFormView.style.display = 'none'
    productListView.style.display = 'block'
    document.getElementById('products-table').style.display = 'table'
    productListMessage.textContent = 'cargando productos'
    productListMessage.style.display = 'block'
  }

  function showProductFormView () {
    productListView.style.display = 'none'
    productFormView.style.display = 'block'
    productFormMessage.textContent = '' // Limpiar mensajes de error/éxito
  }

  // [C]REATE & [U]PDATE: Guardar o Actualizar Producto
  productForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    productFormMessage.textContent = 'Guardando...'
    productFormMessage.className = 'info-text' // Clase temporal para indicar guardado

    const productId = productIdInput.value
    const method = productId ? 'PUT' : 'POST' // PUT para actualizar, POST para crear
    const url = productId ? `/api/prod/${productId}` : '/api/prod'

    const formData = new FormData()

    formData.append('nombre', productNameInput.value)
    formData.append('descripcion', productDescriptionInput.value)
    formData.append('precio', parseFloat(productPriceInput.value))
    formData.append('cantidad', parseInt(productStockInput.value))
    formData.append('categoria', productCategorySelect.value)// Asumiendo que guardamos el ID de la categoría
    // disponible : parseBoolean(productDisp.value)
    if (productImageInput && productImageInput.files && productImageInput.files[0]) {
      formData.append('imagenproducto', productImageInput.files[0])
    }

    const result = await callApiSecured(url, {
      method,
      body: formData
    })

    if (result) {
      productFormMessage.textContent = 'Producto guardado exitosamente!'
      productFormMessage.className = 'success-text'
      setTimeout(async () => {
        showProductListView()
        await loadProducts() // Recargar la lista de productos
      }, 1500) // Dar tiempo para leer el mensaje de éxito
    } else {
      productFormMessage.textContent = 'Error al guardar el producto. Inténtalo de nuevo.'
      productFormMessage.className = 'error-text'
    }
  })

  // [R]EAD: Cargar todos los productos y renderizar la tabla
  async function loadProducts () {
    productsTableBody.innerHTML = '' // Limpiar tabla
    productListMessage.textContent = 'Cargando productos...'
    productListMessage.style.display = 'block'
    document.getElementById('products-table').style.display = 'none' // Ocultar tabla mientras carga

    const products = await callApiSecured('/api/prod')

    if (products && products.length > 0) {
      productListMessage.style.display = 'none' // Ocultar mensaje de carga
      document.getElementById('products-table').style.display = 'table' // Mostrar tabla

      products.forEach(product => {
        const imagenUrl = product.imagen ? `/uploads/productos/${product.imagen}` : 'path/to/default/imagen.png'
        const row = productsTableBody.insertRow()
        row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.nombre}</td>
                    <td>$$${typeof product.precio === 'number' ? product.precio.toFixed(2) : 'N/A'}</td>
                    <td>${product.cantidad}</td>
                    <td>${product.categoria || 'Sin Categoría'}</td> 
                    <td><img src="${imagenUrl}" alt="${product.nombre}" style="width: 50px; height:50px;object-fit: cover; "
                    </td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${product.id}">Editar</button>
                        <button class="action-btn delete-btn" data-id="${product.id}">Eliminar</button>
                    </td>
                `
      })
      // Re-adjuntar eventos a los botones de la tabla (después de que se crean)
      attachProductTableListeners()
    } else if (products) { // Si products existe pero está vacío
      productListMessage.textContent = 'No hay productos registrados.'
      productListMessage.style.display = 'block'
      document.getElementById('products-table').style.display = 'none'
    } else {
      productListMessage.textContent = 'Error al cargar productos.'
      productListMessage.style.display = 'block'
      document.getElementById('products-table').style.display = 'none'
    }
  }

  // [U]PDATE: Cargar un producto específico para edición
  async function loadProductForEdit (productId) {
    productFormTitle.textContent = 'Editar Producto'
    productForm.reset() // Limpiar el formulario
    productIdInput.disabled = true // El ID no es editable
    imagenPreview.style.display = 'none'
    imagenPreview.src = ''
    productImageInput.value = ''

    const product = await callApiSecured(`/api/prod/${productId}`)
    if (product) {
      productIdInput.value = product.id
      productNameInput.value = product.nombre
      productPriceInput.value = product.precio
      productStockInput.value = product.cantidad
      productDescriptionInput.value = product.descripcion
      // Asegurarse de que la categoría se seleccione correctamente
      productCategorySelect.value = product.categoria

      if (product.image) {
        imagenPreview.src = `/public/uploads/productos/${product.image}`
        imagenPreview.style.display = 'block'
      }
      showProductFormView()
      await loadCategoriesIntoSelect(product.categoria)
    } else {
      alert('No se pudo cargar el detalle del producto.')
      showProductListView() // Volver a la lista si falla
    }
  }

  // [D]ELETE: Eliminar un producto
  async function deleteProduct (productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
      return
    }

    const result = await callApiSecured(`/api/prod/${productId}`, {
      method: 'DELETE'
    })

    if (result && result.success) { // Asumiendo que el backend devuelve { success: true }
      alert('Producto eliminado exitosamente.')
      await loadProducts() // Recargar la lista
    } else {
      alert('Error al eliminar el producto: ' + (result ? result.message : ''))
    }
  }

  // Función para cargar las categorías en el select
  async function loadCategoriesIntoSelect (categoryToSelect = null) {
    productCategorySelect.innerHTML = '<option value="">Cargando categorías...</option>'
    const categories = await callApiSecured('/api/categorias') // Asumiendo un endpoint /api/categories

    productCategorySelect.innerHTML = '<option value="">Selecciona una categoría</option>' // Opción por defecto
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.name
        productCategorySelect.appendChild(option)
      })
      if (categoryToSelect) {
        productCategorySelect.value = categoryToSelect
      }
      // ver si agregamos una api para categorias (no creo)
    } else if (categories) {
      productCategorySelect.innerHTML = '<option value="">No hay categorías disponibles</option>'
    } else {
      productCategorySelect.innerHTML = '<option value="">Error al cargar categorías</option>'
    }
  }

  // --- Manejo de Eventos especificos para productos---
  // evento para vista previa de imagen
  productImageInput.addEventListener('submit', async (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagenPreview.src = e.target.result
        imagenPreview.style.display = 'block'
      }
      reader.readAsDataUrl(file)
    } else {
      imagenPreview.src = ''
      imagenPreview.style.display = 'none'
    }
  })
  // Evento para el botón "Añadir Nuevo Producto"
  addProductBtn.addEventListener('click', () => {
    productFormTitle.textContent = 'Añadir Nuevo Producto'
    productForm.reset() // Limpiar formulario para nuevo producto
    productIdInput.value = '' // Asegurarse de que el ID esté vacío para un nuevo producto
    productIdInput.disabled = true // El ID siempre es deshabilitado
    showProductFormView()
    loadCategoriesIntoSelect() // Cargar categorías al añadir
  })

  // Evento para el botón "Volver a Productos" desde el formulario
  backToProductsListBtn.addEventListener('click', async () => {
    showProductListView()
    await loadProducts() // Recargar la lista al volver
  })

  // Función para adjuntar listeners a los botones de la tabla (EDITAR/ELIMINAR)
  // Se llama cada vez que la tabla se re-renderiza
  function attachProductTableListeners () {
    document.querySelectorAll('.data-table .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id
        loadProductForEdit(productId)
        loadCategoriesIntoSelect() // Cargar categorías al editar
      })
    })

    document.querySelectorAll('.data-table .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id
        deleteProduct(productId)
      })
    })
  }

  // --FUNCIONES PARA OTRAS SECCIONES (PENDIENTES DE IMPLEMENTAR)---
  // Tendrás que implementar estas funciones y sus respectivas rutas en el backend
  // y secciones en el HTML, similares a como se hizo con los productos.
  async function loadOrders () {
    const ordersSection = document.getElementById('orders-section')
    if (!ordersSection) return
      ordersSection.innerHTML = '<h2>Gestion de pedidos </h1><p>cargando pedidos...</p>'
    
    ordersSection.innerHTML = '<h2>Gestión de Pedidos</h2><p>Cargando pedidos...</p>'
    // const orders = await callApiSecured('/api/orders');
    // if (orders) { /* ... lógica para mostrar pedidos ... */ }
  }

  async function loadClients () {
    const clientsSection = document.getElementById('clients-section')
    if (!clientsSection) return // Asegurarse de que la sección exista
    clientsSection.innerHTML = '<h2>Gestión de Clientes</h2><p>Cargando clientes...</p>'
    // const clients = await callApiSecured('/api/users'); // Asumiendo /api/users
    // if (clients) { /* ... lógica para mostrar clientes ... */ }
  }
  // ... Puedes añadir loadEmployees, loadBranches, loadCategories (si tienes una vista principal), loadReports

  // --- MANEJO DE CERRAR SESIÓN ---
  const logoutButton = document.getElementById('btn-logout')
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      if (logoutContainer) { // Esto es para asegurar que el botón se oculta si existiera un contenedor
        logoutContainer.style.display = 'none'
      }
      alert('Sesión cerrada. Redirigiendo a la página de login...')
      window.location.href = '/login.html' // Corregida la ruta
    })
  }

  // ... (El resto de tu código JS existente: checkAuthenticationOnInit, callApiSecured, etc.) ...

  // Inicializar: mostrar el panel principal al cargar la página
  showSection('dashboard-section') // Muestra el dashboard por defecto

  // Si el dashboard también necesita datos iniciales protegidos, llámalos aquí:
  // await callApiSecured('/api/dashboard-summary');
})
