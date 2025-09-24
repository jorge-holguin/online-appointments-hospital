"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { format, addMonths } from "date-fns"

interface DateContextType {
  currentDate: Date
  startDate: string
  endDate: string
  refreshDates: () => void
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Actualizar las fechas
  const updateDates = () => {
    const today = new Date()
    const nextMonth = addMonths(today, 1)
    
    // Formato YYYY-MM-DD para la API
    const formattedStartDate = format(today, 'yyyy-MM-dd')
    const formattedEndDate = format(nextMonth, 'yyyy-MM-dd')
    
    setCurrentDate(today)
    setStartDate(formattedStartDate)
    setEndDate(formattedEndDate)
  }

  // Inicializar fechas al cargar el componente
  useEffect(() => {
    updateDates()
  }, [])

  // Función para refrescar las fechas manualmente si es necesario
  const refreshDates = () => {
    updateDates()
  }

  return (
    <DateContext.Provider value={{ currentDate, startDate, endDate, refreshDates }}>
      {children}
    </DateContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useDateContext() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error("useDateContext must be used within a DateProvider")
  }
  return context
}
