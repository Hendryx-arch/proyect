/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const welcomeMessage = document.getElementById('welcomeMessage'); // Renombrado a welcomeMessage
    const logoutContainer = document.getElementById('logout-container');

    // Variables para gestión de productos
    const productListView = document.getElementById('product-list-view');
    const productFormView = document.getElementById('product-form-view');
    const addProductBtn = document.getElementById('add-product-btn');
    const productsTableBody = document.querySelector('#products-table tbody');
    const productForm = document.getElementById('product-form');
    const productFormTitle = document.getElementById('product-form-title');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productStockInput = document.getElementById('product-stock');
    const productCategorySelect = document.getElementById('product-category');
    const productDescriptionInput = document.getElementById('product-description');
    const productListMessage = document.getElementById('product-list-message');
    const productFormMessage = document.getElementById('product-form-message');
    const backToProductsListBtn = document.getElementById('back-to-products-list-btn');
    const productImageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview'); // Renombrado a imagePreview

    // NUEVAS VARIABLES PARA GESTIÓN DE CLIENTES
    const clientListView = document.getElementById('client-list-view');
    const clientFormView = document.getElementById('client-form-view');
    const addClientBtn = document.getElementById('add-client-btn');
    const clientsTableBody = document.querySelector('#clients-table tbody');
    const clientForm = document.getElementById('client-form');
    const clientFormTitle = document.getElementById('client-form-title');
    const clientIdInput = document.getElementById('client-id');
    const clientNamesInput = document.getElementById('client-names');
    const clientLastnamesInput = document.getElementById('client-lastnames');
    const clientEmailInput = document.getElementById('client-email');
    const clientPhoneInput = document.getElementById('client-phone');
    const clientAddressInput = document.getElementById('client-address');
    const clientListMessage = document.getElementById('client-list-message');
    const clientFormMessage = document.getElementById('client-form-message');
    const backToClientsListBtn = document.getElementById('back-to-clients-list-btn');
    // FIN NUEVAS VARIABLES

    // --- FUNCIÓN PRINCIPAL DE VERIFICACIÓN AL CARGAR LA PÁGINA ---
    function checkAuthenticationOnInit() {
        const token = localStorage.getItem('auth_token');
        const adminUser = JSON.parse(localStorage.getItem('adminUser'));
        if (!token || !adminUser) {
            if (logoutContainer) {
                logoutContainer.style.display = 'none';
            }
            alert('No has iniciado sesión o tu sesión ha caducado. Por favor, inicia sesión.');
            window.location.href = '/login.html'; // Asegúrate de que esta ruta sea correcta
            return false;
        }

        if (logoutContainer) {
            logoutContainer.style.display = 'block';
        }
        if (welcomeMessage) { // Usar la variable renombrada
            welcomeMessage.textContent = `Hola, ${adminUser.nombres}`;
        }
        return true;
    }

    // Ejecutar la verificación al cargar la página
    if (!checkAuthenticationOnInit()) {
        return; // Detiene la ejecución si no está autenticado y ya redirigió
    }
    // --- FIN FUNCIÓN PRINCIPAL DE VERIFICACIÓN ---

    // --- NUEVA FUNCIÓN PARA HACER LLAMADAS A LA API DE FORMA SEGURA ---
    async function callApiSecured(url, options = {}) {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No hay token de autentificación disponible. Redirigiendo');
            alert('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
            window.location.href = '/login.html';
            return null;
        }

        const headers = {
            Authorization: `Bearer ${token}`, // Añadir el token a los encabezados
            ...options.headers // Permite añadir otros encabezados personalizados
        };
        // Si el cuerpo es FormData, no establecer Content-Type para que el navegador lo haga automáticamente
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        } else {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401 || response.status === 403) { // 401 Unauthorized, 403 Forbidden
                localStorage.removeItem('auth_token'); // Limpiar el token inválido
                localStorage.removeItem('adminUser');
                if (logoutContainer) logoutContainer.style.display = 'none';
                alert('Tu sesión ha caducado o no estás autorizado. Por favor, inicia sesión de nuevo.');
                window.location.href = '/login.html';
                return null;
            }

            if (!response.ok) { // Otros errores HTTP (ej: 400, 404, 500)
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                throw new Error(errorData.message || 'Error en la petición API');
            }
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { success: true, message: 'Operación exitosa sin contenido de respuesta.' };
            }
            return response.json(); // Devuelve los datos de la respuesta
        } catch (error) {
            console.error('Error de red o API:', error);
            alert('Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.');
            return null; // Indicar que la operación falló
        }
    }
    // --- FIN FUNCIÓN DE LLAMADAS SEGURAS ---

    // --- LÓGICA DE NAVEGACIÓN Y FUNCIONALIDAD DEL PANEL ---
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Lógica para mostrar las vistas de lista por defecto al cambiar de sección
        if (sectionId === 'products-section') {
            showProductListView();
            loadProducts(); // Asegurarse de que los datos se carguen al mostrar la sección
        } else if (sectionId === 'clients-section') {
            showClientListView(); // Nueva función
            loadClients();      // Nueva función
        } else {
            // Ocultar formularios de detalle cuando no se está en la sección correspondiente
            document.querySelectorAll('.detail-form-container').forEach(detail => detail.style.display = 'none');
            // Asegurarse de que las listas generales (si las hubiera en otras secciones) se muestren
            // document.querySelectorAll('div[id$="-list-view"]').forEach(list => list.style.display = 'block');
        }
    }

    // Manejar clics en la barra de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const targetSectionId = link.id.replace('nav-', '') + '-section';
            showSection(targetSectionId); // La función showSection ya maneja la carga inicial
        });
    });

    // --- FUNCIONALIDAD ESPECÍFICA DE GESTIÓN DE PRODUCTOS ---
    function showProductListView() {
        productFormView.style.display = 'none';
        productListView.style.display = 'block';
        document.getElementById('products-table').style.display = 'table';
        productListMessage.textContent = 'Cargando productos...';
        productListMessage.style.display = 'block';
    }

    function showProductFormView() {
        productListView.style.display = 'none';
        productFormView.style.display = 'block';
        productFormMessage.textContent = ''; // Limpiar mensajes
    }

    // [C]REATE & [U]PDATE: Guardar o Actualizar Producto
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        productFormMessage.textContent = 'Guardando...';
        productFormMessage.className = 'info-text';

        const productId = productIdInput.value;
        const method = productId ? 'PUT' : 'POST';
        const url = productId ? `/api/prod/${productId}` : '/api/prod';

        const formData = new FormData();
        formData.append('nombre', productNameInput.value);
        formData.append('descripcion', productDescriptionInput.value);
        formData.append('precio', parseFloat(productPriceInput.value));
        formData.append('cantidad', parseInt(productStockInput.value));
        formData.append('categoria', productCategorySelect.value);

        if (productImageInput && productImageInput.files && productImageInput.files[0]) {
            formData.append('imagenproducto', productImageInput.files[0]);
        }

        const result = await callApiSecured(url, {
            method,
            body: formData
        });

        if (result) {
            productFormMessage.textContent = 'Producto guardado exitosamente!';
            productFormMessage.className = 'success-text';
            setTimeout(async () => {
                showProductListView();
                await loadProducts(); // Recargar la lista
            }, 1500);
        } else {
            productFormMessage.textContent = 'Error al guardar el producto. Inténtalo de nuevo.';
            productFormMessage.className = 'error-text';
        }
    });

    // [R]EAD: Cargar todos los productos y renderizar la tabla
    async function loadProducts() {
        productsTableBody.innerHTML = ''; // Limpiar tabla
        productListMessage.textContent = 'Cargando productos...';
        productListMessage.style.display = 'block';
        document.getElementById('products-table').style.display = 'none';

        const products = await callApiSecured('/api/prod');

        if (products && products.length > 0) {
            productListMessage.style.display = 'none';
            document.getElementById('products-table').style.display = 'table';

            products.forEach(product => {
                const imagenUrl = product.imagen ? `/uploads/productos/${product.imagen}` : '/images/default-product.png'; // Asegura una imagen por defecto
                const row = productsTableBody.insertRow();
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.nombre}</td>
                    <td>Bs ${typeof product.precio === 'number' ? product.precio.toFixed(2) : 'N/A'}</td>
                    <td>${product.cantidad}</td>
                    <td>${product.categoria || 'Sin Categoría'}</td>
                    <td><img src="${imagenUrl}" alt="${product.nombre}" style="width: 50px; height:50px;object-fit: cover;"></td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${product.id}">Editar</button>
                        <button class="action-btn delete-btn" data-id="${product.id}">Eliminar</button>
                    </td>
                `;
            });
            attachProductTableListeners();
        } else if (products) {
            productListMessage.textContent = 'No hay productos registrados.';
            productListMessage.style.display = 'block';
            document.getElementById('products-table').style.display = 'none';
        } else {
            productListMessage.textContent = 'Error al cargar productos.';
            productListMessage.style.display = 'block';
            document.getElementById('products-table').style.display = 'none';
        }
    }

    // [U]PDATE: Cargar un producto específico para edición
    async function loadProductForEdit(productId) {
        productFormTitle.textContent = 'Editar Producto';
        productForm.reset();
        productIdInput.disabled = true;
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        productImageInput.value = '';

        const product = await callApiSecured(`/api/prod/${productId}`);
        if (product) {
            productIdInput.value = product.id;
            productNameInput.value = product.nombre;
            productPriceInput.value = product.precio;
            productStockInput.value = product.cantidad;
            productDescriptionInput.value = product.descripcion;
            productCategorySelect.value = product.categoria;

            if (product.imagen) { // Asumo que el campo de imagen de tu API es 'imagen'
                imagePreview.src = `/uploads/productos/${product.imagen}`; // Asegúrate que esta ruta sea correcta
                imagePreview.style.display = 'block';
            }
            showProductFormView();
            await loadCategoriesIntoSelect(product.categoria);
        } else {
            alert('No se pudo cargar el detalle del producto.');
            showProductListView();
        }
    }

    // [D]ELETE: Eliminar un producto
    async function deleteProduct(productId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
            return;
        }

        const result = await callApiSecured(`/api/prod/${productId}`, {
            method: 'DELETE'
        });

        if (result && result.success) { // Asumiendo que el backend devuelve { success: true }
            alert('Producto eliminado exitosamente.');
            await loadProducts(); // Recargar la lista
        } else {
            alert('Error al eliminar el producto: ' + (result ? result.message : ''));
        }
    }

    // Función para cargar las categorías en el select
    async function loadCategoriesIntoSelect(categoryToSelect = null) {
        productCategorySelect.innerHTML = '<option value="">Cargando categorías...</option>';
        const categories = await callApiSecured('/api/categorias'); // Asumiendo un endpoint /api/categorias

        productCategorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id; // Asumo que la categoría tiene un ID
                option.textContent = category.name || category.nombre; // Ajusta según el campo de nombre de tu categoría
                productCategorySelect.appendChild(option);
            });
            if (categoryToSelect) {
                productCategorySelect.value = categoryToSelect;
            }
        } else if (categories) {
            productCategorySelect.innerHTML = '<option value="">No hay categorías disponibles</option>';
        } else {
            productCategorySelect.innerHTML = '<option value="">Error al cargar categorías</option>';
        }
    }

    // --- Manejo de Eventos específicos para productos ---
    productImageInput.addEventListener('change', (event) => { // Cambiado a 'change' event
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file); // Corregido a readAsDataURL
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    });

    addProductBtn.addEventListener('click', () => {
        productFormTitle.textContent = 'Añadir Nuevo Producto';
        productForm.reset();
        productIdInput.value = '';
        productIdInput.disabled = true;
        imagePreview.style.display = 'none'; // Ocultar imagen previa al añadir nuevo
        imagePreview.src = '';
        loadCategoriesIntoSelect();
        showProductFormView();
    });

    backToProductsListBtn.addEventListener('click', async () => {
        showProductListView();
        await loadProducts();
    });

    function attachProductTableListeners() {
        document.querySelectorAll('#products-table .edit-btn').forEach(btn => { // Más específico con el ID de la tabla
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                loadProductForEdit(productId);
            });
        });

        document.querySelectorAll('#products-table .delete-btn').forEach(btn => { // Más específico
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                deleteProduct(productId);
            });
        });
    }

    // --- FUNCIONALIDAD ESPECÍFICA DE GESTIÓN DE CLIENTES (NUEVO) ---

    function showClientListView() {
        clientFormView.style.display = 'none';
        clientListView.style.display = 'block';
        document.getElementById('clients-table').style.display = 'table';
        clientListMessage.textContent = 'Cargando clientes...';
        clientListMessage.style.display = 'block';
    }

    function showClientFormView() {
        clientListView.style.display = 'none';
        clientFormView.style.display = 'block';
        clientFormMessage.textContent = '';
    }

    // [C]REATE & [U]PDATE: Guardar o Actualizar Cliente
    clientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clientFormMessage.textContent = 'Guardando...';
        clientFormMessage.className = 'info-text';

        const clientId = clientIdInput.value;
        const method = clientId ? 'PUT' : 'POST';
        const url = clientId ? `/api/clientes/${clientId}` : '/api/clientes'; // Asumo endpoint /api/clientes

        const clientData = {
            nombres: clientNamesInput.value,
            apellidos: clientLastnamesInput.value,
            email: clientEmailInput.value,
            telefono: clientPhoneInput.value,
            direccion: clientAddressInput.value
        };

        const result = await callApiSecured(url, {
            method,
            body: JSON.stringify(clientData) // Clientes no requieren FormData a menos que suban archivos
        });

        if (result) {
            clientFormMessage.textContent = 'Cliente guardado exitosamente!';
            clientFormMessage.className = 'success-text';
            setTimeout(async () => {
                showClientListView();
                await loadClients(); // Recargar la lista de clientes
            }, 1500);
        } else {
            clientFormMessage.textContent = 'Error al guardar el cliente. Inténtalo de nuevo.';
            clientFormMessage.className = 'error-text';
        }
    });

    // [R]EAD: Cargar todos los clientes y renderizar la tabla
    async function loadClients() {
        clientsTableBody.innerHTML = ''; // Limpiar tabla
        clientListMessage.textContent = 'Cargando clientes...';
        clientListMessage.style.display = 'block';
        document.getElementById('clients-table').style.display = 'none';

        const clients = await callApiSecured('/api/clientes'); // Asumo endpoint /api/clientes

        if (clients && clients.length > 0) {
            clientListMessage.style.display = 'none';
            document.getElementById('clients-table').style.display = 'table';

            clients.forEach(client => {
                const row = clientsTableBody.insertRow();
                row.innerHTML = `
                    <td>${client.id}</td>
                    <td>${client.nombres}</td>
                    <td>${client.apellidos}</td>
                    <td>${client.email}</td>
                    <td>${client.telefono || 'N/A'}</td>
                    <td>${client.direccion || 'N/A'}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${client.id}">Editar</button>
                        <button class="action-btn delete-btn" data-id="${client.id}">Eliminar</button>
                    </td>
                `;
            });
            attachClientTableListeners();
        } else if (clients) {
            clientListMessage.textContent = 'No hay clientes registrados.';
            clientListMessage.style.display = 'block';
            document.getElementById('clients-table').style.display = 'none';
        } else {
            clientListMessage.textContent = 'Error al cargar clientes.';
            clientListMessage.style.display = 'block';
            document.getElementById('clients-table').style.display = 'none';
        }
    }

    // [U]PDATE: Cargar un cliente específico para edición
    async function loadClientForEdit(clientId) {
        clientFormTitle.textContent = 'Editar Cliente';
        clientForm.reset();
        clientIdInput.disabled = true;

        const client = await callApiSecured(`/api/clientes/${clientId}`); // Asumo endpoint /api/clientes
        if (client) {
            clientIdInput.value = client.id;
            clientNamesInput.value = client.nombres;
            clientLastnamesInput.value = client.apellidos;
            clientEmailInput.value = client.email;
            clientPhoneInput.value = client.telefono;
            clientAddressInput.value = client.direccion;
            showClientFormView();
        } else {
            alert('No se pudo cargar el detalle del cliente.');
            showClientListView();
        }
    }

    // [D]ELETE: Eliminar un cliente
    async function deleteClient(clientId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción es irreversible.')) {
            return;
        }

        const result = await callApiSecured(`/api/clientes/${clientId}`, {
            method: 'DELETE'
        });

        if (result && result.success) {
            alert('Cliente eliminado exitosamente.');
            await loadClients(); // Recargar la lista
        } else {
            alert('Error al eliminar el cliente: ' + (result ? result.message : ''));
        }
    }

    // --- Manejo de Eventos específicos para clientes ---
    addClientBtn.addEventListener('click', () => {
        clientFormTitle.textContent = 'Añadir Nuevo Cliente';
        clientForm.reset();
        clientIdInput.value = '';
        clientIdInput.disabled = true;
        showClientFormView();
    });

    backToClientsListBtn.addEventListener('click', async () => {
        showClientListView();
        await loadClients();
    });

    function attachClientTableListeners() {
        document.querySelectorAll('#clients-table .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const clientId = btn.dataset.id;
                loadClientForEdit(clientId);
            });
        });

        document.querySelectorAll('#clients-table .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const clientId = btn.dataset.id;
                deleteClient(clientId);
            });
        });
    }

    // --- Manejo de Cerrar Sesión ---
    const logoutButton = document.getElementById('btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('auth_token'); // Usa 'auth_token' consistentemente
            localStorage.removeItem('adminUser');
            if (logoutContainer) {
                logoutContainer.style.display = 'none';
            }
            alert('Sesión cerrada. Redirigiendo a la página de login...');
            window.location.href = '/login.html';
        });
    }

    // Inicializar: mostrar el panel principal al cargar la página
    showSection('dashboard-section'); // Muestra el dashboard por defecto
});
