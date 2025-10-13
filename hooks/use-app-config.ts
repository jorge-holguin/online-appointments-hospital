import { useState, useEffect } from 'react'
import { format, endOfMonth } from 'date-fns'

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

// Función para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

// Función para obtener el último día del mes actual en formato YYYY-MM-DD
const getEndOfCurrentMonth = (): string => {
  return format(endOfMonth(new Date()), 'yyyy-MM-dd')
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
      // startDate siempre es dinámico (fecha actual)
      startDate: getTodayDate(),
      // endDate usa el valor del config, o si falla/no existe, usa el último día del mes actual
      endDate: config.dateRange?.endDate || getEndOfCurrentMonth()
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
            startDate: getTodayDate(),
            endDate: getEndOfCurrentMonth()
          }
        })
        setError(err as Error)
        setLoading(false)
      })
  }, [])

  return { config, loading, error }
}
