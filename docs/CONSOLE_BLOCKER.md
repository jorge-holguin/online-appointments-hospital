# Bloqueador de Consola del Navegador

## Descripción

Este documento describe la implementación del bloqueador de consola del navegador, que permite controlar si los usuarios pueden acceder a las herramientas de desarrollador (F12) en el sitio web.

## Configuración

El acceso a la consola se controla mediante la variable de entorno `NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS`:

```env
# Control de acceso a la consola del navegador (F12)
# true = permitir acceso a la consola, false = bloquear acceso a la consola
NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false
```

## Implementación

La implementación consta de dos partes:

1. **Script estático**: `/public/js/console-blocker.js`
   - Se carga en el `<head>` del documento cuando `ALLOW_CONSOLE_ACCESS=false`
   - Proporciona una primera capa de protección que se ejecuta antes de que React se inicialice

2. **Componente React**: `components/security/console-blocker.tsx`
   - Se monta en el layout principal cuando `ALLOW_CONSOLE_ACCESS=false`
   - Proporciona una segunda capa de protección más robusta

## Características de Seguridad

El bloqueador de consola implementa las siguientes medidas:

1. **Bloqueo de métodos de consola**:
   - Reemplaza todos los métodos de `console` (`log`, `error`, etc.) con funciones vacías
   - Evita que los usuarios puedan ver mensajes de depuración o ejecutar comandos

2. **Bloqueo de atajos de teclado**:
   - F12 (abrir DevTools)
   - Ctrl+Shift+I (abrir DevTools)
   - Ctrl+Shift+J (abrir consola JavaScript)
   - Ctrl+Shift+C (abrir inspector de elementos)

3. **Bloqueo de menú contextual**:
   - Deshabilita el clic derecho para evitar "Inspeccionar elemento"

4. **Detección de DevTools abierto**:
   - Monitorea cambios en el tamaño de la ventana que podrían indicar que DevTools está abierto
   - Muestra un mensaje de advertencia si se detecta que DevTools está abierto

## Limitaciones

Es importante entender que estas medidas no son infalibles:

1. Un usuario con conocimientos técnicos avanzados podría encontrar formas de eludir estas protecciones
2. Diferentes navegadores pueden tener diferentes comportamientos
3. No es posible bloquear completamente el acceso a las herramientas de desarrollador en todos los casos

## Uso Recomendado

Esta característica está diseñada principalmente para:

1. Dificultar el acceso casual a la consola del navegador
2. Evitar que usuarios no técnicos puedan ver mensajes de depuración
3. Proporcionar una capa adicional de seguridad contra scripts maliciosos

## Cómo Activar/Desactivar

Para cambiar la configuración:

1. Editar el archivo `.env`
2. Cambiar el valor de `NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS` a `true` o `false`
3. Reiniciar la aplicación

## Consideraciones de Desarrollo

Durante el desarrollo, se recomienda establecer `NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=true` para facilitar la depuración. En producción, puede establecerse en `false` para mayor seguridad.
