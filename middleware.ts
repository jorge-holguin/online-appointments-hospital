import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de seguridad para la aplicación
 * 
 * Funciones:
 * 1. Elimina headers que revelan información del servidor
 * 2. Previene la divulgación de marcas de tiempo Unix
 * 3. Añade headers de seguridad adicionales
 */
export function middleware(request: NextRequest) {
  // Crear respuesta
  const response = NextResponse.next()

  // 1. Eliminar headers que revelan información del servidor
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  
  // 2. Prevenir divulgación de marcas de tiempo Unix
  // Eliminar headers que puedan contener timestamps
  response.headers.delete('Date')
  response.headers.delete('Last-Modified')
  response.headers.delete('ETag')
  
  // 3. Añadir header de fecha genérico (sin timestamp específico)
  // Solo incluir fecha sin hora exacta
  const now = new Date()
  const dateOnly = now.toISOString().split('T')[0]
  response.headers.set('X-Date', dateOnly)
  
  // 4. Headers de seguridad adicionales (por si acaso no se aplican en next.config.mjs)
  if (!response.headers.has('X-Frame-Options')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  }
  
  if (!response.headers.has('Content-Security-Policy')) {
    response.headers.set('Content-Security-Policy', 
      "frame-src 'self' https://www.youtube.com https://youtube.com; " +
      "media-src 'self' https://www.youtube.com https://youtube.com; " +
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self'"
    )
  }
  
  if (!response.headers.has('X-Content-Type-Options')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }
  
  if (!response.headers.has('X-XSS-Protection')) {
    response.headers.set('X-XSS-Protection', '1; mode=block')
  }
  
  // NOTA: No agregar headers personalizados que revelen información
  // como X-Application, X-Powered-By, etc. por seguridad
  
  return response
}

/**
 * Configuración del middleware
 * Aplicar a todas las rutas excepto:
 * - Archivos estáticos (_next/static)
 * - Imágenes (_next/image)
 * - Favicon
 * - Archivos públicos con extensiones específicas
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
