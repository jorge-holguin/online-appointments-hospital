"use client"

import React, { useId } from "react"

interface AccessibleDescriptionProps {
  /**
   * El texto de la descripción
   */
  text: string
  
  /**
   * Si la descripción debe ser visible solo para lectores de pantalla
   * @default true
   */
  srOnly?: boolean
  
  /**
   * ID personalizado para el elemento
   */
  id?: string
  
  /**
   * Clases CSS adicionales
   */
  className?: string
}

/**
 * Componente para proporcionar descripciones accesibles a otros elementos
 * Útil para resolver warnings de accesibilidad como "Missing Description or aria-describedby"
 */
export function AccessibleDescription({
  text,
  srOnly = true,
  id,
  className = "",
}: AccessibleDescriptionProps) {
  // Generar un ID único si no se proporciona uno
  const generatedId = useId()
  const descriptionId = id || `desc-${generatedId}`
  
  return (
    <div 
      id={descriptionId}
      className={`${srOnly ? 'sr-only' : ''} ${className}`}
    >
      {text}
    </div>
  )
}

/**
 * Hook para generar un ID único para descripciones accesibles
 * @returns Un objeto con el ID y las props para el elemento descrito
 */
export function useAccessibleDescription(text: string, srOnly: boolean = true) {
  const id = useId()
  const descriptionId = `desc-${id}`
  
  const description = (
    <AccessibleDescription 
      id={descriptionId}
      text={text}
      srOnly={srOnly}
    />
  )
  
  const describedByProps = {
    'aria-describedby': descriptionId
  }
  
  return { id: descriptionId, description, describedByProps }
}
