"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { format, addMonths, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { AvailabilityCalendar } from "@/components/ui/availability-calendar"
import { useAppConfig, getEffectiveDateRangeForDoctors, getEffectiveDateRangeForDates } from "@/hooks/use-app-config"

interface DateTimeCalendarSelectorProps {
  searchMethod: "doctor" | "datetime"
  specialty: string
  doctor?: { nombre: string; medicoId: string }
  shift: "M" | "T"
  onDateTimeSelect: (slot: any) => void
}

type ShiftType = 'M' | 'T'

interface TimeRange {
  start: string
  end: string
  label: string
}

// Rangos de hora para turno mañana (8:00 - 13:00)
const morningTimeRanges: TimeRange[] = [
  { start: "08:00", end: "09:00", label: "08:00 - 09:00" },
  { start: "09:00", end: "10:00", label: "09:00 - 10:00" },
  { start: "10:00", end: "11:00", label: "10:00 - 11:00" },
  { start: "11:00", end: "12:00", label: "11:00 - 12:00" },
  { start: "12:00", end: "13:00", label: "12:00 - 13:00" },
]

// Rangos de hora para turno tarde (14:00 - 19:00)
const afternoonTimeRanges: TimeRange[] = [
  { start: "14:00", end: "15:00", label: "14:00 - 15:00" },
  { start: "15:00", end: "16:00", label: "15:00 - 16:00" },
  { start: "16:00", end: "17:00", label: "16:00 - 17:00" },
  { start: "17:00", end: "18:00", label: "17:00 - 18:00" },
  { start: "18:00", end: "19:00", label: "18:00 - 19:00" },
]

interface ApiTimeSlot {
  citaId?: string | null
  idCita?: string | null
  fecha?: string | null
  hora?: string | null
  turnoConsulta?: string | null
  consultorio?: string | null
  medico?: string | null
  nombreMedico?: string | null
  conSolicitud?: boolean | null
  estado?: string | null
  lugar?: string | null
}

interface ApiAvailableDate {
  fecha?: string | null
  consultorio?: string | null
  totalDisponibles?: number | null
  lugar?: string | null
}

export default function DateTimeCalendarSelector({
  searchMethod,
  specialty,
  doctor,
  shift,
  onDateTimeSelect
}: DateTimeCalendarSelectorProps) {
  const { config, loading: configLoading } = useAppConfig()
  const startDate = config?.dateRange.startDate
  const endDate = config?.dateRange.endDate
  
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => startDate ? parseISO(startDate) : new Date())
  const [loading, setLoading] = useState(false)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<ApiTimeSlot[]>([])
  const [dayTimeSlots, setDayTimeSlots] = useState<Map<string, string[]>>(new Map())
  
  const shiftType: ShiftType = shift
  
  const minDate = startDate ? parseISO(startDate) : new Date()
  const maxDate = endDate ? parseISO(endDate) : new Date()
  const minNavigationDate = addMonths(startOfMonth(minDate), -6)
  const maxNavigationDate = addMonths(startOfMonth(maxDate), 6)
  
  // Cargar fechas disponibles
  useEffect(() => {
    const fetchData = async () => {
      if (!config) return
      
      setLoading(true)
      
      try {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        
        let url: string
        let dateRange: { startDate: string; endDate: string } | null
        
        if (searchMethod === "doctor" && doctor) {
          // Buscar por médico: mes actual + mes siguiente
          dateRange = getEffectiveDateRangeForDoctors(monthStart, monthEnd, startDate, endDate)
          
          if (!dateRange) {
            setLoading(false)
            return
          }
          
          const { startDate: fetchStartDate, endDate: fetchEndDate } = dateRange
          url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/citas?fechaInicio=${fetchStartDate}&fechaFin=${fetchEndDate}&medicoId=${doctor.nombre}&turnoConsulta=${shiftType}&idEspecialidad=${specialty}`
          
          const response = await fetch(url)
          if (!response.ok) throw new Error(`Error: ${response.status}`)
          
          const data: ApiTimeSlot[] = await response.json()
          
          // Estado "1" o "4" = disponible
          const filteredData = data.filter(slot => 
            slot != null && slot.fecha && slot.hora && 
            (slot.estado === "1" || slot.estado === "4") && 
            !slot.conSolicitud
          )
          
          setAvailableSlots(filteredData)
          
          // Procesar fechas y horarios
          const slotsMap = new Map<string, string[]>()
          const datesSet = new Set<string>()
          
          filteredData.forEach((slot) => {
            if (!slot.fecha || !slot.hora) return
            
            const dateKey = slot.fecha.split(' ')[0]
            datesSet.add(dateKey)
            
            if (!slotsMap.has(dateKey)) {
              slotsMap.set(dateKey, [])
            }
            slotsMap.get(dateKey)?.push(slot.hora.trim())
          })
          
          setAvailableDates(Array.from(datesSet))
          setDayTimeSlots(slotsMap)
          setUnavailableDates([])
          
        } else {
          // Buscar por fecha: solo mes actual
          dateRange = getEffectiveDateRangeForDates(monthStart, monthEnd, startDate, endDate)
          
          if (!dateRange) {
            setLoading(false)
            return
          }
          
          const { startDate: fetchStartDate, endDate: fetchEndDate } = dateRange
          url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/fechas-consultorios?fechaInicio=${fetchStartDate}&fechaFin=${fetchEndDate}&turnoConsulta=${shiftType}&idEspecialidad=${specialty}`
          
          const response = await fetch(url)
          if (!response.ok) throw new Error(`Error: ${response.status}`)
          
          const data: ApiAvailableDate[] = await response.json()
          
          const dateMap = new Map<string, number[]>()
          
          data
            .filter(item => item != null && item.fecha)
            .forEach(item => {
              try {
                const dateStr = item.fecha!.split(' ')[0]
                if (dateStr && dateStr.trim() !== '') {
                  const totalDisp = item.totalDisponibles ?? 1
                  
                  if (!dateMap.has(dateStr)) {
                    dateMap.set(dateStr, [])
                  }
                  dateMap.get(dateStr)!.push(totalDisp)
                }
              } catch (e) {
                console.error('Error parsing date:', e, item)
              }
            })
          
          const datesWithAvailability: string[] = []
          const datesWithoutAvailability: string[] = []
          
          dateMap.forEach((disponibles, dateStr) => {
            const hasAvailability = disponibles.some(total => total > 0)
            
            if (hasAvailability) {
              datesWithAvailability.push(dateStr)
            } else {
              datesWithoutAvailability.push(dateStr)
            }
          })
          
          setAvailableDates(datesWithAvailability)
          setUnavailableDates(datesWithoutAvailability)
          setAvailableSlots([])
          setDayTimeSlots(new Map())
        }
        
      } catch {
        // Error silencioso al cargar datos
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [currentMonth, searchMethod, specialty, doctor, shift, config])
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date || null)
    setSelectedTime(null)
    setSelectedTimeRange(null)
  }
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    
    if (selectedDay && searchMethod === "doctor") {
      // Buscar el slot completo en los datos de la API
      const dateKey = format(selectedDay, 'yyyy-MM-dd')
      const selectedApiSlot = availableSlots.find(slot => 
        slot.fecha === dateKey && slot.hora && slot.hora.trim() === time
      )
      
      if (selectedApiSlot) {
        onDateTimeSelect({
          date: dateKey,
          time: time,
          consultorio: selectedApiSlot.consultorio,
          idCita: selectedApiSlot.idCita || selectedApiSlot.citaId,
          lugar: selectedApiSlot.lugar
        })
      }
    }
  }
  
  const handleTimeRangeSelect = (range: TimeRange) => {
    setSelectedTimeRange(range)
    
    if (selectedDay && searchMethod === "datetime") {
      // Para búsqueda por fecha con rango, pasar fecha y rango de hora
      const dateKey = format(selectedDay, 'yyyy-MM-dd')
      onDateTimeSelect({
        date: dateKey,
        timeRange: range,
        // Usar el inicio del rango como "time" para compatibilidad
        time: range.start
      })
    }
  }
  
  const canGoPrevMonth = () => {
    const prevMonth = addMonths(currentMonth, -1)
    return prevMonth >= minNavigationDate
  }
  
  const canGoNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1)
    return nextMonth <= maxNavigationDate
  }
  
  const goToPrevMonth = () => {
    if (canGoPrevMonth()) {
      setCurrentMonth(prevMonth => addMonths(prevMonth, -1))
    }
  }
  
  const goToNextMonth = () => {
    if (canGoNextMonth()) {
      setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
    }
  }
  
  const getAvailableTimesForSelectedDay = () => {
    if (!selectedDay) return []
    const dateKey = format(selectedDay, 'yyyy-MM-dd')
    return dayTimeSlots.get(dateKey) || []
  }
  
  const isSelectedDateUnavailable = selectedDay && unavailableDates.some(dateStr => {
    const unavailableDate = parseISO(dateStr)
    return unavailableDate.getDate() === selectedDay.getDate() &&
           unavailableDate.getMonth() === selectedDay.getMonth() &&
           unavailableDate.getFullYear() === selectedDay.getFullYear()
  })
  
  return (
    <div className="bg-white rounded-lg border shadow-sm p-3 space-y-3">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm">Cargando...</span>
        </div>
      ) : (
        <>
          {/* Calendario */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevMonth}
                disabled={!canGoPrevMonth()}
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-sm capitalize" style={{ color: "#0a2463" }}>
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                disabled={!canGoNextMonth()}
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <AvailabilityCalendar
              availableDates={availableDates}
              unavailableDates={unavailableDates}
              onSelectDate={handleDateSelect}
              selectedDate={selectedDay || undefined}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="max-w-[300px] mx-auto"
            />
            
            <div className="mt-2 flex items-center justify-center gap-3 flex-wrap text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                <span className="text-gray-500">Sin programación</span>
              </div>
              {unavailableDates.length > 0 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-gray-500">Sin disponibilidad</span>
                </div>
              )}
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3e92cc" }}></div>
                <span className="text-gray-500">Disponible</span>
              </div>
            </div>
          </div>
          
          {/* Horarios disponibles */}
          {selectedDay && (
            <div className="border-t pt-3">
              <h4 className="font-semibold text-sm mb-2 text-center capitalize" style={{ color: "#0a2463" }}>
                {format(selectedDay, 'EEEE dd/MM/yyyy', { locale: es })}
              </h4>
              
              {isSelectedDateUnavailable ? (
                <div className="text-center text-sm text-red-600 py-4">
                  Sin citas disponibles para este día
                </div>
              ) : searchMethod === "doctor" ? (
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {getAvailableTimesForSelectedDay().length > 0 ? (
                    getAvailableTimesForSelectedDay().map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`p-2 rounded border text-xs font-medium transition-all ${
                          selectedTime === time
                            ? 'border-[#3e92cc] bg-[#3e92cc] text-white'
                            : 'border-gray-300 hover:border-[#3e92cc] hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {time}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-sm text-gray-500 py-4">
                      No hay horarios disponibles
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 text-center mb-2">
                    Selecciona un rango de horario:
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {(shiftType === 'M' ? morningTimeRanges : afternoonTimeRanges).map((range) => (
                      <button
                        key={range.label}
                        onClick={() => handleTimeRangeSelect(range)}
                        className={`p-2 rounded border text-xs font-medium transition-all ${
                          selectedTimeRange?.label === range.label
                            ? 'border-[#3e92cc] bg-[#3e92cc] text-white'
                            : 'border-gray-300 hover:border-[#3e92cc] hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {range.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
