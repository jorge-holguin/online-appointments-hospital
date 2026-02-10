import { useState, useEffect } from 'react'
import { format, endOfMonth, startOfDay, parseISO, isBefore, addMonths } from 'date-fns'

interface AppConfig {
  dateRange: {
    startDate?: string // Opcional, se calculará dinámicamente si no existe
    endDate: string
  }
}

interface ProcessedConfig {
  dateRange: {
    startDate: string
    endDate: string
  }
}

// ------------------------------------------------------
// CENTRO ÚNICO DE CONFIGURACIÓN DE FECHAS
// ------------------------------------------------------

// Cambia esta bandera a false cuando quieras volver a fechas 100% dinámicas
const USE_TEST_DATES = false

// ------------------------------------------------------
// MODO NAVIDEÑO
// ------------------------------------------------------
// Cambia esta bandera a true para activar el tema navideño
// (fondo verde, nieve, lobo navideño)
// Cambia a false para volver al tema normal
export const CHRISTMAS_MODE = false 

// Fechas de prueba centralizadas
const TEST_START_DATE = '2025-10-01'
const TEST_END_DATE = '2025-10-31'

// Bloqueo visual de fechas pasadas en el frontend
// true = bloquea visualmente fechas anteriores a hoy
// false = permite seleccionar cualquier fecha del rango
export const BLOCK_PAST_DATES = true

// Función para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

// Función para obtener el primer día del mes actual
export const getFirstDayOfCurrentMonth = (referenceDate?: Date): string => {
  const date = referenceDate || new Date()
  return format(startOfDay(date), 'yyyy-MM-01')
}

// Función para obtener el último día del mes SIGUIENTE en formato YYYY-MM-DD
const getEndOfNextMonth = (referenceDate?: Date): string => {
  const date = referenceDate || new Date()
  const nextMonth = addMonths(date, 1)
  return format(endOfMonth(nextMonth), 'yyyy-MM-dd')
}

// Helper centralizado para obtener el startDate por defecto
const getDefaultStartDate = (): string => {
  return USE_TEST_DATES ? TEST_START_DATE : getTodayDate()
}

// Helper centralizado para obtener el endDate por defecto
const getDefaultEndDate = (configEndDate?: string): string => {
  if (USE_TEST_DATES) return TEST_END_DATE
  // Si hay valor en config, úsalo; si no, último día del mes SIGUIENTE
  return configEndDate || getEndOfNextMonth()
}

// Cache global para evitar múltiples llamadas
let cachedConfig: AppConfig | null = null
let configPromise: Promise<AppConfig> | null = null

// Función para cargar la configuración una sola vez
const loadConfig = async (): Promise<AppConfig> => {
  if (cachedConfig) {
    return cachedConfig
  }

  if (configPromise) {
    return configPromise
  }

  configPromise = fetch('/app-config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      cachedConfig = data
      configPromise = null
      return data
    })
    .catch(err => {
      configPromise = null
      throw err
    })

  return configPromise
}

// Función para procesar la configuración y agregar valores dinámicos
const processConfig = (config: AppConfig | null): ProcessedConfig | null => {
  if (!config) return null

  return {
    dateRange: {
      // startDate: siempre viene del helper centralizado
      startDate: getDefaultStartDate(),
      // endDate: usa helper centralizado combinando config + lógica por defecto
      endDate: getDefaultEndDate(config.dateRange?.endDate)
    }
  }
}

export function useAppConfig() {
  const [config, setConfig] = useState<ProcessedConfig | null>(processConfig(cachedConfig))
  const [loading, setLoading] = useState(!cachedConfig)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (cachedConfig) {
      setConfig(processConfig(cachedConfig))
      setLoading(false)
      return
    }

    loadConfig()
      .then(data => {
        setConfig(processConfig(data))
        setLoading(false)
      })
      .catch(err => {
        // Si falla la carga del config, usar valores dinámicos por defecto
        setConfig({
          dateRange: {
            startDate: getDefaultStartDate(),
            endDate: getDefaultEndDate()
          }
        })
        setError(err as Error)
        setLoading(false)
      })
  }, [])

  return { config, loading, error }
}

// ------------------------------------------------------
// HELPER PARA CALCULAR RANGO EFECTIVO DE FECHAS
// ------------------------------------------------------
/**
 * Calcula el rango efectivo de fechas para consultas de FECHAS/CONSULTORIOS.
 * LÓGICA: Retorna desde el primer día del mes consultado hasta el ÚLTIMO DÍA DEL MES ACTUAL.
 * Esto evita cargas masivas de datos.
 * 
 * @param monthStart - Primer día del mes que se está consultando
 * @param monthEnd - Último día del mes que se está consultando
 * @param configStartDate - Fecha de inicio de configuración (opcional)
 * @param configEndDate - Fecha de fin de configuración (opcional)
 */
export function getEffectiveDateRangeForDates(
  monthStart: Date,
  monthEnd: Date,
  configStartDate: string | undefined,
  configEndDate: string | undefined
): { startDate: string; endDate: string } | null {
  if (!configStartDate || !configEndDate) return null

  if (USE_TEST_DATES) {
    // MODO TEST: usar fechas de configuración
    const configStart = parseISO(configStartDate)
    const configEnd = parseISO(configEndDate)
    
    return {
      startDate: format(configStart, 'yyyy-MM-dd'),
      endDate: format(configEnd, 'yyyy-MM-dd')
    }
  }
  
  // MODO PROD: Solo el mes consultado (NO incluye mes siguiente)
  const firstDayOfConsultedMonth = startOfDay(new Date(monthStart.getFullYear(), monthStart.getMonth(), 1))
  const lastDayOfConsultedMonth = endOfMonth(monthStart)
  
  return {
    startDate: format(firstDayOfConsultedMonth, 'yyyy-MM-dd'),
    endDate: format(lastDayOfConsultedMonth, 'yyyy-MM-dd')
  }
}

/**
 * Calcula el rango efectivo de fechas para consultas de MÉDICOS.
 * LÓGICA: Retorna desde el primer día del mes consultado hasta el ÚLTIMO DÍA DEL MES SIGUIENTE.
 * Esto permite listar todos los médicos disponibles en un rango más amplio.
 * 
 * @param monthStart - Primer día del mes que se está consultando
 * @param monthEnd - Último día del mes que se está consultando
 * @param configStartDate - Fecha de inicio de configuración (opcional)
 * @param configEndDate - Fecha de fin de configuración (opcional)
 */
export function getEffectiveDateRangeForDoctors(
  monthStart: Date,
  monthEnd: Date,
  configStartDate: string | undefined,
  configEndDate: string | undefined
): { startDate: string; endDate: string } | null {
  if (!configStartDate || !configEndDate) return null

  if (USE_TEST_DATES) {
    // MODO TEST: usar fechas de configuración
    const configStart = parseISO(configStartDate)
    const configEnd = parseISO(configEndDate)
    
    return {
      startDate: format(configStart, 'yyyy-MM-dd'),
      endDate: format(configEnd, 'yyyy-MM-dd')
    }
  }
  
  // MODO PROD: Mes consultado + mes siguiente
  const firstDayOfConsultedMonth = startOfDay(new Date(monthStart.getFullYear(), monthStart.getMonth(), 1))
  const lastDayOfNextMonth = endOfMonth(addMonths(monthStart, 1))
  
  return {
    startDate: format(firstDayOfConsultedMonth, 'yyyy-MM-dd'),
    endDate: format(lastDayOfNextMonth, 'yyyy-MM-dd')
  }
}

/**
 * @deprecated Usa getEffectiveDateRangeForDates o getEffectiveDateRangeForDoctors según el caso
 */
export function getEffectiveDateRange(
  monthStart: Date,
  monthEnd: Date,
  configStartDate: string | undefined,
  configEndDate: string | undefined
): { startDate: string; endDate: string } | null {
  // Por defecto, usar el rango para médicos (comportamiento anterior)
  return getEffectiveDateRangeForDoctors(monthStart, monthEnd, configStartDate, configEndDate)
}

/**
 * Verifica si una fecha debe estar visualmente bloqueada en el calendario
 */
export function isDateBlocked(date: Date): boolean {
  if (!BLOCK_PAST_DATES) return false
  if (USE_TEST_DATES) return false // En modo test no bloquear fechas
  
  const today = startOfDay(new Date())
  return isBefore(startOfDay(date), today)
}
