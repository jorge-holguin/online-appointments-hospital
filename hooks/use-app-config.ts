import { useState, useEffect } from 'react'

interface AppConfig {
  dateRange: {
    startDate: string
    endDate: string
  }
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

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(cachedConfig)
  const [loading, setLoading] = useState(!cachedConfig)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig)
      setLoading(false)
      return
    }

    loadConfig()
      .then(data => {
        setConfig(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err as Error)
        setLoading(false)
      })
  }, [])

  return { config, loading, error }
}
