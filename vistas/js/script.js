// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.main-nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const backListButtons = document.querySelectorAll('.back-list-btn');
    const logoutContainer = document.getElementById('logout-container');

    // --- FUNCIÓN PRINCIPAL DE VERIFICACIÓN AL CARGAR LA PÁGINA ---
    function checkAuthenticationOnInit() {
        const token = localStorage.getItem('auth_token'); 

        if (!token) {
            if (logoutContainer) {
                logoutContainer.style.display = 'none';
            }
           alert('No has iniciado sesión o tu sesión ha caducado. Por favor, inicia sesión.');
           window.location.href = 'src/views/login.html'; 
           return false; 
        }

        if (logoutContainer) {
            logoutContainer.style.display = 'block';
        }
        
        // Opcional pero recomendado: Llamar a una API para verificar el token si es necesario
        // Esto es útil para tokens de corta duración que pueden expirar sin que la página se recargue
        // Para simplicidad, no lo implementamos aquí, pero es un punto clave para un sistema real.
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
            // Si el token desaparece en medio de una acción, redirige
           //    alert('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
            window.location.href = 'login.html';
            return null; // O lanzar un error para que la lógica de la llamada lo capture
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Añadir el token a los encabezados
            ...options.headers // Permite añadir otros encabezados personalizados
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401 || response.status === 403) { // 401 Unauthorized, 403 Forbidden
                localStorage.removeItem('auth_token'); // Limpiar el token inválido
                if (logoutContainer) logoutContainer.style.display = 'none';
                alert('Tu sesión ha caducado o no estás autorizado. Por favor, inicia sesión de nuevo.');
                window.location.href = 'src/views/login.html';
                return null; 
            }

            if (!response.ok) { // Otros errores HTTP (ej: 400, 404, 500)
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la petición API');
            }

            return response.json(); // Devuelve los datos de la respuesta
        } catch (error) {
            console.error('Error de red o API:', error);
            // Mensaje genérico para el usuario, el error detallado va a consola
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
        document.querySelectorAll('.detail-form-container').forEach(detail => detail.style.display = 'none');
        document.querySelectorAll('div[id$="-list"]').forEach(list => list.style.display = 'block');
    }

    // Manejar clics en la barra de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', async (event) => { // ¡Importante: async para usar await!
            event.preventDefault(); 
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            const targetSectionId = link.id.replace('nav-', '') + '-section';
            showSection(targetSectionId);

            // Ejemplo: Al hacer clic en "Gestionar Productos", intenta cargar los datos
            if (targetSectionId === 'products-section') {
                await loadProducts(); // Llama a la función que cargará los productos de forma segura
            }
            // Agrega lógica similar para otras secciones que carguen datos
            if (targetSectionId === 'orders-section') {
                await loadOrders();
            }
        });
    });

    // Manejar los botones "Volver a [Lista]" (sin cambios significativos)
    backListButtons.forEach(button => {
        button.addEventListener('click', () => {
            const parentDetailSection = button.closest('.detail-form-container'); 
            if (parentDetailSection) {
                parentDetailSection.style.display = 'none';
            }
            const targetListId = button.dataset.targetList; 
            if (targetListId) {
                document.getElementById(targetListId).style.display = 'block';
            }
        });
    });

    // --- EJEMPLOS DE CÓMO USAR callApiSecured ---

    // Función para cargar productos (simulada)
    async function loadProducts() {
        const productListDiv = document.getElementById('product-list');
        productListDiv.innerHTML = '<h3>Lista de Productos</h3><p>Cargando productos...</p>'; // Mensaje de carga

        const products = await callApiSecured('/api/products'); // Usamos la nueva función segura
        if (products) {
            // Si la llamada fue exitosa y se obtuvieron datos
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            products.forEach(product => {
                tableHtml += `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>${product.stock}</td>
                        <td>
                            <button class="action-btn edit-btn" data-id="${product.id}">Editar</button>
                            <button class="action-btn delete-btn" data-id="${product.id}">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
            tableHtml += `</tbody></table>`;
            productListDiv.innerHTML = tableHtml;

            // Re-adjuntar eventos a los botones de editar/eliminar recién creados
            document.querySelectorAll('.data-table .edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.dataset.id;
                    showProductDetail(productId); // Cargar detalle del producto específico
                });
            });
        } else {
            // Si products es null, significa que hubo un error o redirección, ya manejado por callApiSecured
            productListDiv.innerHTML = '<h3>Lista de Productos</h3><p>No se pudieron cargar los productos.</p>';
        }
    }

    // Función para mostrar y cargar detalle de un producto
    async function showProductDetail(productId) {
        document.getElementById('product-list').style.display = 'none';
        document.getElementById('product-detail').style.display = 'block';

        if (productId) {
            const product = await callApiSecured(`/api/products/${productId}`);
            if (product) {
                document.getElementById('product-id').value = product.id;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-stock').value = product.stock;
                document.getElementById('product-description').value = product.description;
            } else {
                // Si la carga falla, podrías volver a la lista o mostrar un error
                alert('No se pudo cargar el detalle del producto.');
                document.getElementById('product-detail').style.display = 'none';
                document.getElementById('product-list').style.display = 'block';
            }
        } else {
            // Si no hay ID, es un nuevo producto, limpiar formulario
            document.getElementById('product-form').reset(); 
            document.getElementById('product-id').value = '';
        }
    }

    // Ejemplo de cómo manejar el envío de un formulario de forma segura
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = document.getElementById('product-id').value;
            const method = productId ? 'PUT' : 'POST'; // PUT para actualizar, POST para crear
            const url = productId ? `/api/products/${productId}` : '/api/products';
            
            const formData = new FormData(productForm); // Obtener datos del formulario
            const productData = Object.fromEntries(formData.entries());

            const result = await callApiSecured(url, {
                method: method,
                body: JSON.stringify(productData)
            });

            if (result) {
                alert('Producto guardado exitosamente!');
                document.getElementById('product-detail').style.display = 'none';
                document.getElementById('product-list').style.display = 'block';
                await loadProducts(); // Recargar la lista de productos
            } else {
                alert('No se pudo guardar el producto.');
            }
        });
    }

    // ... (otras funciones para loadOrders, loadClients, etc., usando callApiSecured) ...


    // Manejar el botón de cerrar sesión (sin cambios)
    const logoutButton = document.getElementById('btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('auth_token'); 
            if (logoutContainer) { 
                logoutContainer.style.display = 'none';
            }
            alert('Sesión cerrada. Redirigiendo a la página de login...');
            window.location.href = 'login.html'; 
        });
    }

    // Inicializar: mostrar el panel principal al cargar la página
    showSection('dashboard-section');
    // Si el dashboard también necesita datos iniciales protegidos, llámalos aquí:
    // await callApiSecured('/api/dashboard-summary'); 
});
// ... (código existente para checkAuthenticationOnInit, callApiSecured, showSection, etc.) ...

document.addEventListener('DOMContentLoaded', () => {
    // ... (Variables existentes: navLinks, contentSections, logoutContainer) ...

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

    // --- Funciones CRUD para Productos ---

    // Función para mostrar la vista de lista de productos
    function showProductListView() {
        productFormView.style.display = 'none';
        productListView.style.display = 'block';
        document.getElementById('products-table').style.display = 'table'; // Asegurar que la tabla esté visible
        productListMessage.textContent = 'Cargando productos...';
        productListMessage.style.display = 'block';
    }

    // Función para mostrar la vista del formulario de producto
    function showProductFormView() {
        productListView.style.display = 'none';
        productFormView.style.display = 'block';
        productFormMessage.textContent = ''; // Limpiar mensajes de error/éxito
    }

    // [C]REATE & [U]PDATE: Guardar o Actualizar Producto
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        productFormMessage.textContent = 'Guardando...';
        productFormMessage.className = 'info-text'; // Clase temporal para indicar guardado

        const productId = productIdInput.value;
        const method = productId ? 'PUT' : 'POST'; // PUT para actualizar, POST para crear
        const url = productId ? `/api/products/${productId}` : '/api/products';
        
        const productData = {
            name: productNameInput.value,
            price: parseFloat(productPriceInput.value),
            stock: parseInt(productStockInput.value),
            category_id: productCategorySelect.value, // Asumiendo que guardamos el ID de la categoría
            description: productDescriptionInput.value
        };

        const result = await callApiSecured(url, {
            method: method,
            body: JSON.stringify(productData)
        });

        if (result) {
            productFormMessage.textContent = 'Producto guardado exitosamente!';
            productFormMessage.className = 'success-text';
            setTimeout(async () => {
                showProductListView();
                await loadProducts(); // Recargar la lista de productos
            }, 1500); // Dar tiempo para leer el mensaje de éxito
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
        document.getElementById('products-table').style.display = 'none'; // Ocultar tabla mientras carga

        const products = await callApiSecured('/api/products');
        
        if (products && products.length > 0) {
            productListMessage.style.display = 'none'; // Ocultar mensaje de carga
            document.getElementById('products-table').style.display = 'table'; // Mostrar tabla

            products.forEach(product => {
                const row = productsTableBody.insertRow();
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>$${product.price ? product.price.toFixed(2) : 'N/A'}</td>
                    <td>${product.stock}</td>
                    <td>${product.category_name || 'Sin Categoría'}</td> <td>
                        <button class="action-btn edit-btn" data-id="${product.id}">Editar</button>
                        <button class="action-btn delete-btn" data-id="${product.id}">Eliminar</button>
                    </td>
                `;
            });
            // Re-adjuntar eventos a los botones de la tabla (después de que se crean)
            attachProductTableListeners();
        } else if (products) { // Si products existe pero está vacío
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
        productForm.reset(); // Limpiar el formulario
        productIdInput.disabled = true; // El ID no es editable
        
        const product = await callApiSecured(`/api/products/${productId}`);
        if (product) {
            productIdInput.value = product.id;
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productStockInput.value = product.stock;
            productDescriptionInput.value = product.description || '';
            // Asegurarse de que la categoría se seleccione correctamente
            productCategorySelect.value = product.category_id || ''; 
            showProductFormView();
        } else {
            alert('No se pudo cargar el detalle del producto.');
            showProductListView(); // Volver a la lista si falla
        }
    }

    // [D]ELETE: Eliminar un producto
    async function deleteProduct(productId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
            return;
        }

        const result = await callApiSecured(`/api/products/${productId}`, {
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
    async function loadCategoriesIntoSelect() {
        productCategorySelect.innerHTML = '<option value="">Cargando categorías...</option>';
        const categories = await callApiSecured('/api/categories'); // Asumiendo un endpoint /api/categories
        
        productCategorySelect.innerHTML = '<option value="">Selecciona una categoría</option>'; // Opción por defecto
        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                productCategorySelect.appendChild(option);
            });
        } else if (categories) {
            productCategorySelect.innerHTML = '<option value="">No hay categorías disponibles</option>';
        } else {
            productCategorySelect.innerHTML = '<option value="">Error al cargar categorías</option>';
        }
    }

    // --- Manejo de Eventos ---

    // Evento para el botón "Añadir Nuevo Producto"
    addProductBtn.addEventListener('click', () => {
        productFormTitle.textContent = 'Añadir Nuevo Producto';
        productForm.reset(); // Limpiar formulario para nuevo producto
        productIdInput.value = ''; // Asegurarse de que el ID esté vacío para un nuevo producto
        productIdInput.disabled = true; // El ID siempre es deshabilitado
        showProductFormView();
        loadCategoriesIntoSelect(); // Cargar categorías al añadir
    });

    // Evento para el botón "Volver a Productos" desde el formulario
    backToProductsListBtn.addEventListener('click', async () => {
        showProductListView();
        await loadProducts(); // Recargar la lista al volver
    });

    // Función para adjuntar listeners a los botones de la tabla (EDITAR/ELIMINAR)
    // Se llama cada vez que la tabla se re-renderiza
    function attachProductTableListeners() {
        document.querySelectorAll('.data-table .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                loadProductForEdit(productId);
                loadCategoriesIntoSelect(); // Cargar categorías al editar
            });
        });

        document.querySelectorAll('.data-table .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                deleteProduct(productId);
            });
        });
    }

    // --- Integración con la Navegación Principal ---
    // (Ajustar la lógica de navLinks.forEach si ya la tenías en una versión anterior)
    navLinks.forEach(link => {
        link.addEventListener('click', async (event) => { 
            event.preventDefault(); 
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            const targetSectionId = link.id.replace('nav-', '') + '-section';
            showSection(targetSectionId);

            // Cargar productos solo cuando se navega a la sección de productos
            if (targetSectionId === 'products-section') {
                await loadProducts();
            }
            // Puedes añadir lógica similar para otras secciones (pedidos, clientes, etc.)
            // if (targetSectionId === 'orders-section') { await loadOrders(); }
            // if (targetSectionId === 'clients-section') { await loadClients(); }
        });
    });

    // ... (El resto de tu código JS existente: checkAuthenticationOnInit, callApiSecured, etc.) ...
    
    // Inicializar: mostrar el panel principal al cargar la página
    showSection('dashboard-section'); // Muestra el dashboard por defecto

    // Si el dashboard también necesita datos iniciales protegidos, llámalos aquí:
    // await callApiSecured('/api/dashboard-summary'); 
});