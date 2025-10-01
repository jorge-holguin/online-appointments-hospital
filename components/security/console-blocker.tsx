"use client"

import { useEffect } from 'react'

/**
 * Componente que bloquea el acceso a la consola del navegador
 * Se carga solo cuando NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false
 */
export default function ConsoleBlocker() {
  useEffect(() => {
    // Solo aplicar si la variable de entorno está configurada para bloquear
    if (process.env.NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS === 'true') {
      return
    }

    // Métodos para bloquear
    const blockedMethods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'assert', 'profile', 'profileEnd', 'time', 'timeLog', 'timeEnd', 'timeStamp']
    
    // Guardar referencia original de console
    const originalConsole = { ...console }
    
    // Reemplazar todos los métodos con funciones vacías
    blockedMethods.forEach(method => {
      // @ts-ignore - Ignorar error de tipo
      console[method] = function() {}
    })
    
    // Bloquear teclas F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    const handleKeyDown = (event: KeyboardEvent) => {
      // F12
      if (event.key === 'F12') {
        event.preventDefault()
        return false
      }
      
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) {
        event.preventDefault()
        return false
      }
    }
    
    // Bloquear clic derecho para evitar "Inspeccionar elemento"
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      return false
    }
    
    // Detectar si DevTools está abierto
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160
      
      if (widthThreshold || heightThreshold) {
        // Si DevTools está abierto, podemos redirigir o mostrar un mensaje
        document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h1>Acceso no autorizado</h1><p>No está permitido utilizar las herramientas de desarrollador en este sitio.</p></div>'
      }
    }
    
    // Agregar event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('resize', checkDevTools)
    
    // Comprobar periódicamente
    const interval = setInterval(checkDevTools, 1000)
    
    // Mensaje en caso de que alguien intente acceder a la consola
    setTimeout(() => {
      try {
        // @ts-ignore - Ignorar error de tipo
        originalConsole.log('%c¡Detente!', 'color:red;font-size:50px;font-weight:bold')
        // @ts-ignore - Ignorar error de tipo
        originalConsole.log('%cEsta es una función del navegador destinada a desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función o "hackear" la cuenta de alguien, se trata de un fraude.', 'font-size:18px;')
      } catch (e) {}
    }, 2000)
    
    // Limpiar event listeners al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('resize', checkDevTools)
      clearInterval(interval)
      
      // Restaurar console original
      blockedMethods.forEach(method => {
        // @ts-ignore - Ignorar error de tipo
        console[method] = originalConsole[method]
      })
    }
  }, [])
  
  // Este componente no renderiza nada
  return null
}
