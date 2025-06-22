document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form')
  const errorMessage = document.getElementById('error-message')

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault() // Evitar que el formulario se envíe de la forma tradicional

      const contra= document.getElementById('password').value
      const correo = document.getElementById('username').value

      errorMessage.textContent = '' // para limr el mensaje de erro

      try {
        const response = await fetch('/api/aut/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ contra, correo })
        })
        const data = await response.json()

        if (response.ok) {
          // Simular un inicio de sesión exitoso
          // En un caso real, el backend enviaría un token JWT
          localStorage.setItem('auth_token', data.token) // Guardar el token
          localStorage.setItem('adminUser', JSON.stringify(data.user))

          window.location.href = '../../paneladmin.html' // Redirigir al panel de administración
        } else {
          errorMessage.textContent = data.message || 'Usuario o contraseña incorrectos.'
        }
      } catch (error) {
        console.error('Error de red o del servidor:', error)
        errorMessage.textContent = 'No se pudo conectar con el servidor. Intente de nuevo más tarde.'
      }
    })
  }
})
