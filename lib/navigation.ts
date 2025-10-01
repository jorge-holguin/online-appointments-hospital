/**
 * Utilidades para la navegación en la aplicación
 */

/**
 * Redirige a la página principal de la aplicación
 * @param delay Tiempo de espera en ms antes de redirigir (opcional)
 */
export const goToHomePage = (delay: number = 0) => {
  // Si hay un delay, esperar antes de redirigir
  if (delay > 0) {
    setTimeout(() => {
      window.location.href = '/'
    }, delay)
  } else {
    // Redirige inmediatamente a la página principal
    window.location.href = '/'
  }
}

/**
 * Redirige a una URL específica
 * @param url URL a la que redirigir
 * @param delay Tiempo de espera en ms antes de redirigir (opcional)
 */
export const navigateTo = (url: string, delay: number = 0) => {
  // Si hay un delay, esperar antes de redirigir
  if (delay > 0) {
    setTimeout(() => {
      window.location.href = url
    }, delay)
  } else {
    // Redirige inmediatamente
    window.location.href = url
  }
}
