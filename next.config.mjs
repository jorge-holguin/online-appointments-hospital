/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    // Detectar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production'
    
    return [
      {
        // Aplicar headers de seguridad a todas las rutas
        source: '/:path*',
        headers: [
          // 1. Content Security Policy (CSP) - Protección contra XSS
          {
            key: 'Content-Security-Policy',
            value: isProduction 
              ? [
                  // CSP PARA PRODUCCIÓN (Next.js requiere unsafe-inline para funcionar)
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://citas.hospitalchosica.gob.pe",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://citas.hospitalchosica.gob.pe",
                  "font-src 'self' https://fonts.gstatic.com data:",
                  "img-src 'self' data: blob: https://citas.hospitalchosica.gob.pe https://*.hospitalchosica.gob.pe https://www.google.com https://www.gstatic.com",
                  "connect-src 'self' http://192.168.0.252:9012 http://192.168.0.252:9011 https://citas.hospitalchosica.gob.pe https://*.hospitalchosica.gob.pe",
                  "frame-src 'self' https://www.google.com",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'"
                  // NOTA: upgrade-insecure-requests comentado para permitir HTTP local
                  // Descomentar solo para producción real con HTTPS
                  // "upgrade-insecure-requests"
                ].join('; ')
              : [
                  // CSP RELAJADO PARA DESARROLLO (con unsafe-inline y unsafe-eval)
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://citas.hospitalchosica.gob.pe",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://citas.hospitalchosica.gob.pe",
                  "font-src 'self' https://fonts.gstatic.com data:",
                  "img-src 'self' data: blob: https://citas.hospitalchosica.gob.pe https://*.hospitalchosica.gob.pe https://www.google.com https://www.gstatic.com",
                  "connect-src 'self' http://192.168.0.252:9012 http://192.168.0.252:9011 https://citas.hospitalchosica.gob.pe https://*.hospitalchosica.gob.pe",
                  "frame-src 'self' https://www.google.com",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'"
                ].join('; ')
          },
          // 2. X-Frame-Options - Protección contra Clickjacking
          // DENY: No permite que el sitio sea mostrado en ningún iframe
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // 3. X-Content-Type-Options - Prevenir MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // 4. Referrer-Policy - Control de información de referencia
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // 5. Permissions-Policy - Control de características del navegador
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // 6. X-XSS-Protection - Protección XSS adicional (legacy)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // 7. Strict-Transport-Security - Forzar HTTPS en producción
          ...(isProduction ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
          // 8. X-DNS-Prefetch-Control - Control de prefetch DNS
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
          // NOTA: X-Powered-By se elimina completamente con poweredByHeader: false
          // No se debe agregar un X-Powered-By personalizado por seguridad
        ],
      },
    ]
  },
  // Ocultar el header X-Powered-By de Next.js
  poweredByHeader: false,
}

export default nextConfig
