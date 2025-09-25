/**
 * Script para bloquear el acceso a la consola del navegador (F12)
 * Este script se carga solo cuando NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false
 */
(function() {
  // Métodos para bloquear
  const blockedMethods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'assert', 'profile', 'profileEnd', 'time', 'timeLog', 'timeEnd', 'timeStamp'];
  
  // Guardar referencia original de console
  const originalConsole = window.console;
  
  // Crear un objeto console vacío
  const emptyConsole = {};
  
  // Reemplazar todos los métodos con funciones vacías
  blockedMethods.forEach(method => {
    emptyConsole[method] = function() {};
  });
  
  // Reemplazar el objeto console
  window.console = emptyConsole;
  
  // Bloquear teclas F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  document.addEventListener('keydown', function(event) {
    // F12
    if (event.keyCode === 123) {
      event.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74 || event.keyCode === 67)) {
      event.preventDefault();
      return false;
    }
  });
  
  // Bloquear clic derecho para evitar "Inspeccionar elemento"
  document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    return false;
  });
  
  // Detectar si DevTools está abierto
  const checkDevTools = function() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      // Si DevTools está abierto, podemos redirigir o mostrar un mensaje
      document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h1>Acceso no autorizado</h1><p>No está permitido utilizar las herramientas de desarrollador en este sitio.</p></div>';
    }
  };
  
  // Comprobar periódicamente
  setInterval(checkDevTools, 1000);
  
  // También podemos usar el evento de cambio de tamaño
  window.addEventListener('resize', checkDevTools);
  
  // Mensaje en caso de que alguien intente acceder a la consola
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      // Este mensaje solo aparecerá si alguien ha restaurado la consola
      try {
        originalConsole.log('%c¡Detente!', 'color:red;font-size:50px;font-weight:bold');
        originalConsole.log('%cEsta es una función del navegador destinada a desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función o "hackear" la cuenta de alguien, se trata de un fraude.', 'font-size:18px;');
      } catch (e) {}
    }, 2000);
  });
})();
