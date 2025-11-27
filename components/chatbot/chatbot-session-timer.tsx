"use client"

import { useEffect, useState, useRef } from "react"
import { Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatbotSessionTimerProps {
  onExpire: () => void
  onClose?: () => void
}

const SESSION_DURATION = 10 * 60 // 10 minutos en segundos

export default function ChatbotSessionTimer({ onExpire, onClose }: ChatbotSessionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION)
  const [isExpired, setIsExpired] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const sessionEndTimeRef = useRef<number>(Date.now() + SESSION_DURATION * 1000)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const endTime = sessionEndTimeRef.current
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))
      
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        setIsExpired(true)
        onExpire()
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTimer)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(updateTimer)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [onExpire])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getColorClass = () => {
    if (timeRemaining <= 60) return "text-red-600 bg-red-50 border-red-200"
    if (timeRemaining <= 180) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-blue-600 bg-blue-50 border-blue-200"
  }

  if (isExpired) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b border-red-200">
        <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>Sesión expirada</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-700 hover:text-red-900 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 border-b transition-colors",
      getColorClass()
    )}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4" />
        <span>Tiempo restante: {formatTime(timeRemaining)}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
