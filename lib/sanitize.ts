import DOMPurify from 'dompurify'
import React from 'react'

// Configuración segura para DOMPurify
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'style'],
  ALLOW_DATA_ATTR: false,
}

/**
 * Sanitiza HTML de forma segura usando DOMPurify
 * Solo usar cuando sea absolutamente necesario renderizar HTML
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    // En el servidor, solo devolver texto plano
    return html.replace(/<[^>]*>/g, '')
  }
  
  return DOMPurify.sanitize(html, PURIFY_CONFIG)
}

/**
 * Componente React para renderizar HTML sanitizado
 * Solo usar cuando sea absolutamente necesario
 */
export const SafeHTML: React.FC<{ html: string; className?: string }> = ({ 
  html, 
  className = '' 
}) => {
  const sanitizedHTML = sanitizeHTML(html)
  
  return React.createElement('div', {
    className,
    dangerouslySetInnerHTML: { __html: sanitizedHTML }
  })
}

/**
 * Escapar caracteres HTML para prevenir XSS
 * Usar esto para mostrar texto que puede contener caracteres especiales
 */
export const escapeHTML = (text: string): string => {
  if (typeof window === 'undefined') {
    // En el servidor, escapar manualmente
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Validar que una URL es segura
 */
export const isSafeURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    // Solo permitir HTTP, HTTPS y mailto
    return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}
