"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'

interface SessionContextType {
  token: string | null
  isSessionActive: boolean
  startSession: (token: string) => void
  endSession: () => void
  refreshSession: () => Promise<void>
  onSessionExpired?: () => void
  setOnSessionExpired: (callback: () => void) => void
}

interface SessionTimerContextType {
  timeRemaining: number
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)
const SessionTimerContext = createContext<SessionTimerContextType | undefined>(undefined)

const SESSION_DURATION = 5 * 60 // 5 minutos en segundos

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartTimeRef = useRef<number | null>(null)
  const onSessionExpiredRef = useRef<(() => void) | undefined>(undefined)

  const endSession = useCallback(() => {
    setToken(null)
    setTimeRemaining(0)
    setIsSessionActive(false)
    sessionStartTimeRef.current = null
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Llamar al callback de expiración si existe
    if (onSessionExpiredRef.current) {
      onSessionExpiredRef.current()
    }
  }, [])

  const startSession = useCallback((newToken: string) => {
    // Limpiar sesión anterior si existe
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setToken(newToken)
    setTimeRemaining(SESSION_DURATION)
    setIsSessionActive(true)
    sessionStartTimeRef.current = Date.now()

    // Iniciar contador regresivo
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [endSession])

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/sesion`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error al renovar sesión: ${response.status}`)
      }

      const data = await response.json()
      startSession(data.token)
    } catch (error) {
      console.error('Error al renovar sesión:', error)
      throw error
    }
  }, [startSession])

  // Función para establecer el callback de expiración
  const setOnSessionExpired = useCallback((callback: () => void) => {
    onSessionExpiredRef.current = callback
  }, [])

  // Limpiar el timer cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Memoizar el valor del contexto de sesión para evitar re-renders
  const sessionValue = useMemo(() => ({
    token,
    isSessionActive,
    startSession,
    endSession,
    refreshSession,
    onSessionExpired: onSessionExpiredRef.current,
    setOnSessionExpired,
  }), [token, isSessionActive, startSession, endSession, refreshSession, setOnSessionExpired])

  // Valor del timer separado
  const timerValue = useMemo(() => ({
    timeRemaining,
  }), [timeRemaining])

  return (
    <SessionContext.Provider value={sessionValue}>
      <SessionTimerContext.Provider value={timerValue}>
        {children}
      </SessionTimerContext.Provider>
    </SessionContext.Provider>
  )
}

// Hook para obtener el token y funciones de sesión (NO causa re-render con el timer)
export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession debe ser usado dentro de un SessionProvider')
  }
  return context
}

// Hook para obtener el tiempo restante (SOLO para el componente SessionTimer)
export function useSessionTimer() {
  const context = useContext(SessionTimerContext)
  if (context === undefined) {
    throw new Error('useSessionTimer debe ser usado dentro de un SessionProvider')
  }
  return context
}
