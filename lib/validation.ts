import { z } from 'zod'

// Función para sanitizar inputs eliminando caracteres peligrosos y espacios extra
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Eliminar < y >
    .trim() // Eliminar espacios al inicio y final
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
}

// Función para sanitizar nombres permitiendo espacios naturales
export const sanitizeName = (input: string): string => {
  // Solo eliminar caracteres realmente peligrosos, preservar espacios naturales
  return input
    .replace(/[<>"'&]/g, '') // Eliminar solo caracteres peligrosos para XSS
    // NO eliminar espacios ni hacer trim para permitir escritura natural
}

// Función para normalizar teléfono (solo números)
export const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '') // Eliminar todo lo que no sea dígito
}

// Función para normalizar email (minúsculas)
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

// Esquemas de validación con Zod
export const patientValidationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .transform((val) => val.trim().replace(/\s+/g, ' ')), // Solo limpiar al final para la validación
  
  phone: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^\d+$/, 'El teléfono solo puede contener números')
    .transform(normalizePhone),
  
  documento: z
    .string()
    .min(8, 'El documento debe tener al menos 8 caracteres')
    .max(15, 'El documento no puede exceder 15 caracteres')
    .regex(/^\d+$/, 'El documento solo puede contener números'),
  
  email: z
    .string()
    .email('Ingresa un email válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .transform(normalizeEmail),
  
  tipoDocumento: z
    .string()
    .min(1, 'Selecciona un tipo de documento')
    // No transformar para preservar espacios
    .transform(val => val),
  
  digitoVerificador: z
    .string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val)
})

export type PatientFormData = z.infer<typeof patientValidationSchema>

// Función para validar y sanitizar datos del formulario
export const validatePatientData = (data: any) => {
  try {
    return {
      success: true,
      data: patientValidationSchema.parse(data),
      errors: null
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message
          return acc
        }, {} as Record<string, string>)
      }
    }
    return {
      success: false,
      data: null,
      errors: { general: 'Error de validación inesperado' }
    }
  }
}

// Mensajes de error seguros para mostrar al usuario
export const getSecureErrorMessage = (error: any): string => {
  // No exponer detalles técnicos, solo mensajes genéricos y seguros
  if (typeof error === 'string') {
    return 'Ocurrió un error. Por favor, inténtalo de nuevo.'
  }
  
  if (error?.message) {
    // Solo mostrar mensajes de validación conocidos
    const safeMessages = [
      'El nombre debe tener al menos 2 caracteres',
      'El teléfono debe tener al menos 9 dígitos',
      'El DNI debe tener exactamente 8 dígitos',
      'Ingresa un email válido',
      'Selecciona un tipo de documento'
    ]
    
    if (safeMessages.some(msg => error.message.includes(msg))) {
      return error.message
    }
  }
  
  return 'Error al procesar la información. Por favor, verifica los datos e inténtalo de nuevo.'
}
