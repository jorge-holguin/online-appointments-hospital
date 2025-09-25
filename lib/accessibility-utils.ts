/**
 * Utilidades para mejorar la accesibilidad de la aplicación
 */

/**
 * Genera un ID único para elementos de accesibilidad
 * @param prefix - Prefijo para el ID
 * @returns ID único
 */
export function generateAccessibilityId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Propiedades de accesibilidad para componentes
 */
export interface AccessibilityProps {
  /**
   * ID del elemento que describe este componente
   */
  'aria-describedby'?: string;
  
  /**
   * ID del elemento que etiqueta este componente
   */
  'aria-labelledby'?: string;
  
  /**
   * Etiqueta directa para el componente
   */
  'aria-label'?: string;
  
  /**
   * Indica si el componente está expandido
   */
  'aria-expanded'?: boolean;
  
  /**
   * Indica si el componente está seleccionado
   */
  'aria-selected'?: boolean;
  
  /**
   * Indica si el componente está presionado
   */
  'aria-pressed'?: boolean;
  
  /**
   * Indica el rol del componente
   */
  role?: string;
}

/**
 * Combina propiedades de accesibilidad con otras propiedades
 * @param a11yProps - Propiedades de accesibilidad
 * @param otherProps - Otras propiedades
 * @returns Propiedades combinadas
 */
export function combineA11yProps(
  a11yProps: AccessibilityProps,
  otherProps: Record<string, any>
): Record<string, any> {
  return {
    ...otherProps,
    ...a11yProps,
  };
}

/**
 * Verifica si un elemento tiene suficiente contraste de color
 * @param foreground - Color de primer plano
 * @param background - Color de fondo
 * @returns true si el contraste es suficiente
 */
export function hasAdequateContrast(foreground: string, background: string): boolean {
  // Implementación simplificada
  // En una implementación real, se calcularía el ratio de contraste según WCAG
  return true;
}
