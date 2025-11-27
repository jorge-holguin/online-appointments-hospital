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
const USE_TEST_DATES = true

// Fechas de prueba centralizadas
const TEST_START_DATE = '2025-10-01'
const TEST_END_DATE = '2025-10-31'

// Función para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

// Función para obtener el último día del mes SIGUIENTE en formato YYYY-MM-DD
const getEndOfNextMonth = (): string => {
  const nextMonth = addMonths(new Date(), 1)
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
 * Calcula el rango efectivo de fechas para consultas API,
 * asegurando que estén dentro del rango del config y no antes de hoy
 */
export function getEffectiveDateRange(
  monthStart: Date,
  monthEnd: Date,
  configStartDate: string | undefined,
  configEndDate: string | undefined
): { startDate: string; endDate: string } | null {
  if (!configStartDate || !configEndDate) return null

  const configStart = parseISO(configStartDate)
  const configEnd = parseISO(configEndDate)

  // Si el rango de configuración es inválido, no devolvemos nada
  if (isBefore(configEnd, configStart)) {
    return null
  }

  let effectiveStart: Date

  if (USE_TEST_DATES) {
    // MODO TEST: respetar el rango del config y del mes consultado
    // No recortamos a "hoy" para poder probar rangos en el pasado.
    effectiveStart = monthStart
  } else {
    // MODO PROD: no mostrar citas antes de hoy
    const today = startOfDay(new Date())
    const baseStart = isBefore(monthStart, today) ? today : monthStart
    effectiveStart = baseStart
  }

  // Limitar siempre al rango del config
  const finalStart = isBefore(effectiveStart, configStart) ? configStart : effectiveStart
  const finalEnd = isBefore(configEnd, monthEnd) ? configEnd : monthEnd

  // Si por alguna razón el resultado queda invertido, no devolvemos rango
  if (isBefore(finalEnd, finalStart)) {
    return null
  }

  return {
    startDate: format(finalStart, 'yyyy-MM-dd'),
    endDate: format(finalEnd, 'yyyy-MM-dd')
  }
}
