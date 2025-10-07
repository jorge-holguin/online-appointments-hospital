"use client"

import { useSession, useSessionTimer } from '@/context/session-context'
import { Clock, AlertTriangle } from 'lucide-react'

export default function SessionTimer() {
  const { isSessionActive } = useSession()
  const { timeRemaining } = useSessionTimer()

  if (!isSessionActive) {
    return null
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  // Determinar el color basado en el tiempo restante
  const getColorClass = () => {
    if (timeRemaining > 180) return 'bg-green-50 border-green-200 text-green-700' // > 3 min
    if (timeRemaining > 60) return 'bg-yellow-50 border-yellow-200 text-yellow-700' // > 1 min
    return 'bg-red-50 border-red-200 text-red-700' // <= 1 min
  }

  const getIconColorClass = () => {
    if (timeRemaining > 180) return 'text-green-600'
    if (timeRemaining > 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const isLowTime = timeRemaining <= 60

  return (
    <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${getColorClass()} transition-colors duration-300`}>
      {isLowTime ? (
        <AlertTriangle className={`w-4 h-4 ${getIconColorClass()} animate-pulse`} />
      ) : (
        <Clock className={`w-4 h-4 ${getIconColorClass()}`} />
      )}
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold">
          Tiempo restante:
        </span>
        <span className={`text-sm font-bold ${isLowTime ? 'animate-pulse' : ''}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
