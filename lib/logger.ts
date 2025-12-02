// Logger simplificado sin dependencias de workers
// Evita problemas con pino-pretty en Next.js SSR

const isClient = typeof globalThis.window !== 'undefined'

// Logger silencioso (no-op) para cliente y servidor
const silentLogger = {
  info: (_obj: any, _msg?: string) => {
    // No-op para evitar uso de console.*
  },
  error: (_obj: any, _msg?: string) => {
    // No-op para evitar uso de console.*
  },
  warn: (_obj: any, _msg?: string) => {
    // No-op para evitar uso de console.*
  },
  debug: (_obj: any, _msg?: string) => {
    // No-op para evitar uso de console.*
  },
  child: () => silentLogger,
}

// Exportar el logger silencioso
export const logger = silentLogger

// Helper para logging de reservas exitosas
export const logSuccessfulBooking = (data: {
  patientId?: string
  patientName?: string
  specialty?: string
  doctor?: string
  appointmentId?: string
  date?: string
  time?: string
}) => {
  logger.info({
    event: 'BOOKING_SUCCESS',
    timestamp: new Date().toISOString(),
    ...data
  }, 'Reserva exitosa')
}

// Helper para logging de errores en reservas
export const logBookingError = (error: Error | unknown, context: {
  step?: string
  patientId?: string
  specialty?: string
  doctor?: string
  additionalInfo?: any
}) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  logger.error({
    event: 'BOOKING_ERROR',
    timestamp: new Date().toISOString(),
    error: errorMessage,
    stack: errorStack,
    ...context
  }, `Error en reserva: ${errorMessage}`)
}

// Helper para logging de errores de API
export const logApiError = (endpoint: string, error: Error | unknown, requestData?: any) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  logger.error({
    event: 'API_ERROR',
    timestamp: new Date().toISOString(),
    endpoint,
    error: errorMessage,
    stack: errorStack,
    requestData
  }, `Error en API: ${endpoint}`)
}

// Helper para logging de eventos importantes
export const logEvent = (eventName: string, data?: any) => {
  logger.info({
    event: eventName,
    timestamp: new Date().toISOString(),
    ...data
  }, `Evento: ${eventName}`)
}

// Helper para logging de warnings
export const logWarning = (message: string, data?: any) => {
  logger.warn({
    event: 'WARNING',
    timestamp: new Date().toISOString(),
    message,
    ...data
  }, message)
}
