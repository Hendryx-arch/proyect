/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const welcomeMessage = document.getElementById('welcomeMessage');
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
    const imagePreview = document.getElementById('image-preview');

    // Variables para gestión de clientes
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

    // Variables para gestión de pedidos
    const orderListView = document.getElementById('order-list-view');
    const orderDetailView = document.getElementById('order-detail-view');
    const ordersTableBody = document.querySelector('#orders-table tbody');
    const orderListMessage = document.getElementById('order-list-message');
    const orderDetailId = document.getElementById('order-detail-id');
    const orderDetailClientName = document.getElementById('order-detail-client-name');
    const orderDetailClientEmail = document.getElementById('order-detail-client-email');
    const orderDetailDate = document.getElementById('order-detail-date');
    const orderDetailTotal = document.getElementById('order-detail-total');
    const orderDetailAddress = document.getElementById('order-detail-address');
    const orderItemsTbody = document.getElementById('order-items-tbody');
    const orderStatusSelect = document.getElementById('order-status-select');
    const updateOrderStatusBtn = document.getElementById('update-order-status-btn');
    const backToOrdersListBtn = document.getElementById('back-to-orders-list-btn');
    const orderFormMessage = document.getElementById('order-form-message');
    let currentOrderId = null;

    // NUEVAS VARIABLES PARA GESTIÓN DE EMPLEADOS
    const employeeListView = document.getElementById('employee-list-view');
    const employeeFormView = document.getElementById('employee-form-view');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const employeesTableBody = document.querySelector('#employees-table tbody');
    const employeeForm = document.getElementById('employee-form');
    const employeeFormTitle = document.getElementById('employee-form-title');
    const employeeIdInput = document.getElementById('employee-id');
    const employeeNamesInput = document.getElementById('employee-names');
    const employeeLastnamesInput = document.getElementById('employee-lastnames');
    const employeeEmailInput = document.getElementById('employee-email');
    const employeePhoneInput = document.getElementById('employee-phone');
    const employeeRoleSelect = document.getElementById('employee-role');
    const employeePasswordInput = document.getElementById('employee-password');
    const employeeConfirmPasswordInput = document.getElementById('employee-confirm-password');
    const employeeListMessage = document.getElementById('employee-list-message');
    const employeeFormMessage = document.getElementById('employee-form-message');
    const backToEmployeesListBtn = document.getElementById('back-to-employees-list-btn');
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
            window.location.href = '/login.html';
            return false;
        }

        if (logoutContainer) {
            logoutContainer.style.display = 'block';
        }
        if (welcomeMessage) {
            welcomeMessage.textContent = `Hola, ${adminUser.nombres}`;
        }
        return true;
    }

    if (!checkAuthenticationOnInit()) {
        return;
    }

    // --- FUNCIÓN PARA HACER LLAMADAS A LA API DE FORMA SEGURA ---
    async function callApiSecured(url, options = {}) {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No hay token de autentificación disponible. Redirigiendo');
            alert('Tu sesión ha caducada. Por favor, inicia sesión de nuevo.');
            window.location.href = '/login.html';
            return null;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            ...options.headers
        };
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        } else {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('adminUser');
                if (logoutContainer) logoutContainer.style.display = 'none';
                alert('Tu sesión ha caducado o no estás autorizado. Por favor, inicia sesión de nuevo.');
                window.location.href = '/login.html';
                return null;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                throw new Error(errorData.message || 'Error en la petición API');
            }
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { success: true, message: 'Operación exitosa sin contenido de respuesta.' };
            }
            return response.json();
        } catch (error) {
            console.error('Error de red o API:', error);
            alert('Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.');
            return null;
        }
    }

    // --- LÓGICA DE NAVEGACIÓN Y FUNCIONALIDAD DEL PANEL ---
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Ocultar todos los formularios de detalle por defecto y mostrar vistas de lista
        document.querySelectorAll('.detail-form-container').forEach(detail => detail.style.display = 'none');
        document.querySelectorAll('div[id$="-list-view"]').forEach(list => list.style.display = 'none'); // Ocultar todas las listas primero

        if (sectionId === 'products-section') {
            showProductListView();
            loadProducts();
        } else if (sectionId === 'clients-section') {
            showClientListView();
            loadClients();
        } else if (sectionId === 'orders-section') {
            showOrderListView();
            loadOrders();
        } else if (sectionId === 'employees-section') { // Manejo de la sección de empleados
            showEmployeeListView();
            loadEmployees();
        } else if (sectionId === 'dashboard-section') {
            // No hay una vista de lista para el dashboard, solo la sección principal
            document.getElementById('dashboard-section').style.display = 'block';
        }
        // ... (otros else if para otras secciones si tienen lógicas de carga específicas)
    }

    navLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const targetSectionId = link.id.replace('nav-', '') + '-section';
            showSection(targetSectionId);
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
        productFormMessage.textContent = '';
    }

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
                await loadProducts();
            }, 1500);
        } else {
            productFormMessage.textContent = 'Error al guardar el producto. Inténtalo de nuevo.';
            productFormMessage.className = 'error-text';
        }
    });

    async function loadProducts() {
        productsTableBody.innerHTML = '';
        productListMessage.textContent = 'Cargando productos...';
        productListMessage.style.display = 'block';
        document.getElementById('products-table').style.display = 'none';

        const products = await callApiSecured('/api/prod');

        if (products && products.length > 0) {
            productListMessage.style.display = 'none';
            document.getElementById('products-table').style.display = 'table';

            products.forEach(product => {
                const imagenUrl = product.imagen ? `/uploads/productos/${product.imagen}` : '/images/default-product.png';
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

            if (product.imagen) {
                imagePreview.src = `/uploads/productos/${product.imagen}`;
                imagePreview.style.display = 'block';
            }
            showProductFormView();
            await loadCategoriesIntoSelect(product.categoria);
        } else {
            alert('No se pudo cargar el detalle del producto.');
            showProductListView();
        }
    }

    async function deleteProduct(productId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
            return;
        }

        const result = await callApiSecured(`/api/prod/${productId}`, {
            method: 'DELETE'
        });

        if (result && result.success) {
            alert('Producto eliminado exitosamente.');
            await loadProducts();
        } else {
            alert('Error al eliminar el producto: ' + (result ? result.message : ''));
        }
    }

    async function loadCategoriesIntoSelect(categoryToSelect = null) {
        productCategorySelect.innerHTML = '<option value="">Cargando categorías...</option>';
        const categories = await callApiSecured('/api/categorias');

        productCategorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name || category.nombre;
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

    productImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
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
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        loadCategoriesIntoSelect();
        showProductFormView();
    });

    backToProductsListBtn.addEventListener('click', async () => {
        showProductListView();
        await loadProducts();
    });

    function attachProductTableListeners() {
        document.querySelectorAll('#products-table .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                loadProductForEdit(productId);
            });
        });

        document.querySelectorAll('#products-table .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                deleteProduct(productId);
            });
        });
    }

    // --- FUNCIONALIDAD ESPECÍFICA DE GESTIÓN DE CLIENTES ---
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

    clientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clientFormMessage.textContent = 'Guardando...';
        clientFormMessage.className = 'info-text';

        const clientId = clientIdInput.value;
        const method = clientId ? 'PUT' : 'POST';
        const url = clientId ? `/api/clientes/${clientId}` : '/api/clientes';

        const clientData = {
            nombres: clientNamesInput.value,
            apellidos: clientLastnamesInput.value,
            email: clientEmailInput.value,
            telefono: clientPhoneInput.value,
            direccion: clientAddressInput.value
        };

        const result = await callApiSecured(url, {
            method,
            body: JSON.stringify(clientData)
        });

        if (result) {
            clientFormMessage.textContent = 'Cliente guardado exitosamente!';
            clientFormMessage.className = 'success-text';
            setTimeout(async () => {
                showClientListView();
                await loadClients();
            }, 1500);
        } else {
            clientFormMessage.textContent = 'Error al guardar el cliente. Inténtalo de nuevo.';
            clientFormMessage.className = 'error-text';
        }
    });

    async function loadClients() {
        clientsTableBody.innerHTML = '';
        clientListMessage.textContent = 'Cargando clientes...';
        clientListMessage.style.display = 'block';
        document.getElementById('clients-table').style.display = 'none';

        const clients = await callApiSecured('/api/clientes');

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

    async function loadClientForEdit(clientId) {
        clientFormTitle.textContent = 'Editar Cliente';
        clientForm.reset();
        clientIdInput.disabled = true;

        const client = await callApiSecured(`/api/clientes/${clientId}`);
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

    async function deleteClient(clientId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción es irreversible.')) {
            return;
        }

        const result = await callApiSecured(`/api/clientes/${clientId}`, {
            method: 'DELETE'
        });

        if (result && result.success) {
            alert('Cliente eliminado exitosamente.');
            await loadClients();
        } else {
            alert('Error al eliminar el cliente: ' + (result ? result.message : ''));
        }
    }

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

    // --- FUNCIONALIDAD ESPECÍFICA DE GESTIÓN DE PEDIDOS ---

    function showOrderListView() {
        orderDetailView.style.display = 'none';
        orderListView.style.display = 'block';
        document.getElementById('orders-table').style.display = 'table';
        orderListMessage.textContent = 'Cargando pedidos...';
        orderListMessage.style.display = 'block';
    }

    function showOrderDetailView() {
        orderListView.style.display = 'none';
        orderDetailView.style.display = 'block';
        orderFormMessage.textContent = '';
    }

    async function loadOrders() {
        ordersTableBody.innerHTML = '';
        orderListMessage.textContent = 'Cargando pedidos...';
        orderListMessage.style.display = 'block';
        document.getElementById('orders-table').style.display = 'none';

        const orders = await callApiSecured('/api/pedidos');

        if (orders && orders.length > 0) {
            orderListMessage.style.display = 'none';
            document.getElementById('orders-table').style.display = 'table';

            orders.forEach(order => {
                const orderDate = new Date(order.fecha_pedido).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const row = ordersTableBody.insertRow();
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.cliente_nombre || 'N/A'} ${order.cliente_apellidos || ''}</td>
                    <td>${orderDate}</td>
                    <td>Bs ${typeof order.total === 'number' ? order.total.toFixed(2) : 'N/A'}</td>
                    <td>${order.estado || 'Pendiente'}</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${order.id}">Ver Detalle</button>
                    </td>
                `;
            });
            attachOrderTableListeners();
        } else if (orders) {
            orderListMessage.textContent = 'No hay pedidos registrados.';
            orderListMessage.style.display = 'block';
            document.getElementById('orders-table').style.display = 'none';
        } else {
            orderListMessage.textContent = 'Error al cargar pedidos.';
            orderListMessage.style.display = 'block';
            document.getElementById('orders-table').style.display = 'none';
        }
    }

    async function loadOrderForView(orderId) {
        orderFormMessage.textContent = '';
        currentOrderId = orderId;

        const order = await callApiSecured(`/api/pedidos/${orderId}`);
        if (order) {
            orderDetailId.textContent = order.id;
            orderDetailClientName.textContent = `${order.cliente_nombre || ''} ${order.cliente_apellidos || ''}`;
            orderDetailClientEmail.textContent = order.cliente_email || 'N/A';
            orderDetailDate.textContent = new Date(order.fecha_pedido).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            orderDetailTotal.textContent = `Bs ${typeof order.total === 'number' ? order.total.toFixed(2) : 'N/A'}`;
            orderDetailAddress.textContent = order.direccion_envio || 'N/A';

            orderStatusSelect.value = order.estado || 'Pendiente';

            orderItemsTbody.innerHTML = '';
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    const row = orderItemsTbody.insertRow();
                    row.innerHTML = `
                        <td>${item.nombre_producto || 'N/A'}</td>
                        <td>${item.cantidad}</td>
                        <td>Bs ${typeof item.precio_unitario === 'number' ? item.precio_unitario.toFixed(2) : 'N/A'}</td>
                        <td>Bs ${typeof item.subtotal === 'number' ? item.subtotal.toFixed(2) : 'N/A'}</td>
                    `;
                });
            } else {
                const row = orderItemsTbody.insertRow();
                row.innerHTML = `<td colspan="4">No hay artículos en este pedido.</td>`;
            }

            showOrderDetailView();
        } else {
            alert('No se pudo cargar el detalle del pedido.');
            showOrderListView();
        }
    }

    updateOrderStatusBtn.addEventListener('click', async () => {
        if (!currentOrderId) {
            alert('No hay un pedido seleccionado para actualizar.');
            return;
        }

        orderFormMessage.textContent = 'Actualizando estado...';
        orderFormMessage.className = 'info-text';

        const newStatus = orderStatusSelect.value;
        const result = await callApiSecured(`/api/pedidos/${currentOrderId}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado: newStatus })
        });

        if (result && result.success) {
            orderFormMessage.textContent = 'Estado del pedido actualizado exitosamente!';
            orderFormMessage.className = 'success-text';
            setTimeout(async () => {
                showOrderListView();
                await loadOrders();
            }, 1500);
        } else {
            orderFormMessage.textContent = 'Error al actualizar el estado del pedido: ' + (result ? result.message : '');
            orderFormMessage.className = 'error-text';
        }
    });

    backToOrdersListBtn.addEventListener('click', async () => {
        showOrderListView();
        await loadOrders();
    });

    function attachOrderTableListeners() {
        document.querySelectorAll('#orders-table .view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.dataset.id;
                loadOrderForView(orderId);
            });
        });
    }

    // --- FUNCIONALIDAD ESPECÍFICA DE GESTIÓN DE EMPLEADOS (NUEVO) ---

    function showEmployeeListView() {
        employeeFormView.style.display = 'none';
        employeeListView.style.display = 'block';
        document.getElementById('employees-table').style.display = 'table';
        employeeListMessage.textContent = 'Cargando empleados...';
        employeeListMessage.style.display = 'block';
    }

    function showEmployeeFormView() {
        employeeListView.style.display = 'none';
        employeeFormView.style.display = 'block';
        employeeFormMessage.textContent = ''; // Limpiar mensajes previos
    }

    // [C]REATE / [U]PDATE: Manejar el envío del formulario de empleado
    employeeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        employeeFormMessage.textContent = 'Guardando...';
        employeeFormMessage.className = 'info-text';

        const employeeId = employeeIdInput.value;
        const method = employeeId ? 'PUT' : 'POST';
        const url = employeeId ? `/api/employees/${employeeId}` : '/api/employees'; // Asumo endpoints /api/employees

        const password = employeePasswordInput.value;
        const confirmPassword = employeeConfirmPasswordInput.value;

        if (!employeeId && (!password || password.length < 6)) { // Para creación, la contraseña es obligatoria y con mínimo
            employeeFormMessage.textContent = 'La contraseña es obligatoria y debe tener al menos 6 caracteres.';
            employeeFormMessage.className = 'error-text';
            return;
        }

        if (password && password !== confirmPassword) {
            employeeFormMessage.textContent = 'Las contraseñas no coinciden.';
            employeeFormMessage.className = 'error-text';
            return;
        }

        const employeeData = {
            nombres: employeeNamesInput.value,
            apellidos: employeeLastnamesInput.value,
            email: employeeEmailInput.value,
            telefono: employeePhoneInput.value,
            rol: employeeRoleSelect.value,
            // Solo incluir la contraseña si se proporcionó una o si es un nuevo registro
            ...(password && { password: password })
        };

        // Si es una actualización y no se puso nueva contraseña, no la envíes
        if (employeeId && !password) {
            delete employeeData.password;
        }

        const result = await callApiSecured(url, {
            method,
            body: JSON.stringify(employeeData)
        });

        if (result) {
            employeeFormMessage.textContent = 'Empleado guardado exitosamente!';
            employeeFormMessage.className = 'success-text';
            setTimeout(async () => {
                showEmployeeListView();
                await loadEmployees();
            }, 1500);
        } else {
            employeeFormMessage.textContent = 'Error al guardar el empleado. Inténtalo de nuevo.';
            employeeFormMessage.className = 'error-text';
        }
    });

    // [R]EAD: Cargar todos los empleados y renderizar la tabla
    async function loadEmployees() {
        employeesTableBody.innerHTML = '';
        employeeListMessage.textContent = 'Cargando empleados...';
        employeeListMessage.style.display = 'block';
        document.getElementById('employees-table').style.display = 'none';

        const employees = await callApiSecured('/api/employees'); // Asumo endpoint /api/employees

        if (employees && employees.length > 0) {
            employeeListMessage.style.display = 'none';
            document.getElementById('employees-table').style.display = 'table';

            employees.forEach(employee => {
                const row = employeesTableBody.insertRow();
                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.nombres}</td>
                    <td>${employee.apellidos}</td>
                    <td>${employee.email}</td>
                    <td>${employee.telefono || 'N/A'}</td>
                    <td>${employee.rol || 'N/A'}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${employee.id}">Editar</button>
                        <button class="action-btn delete-btn" data-id="${employee.id}">Eliminar</button>
                    </td>
                `;
            });
            attachEmployeeTableListeners();
        } else if (employees) {
            employeeListMessage.textContent = 'No hay empleados registrados.';
            employeeListMessage.style.display = 'block';
            document.getElementById('employees-table').style.display = 'none';
        } else {
            employeeListMessage.textContent = 'Error al cargar empleados.';
            employeeListMessage.style.display = 'block';
            document.getElementById('employees-table').style.display = 'none';
        }
    }

    // [U]PDATE: Cargar un empleado específico para editar
    async function loadEmployeeForEdit(employeeId) {
        employeeFormTitle.textContent = 'Editar Empleado';
        employeeForm.reset();
        employeeIdInput.disabled = true; // El ID no se edita

        // Ocultar los campos de contraseña para edición a menos que se quiera cambiar
        employeePasswordInput.value = '';
        employeeConfirmPasswordInput.value = '';
        // Puedes agregar lógica para mostrar/ocultar estos campos o un checkbox "cambiar contraseña"
        // Por ahora, simplemente se limpian y si el usuario los rellena, se enviarán.

        const employee = await callApiSecured(`/api/employees/${employeeId}`);
        if (employee) {
            employeeIdInput.value = employee.id;
            employeeNamesInput.value = employee.nombres;
            employeeLastnamesInput.value = employee.apellidos;
            employeeEmailInput.value = employee.email;
            employeePhoneInput.value = employee.telefono;
            employeeRoleSelect.value = employee.rol;
            showEmployeeFormView();
        } else {
            alert('No se pudo cargar el detalle del empleado.');
            showEmployeeListView();
        }
    }

    // [D]ELETE: Eliminar un empleado
    async function deleteEmployee(employeeId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este empleado? Esta acción es irreversible.')) {
            return;
        }

        const result = await callApiSecured(`/api/employees/${employeeId}`, {
            method: 'DELETE'
        });

        if (result && result.success) {
            alert('Empleado eliminado exitosamente.');
            await loadEmployees();
        } else {
            alert('Error al eliminar el empleado: ' + (result ? result.message : ''));
        }
    }

    addEmployeeBtn.addEventListener('click', () => {
        employeeFormTitle.textContent = 'Añadir Nuevo Empleado';
        employeeForm.reset();
        employeeIdInput.value = '';
        employeeIdInput.disabled = true;
        employeePasswordInput.required = true; // La contraseña es requerida al crear
        employeeConfirmPasswordInput.required = true;
        showEmployeeFormView();
    });

    backToEmployeesListBtn.addEventListener('click', async () => {
        showEmployeeListView();
        await loadEmployees();
    });

    function attachEmployeeTableListeners() {
        document.querySelectorAll('#employees-table .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const employeeId = btn.dataset.id;
                employeePasswordInput.required = false; // Contraseña no requerida para editar (solo si se cambia)
                employeeConfirmPasswordInput.required = false;
                loadEmployeeForEdit(employeeId);
            });
        });

        document.querySelectorAll('#employees-table .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const employeeId = btn.dataset.id;
                deleteEmployee(employeeId);
            });
        });
    }


    // --- Manejo de Cerrar Sesión ---
    const logoutButton = document.getElementById('btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('adminUser');
            if (logoutContainer) {
                logoutContainer.style.display = 'none';
            }
            alert('Sesión cerrada. Redirigiendo a la página de login...');
            window.location.href = '/login.html';
        });
    }

    // Inicializar: mostrar el panel principal al cargar la página
    showSection('dashboard-section');
});
