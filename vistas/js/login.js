// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Función para simular una verificación de autenticación (ej: si ya hay un token)
    function checkAuthStatus() {
        // En un entorno real, aquí verificarías si existe un token JWT en localStorage o sessionStorage
        const isAuthenticated = localStorage.getItem('auth_token'); 
        if (isAuthenticated) {
            // Si el usuario ya está autenticado, redirigir al panel de administración
          //  window.location.href = 'admin-dashboard.html'; // O la ruta /admin
        }
    }

    // Ejecutar la verificación al cargar la página de login
    checkAuthStatus();

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar que el formulario se envíe de la forma tradicional

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Aquí harías una llamada a tu API de backend para autenticar
        // Ejemplo simplificado (sin fetch real, solo para demostrar la lógica)
        if (username === 'admin' && password === 'admin') {
            // Simular un inicio de sesión exitoso
            // En un caso real, el backend enviaría un token JWT
            const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            localStorage.setItem('auth_token', fakeToken); // Guardar el token

            errorMessage.textContent = ''; // Limpiar cualquier mensaje de error
            //alert('¡Inicio de sesión exitoso! Redirigiendo al panel...');
            window.location.href = '../../inde.html'; // Redirigir al panel de administración
        } else {
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
        }
    });
});