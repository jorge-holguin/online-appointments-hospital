import pino from 'pino'

// Configuración de Pino para el cliente (browser)
const isClient = typeof window !== 'undefined'

// Logger para el navegador (simplificado)
const browserLogger = {
  info: (obj: any, msg?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', msg || '', obj)
    }
  },
  error: (obj: any, msg?: string) => {
    console.error('[ERROR]', msg || '', obj)
  },
  warn: (obj: any, msg?: string) => {
    console.warn('[WARN]', msg || '', obj)
  },
  debug: (obj: any, msg?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', msg || '', obj)
    }
  },
  child: () => browserLogger,
}

// Logger para el servidor (Node.js)
const serverLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

// Exportar el logger apropiado según el entorno
export const logger = isClient ? browserLogger : serverLogger

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
