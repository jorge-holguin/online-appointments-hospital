// Script para hacer que los eventos de touch sean pasivos por defecto
// Esto soluciona el warning: [Violation] Added non-passive event listener to a scroll-blocking 'touchstart' event
(function() {
  // Opción para hacer que todos los eventos touch sean pasivos por defecto
  // Esto mejora el rendimiento en dispositivos móviles
  const supportsPassive = (() => {
    let result = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          result = true;
          return true;
        }
      });
      window.addEventListener('testPassive', null, opts);
      window.removeEventListener('testPassive', null, opts);
    } catch (e) {}
    return result;
  })();

  if (supportsPassive) {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      // Si es un evento touch y no se especificó passive, hacerlo pasivo por defecto
      if (type === 'touchstart' || type === 'touchmove') {
        if (typeof options === 'object') {
          if (options.passive === undefined) {
            options.passive = true;
          }
        } else if (options === undefined || options === false) {
          options = { passive: true };
        }
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
})();
