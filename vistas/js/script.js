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
  // --- Nuevas referencias DOM para Usuarios ---
  const userList = document.getElementById('users-list')
  const userTable = document.getElementById('user-table')
  const usersTableBody = document.querySelector('#users-table-body tbody')
  const addUserBtn = document.getElementById('add-user-btn')
  const userFormView = document.getElementById('user-form-view')
  const userForm = document.getElementById('user-form')
  const saveUserBtn = document.getElementById('save-user-btn')
  const backToUsersListBtn = document.getElementById('back-to-users-list-btn')
  const userFormMessage = document.getElementById('users-form-message')
  const usersListMessage = document.getElementById('users-list-message')
  // --- NUEVAS referencias DOM para Roles de Usuario ---
  const userRolesFormContainer = document.getElementById('user-roles-form-container')
  const userRolesNameSpan = document.getElementById('user-roles-name')
  const userRolesIdInput = document.getElementById('user-roles-id')
  const rolesCheckboxesDiv = document.getElementById('roles-checkboxes')
  const saveUserRolesBtn = document.getElementById('save-user-roles-btn')
  const backToUserDetailsBtn = document.getElementById('back-to-user-details-btn')
  const userRolesFormMessage = document.getElementById('user-roles-message')
  const manageRolesBtn = document.getElementById('manage-roles-btn') // El botón "Gestionar Roles"
  // FIN NUEVAS VARIABLESc

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
  // Manejar clics en la barra de navegación
  navLinks.forEach(link => {
    link.addEventListener('click', async (event) => { // ¡Importante: async para usar await!
      event.preventDefault()

      navLinks.forEach(item => item.classList.remove('active'))
      link.classList.add('active')
      const targetSectionId = link.id.replace('nav-', '') + '-section'
      showSection(targetSectionId)
    })
  })

  // --- LÓGICA DE NAVEGACIÓN Y FUNCIONALIDAD DEL PANEL ---
  function showSection (sectionId) {
    contentSections.forEach(section => {
      section.classList.remove('active')
    })
    document.getElementById(sectionId).classList.add('active')

    if (sectionId === 'products-section') {
      showProductListView()
      loadProducts()
    } else if (sectionId === 'users-section') { // *** NUEVO: Para la sección de usuarios ***
      showUserListView()
      loadUsers() // Carga los usuarios al entrar en la sección
    } else { // y cargar aqui para los demas navegadores
      document.querySelectorAll('.detail-form-container').forEach(detail => detail.style.display = 'none')
      document.querySelectorAll('div[id$="-list"]').forEach(list => list.style.display = 'block')
    }
  }

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
    userRolesFormContainer.style.display = 'none'
    productFormMessage.textContent = 'Llena los campos' // Limpiar mensajes de error/éxito
  }
  function showUserListView () {
    userFormView.style.display = 'none'
    userList.style.display = 'block'
    document.getElementById('users-list').style.display = 'table'
    userRolesFormContainer.style.display = 'none'
    usersListMessage.textContent = 'cargando usuarios'
    usersListMessage.style.display = 'block'
  }
  function showUserRolesForm () {
    document.getElementById('users-list').style.display = 'none'
    userFormView.style.display = 'none' // Ocultar el formulario principal del usuario
    userRolesFormContainer.style.display = 'block'
  }

  async function fetchAllRoles () {
    try {
      allAvaliableRoles = await callApiSecured('/api/roles')
      console.log('Roles disponibles:', allAvaliableRoles)
    } catch (error) {
      console.error('Error al cargar roles disponibles', error)
      alert('no se puedieron cargar los roles disponibles.')
    }
  }

  function populateRoleCheckboxes (userId, userName, assigneRole = []) {
    userRolesNameSpan.textContent = userName
    userRolesIdInput.value = userId
    rolesCheckboxesDiv, innerHTML = ''
    if (allAvaliableRoles.length === 0) {
      rolesCheckboxesDiv.innerHTML = '<p>No hay roles disponibles.</p>'
      return
    }
    allAvaliableRoles.forEach(role => {
      const isChecked = assigneRole.includes(role.id)
      rolesCheckboxesDiv.innerHTML += `
        <input type="checkbox" id="role-${role.id}" name="roleIds" value="${role.id}" ${isChecked ? 'checked' : ''}>
        <label for="role-${role.id}">${role.nombre_rol}</label><br>
        `
    })
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
        const finalImageUrl = product.imagen
        const row = productsTableBody.insertRow()
        row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.nombre}</td>
                    <td>${typeof product.precio === 'number' ? product.precio.toFixed(2) : ''}</td>
                    <td>${product.cantidad}</td>
                    <td>${product.categoria || 'Sin Categoría'}</td> 
                    <td><img src="${finalImageUrl}" alt="${product.nombre}" style="width: 50px; height:50px;object-fit: cover; "
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
  // -----SECCION DE USUARIOS---------
  // --- Funciones para la vista de Usuarios ---
  // Mostrar la vista de lista de usuarios y ocultar el formulario

  // Mostrar el formulario de usuario y ocultar la lista
  function showUserForm () {
    userList.style.display = 'none'
    userFormView.style.display = 'block'
    userFormMessage.textContent = 'llena los datos'
  }
  // [R]ead mostrar los usuarios
  async function loadUsers () {
    usersTableBody.innerHTML = '' // Limpiar tabla
    usersListMessage.textContent = 'Cargando usuarios...'
    usersListMessage.style.display = 'block'
    document.getElementById('users-table-body').style.display = 'none'

    // const users = callApiSecured('/api/users')

    try {
      const users = await callApiSecured('/api/users') // Llamada a tu API de usuarios

      if (users && users.length > 0) {
        usersListMessage.style.display = 'none'
        document.getElementById('users-table-body').style.display = 'table'

        users.forEach(user => {
          const row = usersTableBody.insertRow()
          row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nombres}</td>
                    <td>${user.apellidos}</td>
                    <td>${user.ci}</td>
                    <td>${user.correo}</td>
                    <td>${user.telefono}</td>
                    <td>${user.roles} </td>
                    <td>
                        <button class="action-btn edit-user-btn" data-id="${user.id}">Editar</button>
                        <button class="action-btn delete-user-btn" data-id="${user.id}">Eliminar</button>
                    </td>
                `
        })
        attachUserTableListeners() // Adjuntar listeners a los botones de la tabla
      } else if (users) {
        usersListMessage.textContent = 'No hay usuarios registrados.'
        usersListMessage.style.display = 'block'
        document.getElementById('users-table').style.display = 'none'
      } else {
        usersListMessage.textContent = 'Error al cargar usuarios.'
        usersListMessage.style.display = 'block'
        document.getElementById('users-list').style.display = 'none'
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      usersListMessage.textContent = 'Error al cargar usuarios: ' + (error.message || 'Error desconocido')
      usersListMessage.style.display = 'block'
      document.getElementById('users-list').style.display = 'none'
    }
  }

  // Cargar usuario para edición
  async function loadUserForEdit (userId) {
    try {
      const user = await callApiSecured(`/api/users/${userId}`)
      document.getElementById('user-id').value = user.id
      document.getElementById('user-name').value = user.nombres
      document.getElementById('user-apellido').value = user.apellidos
      document.getElementById('user-ci').value = user.ci
      document.getElementById('user-telefono').value = user.telefono
      document.getElementById('user-email').value = user.correo
      // No se rellena la contraseña por seguridad
      document.getElementById('user-password').value = '' // Vaciar siempre

      manageRolesBtn.style.display = 'inline-block'
      manageRolesBtn.dataset.userId = user.id
      manageRolesBtn.dataset.userName = user.nombre
      manageRolesBtn.dataset.assigneRole = JSON.stringify(user.assigRol || [])

      saveUserBtn.textContent = 'Actualizar Informacion'
      userFormMessage.textContent = ''
      showUserForm()
    } catch (error) {
      console.error('Error al cargar usuario para edición:', error)
      alert('Error al cargar el usuario: ' + (error.message || 'Error desconocido'))
    }
  }
  // Listener para el botón "Añadir Nuevo Usuario"
  addUserBtn.addEventListener('click', () => {
    userForm.reset() // Limpiar el formulario
    document.getElementById('user-id').value = '' // Asegurarse de que el ID esté vacío para nueva creación
    saveUserBtn.textContent = 'Guardar Usuario'
    userFormMessage.textContent = ''
    showUserForm()
  })

  // Listener para el botón "Volver a Usuarios"
  backToUsersListBtn.addEventListener('click', () => {
    showUserListView()
    loadUsers() // Recargar la lista al volver
  })

  // Manejar el envío del formulario de usuario
  userForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const userId = document.getElementById('user-id').value
    const formData = new FormData(userForm) // FormData para facilitar la recolección
    const userData = Object.fromEntries(formData.entries())

    // Eliminar el campo de ID si es una creación nueva
    if (!userId) {
      delete userData.id
    }

    // Si la contraseña está vacía, no la envíes para actualización
    if (userId && userData.contrasena === '') {
      delete userData.contrasena
    }

    try {
      let response
      if (userId) { // Si hay un ID, es una actualización (PUT)
        response = await callApiSecured(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      } else { // Si no hay ID, es una creación (POST)
        response = await callApiSecured('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      }

      if (response.message) {
        userFormMessage.textContent = response.message
        userFormMessage.style.color = 'green'
      } else {
        userFormMessage.textContent = 'Operación exitosa.'
        userFormMessage.style.color = 'green'
      }
      setTimeout(() => {
        showUserListView()
        loadUsers() // Recargar lista después de guardar
      }, 1500)
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      userFormMessage.textContent = 'Error al guardar usuario: ' + (error.message || 'Error desconocido')
      userFormMessage.style.color = 'red'
    }
  })

  // Adjuntar listeners a los botones de la tabla de usuarios (Editar/Eliminar)
  function attachUserTableListeners () {
    document.getElementById('users-table-body').addEventListener('click', async (event) => {
      if (event.target.classList.contains('edit-user-btn')) {
        const userId = event.target.dataset.id
        await loadUserForEdit(userId)
      } else if (event.target.classList.contains('delete-user-btn')) {
        const userId = event.target.dataset.id
        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
          try {
            const response = await callApiSecured(`/api/users/${userId}`, { method: 'DELETE' })
            alert(response.message || 'Usuario eliminado.')
            loadUsers() // Recargar la lista después de eliminar
          } catch (error) {
            console.error('Error al eliminar usuario:', error)
            alert('Error al eliminar usuario: ' + (error.message || 'Error desconocido'))
          }
        }
      }
    })
  }
  // -----------Funciones para los roles-----------
  let allAvaliableRoles = []

  // Llama a loadUsers al inicio si la sección de usuarios es la activa por defecto
  // o se va a activar por alguna lógica inicial.
  // O puedes mover loadUsers al navUsersLink event listener como hicimos con products.
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
  // })
  // --- Listeners para la gestión de Usuarios y Roles ---
  // document.addEventListener('DOMContentLoaded', async () => { // Hacemos async para fetchAllRoles
  // ... Tus listeners existentes para productos ...

  // Listener para el enlace de navegación de usuarios
  // Cargar todos los roles disponibles al inicio
  await fetchAllRoles() // Llama a esta función al cargar la página

  // Listener para el botón "Añadir Nuevo Usuario"
  addUserBtn.addEventListener('click', () => {
    userForm.reset() // Limpiar el formulario
    document.getElementById('user-id').value = '' // Asegurarse de que el ID esté vacío para nueva creación
    document.getElementById('user-password').setAttribute('required', 'true') // Contraseña es obligatoria en creación
    manageRolesBtn.style.display = 'none' // Ocultar el botón de gestionar roles
    saveUserBtn.textContent = 'Guardar Nuevo Usuario'
    userFormMessage.textContent = ''
    showUserForm()
  })

  // Listener para el botón "Volver a Usuarios" desde el formulario de usuario
  backToUsersListBtn.addEventListener('click', () => {
    showUserListView()
    loadUsers() // Recargar la lista al volver
  })

  // Listener para el botón "Gestionar Roles"
  manageRolesBtn.addEventListener('click', () => {
    const userId = manageRolesBtn.dataset.userId
    const userName = manageRolesBtn.dataset.userName
    const assigneRole = JSON.parse(manageRolesBtn.dataset.assigneRole) // Parsear el array
    populateRoleCheckboxes(userId, userName, assigneRole)
    userRolesFormMessage.textContent = ''
    showUserRolesForm()
  })

  // Listener para el botón "Volver a Detalles del Usuario" desde el formulario de roles
  backToUserDetailsBtn.addEventListener('click', () => {
    const currentUserId = userRolesIdInput.value
    showUserForm() // Vuelve al formulario principal
    loadUserForEdit(currentUserId) // Recarga los datos del usuario para mantener el formulario lleno
  })

  // Manejar el envío del formulario de información básica del usuario
  userForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const userId = document.getElementById('user-id').value
    const formData = new FormData(userForm)
    const userData = Object.fromEntries(formData.entries())

    // Eliminar el campo de ID si es una creación nueva
    if (!userId) {
      delete userData.id
    }

    // Si la contraseña está vacía, no la envíes para actualización
    if (userId && userData.contrasena === '') {
      delete userData.contrasena
    }

    try {
      let response
      if (userId) { // Si hay un ID, es una actualización (PUT)
        document.getElementById('user-password').removeAttribute('required') // Ya no es obligatorio al actualizar
        response = await callApiSecured(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      } else { // Si no hay ID, es una creación (POST)
        response = await callApiSecured('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      }

      if (response.message) {
        userFormMessage.textContent = response.message
        userFormMessage.style.color = 'green'
      } else {
        userFormMessage.textContent = 'Operación exitosa.'
        userFormMessage.style.color = 'green'
      }
      setTimeout(() => {
        // Si es una creación, se vuelve a la lista.
        // Si es una actualización, se mantiene en el formulario para gestionar roles.
        if (!userId) {
          showUserListView()
          loadUsers()
        } else {
          // Mantener en el formulario, quizá con un mensaje de éxito más claro.
        }
      }, 1500)
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      userFormMessage.textContent = 'Error al guardar usuario: ' + (error.message || 'Error desconocido')
      userFormMessage.style.color = 'red'
    }
  })

  // Manejar el envío del formulario de roles del usuario
  document.getElementById('user-roles-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const userId = userRolesIdInput.value
    const selectedRoleIds = Array.from(rolesCheckboxesDiv.querySelectorAll('input[name="roleIds"]:checked'))
      .map(checkbox => parseInt(checkbox.value))

    console.log('UserID a enviar:', userId)
    console.log('Role IDs a enviar:', selectedRoleIds) // <<-- ¡AÑADE ESTE CONSOLE.LOG!
    console.log('Tipo de Role IDs:', typeof selectedRoleIds, 'Es Array?', Array.isArray(selectedRoleIds)) // <<-- ¡AÑADE ESTE CONSOLE.LOG!

    try {
      const response = await callApiSecured(`/api/roles/${userId}/roles`, { // Nueva ruta PUT para asignar roles
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds: selectedRoleIds })
      })

      if (response.message) {
        userRolesFormMessage.textContent = response.message
        userRolesFormMessage.style.color = 'green'
      } else {
        userRolesFormMessage.textContent = 'Roles asignados exitosamente.'
        userRolesFormMessage.style.color = 'green'
      }
      setTimeout(() => {
        showUserListView() // Volver a la lista después de guardar roles
        loadUsers() // Recargar la lista para ver los roles actualizados
      }, 1500)
    } catch (error) {
      console.error('Error al guardar roles:', error)
      userRolesFormMessage.textContent = 'Error al guardar roles: ' + (error.message || 'Error desconocido')
      userRolesFormMessage.style.color = 'red'
    }
  })

  // Adjuntar listeners a los botones de la tabla de usuarios (Editar/Eliminar)
  // Llama a los listeners de la tabla al inicio

  // Llama a loadUsers si la sección de usuarios es la activa por defecto
  // o se va a activar por alguna lógica inicial (esto ya lo manejas en showSection)
})
