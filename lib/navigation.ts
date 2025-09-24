/**
 * Utilidades para la navegación en la aplicación
 */

/**
 * Redirige a la página principal de la aplicación
 */
export const goToHomePage = () => {
  // Redirige a la página principal
  window.location.href = '/'
}

/**
 * Redirige a una URL específica
 */
export const navigateTo = (url: string) => {
  window.location.href = url
}
